/**
 * Hash logger — logs SHA256 hash of response payloads to debug/consistency.log
 *
 * Computes hash of serialized response content to track consistency,
 * detect payload mutations, and identify response differences.
 *
 * Writes asynchronously to avoid blocking response delivery.
 * Includes timestamp, request_id, hash, and payload size.
 *
 * Usage:
 * ```ts
 * const response = await anthropic.messages.create(...)
 * const responseText = JSON.stringify(response)
 * await logResponseHash(responseText, '/api/agents', 'req-12345')
 * ```
 */

import { createHash } from 'node:crypto'
import { mkdir, appendFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const CONSISTENCY_LOG_PATH = join(DEBUG_DIR, 'consistency.log')

interface HashLogEntry {
  timestamp: string
  request_id: string
  route: string
  hash: string
  size_bytes: number
}

/**
 * Compute SHA256 hash of a string payload.
 * @param payload String to hash
 * @returns Hex-encoded SHA256 hash
 */
function computeHash(payload: string): string {
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Ensure debug directory exists.
 * Called lazily on first log write.
 */
async function ensureDebugDir(): Promise<void> {
  try {
    await mkdir(DEBUG_DIR, { recursive: true })
  } catch (err) {
    // Swallow errors — directory may already exist or be read-only
    // Logging should never fail the main response
    console.error('[hash-logger] Failed to create debug dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log response hash to consistency.log.
 * Runs asynchronously — does NOT block response delivery.
 *
 * @param payload String to hash (typically JSON stringified response)
 * @param route API route path (e.g., '/api/agents/control')
 * @param requestId Unique request identifier (for tracing)
 */
export async function logResponseHash(
  payload: string,
  route: string,
  requestId: string
): Promise<void> {
  try {
    // Ensure directory exists
    await ensureDebugDir()

    const hash = computeHash(payload)
    const logEntry: HashLogEntry = {
      timestamp: new Date().toISOString(),
      request_id: requestId,
      route,
      hash,
      size_bytes: Buffer.byteLength(payload, 'utf8'),
    }

    const logLine = JSON.stringify(logEntry)

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(CONSISTENCY_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[hash-logger] Failed to write log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[hash-logger] Error in logResponseHash:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Log a response object by serializing and hashing it.
 * Convenience wrapper around logResponseHash for LLM responses.
 *
 * @param response Anthropic or LLM response object
 * @param route API route path
 * @param requestId Unique request identifier
 */
export async function logInferenceResponse(
  response: unknown,
  route: string,
  requestId: string
): Promise<void> {
  try {
    const payload = JSON.stringify(response)
    await logResponseHash(payload, route, requestId)
  } catch (err) {
    console.error(
      '[hash-logger] Error in logInferenceResponse:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Generate a request ID for tracing.
 * Uses timestamp + random suffix for uniqueness.
 *
 * @returns Request ID string (e.g., "req-1234567890-abc123")
 */
export function generateRequestId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `req-${timestamp}-${random}`
}
