/**
 * API client — timeout handler that logs elapsed milliseconds.
 *
 * Wraps API requests with a configurable timeout threshold and logs
 * requests that exceed it. Useful for identifying slow API calls and
 * performance bottlenecks.
 *
 * All logging is fire-and-forget and never blocks request delivery.
 */

import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const API_CLIENT_LOG_PATH = join(process.cwd(), 'api-client.log')

// Configurable timeout threshold (milliseconds)
// Requests exceeding this duration will be logged
const DEFAULT_TIMEOUT_THRESHOLD_MS = 5000

interface ApiCallLogEntry {
  timestamp: string
  url: string
  method: string
  elapsedMs: number
  exceeded: boolean
  status?: number
  error?: string
}

/**
 * Log an API call that exceeded the timeout threshold.
 * Runs asynchronously — does NOT block the caller.
 */
async function logApiCall(entry: ApiCallLogEntry): Promise<void> {
  try {
    const logLine = JSON.stringify({
      at: entry.timestamp,
      url: entry.url,
      method: entry.method,
      elapsedMs: entry.elapsedMs,
      exceeded: entry.exceeded,
      status: entry.status,
      error: entry.error,
    })

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the request
    appendFile(API_CLIENT_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[api-client] Failed to write log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main request
    console.error(
      '[api-client] Error in logApiCall:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Make a fetch request with timeout logging.
 * Logs requests that exceed the configured threshold.
 *
 * Usage:
 * ```ts
 * const response = await fetchWithTimeout('https://api.example.com/data', {
 *   method: 'GET',
 *   timeoutThreshold: 3000,
 * })
 * ```
 *
 * @param url API endpoint URL
 * @param options Fetch options + timeout settings
 * @returns Response object
 */
export async function fetchWithTimeout(
  url: string,
  options?: RequestInit & {
    timeoutThreshold?: number
  }
): Promise<Response> {
  const startMs = Date.now()
  const timeoutThreshold = options?.timeoutThreshold ?? DEFAULT_TIMEOUT_THRESHOLD_MS
  const method = options?.method ?? 'GET'

  try {
    const response = await fetch(url, options)
    const elapsedMs = Date.now() - startMs

    // Log if request exceeded threshold or failed
    if (elapsedMs > timeoutThreshold || !response.ok) {
      const timestamp = new Date().toISOString()

      logApiCall({
        timestamp,
        url,
        method,
        elapsedMs,
        exceeded: elapsedMs > timeoutThreshold,
        status: response.status,
      }).catch(() => {
        // Swallow errors — logging should never fail
      })
    }

    return response
  } catch (err) {
    const elapsedMs = Date.now() - startMs
    const timestamp = new Date().toISOString()
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Always log errors, regardless of threshold
    logApiCall({
      timestamp,
      url,
      method,
      elapsedMs,
      exceeded: elapsedMs > timeoutThreshold,
      error: errorMessage,
    }).catch(() => {
      // Swallow errors — logging should never fail
    })

    throw err
  }
}

/**
 * Measure the elapsed time of an async operation.
 * Logs the elapsed duration.
 *
 * Usage:
 * ```ts
 * const result = await measureElapsedTime(
 *   async () => {
 *     return await someAsyncOperation()
 *   },
 *   'https://api.example.com/data',
 *   { method: 'GET', threshold: 3000 }
 * )
 * ```
 *
 * @param operation Async function to measure
 * @param url API endpoint URL (for logging)
 * @param options Measurement options
 * @returns Result of the async operation
 */
export async function measureElapsedTime<T>(
  operation: () => Promise<T>,
  url: string,
  options?: {
    method?: string
    threshold?: number
  }
): Promise<T> {
  const startMs = Date.now()
  const method = options?.method ?? 'UNKNOWN'
  const threshold = options?.threshold ?? DEFAULT_TIMEOUT_THRESHOLD_MS

  try {
    const result = await operation()
    const elapsedMs = Date.now() - startMs

    // Log if elapsed time exceeded threshold
    if (elapsedMs > threshold) {
      const timestamp = new Date().toISOString()

      logApiCall({
        timestamp,
        url,
        method,
        elapsedMs,
        exceeded: true,
      }).catch(() => {
        // Swallow errors — logging should never fail
      })
    }

    return result
  } catch (err) {
    const elapsedMs = Date.now() - startMs
    const timestamp = new Date().toISOString()
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Log error regardless of threshold
    logApiCall({
      timestamp,
      url,
      method,
      elapsedMs,
      exceeded: elapsedMs > threshold,
      error: errorMessage,
    }).catch(() => {
      // Swallow errors — logging should never fail
    })

    throw err
  }
}

/**
 * Create a simple timeout timer that logs elapsed time.
 * Useful for tracking durations outside of fetch calls.
 *
 * Usage:
 * ```ts
 * const timer = createTimeoutTimer(
 *   'https://api.example.com/process',
 *   { threshold: 5000, method: 'POST' }
 * )
 *
 * // ... do work ...
 *
 * timer.log() // Logs if threshold exceeded
 * ```
 *
 * @param url Operation identifier (for logging)
 * @param options Timer options
 * @returns Timer object with log method
 */
export function createTimeoutTimer(
  url: string,
  options?: {
    threshold?: number
    method?: string
  }
): {
  log: () => number
  logIfExceeded: () => boolean
} {
  const startMs = Date.now()
  const threshold = options?.threshold ?? DEFAULT_TIMEOUT_THRESHOLD_MS
  const method = options?.method ?? 'UNKNOWN'

  return {
    log: (): number => {
      const elapsedMs = Date.now() - startMs
      const timestamp = new Date().toISOString()

      logApiCall({
        timestamp,
        url,
        method,
        elapsedMs,
        exceeded: elapsedMs > threshold,
      }).catch(() => {
        // Swallow errors — logging should never fail
      })

      return elapsedMs
    },

    logIfExceeded: (): boolean => {
      const elapsedMs = Date.now() - startMs

      if (elapsedMs > threshold) {
        const timestamp = new Date().toISOString()

        logApiCall({
          timestamp,
          url,
          method,
          elapsedMs,
          exceeded: true,
        }).catch(() => {
          // Swallow errors — logging should never fail
        })

        return true
      }

      return false
    },
  }
}

/**
 * Get the current default timeout threshold.
 * @returns Threshold in milliseconds
 */
export function getDefaultTimeoutThreshold(): number {
  return DEFAULT_TIMEOUT_THRESHOLD_MS
}
