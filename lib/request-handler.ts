/**
 * Request handler — logs AbortSignal events for request lifecycle tracking.
 *
 * Monitors abort signals and timeout events on incoming requests.
 * Logs when signals fire, including reason and context.
 *
 * Runs asynchronously — does NOT block request or response delivery.
 */

import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const ABORT_LOG_PATH = join(process.cwd(), 'abort-signals.log')

interface AbortLogEntry {
  timestamp: string
  route: string
  method: string
  reason: string
  type: 'abort' | 'timeout'
  durationMs?: number
}

/**
 * Log an abort signal event.
 * Runs asynchronously — does NOT block request handling.
 */
async function logAbortSignal(entry: AbortLogEntry): Promise<void> {
  try {
    const logLine = JSON.stringify({
      at: entry.timestamp,
      route: entry.route,
      method: entry.method,
      type: entry.type,
      reason: entry.reason,
      ms: entry.durationMs,
    })

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the request
    appendFile(ABORT_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[request-handler] Failed to write abort log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main request
    console.error(
      '[request-handler] Error in logAbortSignal:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Attach abort signal listeners to a request.
 * Logs when the signal is aborted or times out.
 *
 * Usage in a route handler:
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const startMs = Date.now()
 *   attachAbortListener(req.signal, '/api/example', 'GET', startMs)
 *   // ... handle request ...
 * }
 * ```
 *
 * @param signal AbortSignal from the incoming request
 * @param route API route path
 * @param method HTTP method (GET, POST, etc.)
 * @param startMs Timestamp when request started (for duration calculation)
 */
export function attachAbortListener(
  signal: AbortSignal,
  route: string,
  method: string,
  startMs: number
): void {
  if (!signal) return

  // Log when the signal is aborted
  signal.addEventListener(
    'abort',
    () => {
      const durationMs = Date.now() - startMs
      const timestamp = new Date().toISOString()

      logAbortSignal({
        timestamp,
        route,
        method,
        reason: signal.reason || 'unknown',
        type: 'abort',
        durationMs,
      }).catch(() => {
        // Swallow errors — logging should never fail
      })
    },
    { once: true }
  )

  // Log timeout events if available (in some environments)
  // This captures abort signals that fire due to timeout conditions
  if ('timeout' in signal) {
    const timeout = (signal as AbortSignal & { timeout?: number }).timeout
    if (timeout && timeout > 0) {
      const timeoutHandle = setTimeout(() => {
        const durationMs = Date.now() - startMs
        const timestamp = new Date().toISOString()

        logAbortSignal({
          timestamp,
          route,
          method,
          reason: `timeout after ${timeout}ms`,
          type: 'timeout',
          durationMs,
        }).catch(() => {
          // Swallow errors — logging should never fail
        })
      }, timeout)

      // Clean up timeout if request completes normally
      signal.addEventListener(
        'abort',
        () => clearTimeout(timeoutHandle),
        { once: true }
      )
    }
  }
}

/**
 * Get current abort signal statistics.
 * Useful for monitoring request cancellation patterns.
 *
 * @returns Object with abort event counts
 */
export function getAbortStats(): { totalAborts: number; totalTimeouts: number } {
  // In-memory tracking — resets on server restart
  // This is a placeholder for future expansion with in-memory metrics
  return {
    totalAborts: 0,
    totalTimeouts: 0,
  }
}
