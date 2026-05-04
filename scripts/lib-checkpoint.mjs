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
 *   "SLO thresholds make performance visible and actionable."
 *   "Don't assume performance—measure timestamps between each phase."
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
 * Per-phase SLO budgets (milliseconds). If a phase exceeds its budget, an
 * [SLO BREACH] warning is logged immediately so slow phases are actionable
 * rather than invisible.
 *
 * Lesson: "SLO thresholds make performance visible and actionable."
 * Lesson: "Don't assume performance—measure timestamps between each phase."
 *
 * Phases not listed here are unconstrained (no SLO warning).
 */
const PHASE_SLO_MS = {
  'claim':              3_000,   // DB claim should be fast
  'screener':           5_000,   // pre-flight screener
  'memory-load':        2_000,   // loading agent memory files
  'preflight':         15_000,   // haiku sanity check before main run
  'first-token':       20_000,   // time to first LLM response token
  'llm-call':          60_000,   // full LLM round-trip
  'tool-exec':         30_000,   // single tool execution
  'iteration':         90_000,   // one complete agent iteration (call + tools)
  'compress':           5_000,   // context compression
  'write-result':       5_000,   // writing task result back to DB
  'total':            480_000,   // 8-min wall-clock budget
}

/**
 * Creates a boundary timer for a single task run.
 * Call .mark(label) at key points; call .summary() at the end.
 *
 * Each .mark() call:
 *   1. Logs elapsed time since the previous mark (phase delta)
 *   2. Checks the phase against PHASE_SLO_MS and emits [SLO BREACH] if exceeded
 *
 * Lesson: "Logging at every layer reveals hidden bottlenecks instantly."
 * Lesson: "SLO thresholds make performance visible and actionable."
 *
 * @param {string} taskId
 * @param {string} taskTitle  — short label for log lines
 * @param {object} [customSlos]  — override specific SLO values for this run (ms)
 * @returns {{ mark: (label: string) => void, summary: () => string, elapsed: () => number, sloBreaches: () => string[] }}
 */
export function createRunTimer(taskId, taskTitle, customSlos = {}) {
  const start = Date.now()
  const marks = []  // [{ label, ms, delta }]
  const breaches = []
  const short = String(taskTitle ?? taskId).slice(0, 60)
  const slos = { ...PHASE_SLO_MS, ...customSlos }

  function mark(label) {
    const now = Date.now()
    const ms = now - start
    const prevMs = marks.length > 0 ? marks[marks.length - 1].ms : 0
    const delta = ms - prevMs
    marks.push({ label, ms, delta })

    const budget = slos[label]
    if (budget !== undefined && delta > budget) {
      const msg = `[SLO BREACH] ${short} · phase="${label}" took ${delta}ms (budget=${budget}ms, over by ${delta - budget}ms)`
      console.warn(msg)
      breaches.push({ label, delta, budget, at: new Date(now).toISOString() })
    } else {
      console.log(`[TIMER] ${short} · ${label} +${ms}ms (phase: ${delta}ms)`)
    }
  }

  function elapsed() {
    return Date.now() - start
  }

  function summary() {
    const total = Date.now() - start
    const segments = marks.map(m => `${m.label}=${m.delta}ms`).join(' | ')
    const totalBudget = slos['total']
    const totalNote = totalBudget && total > totalBudget
      ? ` ⚠ TOTAL SLO BREACH (${total}ms > ${totalBudget}ms)`
      : ''
    return `total=${total}ms${segments ? ' · ' + segments : ''}${totalNote}`
  }

  /** Returns all SLO breaches recorded so far for this run. */
  function sloBreaches() {
    return breaches.map(b => `${b.label}: ${b.delta}ms > ${b.budget}ms budget`)
  }

  // Log start immediately with wall-clock timestamp for cross-layer correlation
  const startIso = new Date(start).toISOString()
  console.log(`[TIMER] ${short} · start ts=${startIso}`)

  return { mark, elapsed, summary, sloBreaches }
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
