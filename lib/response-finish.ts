/**
 * Response finish — utilities for marking response completion status.
 *
 * Provides helpers to track and mark when a response finishes processing,
 * including completion markers, status checks, and lifecycle events.
 *
 * Integrates with ResponseEnvelope completion_marker field to signal
 * when a response has finished and is ready to be sent to the client.
 *
 * Fire-and-forget: completion marking never blocks response delivery.
 */

import type { ResponseEnvelope, CompletionMarker } from './response'
import { markComplete, isResponseComplete } from './response'

/**
 * Completion status snapshot — captures the state of a response at a moment.
 */
export interface CompletionSnapshot {
  isComplete: boolean
  marker: CompletionMarker | undefined
  timestamp: string
  elapsedMs: number
}

/**
 * Finish event metadata — logged when a response completes.
 */
export interface FinishEvent {
  completedAt: string
  marker: CompletionMarker
  durationMs: number
  route?: string
  method?: string
  requestId?: string
}

// In-memory completion tracking for monitoring
const completionEvents: FinishEvent[] = []
const MAX_COMPLETION_HISTORY = 1000

/**
 * Mark a response as finished with the given completion marker.
 *
 * Updates the envelope's completion_marker and duration, then logs the event.
 * Never throws — completion marking is always safe.
 *
 * Usage:
 * ```ts
 * const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 * const startMs = Date.now()
 * // ... do work ...
 * finishResponse(envelope, 'SUCCESS', startMs)
 * ```
 *
 * @param envelope The response envelope to mark
 * @param marker Completion status (SUCCESS, ERROR, TIMEOUT, etc.)
 * @param startMs Start timestamp in milliseconds (for duration calculation)
 * @returns The updated envelope with completion status
 */
export function finishResponse<T>(
  envelope: ResponseEnvelope<T>,
  marker: CompletionMarker,
  startMs: number,
): ResponseEnvelope<T> {
  try {
    const durationMs = Date.now() - startMs
    markComplete(envelope, marker, durationMs)

    // Log the completion event
    logCompletionEvent({
      completedAt: new Date().toISOString(),
      marker,
      durationMs,
      route: envelope.route,
      method: envelope.method,
      requestId: envelope.request_id,
    })

    return envelope
  } catch (err) {
    // Fallback: ensure envelope is marked at minimum
    console.error('[response-finish] Error finishing response:', err instanceof Error ? err.message : String(err))
    envelope.completion_marker = marker
    return envelope
  }
}

/**
 * Get a snapshot of the current completion status of an envelope.
 *
 * Usage:
 * ```ts
 * const snapshot = getCompletionSnapshot(envelope)
 * if (snapshot.isComplete) {
 *   console.log(`Response completed with marker: ${snapshot.marker}`)
 * }
 * ```
 *
 * @param envelope The response envelope to check
 * @param startMs Optional start timestamp for duration calculation
 * @returns Snapshot of completion status
 */
export function getCompletionSnapshot(
  envelope: ResponseEnvelope,
  startMs?: number,
): CompletionSnapshot {
  return {
    isComplete: isResponseComplete(envelope),
    marker: envelope.completion_marker,
    timestamp: new Date().toISOString(),
    elapsedMs: startMs ? Date.now() - startMs : envelope.duration_ms || 0,
  }
}

/**
 * Check if a response is ready to be sent (i.e., marked as complete).
 *
 * A response is ready if its completion_marker indicates final state.
 *
 * Usage:
 * ```ts
 * if (isResponseReady(envelope)) {
 *   return NextResponse.json(envelope)
 * }
 * ```
 *
 * @param envelope The response envelope to check
 * @returns true if response is complete and ready to send
 */
export function isResponseReady(envelope: ResponseEnvelope): boolean {
  return isResponseComplete(envelope)
}

/**
 * Log a completion event to the in-memory event history.
 * Events are rotated when history exceeds MAX_COMPLETION_HISTORY.
 *
 * Fire-and-forget: errors are swallowed and logged.
 *
 * @param event The completion event to record
 */
export function logCompletionEvent(event: FinishEvent): void {
  try {
    completionEvents.push(event)

    // Rotate history if needed
    if (completionEvents.length > MAX_COMPLETION_HISTORY) {
      completionEvents.shift()
    }

    // Optional: log to console if enabled via environment
    if (process.env.LOG_COMPLETION_EVENTS === 'true') {
      console.log('[response-finish-event]', JSON.stringify(event))
    }
  } catch (err) {
    // Swallow errors — event logging should never fail
    console.error('[response-finish] Error logging completion event:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Get the completion event history (most recent first).
 * Returns a copy to prevent external mutation.
 *
 * Usage:
 * ```ts
 * const recent = getCompletionHistory(10)
 * console.log(`Last 10 completions:`, recent)
 * ```
 *
 * @param limit Maximum number of events to return (default: 10)
 * @returns Array of completion events, newest first
 */
export function getCompletionHistory(limit: number = 10): FinishEvent[] {
  return completionEvents.slice(-limit).reverse()
}

/**
 * Get statistics on completion patterns over the history.
 *
 * Analyzes the completion event history to extract patterns:
 * - Count of each completion marker
 * - Average duration by marker type
 * - Most recent completion time
 *
 * Usage:
 * ```ts
 * const stats = getCompletionStats()
 * console.log(`Success rate: ${stats.SUCCESS.count}/${stats.total} responses`)
 * ```
 *
 * @returns Statistics object with marker counts and average durations
 */
export function getCompletionStats(): {
  SUCCESS: { count: number; avgMs: number }
  ERROR: { count: number; avgMs: number }
  PARTIAL: { count: number; avgMs: number }
  TIMEOUT: { count: number; avgMs: number }
  STREAMING: { count: number; avgMs: number }
  CANCELLED: { count: number; avgMs: number }
  RETRYING: { count: number; avgMs: number }
  FALLBACK: { count: number; avgMs: number }
  PENDING: { count: number; avgMs: number }
  total: number
} {
  const stats: Record<CompletionMarker, { count: number; totalMs: number }> = {
    SUCCESS: { count: 0, totalMs: 0 },
    ERROR: { count: 0, totalMs: 0 },
    PARTIAL: { count: 0, totalMs: 0 },
    TIMEOUT: { count: 0, totalMs: 0 },
    STREAMING: { count: 0, totalMs: 0 },
    CANCELLED: { count: 0, totalMs: 0 },
    RETRYING: { count: 0, totalMs: 0 },
    FALLBACK: { count: 0, totalMs: 0 },
    PENDING: { count: 0, totalMs: 0 },
  }

  for (const event of completionEvents) {
    if (event.marker in stats) {
      stats[event.marker].count += 1
      stats[event.marker].totalMs += event.durationMs
    }
  }

  return {
    SUCCESS: {
      count: stats.SUCCESS.count,
      avgMs: stats.SUCCESS.count > 0 ? Math.round(stats.SUCCESS.totalMs / stats.SUCCESS.count) : 0,
    },
    ERROR: {
      count: stats.ERROR.count,
      avgMs: stats.ERROR.count > 0 ? Math.round(stats.ERROR.totalMs / stats.ERROR.count) : 0,
    },
    PARTIAL: {
      count: stats.PARTIAL.count,
      avgMs: stats.PARTIAL.count > 0 ? Math.round(stats.PARTIAL.totalMs / stats.PARTIAL.count) : 0,
    },
    TIMEOUT: {
      count: stats.TIMEOUT.count,
      avgMs: stats.TIMEOUT.count > 0 ? Math.round(stats.TIMEOUT.totalMs / stats.TIMEOUT.count) : 0,
    },
    STREAMING: {
      count: stats.STREAMING.count,
      avgMs: stats.STREAMING.count > 0 ? Math.round(stats.STREAMING.totalMs / stats.STREAMING.count) : 0,
    },
    CANCELLED: {
      count: stats.CANCELLED.count,
      avgMs: stats.CANCELLED.count > 0 ? Math.round(stats.CANCELLED.totalMs / stats.CANCELLED.count) : 0,
    },
    RETRYING: {
      count: stats.RETRYING.count,
      avgMs: stats.RETRYING.count > 0 ? Math.round(stats.RETRYING.totalMs / stats.RETRYING.count) : 0,
    },
    FALLBACK: {
      count: stats.FALLBACK.count,
      avgMs: stats.FALLBACK.count > 0 ? Math.round(stats.FALLBACK.totalMs / stats.FALLBACK.count) : 0,
    },
    PENDING: {
      count: stats.PENDING.count,
      avgMs: stats.PENDING.count > 0 ? Math.round(stats.PENDING.totalMs / stats.PENDING.count) : 0,
    },
    total: completionEvents.length,
  }
}

/**
 * Module completion status marker.
 *
 * Exported constant indicating that the response-finish module has been
 * successfully initialized and is ready for use. Can be imported and checked
 * in tests or initialization sequences to verify module availability.
 *
 * Usage:
 * ```ts
 * import { RESPONSE_FINISH_READY } from '@/lib/response-finish'
 * 
 * if (RESPONSE_FINISH_READY) {
 *   console.log('response-finish module is initialized')
 * }
 * ```
 */
export const RESPONSE_FINISH_READY = true

/**
 * Module completion status timestamp.
 *
 * ISO string timestamp indicating when the response-finish module
 * was loaded/initialized. Useful for debugging initialization order.
 */
export const RESPONSE_FINISH_INITIALIZED_AT = new Date().toISOString()

/**
 * Reset the completion event history.
 * Useful for testing or periodic metric rotation.
 */
export function resetCompletionHistory(): void {
  try {
    completionEvents.length = 0
  } catch (err) {
    console.error('[response-finish] Error resetting history:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Create a completion tracker for a single request/response cycle.
 *
 * Usage:
 * ```ts
 * const tracker = createCompletionTracker(envelope, startMs)
 * // ... do work ...
 * tracker.finish('SUCCESS')
 * ```
 *
 * @param envelope The response envelope to track
 * @param startMs Start timestamp in milliseconds
 * @returns Tracker with finish() method
 */
export function createCompletionTracker(
  envelope: ResponseEnvelope,
  startMs: number,
): {
  finish: (marker: CompletionMarker) => void
  snapshot: () => CompletionSnapshot
  isReady: () => boolean
} {
  return {
    finish: (marker: CompletionMarker): void => {
      finishResponse(envelope, marker, startMs)
    },
    snapshot: (): CompletionSnapshot => {
      return getCompletionSnapshot(envelope, startMs)
    },
    isReady: (): boolean => {
      return isResponseReady(envelope)
    },
  }
}

