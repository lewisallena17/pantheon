/**
 * Determinism logger — logs timestamp + request hash to explore sandbox determinism.
 *
 * Computes a deterministic hash of canonical request payloads to compare multiple
 * runs of identical requests. This helps identify whether the sandbox environment
 * executes requests deterministically or if there are non-deterministic behaviors
 * (e.g., randomization, timestamp injection, environmental variables).
 *
 * Hash strategy:
 * - Sort all object keys alphabetically (deep)
 * - Use stable JSON serialization (no spaces, consistent formatting)
 * - Include request metadata (route, method, timestamp precision)
 *
 * Timestamp logging:
 * - Microsecond precision via performance.now()
 * - UTC ISO format for consistency across timezones
 * - Tracks both wall-clock time and relative timing
 *
 * Writes asynchronously to avoid blocking response delivery.
 * Includes request_id, route, hash, timestamp, and performance metrics.
 *
 * Usage:
 * ```ts
 * import { logDeterminismEvent } from '@/lib/determinism-logger'
 *
 * const payload = { user_id: 123, query: "SELECT * FROM tasks" }
 * await logDeterminismEvent({
 *   route: '/api/todos',
 *   method: 'GET',
 *   payload,
 *   requestId: 'req-12345',
 *   phase: 'request', // 'request' | 'response'
 * })
 * ```
 */

import { createHash } from 'node:crypto'
import { mkdir, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const DETERMINISM_LOG_PATH = join(DEBUG_DIR, 'determinism.log')

/**
 * Canonical JSON stringifier that produces deterministic output.
 * Sorts all keys deeply to ensure identical objects produce identical hashes.
 *
 * @param obj Object to stringify
 * @returns Canonical JSON string (no spaces, sorted keys)
 */
function canonicalStringify(obj: unknown): string {
  const seen = new WeakSet()

  const replacer = (_key: string, value: unknown): unknown => {
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value as object)) {
        return '[Circular]'
      }
      seen.add(value as object)
    }

    // Sort object keys for determinism
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const sorted: Record<string, unknown> = {}
      for (const k of Object.keys(value as Record<string, unknown>).sort()) {
        sorted[k] = (value as Record<string, unknown>)[k]
      }
      return sorted
    }

    return value
  }

  return JSON.stringify(obj, replacer)
}

/**
 * Compute SHA256 hash of a payload using canonical serialization.
 * @param payload Object or string to hash
 * @returns Hex-encoded SHA256 hash
 */
function computeRequestHash(payload: unknown): string {
  const canonical =
    typeof payload === 'string' ? payload : canonicalStringify(payload)
  return createHash('sha256').update(canonical).digest('hex')
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
    console.error(
      '[determinism-logger] Failed to create debug dir:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

interface DeterminismLogEntry {
  timestamp: string // ISO 8601 UTC
  timestamp_ms: number // Unix milliseconds
  timestamp_us: number // Unix microseconds (via perf.now())
  request_id: string
  route: string
  method: string
  phase: 'request' | 'response'
  hash: string // SHA256 of canonical payload
  payload_size_bytes: number
  perf_ms: number // performance.now() for relative timing
}

interface LogDeterminismEventOptions {
  route: string
  method: string
  payload: unknown
  requestId: string
  phase: 'request' | 'response'
  label?: string // Optional descriptive label
}

/**
 * Log a determinism event (request or response).
 * Computes hash of canonical payload and logs with precise timestamps.
 * Runs asynchronously — does NOT block request/response delivery.
 *
 * @param options Event options
 */
export async function logDeterminismEvent(
  options: LogDeterminismEventOptions
): Promise<void> {
  try {
    await ensureDebugDir()

    const { route, method, payload, requestId, phase, label } = options

    // Compute canonical hash
    const payloadStr =
      typeof payload === 'string' ? payload : canonicalStringify(payload)
    const hash = computeRequestHash(payloadStr)

    // Capture high-precision timestamps
    const now = new Date()
    const timestampMs = Date.now()
    const perfMs = performance.now()
    const timestampUs = timestampMs * 1000 + Math.floor((perfMs % 1) * 1000)

    const logEntry: DeterminismLogEntry = {
      timestamp: now.toISOString(),
      timestamp_ms: timestampMs,
      timestamp_us: timestampUs,
      request_id: requestId,
      route,
      method,
      phase,
      hash,
      payload_size_bytes: Buffer.byteLength(payloadStr, 'utf8'),
      perf_ms: perfMs,
    }

    // Add label if provided
    const enrichedEntry = label ? { ...logEntry, label } : logEntry

    const logLine = JSON.stringify(enrichedEntry)

    // Fire-and-forget: append to log without awaiting
    appendFile(DETERMINISM_LOG_PATH, logLine + '\n').catch((err) => {
      console.error(
        '[determinism-logger] Failed to write log:',
        err instanceof Error ? err.message : String(err)
      )
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main request/response
    console.error(
      '[determinism-logger] Error in logDeterminismEvent:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Convenience wrapper for logging request payloads.
 *
 * @param route API route
 * @param method HTTP method
 * @param payload Request payload
 * @param requestId Request ID
 * @param label Optional label for context
 */
export async function logRequestPayload(
  route: string,
  method: string,
  payload: unknown,
  requestId: string,
  label?: string
): Promise<void> {
  await logDeterminismEvent({
    route,
    method,
    payload,
    requestId,
    phase: 'request',
    label,
  })
}

/**
 * Convenience wrapper for logging response payloads.
 *
 * @param route API route
 * @param method HTTP method
 * @param response Response payload
 * @param requestId Request ID
 * @param label Optional label for context
 */
export async function logResponsePayload(
  route: string,
  method: string,
  response: unknown,
  requestId: string,
  label?: string
): Promise<void> {
  await logDeterminismEvent({
    route,
    method,
    payload: response,
    requestId,
    phase: 'response',
    label,
  })
}

/**
 * Parse determinism log entries from a log file (for testing/analysis).
 * Returns entries with matching hash signatures.
 *
 * @param entries Array of log line strings
 * @returns Array of parsed DeterminismLogEntry objects
 */
export function parseDeterminismLog(entries: string[]): DeterminismLogEntry[] {
  return entries
    .map((line) => {
      try {
        return JSON.parse(line) as DeterminismLogEntry
      } catch {
        return null
      }
    })
    .filter((entry) => entry !== null) as DeterminismLogEntry[]
}

/**
 * Analyze determinism log for identical request hashes.
 * Groups entries by hash and reports differences in responses.
 *
 * @param entries Array of parsed log entries
 * @returns Analysis report with hash statistics
 */
export function analyzeDeterminism(entries: DeterminismLogEntry[]): {
  totalEntries: number
  uniqueHashes: number
  hashGroups: Map<string, DeterminismLogEntry[]>
  duplicateHashes: string[]
  timingStats: {
    minMs: number
    maxMs: number
    avgMs: number
    stdDevMs: number
  }
} {
  const hashGroups = new Map<string, DeterminismLogEntry[]>()
  const timings: number[] = []

  for (const entry of entries) {
    if (!hashGroups.has(entry.hash)) {
      hashGroups.set(entry.hash, [])
    }
    hashGroups.get(entry.hash)!.push(entry)
    timings.push(entry.perf_ms)
  }

  const duplicateHashes = Array.from(hashGroups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([hash]) => hash)

  const avgMs = timings.reduce((a, b) => a + b, 0) / timings.length
  const variance =
    timings.reduce((sum, t) => sum + Math.pow(t - avgMs, 2), 0) /
    timings.length
  const stdDevMs = Math.sqrt(variance)

  return {
    totalEntries: entries.length,
    uniqueHashes: hashGroups.size,
    hashGroups,
    duplicateHashes,
    timingStats: {
      minMs: Math.min(...timings),
      maxMs: Math.max(...timings),
      avgMs,
      stdDevMs,
    },
  }
}

/**
 * Generate determinism summary from log entries.
 * Useful for quick analysis of consistency.
 *
 * @param entries Parsed log entries
 * @returns Summary report string
 */
export function summarizeDeterminism(entries: DeterminismLogEntry[]): string {
  const analysis = analyzeDeterminism(entries)

  const lines = [
    'Determinism Analysis',
    '====================',
    `Total entries: ${analysis.totalEntries}`,
    `Unique hashes: ${analysis.uniqueHashes}`,
    `Duplicate hashes: ${analysis.duplicateHashes.length}`,
    '',
    'Timing Statistics (perf_ms):',
    `  Min: ${analysis.timingStats.minMs.toFixed(2)}ms`,
    `  Max: ${analysis.timingStats.maxMs.toFixed(2)}ms`,
    `  Avg: ${analysis.timingStats.avgMs.toFixed(2)}ms`,
    `  StdDev: ${analysis.timingStats.stdDevMs.toFixed(2)}ms`,
  ]

  if (analysis.duplicateHashes.length > 0) {
    lines.push('')
    lines.push(`Duplicate hash groups: ${analysis.duplicateHashes.join(', ')}`)
  }

  return lines.join('\n')
}
