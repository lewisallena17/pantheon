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
 *   "Token-cap aborts logged as 'succeeded' corrupt the reliability model silently."
 *   "Pre-validate outcome text at boundaries — partial completion ≠ success."
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

// ── Outcome classifier — catches silent partial completions ────────────────
//
// ROOT CAUSE (cycles 390–700): Agents hitting the token-cap mid-run still
// reach the "mark completed" code path.  Their result text contains a
// telltale phrase like "Pre-call gate: projected input ~117k tokens would
// exceed cap. Wrapping up with partial progress." — but the caller records
// this as a clean 'completed', poisoning:
//   1. Pool reliability counters (inflated success rate)
//   2. Episodic memory ("X succeeded — partial progress" is noise, not signal)
//   3. Curriculum tier scores (pools stay 'journeyman' when they should drop)
//
// Fix: call classifyOutcome(resultText) before recording any terminal status.
// Returns 'completed' | 'partial' | 'failed'.
// Callers MUST treat 'partial' as a non-success for reliability tracking,
// and SHOULD mark the DB row as 'failed' (or a new 'partial' status if the
// schema supports it) rather than 'completed'.

/** Phrases that betray a token-cap or cost-cap abort mid-task */
const PARTIAL_ABORT_SIGNATURES = [
  /pre.?call gate.*?exceed cap/i,
  /projected input.*?token.*?exceed/i,
  /wrapping up with partial progress/i,
  /cost cap hit.*?stopping/i,
  /token budget.*?exceeded.*?stopping/i,
  /context window.*?limit.*?stopping/i,
  /output truncated.*?token/i,
  /stopping.*?token.*?limit/i,
  /stopping.*?cost.*?cap/i,
  /partial progress.*?token/i,
  /hit.*?token.*?cap.*?wrap/i,
]

/** Phrases that signal a clean, intentional failure (not a partial abort) */
const EXPLICIT_FAILURE_SIGNATURES = [
  /cannot complete/i,
  /task is not possible/i,
  /no queryable table/i,
  /unmeasurable/i,
  /rejected pre.?flight/i,
]

/**
 * Classify the terminal outcome of a task from its result text.
 *
 * @param {string} resultText  — the final text returned by the agent
 * @returns {'completed' | 'partial' | 'failed'}
 *
 * Usage in ruflo-runner (at every point where status is set to 'completed'):
 *
 *   import { classifyOutcome } from './lib-checkpoint.mjs'
 *   const outcome = classifyOutcome(finalText)
 *   if (outcome !== 'completed') {
 *     console.warn(`[CHECKPOINT] ⚠ task ${taskId} outcome=${outcome} — reclassifying as failed`)
 *     // mark DB as 'failed', record pool failure, skip positive memory entry
 *   }
 */
export function classifyOutcome(resultText) {
  if (!resultText || typeof resultText !== 'string') return 'failed'
  const text = resultText.slice(0, 2000) // only scan the head; aborts appear early

  if (PARTIAL_ABORT_SIGNATURES.some(rx => rx.test(text))) {
    console.warn(`[CHECKPOINT] ⚠ classifyOutcome → 'partial' (token/cost abort detected in result)`)
    return 'partial'
  }
  if (EXPLICIT_FAILURE_SIGNATURES.some(rx => rx.test(text))) {
    return 'failed'
  }
  return 'completed'
}

/**
 * Convenience: wraps classifyOutcome and returns the DB-safe terminal status
 * and whether to count this as a pool success for the reliability tracker.
 *
 * @param {string} resultText
 * @param {string} [agentName]  — for logging
 * @param {string} [taskId]     — for logging
 * @returns {{ dbStatus: 'completed'|'failed', poolOutcome: 'completed'|'failed', isPartial: boolean }}
 */
export function resolveTerminalStatus(resultText, agentName = '?', taskId = '?') {
  const outcome = classifyOutcome(resultText)
  if (outcome === 'partial') {
    console.warn(
      `[CHECKPOINT] ✗ partial-completion reclassified as FAILED` +
      ` — agent=${agentName} task=${taskId.slice(0, 8)}`
    )
    return { dbStatus: 'failed', poolOutcome: 'failed', isPartial: true }
  }
  if (outcome === 'failed') {
    return { dbStatus: 'failed', poolOutcome: 'failed', isPartial: false }
  }
  return { dbStatus: 'completed', poolOutcome: 'completed', isPartial: false }
}
