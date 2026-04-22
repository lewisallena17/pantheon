/**
 * Response wall-clock timestamps — logs request/response lifecycle events
 * to console with high-precision timing information.
 * 
 * Captures:
 * - Request arrival (response start)
 * - Response completion (response end)
 * - Total duration with millisecond precision
 * 
 * Uses performance.now() for wall-clock accuracy across all environments.
 * Fire-and-forget logging — never blocks response delivery.
 */

/**
 * Logging configuration
 */
const ENABLE_CONSOLE_TIMESTAMPS = process.env.LOG_RESPONSE_TIMESTAMPS !== 'false'

/**
 * Format a wall-clock timestamp with millisecond precision.
 * @param timestamp ISO string or Date
 * @returns Formatted timestamp string
 */
function formatTimestamp(timestamp: Date | string): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toISOString()
}

/**
 * Log response start event.
 * Called at the beginning of a request handler.
 * 
 * @param route The API route path
 * @param method HTTP method
 * @param requestId Optional request ID for correlation
 * @returns Start timestamp for later duration calculation
 */
export function logResponseStart(
  route: string,
  method: string,
  requestId?: string
): number {
  if (!ENABLE_CONSOLE_TIMESTAMPS) return Date.now()

  try {
    const now = new Date()
    const startMs = Date.now()
    const perfMs = performance.now()

    const logEntry = {
      event: 'response_start',
      route,
      method,
      timestamp: formatTimestamp(now),
      wallClockMs: perfMs,
      requestId: requestId || undefined,
    }

    console.log('[response-timestamps-START]', JSON.stringify(logEntry))
    return startMs
  } catch (err) {
    // Swallow errors — logging should never fail the request
    console.error('[response-timestamps] Error logging start:', err instanceof Error ? err.message : String(err))
    return Date.now()
  }
}

/**
 * Log response end event.
 * Called after a response is generated, before it is sent.
 * 
 * @param startMs The start timestamp from logResponseStart()
 * @param route The API route path
 * @param method HTTP method
 * @param status HTTP status code
 * @param requestId Optional request ID for correlation
 */
export function logResponseEnd(
  startMs: number,
  route: string,
  method: string,
  status?: number,
  requestId?: string
): void {
  if (!ENABLE_CONSOLE_TIMESTAMPS) return

  try {
    const now = new Date()
    const durationMs = Date.now() - startMs
    const perfMs = performance.now()

    const logEntry = {
      event: 'response_end',
      route,
      method,
      status: status || undefined,
      timestamp: formatTimestamp(now),
      wallClockMs: perfMs,
      durationMs,
      requestId: requestId || undefined,
    }

    console.log('[response-timestamps-END]', JSON.stringify(logEntry))
  } catch (err) {
    // Swallow errors — logging should never fail the response
    console.error('[response-timestamps] Error logging end:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Convenience wrapper: measure and log a complete request/response cycle.
 * Logs both start and end events, and returns the measured duration.
 * 
 * Usage:
 * ```ts
 * const startMs = logResponseStart('/api/todos', 'GET')
 * // ... do work ...
 * const duration = logResponseEnd(startMs, '/api/todos', 'GET', 200)
 * ```
 * 
 * Or use the wrapper:
 * ```ts
 * const { startMs, logEnd } = startResponseTiming('/api/todos', 'GET')
 * // ... do work ...
 * logEnd(200)
 * ```
 */
export function startResponseTiming(
  route: string,
  method: string,
  requestId?: string
): {
  startMs: number
  logEnd: (status?: number) => number
} {
  const startMs = logResponseStart(route, method, requestId)
  
  return {
    startMs,
    logEnd: (status?: number): number => {
      logResponseEnd(startMs, route, method, status, requestId)
      return Date.now() - startMs
    },
  }
}

/**
 * Check if timestamp logging is enabled via environment variable.
 */
export function isTimestampLoggingEnabled(): boolean {
  return ENABLE_CONSOLE_TIMESTAMPS
}
