/**
 * Consistency logger — logs identical prompt responses to responses/consistency-test.log
 *
 * Tracks prompt hashes to detect when identical prompts are submitted multiple times.
 * When a duplicate prompt is detected, logs the response and metadata to aid in
 * identifying response consistency issues.
 *
 * Writes asynchronously to avoid blocking response delivery.
 * Includes timestamp, request_id, prompt_hash, and response content/hash.
 *
 * Usage:
 * ```ts
 * const prompt = "What is the capital of France?"
 * const response = await anthropic.messages.create({ messages: [{ role: 'user', content: prompt }] })
 * await logConsistencyIfDuplicate(prompt, response, '/api/agents', 'req-12345')
 * ```
 */

import { createHash } from 'node:crypto'
import { mkdir, appendFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'

const RESPONSES_DIR = join(process.cwd(), 'responses')
const CONSISTENCY_LOG_PATH = join(RESPONSES_DIR, 'consistency-test.log')

// In-memory cache of seen prompt hashes
// Maps prompt_hash -> { count: number, firstSeenAt: string }
const promptHashCache = new Map<string, { count: number; firstSeenAt: string }>()

interface ConsistencyLogEntry {
  timestamp: string
  request_id: string
  route: string
  prompt_hash: string
  response_hash: string
  prompt_length: number
  response_length: number
  duplicate_count: number
}

/**
 * Compute SHA256 hash of a string.
 * @param input String to hash
 * @returns Hex-encoded SHA256 hash
 */
function computeHash(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Ensure responses directory exists.
 * Called lazily on first log write.
 */
async function ensureResponsesDir(): Promise<void> {
  try {
    await mkdir(RESPONSES_DIR, { recursive: true })
  } catch (err) {
    // Swallow errors — directory may already exist or be read-only
    // Logging should never fail the main response
    console.error(
      '[consistency-logger] Failed to create responses dir:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Log a duplicate prompt response to consistency-test.log.
 * Runs asynchronously — does NOT block response delivery.
 *
 * @param prompt The prompt string
 * @param response The response object (typically from LLM/Anthropic)
 * @param route API route path (e.g., '/api/wisdom')
 * @param requestId Unique request identifier (for tracing)
 */
export async function logConsistencyIfDuplicate(
  prompt: string,
  response: unknown,
  route: string,
  requestId: string
): Promise<void> {
  try {
    // Ensure directory exists
    await ensureResponsesDir()

    const promptHash = computeHash(prompt)
    const responseStr = JSON.stringify(response)
    const responseHash = computeHash(responseStr)

    // Check if we've seen this prompt hash before
    const existingEntry = promptHashCache.get(promptHash)

    if (existingEntry) {
      // This is a duplicate prompt — increment count and log
      existingEntry.count++

      const logEntry: ConsistencyLogEntry = {
        timestamp: new Date().toISOString(),
        request_id: requestId,
        route,
        prompt_hash: promptHash,
        response_hash: responseHash,
        prompt_length: Buffer.byteLength(prompt, 'utf8'),
        response_length: Buffer.byteLength(responseStr, 'utf8'),
        duplicate_count: existingEntry.count,
      }

      const logLine = JSON.stringify(logEntry)

      // Fire-and-forget: append to log without awaiting
      // This ensures the log write doesn't add latency to the response
      appendFile(CONSISTENCY_LOG_PATH, logLine + '\n').catch((err) => {
        console.error('[consistency-logger] Failed to write log:', err.message)
      })
    } else {
      // First time seeing this prompt hash — add to cache
      promptHashCache.set(promptHash, {
        count: 1,
        firstSeenAt: new Date().toISOString(),
      })
    }
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[consistency-logger] Error in logConsistencyIfDuplicate:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Get statistics about tracked prompts.
 * Useful for monitoring duplicate detection.
 *
 * @returns Object with total prompts and duplicate count
 */
export function getConsistencyStats(): {
  totalPrompts: number
  totalDuplicates: number
  cachedHashes: string[]
} {
  let totalDuplicates = 0

  for (const entry of promptHashCache.values()) {
    if (entry.count > 1) {
      totalDuplicates += entry.count - 1
    }
  }

  return {
    totalPrompts: promptHashCache.size,
    totalDuplicates,
    cachedHashes: Array.from(promptHashCache.keys()),
  }
}

/**
 * Clear the in-memory prompt hash cache.
 * Useful for testing or resetting monitoring.
 */
export function clearConsistencyCache(): void {
  promptHashCache.clear()
}

/**
 * Log a response with optional prompt for consistency tracking.
 * Convenience wrapper that accepts response metadata.
 *
 * @param prompt The input prompt/request
 * @param response The response object
 * @param metadata Additional metadata { route, requestId }
 */
export async function logResponseConsistency(
  prompt: string,
  response: unknown,
  metadata: { route: string; requestId: string }
): Promise<void> {
  await logConsistencyIfDuplicate(prompt, response, metadata.route, metadata.requestId)
}
