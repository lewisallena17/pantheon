/**
 * Response logger — logs response generation timestamps to responses.log
 * 
 * Writes asynchronously to avoid blocking response delivery.
 * Appends ISO timestamp + route + duration + format type on each API response.
 */

import { writeFile, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const RESPONSES_LOG_PATH = join(process.cwd(), 'responses.log')

/**
 * Detect the format type of a response based on content-type header or response body.
 * Supports: json, xml, html, text, stream, buffer, unknown
 */
export function detectResponseFormat(
  contentType?: string | null,
  body?: unknown
): string {
  // If we have a content-type header, use it as primary source
  if (contentType) {
    const lowerType = contentType.toLowerCase()
    if (lowerType.includes('application/json') || lowerType.includes('json')) return 'json'
    if (lowerType.includes('application/xml') || lowerType.includes('text/xml') || lowerType.includes('xml')) return 'xml'
    if (lowerType.includes('text/html') || lowerType.includes('html')) return 'html'
    if (lowerType.includes('text/plain') || lowerType.includes('text/')) return 'text'
    if (lowerType.includes('stream') || lowerType.includes('octet-stream')) return 'stream'
  }

  // Fallback: inspect body type
  if (body) {
    if (typeof body === 'string') {
      const trimmed = (body as string).trim()
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
      if (trimmed.startsWith('<')) return 'xml'
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) return 'html'
      return 'text'
    }
    if (Buffer.isBuffer(body)) return 'buffer'
    if (body instanceof ReadableStream) return 'stream'
    // If it's an object, assume it was serialized to JSON
    if (typeof body === 'object') return 'json'
  }

  return 'unknown'
}

interface LogEntry {
  timestamp: string
  route: string
  method: string
  status?: number
  durationMs: number
  formatType?: string
}

/**
 * Log a response with timestamp, duration, and format type.
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
      format: entry.formatType || 'unknown',
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
 * Measure and log response generation time with optional format detection.
 * 
 * Usage in a route handler:
 * ```ts
 * const start = Date.now()
 * // ... generate response ...
 * const response = NextResponse.json({ ... })
 * await measureAndLog(start, '/api/health', 'GET', response.status, 'json')
 * return response
 * ```
 * 
 * Or auto-detect from content-type:
 * ```ts
 * const contentType = response.headers.get('content-type')
 * await measureAndLog(start, '/api/data', 'GET', response.status, 
 *   detectResponseFormat(contentType))
 * ```
 */
export async function measureAndLog(
  startMs: number,
  route: string,
  method: string,
  status?: number,
  formatType?: string
): Promise<void> {
  const durationMs = Date.now() - startMs
  const timestamp = new Date().toISOString()

  await logResponse({
    timestamp,
    route,
    method,
    status,
    durationMs,
    formatType: formatType || 'unknown',
  })
}
