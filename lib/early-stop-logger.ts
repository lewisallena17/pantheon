/**
 * Early-stop logger — logs when response generation halts early
 *
 * Captures halt events with:
 * - ISO timestamp when generation stopped
 * - Reason for halt (max_tokens, timeout, content_filter, rate_limit, etc.)
 * - Route, method, request ID for correlation
 * - Optional token counts and status
 *
 * Writes asynchronously to early-stops.log (JSONL format) without blocking response delivery.
 *
 * Usage:
 * ```ts
 * import { logEarlyStop } from '@/lib/early-stop-logger'
 *
 * // Generation hit max token limit
 * logEarlyStop({
 *   reason: 'max_tokens',
 *   route: '/api/chat',
 *   method: 'POST',
 *   requestId: 'req-123',
 *   metadata: { total_tokens: 4096, max_tokens: 4096 }
 * })
 *
 * // Generation timed out
 * logEarlyStop({
 *   reason: 'timeout',
 *   route: '/api/generate',
 *   method: 'POST',
 *   requestId: 'req-456',
 *   metadata: { elapsed_ms: 30000, timeout_ms: 30000 }
 * })
 * ```
 */

import { appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const EARLY_STOPS_LOG_PATH = join(process.cwd(), 'early-stops.log')

/**
 * Common reasons why response generation halts early
 */
export enum EarlyStopReason {
  MAX_TOKENS = 'max_tokens',
  TIMEOUT = 'timeout',
  CONTENT_FILTER = 'content_filter',
  RATE_LIMIT = 'rate_limit',
  MAX_RETRIES = 'max_retries',
  INVALID_REQUEST = 'invalid_request',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  USER_CANCEL = 'user_cancel',
  CIRCUIT_BREAKER = 'circuit_breaker',
  MEMORY_LIMIT = 'memory_limit',
  SAFETY_VIOLATION = 'safety_violation',
  OTHER = 'other',
}

/**
 * Early stop event — represents when response generation halted early
 */
export interface EarlyStopEvent {
  /**
   * ISO timestamp when halt was detected
   */
  timestamp: string

  /**
   * Reason why generation stopped
   * One of: max_tokens, timeout, content_filter, rate_limit, etc.
   */
  reason: string | EarlyStopReason

  /**
   * API route that generated the response
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
   * Optional user ID for tracking
   */
  user_id?: string

  /**
   * HTTP status code (if response was sent)
   */
  status?: number

  /**
   * Response duration in milliseconds
   */
  duration_ms?: number

  /**
   * Additional metadata relevant to the halt reason
   * Examples:
   * - max_tokens: { total_tokens, max_tokens }
   * - timeout: { elapsed_ms, timeout_ms }
   * - rate_limit: { attempts, limit }
   * - etc.
   */
  metadata?: Record<string, unknown>

  /**
   * Wall-clock timestamp (ms from performance.now())
   */
  wall_clock_ms?: number
}

/**
 * Detect early stop reason from error or metadata.
 *
 * Examines error message, finish_reason, and constraint violations
 * to classify the cause of early generation halt.
 *
 * @param errorMessage - Error message string
 * @param finishReason - Finish reason from API (e.g., 'length', 'content_filter')
 * @param metadata - Response metadata
 * @returns Classified reason
 *
 * @example
 * ```ts
 * const reason = detectEarlyStopReason(
 *   'Max tokens exceeded',
 *   'length',
 *   { token_count: { total_tokens: 4096 } }
 * )
 * // Returns: 'max_tokens'
 * ```
 */
export function detectEarlyStopReason(
  errorMessage?: string,
  finishReason?: string,
  metadata?: Record<string, unknown>,
): EarlyStopReason | string {
  // Check finish_reason first (most reliable)
  if (finishReason === 'length') {
    return EarlyStopReason.MAX_TOKENS
  }
  if (finishReason === 'content_filter') {
    return EarlyStopReason.CONTENT_FILTER
  }

  // Check error message patterns
  if (errorMessage) {
    const msg = errorMessage.toLowerCase()
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return EarlyStopReason.TIMEOUT
    }
    if (msg.includes('rate limit') || msg.includes('rate_limit')) {
      return EarlyStopReason.RATE_LIMIT
    }
    if (msg.includes('max token') || msg.includes('max_token')) {
      return EarlyStopReason.MAX_TOKENS
    }
    if (msg.includes('content filter') || msg.includes('content_filter')) {
      return EarlyStopReason.CONTENT_FILTER
    }
    if (msg.includes('circuit break') || msg.includes('circuit_break')) {
      return EarlyStopReason.CIRCUIT_BREAKER
    }
    if (msg.includes('memory') || msg.includes('memory_limit')) {
      return EarlyStopReason.MEMORY_LIMIT
    }
    if (msg.includes('safety') || msg.includes('safety_violation')) {
      return EarlyStopReason.SAFETY_VIOLATION
    }
    if (msg.includes('cancelled') || msg.includes('user_cancel')) {
      return EarlyStopReason.USER_CANCEL
    }
    if (msg.includes('unavailable') || msg.includes('service_unavailable')) {
      return EarlyStopReason.SERVICE_UNAVAILABLE
    }
    if (msg.includes('invalid') || msg.includes('invalid_request')) {
      return EarlyStopReason.INVALID_REQUEST
    }
    if (msg.includes('retry') || msg.includes('max_retries')) {
      return EarlyStopReason.MAX_RETRIES
    }
  }

  return EarlyStopReason.OTHER
}

/**
 * Log an early stop event to early-stops.log.
 *
 * Runs asynchronously and does NOT block response delivery.
 * Useful for tracking constraint violations and understanding why
 * responses halt before completion.
 *
 * @param event - Early stop event details
 *
 * @example
 * ```ts
 * logEarlyStop({
 *   reason: 'max_tokens',
 *   route: '/api/chat',
 *   method: 'POST',
 *   request_id: 'req-123',
 *   status: 200,
 *   duration_ms: 2500,
 *   metadata: { total_tokens: 4096, max_tokens: 4096 }
 * })
 * ```
 */
export function logEarlyStop(event: Omit<EarlyStopEvent, 'timestamp'>): void {
  try {
    const wallClockMs = typeof performance !== 'undefined' ? performance.now() : undefined

    const logEntry: EarlyStopEvent = {
      timestamp: new Date().toISOString(),
      wall_clock_ms: wallClockMs,
      ...event,
    }

    // Fire-and-forget: append to log without awaiting
    appendFile(EARLY_STOPS_LOG_PATH, JSON.stringify(logEntry) + '\n').catch((err) => {
      console.error('[early-stop-logger] Failed to write log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[early-stop-logger] Error in logEarlyStop:',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Log early stop from an error with auto-detection of reason.
 *
 * Convenience wrapper that attempts to detect the halt reason from error
 * message and finish_reason, then logs the event.
 *
 * @param error - Error object or message
 * @param route - API route
 * @param method - HTTP method
 * @param finishReason - Optional finish reason (e.g., 'length', 'content_filter')
 * @param requestId - Optional request ID for correlation
 * @param metadata - Optional additional metadata
 *
 * @example
 * ```ts
 * try {
 *   // ... generate response ...
 * } catch (error) {
 *   logEarlyStopFromError(error, '/api/chat', 'POST', 'length', 'req-123')
 * }
 * ```
 */
export function logEarlyStopFromError(
  error: Error | string,
  route: string,
  method: string,
  finishReason?: string,
  requestId?: string,
  metadata?: Record<string, unknown>,
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const reason = detectEarlyStopReason(errorMessage, finishReason, metadata)

  logEarlyStop({
    reason,
    route,
    method,
    request_id: requestId,
    metadata: {
      ...metadata,
      error_message: errorMessage,
      finish_reason: finishReason,
    },
  })
}

/**
 * Check if early stop logging is enabled.
 * Reads DISABLE_EARLY_STOP_LOGGING environment variable.
 *
 * @returns true if early stop logging is enabled (default: true)
 */
export function isEarlyStopLoggingEnabled(): boolean {
  return process.env.DISABLE_EARLY_STOP_LOGGING !== 'true'
}

/**
 * Convenience builder for creating early stop events with required fields.
 * Useful for ensuring all events have consistent structure.
 *
 * @example
 * ```ts
 * const event = EarlyStopEventBuilder.forRoute('/api/chat', 'POST')
 *   .withReason('max_tokens')
 *   .withRequestId('req-123')
 *   .withMetadata({ total_tokens: 4096 })
 *   .build()
 *
 * logEarlyStop(event)
 * ```
 */
export class EarlyStopEventBuilder {
  private event: Omit<EarlyStopEvent, 'timestamp'> = {
    route: '',
    method: '',
    reason: EarlyStopReason.OTHER,
  }

  constructor(route: string, method: string) {
    this.event.route = route
    this.event.method = method
  }

  static forRoute(route: string, method: string): EarlyStopEventBuilder {
    return new EarlyStopEventBuilder(route, method)
  }

  withReason(reason: EarlyStopReason | string): this {
    this.event.reason = reason
    return this
  }

  withRequestId(requestId: string): this {
    this.event.request_id = requestId
    return this
  }

  withUserId(userId: string): this {
    this.event.user_id = userId
    return this
  }

  withStatus(status: number): this {
    this.event.status = status
    return this
  }

  withDuration(durationMs: number): this {
    this.event.duration_ms = durationMs
    return this
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.event.metadata = metadata
    return this
  }

  build(): Omit<EarlyStopEvent, 'timestamp'> {
    return { ...this.event }
  }
}
