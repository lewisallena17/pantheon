/**
 * Response logger — logs response generation timestamps to responses.log
 * 
 * Writes asynchronously to avoid blocking response delivery.
 * Appends ISO timestamp + route + duration on each API response.
 */

import { writeFile, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const RESPONSES_LOG_PATH = join(process.cwd(), 'responses.log')

interface LogEntry {
  timestamp: string
  route: string
  method: string
  status?: number
  durationMs: number
}

/**
 * Log a response with timestamp and duration.
 * Runs asynchronously — does NOT block response delivery.
 */
export async function logResponse(entry: LogEntry): Promise<void> {
  try {
    const logLine = JSON.stringify({
      at: entry.timestamp,
      route: entry.route,
      method: entry.method,
      status: entry.status,
      ms: entry.durationMs,
    })

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(RESPONSES_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[response-logger] Failed to write log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error('[response-logger] Error in logResponse:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Measure and log response generation time.
 * 
 * Usage in a route handler:
 * ```ts
 * const start = Date.now()
 * // ... generate response ...
 * const response = NextResponse.json({ ... })
 * measureAndLog(start, '/api/health', 'GET', response.status)
 * return response
 * ```
 */
export async function measureAndLog(
  startMs: number,
  route: string,
  method: string,
  status?: number
): Promise<void> {
  const durationMs = Date.now() - startMs
  const timestamp = new Date().toISOString()

  await logResponse({
    timestamp,
    route,
    method,
    status,
    durationMs,
  })
}
