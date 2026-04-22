/**
 * Latency logger — logs response generation start/end timestamps to latency.log
 * 
 * Records precise start and end timestamps for response generation to enable
 * detailed latency analysis. Writes asynchronously to avoid blocking response delivery.
 * 
 * Each entry includes:
 * - Timestamp (ISO format)
 * - Event (start or end)
 * - Route and HTTP method
 * - Duration (end event only)
 * - Request ID for correlation (optional)
 */

import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const LATENCY_LOG_PATH = join(process.cwd(), 'latency.log')

interface LatencyLogEntry {
  timestamp: string
  event: 'start' | 'end'
  route: string
  method: string
  durationMs?: number
  requestId?: string
}

/**
 * Format a timestamp in ISO format with millisecond precision.
 * @param date Date object or undefined (uses current time)
 * @returns ISO string timestamp
 */
function formatTimestamp(date?: Date): string {
  return (date || new Date()).toISOString()
}

/**
 * Log response generation start event.
 * Called at the beginning of response handling.
 * 
 * @param route API route path (e.g., '/api/health')
 * @param method HTTP method (GET, POST, etc.)
 * @param requestId Optional request ID for tracing/correlation
 * @returns Timestamp in milliseconds for later duration calculation
 */
export function logLatencyStart(
  route: string,
  method: string,
  requestId?: string
): number {
  const startMs = Date.now()

  try {
    const entry: LatencyLogEntry = {
      timestamp: formatTimestamp(),
      event: 'start',
      route,
      method,
      requestId,
    }

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(LATENCY_LOG_PATH, JSON.stringify(entry) + '\n').catch((err) => {
      console.error('[latency-logger] Failed to write start log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the request
    console.error('[latency-logger] Error in logLatencyStart:', err instanceof Error ? err.message : String(err))
  }

  return startMs
}

/**
 * Log response generation end event.
 * Called after response is generated, before it is sent to client.
 * 
 * @param startMs Start timestamp from logLatencyStart()
 * @param route API route path
 * @param method HTTP method
 * @param requestId Optional request ID for correlation
 */
export function logLatencyEnd(
  startMs: number,
  route: string,
  method: string,
  requestId?: string
): void {
  const durationMs = Date.now() - startMs

  try {
    const entry: LatencyLogEntry = {
      timestamp: formatTimestamp(),
      event: 'end',
      route,
      method,
      durationMs,
      requestId,
    }

    // Fire-and-forget: append to log without awaiting
    appendFile(LATENCY_LOG_PATH, JSON.stringify(entry) + '\n').catch((err) => {
      console.error('[latency-logger] Failed to write end log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the response
    console.error('[latency-logger] Error in logLatencyEnd:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Measure and log a complete request/response cycle.
 * Logs both start and end events, and returns the measured duration.
 * 
 * Usage:
 * ```ts
 * const startMs = logLatencyStart('/api/todos', 'GET')
 * // ... generate response ...
 * const duration = logLatencyEnd(startMs, '/api/todos', 'GET')
 * return response
 * ```
 * 
 * Or use the convenience wrapper:
 * ```ts
 * const { startMs, logEnd } = startLatencyTiming('/api/todos', 'GET')
 * // ... generate response ...
 * logEnd()
 * return response
 * ```
 */
export function startLatencyTiming(
  route: string,
  method: string,
  requestId?: string
): {
  startMs: number
  logEnd: () => number
} {
  const startMs = logLatencyStart(route, method, requestId)

  return {
    startMs,
    logEnd: (): number => {
      logLatencyEnd(startMs, route, method, requestId)
      return Date.now() - startMs
    },
  }
}

/**
 * Check if latency logging is enabled.
 * Always returns true — latency logging should always be active.
 * Can be gated by environment variable if needed.
 */
export function isLatencyLoggingEnabled(): boolean {
  return process.env.DISABLE_LATENCY_LOGGING !== 'true'
}
