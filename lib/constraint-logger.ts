/**
 * Constraint logger — logs response_metadata.json to track constraint hits
 *
 * Captures and logs response metadata focusing on constraint-relevant fields:
 * - Token counts (request, response, total)
 * - Finish reason (stop, length, content_filter, etc.)
 * - Constraint violations (safety flags, rate limits, timeouts)
 *
 * Writes asynchronously to constraints.log (JSONL format) without blocking response delivery.
 *
 * Usage:
 * ```ts
 * const metadata = {
 *   token_count: { response_tokens: 150, total_tokens: 250 },
 *   finish_reason: 'stop',
 *   constraint_hits: { max_tokens: true }
 * }
 * logConstraintHit(metadata, '/api/todos', 'POST', 'req-123')
 * ```
 */

import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { TokenCountFooter } from './response_metadata'

const CONSTRAINTS_LOG_PATH = join(process.cwd(), 'constraints.log')

/**
 * Constraint hit event — represents a response that hit a constraint
 */
export interface ConstraintHitEvent {
  /**
   * ISO timestamp when constraint was detected
   */
  timestamp: string

  /**
   * API route that triggered the constraint hit
   */
  route: string

  /**
   * HTTP method (GET, POST, etc.)
   */
  method: string

  /**
   * Optional request ID for correlation
   */
  request_id?: string

  /**
   * Token count information from response metadata
   */
  token_count?: TokenCountFooter

  /**
   * Finish reason: 'stop', 'length', 'content_filter', 'tool_calls', etc.
   */
  finish_reason?: string

  /**
   * Map of constraint names to whether they were hit (true = hit)
   * Examples: max_tokens, rate_limit, timeout, content_filter, etc.
   */
  constraints_hit?: Record<string, boolean>

  /**
   * HTTP status code
   */
  status?: number

  /**
   * Duration in milliseconds
   */
  duration_ms?: number

  /**
   * Additional metadata fields
   */
  metadata?: Record<string, unknown>
}

/**
 * Extract constraint-relevant metadata from a response metadata object.
 *
 * Filters to only fields relevant to constraint tracking:
 * - token_count (all fields)
 * - finish_reason
 * - Any fields explicitly marked as constraint-related
 *
 * @param metadata - Full response metadata object
 * @returns Filtered constraint-relevant metadata
 *
 * @example
 * ```ts
 * const filtered = extractConstraintMetadata({
 *   token_count: { response_tokens: 150, ... },
 *   finish_reason: 'length',
 *   other_field: 'ignored'
 * })
 * // Result: { token_count: {...}, finish_reason: 'length' }
 * ```
 */
export function extractConstraintMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}

  // Always include token_count if present
  if (metadata.token_count) {
    filtered.token_count = metadata.token_count
  }

  // Always include finish_reason if present
  if (metadata.finish_reason) {
    filtered.finish_reason = metadata.finish_reason
  }

  // Include any field that contains 'constraint' or 'hit' in its name
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase()
    if (lowerKey.includes('constraint') || lowerKey.includes('hit')) {
      filtered[key] = value
    }
  }

  return filtered
}

/**
 * Detect constraint hits based on metadata.
 *
 * A constraint hit is detected when:
 * - Token count is near limits
 * - Finish reason is 'length' or 'content_filter'
 * - Explicit constraint fields are present in metadata
 *
 * @param metadata - Response metadata to analyze
 * @param maxTokens - Optional max tokens threshold (default: 4000)
 * @returns Record of detected constraints
 *
 * @example
 * ```ts
 * const hits = detectConstraintHits({ finish_reason: 'length' })
 * // Result: { length_limit: true }
 * ```
 */
export function detectConstraintHits(
  metadata: Record<string, unknown>,
  maxTokens: number = 4000,
): Record<string, boolean> {
  const hits: Record<string, boolean> = {}

  // Check finish_reason
  const finishReason = metadata.finish_reason as string | undefined
  if (finishReason === 'length') {
    hits.length_limit = true
  }
  if (finishReason === 'content_filter') {
    hits.content_filter = true
  }

  // Check token counts
  const tokenCount = metadata.token_count as TokenCountFooter | undefined
  if (tokenCount && tokenCount.total_tokens) {
    if (tokenCount.total_tokens >= maxTokens) {
      hits.max_tokens = true
    }
    // Flag if approaching limit (>80%)
    if (tokenCount.total_tokens >= maxTokens * 0.8) {
      hits.approaching_token_limit = true
    }
  }

  // Check explicit constraint fields
  if (metadata.constraints_hit && typeof metadata.constraints_hit === 'object') {
    Object.assign(hits, metadata.constraints_hit as Record<string, boolean>)
  }

  return hits
}

/**
 * Log a constraint hit event to constraints.log.
 *
 * Runs asynchronously and does NOT block response delivery.
 *
 * @param metadata - Response metadata with constraint information
 * @param route - API route
 * @param method - HTTP method
 * @param requestId - Optional request ID for tracing
 * @param status - Optional HTTP status code
 * @param durationMs - Optional response duration
 *
 * @example
 * ```ts
 * logConstraintHit(
 *   { token_count: {...}, finish_reason: 'length' },
 *   '/api/chat',
 *   'POST',
 *   'req-123',
 *   200,
 *   1250
 * )
 * ```
 */
export function logConstraintHit(
  metadata: Record<string, unknown>,
  route: string,
  method: string,
  requestId?: string,
  status?: number,
  durationMs?: number,
): void {
  try {
    const constraintsHit = detectConstraintHits(metadata)

    // Only log if there are actual constraints hit
    if (Object.keys(constraintsHit).length === 0) {
      return
    }

    const event: ConstraintHitEvent = {
      timestamp: new Date().toISOString(),
      route,
      method,
      request_id: requestId,
      status,
      duration_ms: durationMs,
      constraints_hit: constraintsHit,
    }

    // Add filtered metadata
    const filtered = extractConstraintMetadata(metadata)
    if (Object.keys(filtered).length > 0) {
      event.metadata = filtered
    }

    // Fire-and-forget: append to log without awaiting
    appendFile(CONSTRAINTS_LOG_PATH, JSON.stringify(event) + '\n').catch((err) => {
      console.error('[constraint-logger] Failed to write log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[constraint-logger] Error in logConstraintHit:',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Log all response metadata (for audit/debug purposes).
 *
 * Writes the complete metadata object to constraints.log without filtering.
 * Useful for post-analysis and debugging constraint violations.
 *
 * @param metadata - Full response metadata
 * @param route - API route
 * @param method - HTTP method
 * @param requestId - Optional request ID
 *
 * @example
 * ```ts
 * logMetadataAudit(fullMetadata, '/api/todos', 'GET', 'req-456')
 * ```
 */
export function logMetadataAudit(
  metadata: Record<string, unknown>,
  route: string,
  method: string,
  requestId?: string,
): void {
  try {
    const event: ConstraintHitEvent = {
      timestamp: new Date().toISOString(),
      route,
      method,
      request_id: requestId,
      metadata,
    }

    // Fire-and-forget
    appendFile(CONSTRAINTS_LOG_PATH, JSON.stringify(event) + '\n').catch((err) => {
      console.error('[constraint-logger] Failed to write audit log:', err.message)
    })
  } catch (err) {
    console.error(
      '[constraint-logger] Error in logMetadataAudit:',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Check if constraint logging is enabled.
 * Reads DISABLE_CONSTRAINT_LOGGING environment variable.
 *
 * @returns true if constraint logging is enabled (default: true)
 */
export function isConstraintLoggingEnabled(): boolean {
  return process.env.DISABLE_CONSTRAINT_LOGGING !== 'true'
}

/**
 * Get the path to the constraints log file.
 *
 * @returns Full file path to constraints.log
 */
export function getConstraintsLogPath(): string {
  return CONSTRAINTS_LOG_PATH
}
