/**
 * lib-checkpoint.mjs — Idempotent task-claim checkpoint
 *
 * Provides a single atomic "claim" operation that prevents two parallel
 * ruflo-runner instances from double-claiming the same task row.
 *
 * Strategy:
 *   Supabase UPDATE … WHERE status = 'pending' AND id = <id>
 *   Returns the updated row count. If count === 0 the task was already
 *   claimed by another worker → caller must skip it.
 *
 * Also tracks per-task elapsed time at key execution boundaries so
 * bottlenecks are visible without having to guess.
 *
 * Lessons encoded:
 *   "Never parallelize without idempotent state — corruption cascades silently."
 *   "Never skip checkpoint idempotency when parallelizing tasks."
 *   "Logging at every layer reveals hidden bottlenecks instantly."
 *   "Don't optimize without granular visibility into actual behavior."
 */

// ── Idempotent claim ───────────────────────────────────────────────────────

/**
 * Attempt to atomically claim a task for execution.
 *
 * Uses a conditional UPDATE (WHERE status = 'pending') so only one worker
 * wins the race — the loser gets count === 0 and must skip the task.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string}  taskId       — UUID of the task row
 * @param {string}  agentName    — the agent identifier (stored in assigned_agent)
 * @returns {Promise<{ claimed: boolean, reason?: string }>}
 */
export async function claimTask(supabase, taskId, agentName) {
  const claimedAt = new Date().toISOString()

  try {
    // Supabase JS client: .update() with .eq() conditions is atomic on the DB
    // side — Postgres UPDATE returns 0 rows if the WHERE predicate is not met.
    const { data, error, count } = await supabase
      .from('todos')
      .update({
        status:         'in_progress',
        assigned_agent: agentName,
        started_at:     claimedAt,
      })
      .eq('id',     taskId)
      .eq('status', 'pending')   // ← idempotency guard: only wins if still pending
      .select('id, status')

    if (error) {
      return { claimed: false, reason: `db-error: ${error.message?.slice(0, 120)}` }
    }

    // count may be null on some Supabase versions; fall back to data length
    const updated = count ?? data?.length ?? 0
    if (updated === 0) {
      return { claimed: false, reason: 'already-claimed-by-another-worker' }
    }

    console.log(`[CHECKPOINT] ✓ claimed task ${taskId} for ${agentName} at ${claimedAt}`)
    return { claimed: true }
  } catch (e) {
    return { claimed: false, reason: `exception: ${e.message?.slice(0, 120)}` }
  }
}

/**
 * Release a claim (reset to pending) when a claim was won but execution
 * cannot start (e.g. screener rejects after claim, slot full).
 *
 * Safe to call even if the task is already in a terminal state — the
 * conditional WHERE guards prevent clobbering a completed/failed row.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} taskId
 */
export async function releaseClaim(supabase, taskId) {
  try {
    await supabase
      .from('todos')
      .update({ status: 'pending', started_at: null })
      .eq('id',     taskId)
      .eq('status', 'in_progress')  // only release if still in_progress (not completed/failed)
    console.log(`[CHECKPOINT] ↩ released claim on task ${taskId}`)
  } catch (e) {
    console.warn(`[CHECKPOINT] release failed for ${taskId}: ${e.message?.slice(0, 80)}`)
  }
}

// ── Boundary elapsed-time logger ───────────────────────────────────────────

/**
 * Creates a boundary timer for a single task run.
 * Call .mark(label) at key points; call .summary() at the end.
 *
 * Lesson: "Logging at every layer reveals hidden bottlenecks instantly."
 *
 * @param {string} taskId
 * @param {string} taskTitle  — short label for log lines
 * @returns {{ mark: (label: string) => void, summary: () => string, elapsed: () => number }}
 */
export function createRunTimer(taskId, taskTitle) {
  const start = Date.now()
  const marks = []  // [{ label, ms }]
  const short = String(taskTitle ?? taskId).slice(0, 60)

  function mark(label) {
    const ms = Date.now() - start
    marks.push({ label, ms })
    console.log(`[TIMER] ${short} · ${label} +${ms}ms`)
  }

  function elapsed() {
    return Date.now() - start
  }

  function summary() {
    const total = Date.now() - start
    const segments = marks.map((m, i) => {
      const prev = i === 0 ? 0 : marks[i - 1].ms
      return `${m.label}=${m.ms - prev}ms`
    }).join(' | ')
    return `total=${total}ms${segments ? ' · ' + segments : ''}`
  }

  // Log start immediately
  console.log(`[TIMER] ${short} · start`)

  return { mark, elapsed, summary }
}

// ── Hash-based consistency guard for async state ───────────────────────────

/**
 * Computes a lightweight hash of a task's mutable fields so callers can
 * detect if the row changed between two async reads (e.g. status flipped
 * while the agent was running).
 *
 * Lesson: "Never skip timestamp/hash consistency checks across async operations."
 *
 * @param {{ status?: string, updated_at?: string, assigned_agent?: string }} todo
 * @returns {string}
 */
export function taskStateHash(todo) {
  return [
    todo?.status ?? '',
    todo?.updated_at ?? '',
    todo?.assigned_agent ?? '',
  ].join('|')
}

/**
 * Verify the task row hasn't changed between claim time and now.
 * Returns { consistent: true } or { consistent: false, reason }.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} taskId
 * @param {string} expectedHash  — from taskStateHash() at claim time
 */
export async function assertTaskConsistency(supabase, taskId, expectedHash) {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('id, status, updated_at, assigned_agent')
      .eq('id', taskId)
      .single()

    if (error || !data) {
      return { consistent: false, reason: `fetch-failed: ${error?.message?.slice(0, 80) ?? 'no data'}` }
    }

    const currentHash = taskStateHash(data)
    if (currentHash !== expectedHash) {
      return {
        consistent: false,
        reason:     `state changed: expected="${expectedHash}" got="${currentHash}"`,
        current:    data,
      }
    }
    return { consistent: true, current: data }
  } catch (e) {
    return { consistent: false, reason: `exception: ${e.message?.slice(0, 80)}` }
  }
}
