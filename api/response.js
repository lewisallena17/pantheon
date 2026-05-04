/**
 * Centralized response handler with timestamp delta logging.
 * 
 * Provides a unified interface for API routes to:
 * - Capture request entry timestamps
 * - Measure response generation latency
 * - Log perceived delays (delta between request arrival and response completion)
 * - Integrate with existing latency and response logging utilities
 * 
 * This module enables detecting delays in:
 * - Request queuing (time from handler entry to actual processing start)
 * - Response generation (time from processing start to response ready)
 * - Total perceived latency (sum of queuing + generation)
 * 
 * Usage in a route handler:
 * ```ts
 * import { startResponseTiming, measureResponseDelta } from '@/api/response'
 * 
 * export async function GET(req: NextRequest) {
 *   const timing = startResponseTiming('/api/health', 'GET', req.headers.get('x-request-id'))
 *   
 *   // ... generate response ...
 *   const response = NextResponse.json(data)
 *   
 *   // Log the complete timing delta
 *   timing.logComplete(response.status)
 *   return response
 * }
 * ```
 */

/**
 * Response timing measurement configuration.
 * Controls how timestamp deltas are captured and logged.
 */
const TIMING_CONFIG = {
  // Enable/disable timestamp delta logging
  ENABLE_DELTAS: process.env.LOG_RESPONSE_DELTAS !== 'false',
  
  // Log delta details to console (in addition to fire-and-forget file log)
  LOG_TO_CONSOLE: process.env.LOG_RESPONSE_DELTAS_CONSOLE === 'true',
  
  // Threshold (ms) above which a delta is considered a "slow" response
  SLOW_THRESHOLD_MS: parseInt(process.env.RESPONSE_SLOW_THRESHOLD_MS || '1000', 10),
  
  // Threshold (ms) above which a delta is considered excessive delay
  EXCESSIVE_THRESHOLD_MS: parseInt(process.env.RESPONSE_EXCESSIVE_THRESHOLD_MS || '5000', 10),
}

/**
 * Classification for perceived delay based on duration.
 */
export const DELAY_CLASSIFICATION = {
  INSTANT: { label: 'instant', maxMs: 100 },
  FAST: { label: 'fast', maxMs: 500 },
  NORMAL: { label: 'normal', maxMs: 1000 },
  SLOW: { label: 'slow', maxMs: 5000 },
  EXCESSIVE: { label: 'excessive', minMs: 5000 },
}

/**
 * Classify a response duration into a perceived delay category.
 * 
 * @param durationMs Duration in milliseconds
 * @returns Classification label: 'instant', 'fast', 'normal', 'slow', or 'excessive'
 */
export function classifyDelay(durationMs) {
  if (durationMs <= DELAY_CLASSIFICATION.INSTANT.maxMs) return 'instant'
  if (durationMs <= DELAY_CLASSIFICATION.FAST.maxMs) return 'fast'
  if (durationMs <= DELAY_CLASSIFICATION.NORMAL.maxMs) return 'normal'
  if (durationMs <= DELAY_CLASSIFICATION.SLOW.maxMs) return 'slow'
  return 'excessive'
}

/**
 * Detailed timing delta breakdown.
 * Tracks multiple phases of request/response lifecycle.
 */
export class TimingDelta {
  /**
   * Request entry timestamp (when handler starts).
   * Captured with Date.now() for wall-clock accuracy.
   */
  requestStartMs

  /**
   * Wall-clock timestamp when measurement began.
   * Captured with new Date() for formatted logging.
   */
  startTimestamp

  /**
   * API route path (e.g., '/api/health').
   */
  route

  /**
   * HTTP method (GET, POST, PATCH, DELETE, etc.).
   */
  method

  /**
   * Optional request ID for tracing/correlation.
   */
  requestId

  /**
   * Optional user ID or session identifier.
   */
  userId

  /**
   * Response generation started timestamp.
   * Optional: when actual processing began (if different from handler entry).
   */
  processingStartMs

  /**
   * Response completion timestamp.
   * Set when response is ready to send.
   */
  responseEndMs

  /**
   * HTTP status code of the response.
   */
  status

  /**
   * Error code (if response failed).
   */
  errorCode

  /**
   * Create a new TimingDelta instance.
   * 
   * @param route API route path
   * @param method HTTP method
   * @param requestId Optional request ID
   * @param userId Optional user ID
   */
  constructor(route, method, requestId, userId) {
    this.requestStartMs = Date.now()
    this.startTimestamp = new Date()
    this.route = route
    this.method = method
    this.requestId = requestId
    this.userId = userId
    this.processingStartMs = null
    this.responseEndMs = null
    this.status = null
    this.errorCode = null
  }

  /**
   * Mark when processing actually began (if different from handler entry).
   * Useful for measuring queuing delay.
   * 
   * @param processingStartMs Timestamp when processing started
   * @returns this (for chaining)
   */
  setProcessingStart(processingStartMs) {
    this.processingStartMs = processingStartMs
    return this
  }

  /**
   * Total queuing delay (time from handler entry to processing start).
   * Returns 0 if processingStartMs was not set.
   * 
   * @returns Queuing delay in milliseconds
   */
  getQueuingDelayMs() {
    if (!this.processingStartMs) return 0
    return this.processingStartMs - this.requestStartMs
  }

  /**
   * Response generation latency (time from processing start to response end).
   * If processingStartMs not set, measures from request start.
   * 
   * @returns Generation latency in milliseconds
   */
  getGenerationLatencyMs() {
    if (!this.responseEndMs) return 0
    const startRef = this.processingStartMs || this.requestStartMs
    return this.responseEndMs - startRef
  }

  /**
   * Total perceived delay (time from handler entry to response completion).
   * This is the delay the client sees.
   * 
   * @returns Total perceived delay in milliseconds
   */
  getTotalDelayMs() {
    if (!this.responseEndMs) return 0
    return this.responseEndMs - this.requestStartMs
  }

  /**
   * Classify the total perceived delay.
   * 
   * @returns Classification label: 'instant', 'fast', 'normal', 'slow', or 'excessive'
   */
  getDelayClassification() {
    return classifyDelay(this.getTotalDelayMs())
  }

  /**
   * Check if this response should be flagged as "slow".
   * 
   * @returns true if total delay exceeds SLOW_THRESHOLD_MS
   */
  isSlowResponse() {
    return this.getTotalDelayMs() > TIMING_CONFIG.SLOW_THRESHOLD_MS
  }

  /**
   * Check if this response has excessive delay.
   * 
   * @returns true if total delay exceeds EXCESSIVE_THRESHOLD_MS
   */
  hasExcessiveDelay() {
    return this.getTotalDelayMs() > TIMING_CONFIG.EXCESSIVE_THRESHOLD_MS
  }

  /**
   * Mark response as complete and log timing delta.
   * Fire-and-forget: logs asynchronously without blocking response delivery.
   * 
   * @param status HTTP status code
   * @param errorCode Optional error code (if response is error)
   */
  logComplete(status, errorCode) {
    this.responseEndMs = Date.now()
    this.status = status
    this.errorCode = errorCode || null

    // Fire-and-forget async logging
    if (TIMING_CONFIG.ENABLE_DELTAS) {
      this._logDeltasAsync().catch((err) => {
        console.error('[response.js] Error logging timing deltas:', err.message)
      })
    }
  }

  /**
   * Internal: async logging of timing deltas.
   * Never blocks response delivery.
   * 
   * @private
   */
  async _logDeltasAsync() {
    try {
      const totalMs = this.getTotalDelayMs()
      const queuingMs = this.getQueuingDelayMs()
      const generationMs = this.getGenerationLatencyMs()
      const classification = this.getDelayClassification()

      const logEntry = {
        at: this.startTimestamp.toISOString(),
        event: 'response_delta',
        route: this.route,
        method: this.method,
        status: this.status,
        error_code: this.errorCode,
        total_ms: totalMs,
        queuing_ms: queuingMs,
        generation_ms: generationMs,
        classification,
        is_slow: this.isSlowResponse(),
        has_excessive: this.hasExcessiveDelay(),
        request_id: this.requestId,
        user_id: this.userId,
      }

      // Console logging if enabled
      if (TIMING_CONFIG.LOG_TO_CONSOLE) {
        console.log('[response-delta]', JSON.stringify(logEntry))
      }

      // Append to response-deltas.log (async, non-blocking)
      const { appendFile } = await import('node:fs/promises')
      const { join } = await import('node:path')
      const logPath = join(process.cwd(), 'response-deltas.log')
      await appendFile(logPath, JSON.stringify(logEntry) + '\n').catch((err) => {
        console.error('[response.js] Failed to write response-deltas.log:', err.message)
      })
    } catch (err) {
      // Swallow errors — logging should never fail the main request
      console.error('[response.js] Error in _logDeltasAsync:', err instanceof Error ? err.message : String(err))
    }
  }

  /**
   * Convert timing data to JSON-serializable object.
   * Useful for including in response metadata or logs.
   * 
   * @returns Plain object with timing measurements
   */
  toJSON() {
    return {
      route: this.route,
      method: this.method,
      status: this.status,
      error_code: this.errorCode,
      total_ms: this.getTotalDelayMs(),
      queuing_ms: this.getQueuingDelayMs(),
      generation_ms: this.getGenerationLatencyMs(),
      classification: this.getDelayClassification(),
      is_slow: this.isSlowResponse(),
      has_excessive: this.hasExcessiveDelay(),
      request_id: this.requestId,
      user_id: this.userId,
    }
  }
}

/**
 * Start response timing measurement.
 * Call at the beginning of a request handler.
 * 
 * @param route API route path (e.g., '/api/todos')
 * @param method HTTP method (GET, POST, etc.)
 * @param requestId Optional request ID for tracing
 * @param userId Optional user ID for analytics
 * @returns TimingDelta instance for measuring and logging delays
 * 
 * @example
 * ```ts
 * export async function GET(req: NextRequest) {
 *   const timing = startResponseTiming('/api/data', 'GET', req.headers.get('x-request-id'))
 *   
 *   // ... generate response ...
 *   const response = NextResponse.json(data)
 *   
 *   // Log the timing delta
 *   timing.logComplete(response.status)
 *   return response
 * }
 * ```
 */
export function startResponseTiming(route, method, requestId, userId) {
  return new TimingDelta(route, method, requestId, userId)
}

/**
 * Measure and log response delta.
 * Convenience wrapper that combines start, processing, and logging.
 * 
 * @param fn Async function that generates the response
 * @param route API route path
 * @param method HTTP method
 * @param requestId Optional request ID
 * @param userId Optional user ID
 * @returns Object with response and timing data
 * 
 * @example
 * ```ts
 * const { response, timing } = await measureResponseDelta(
 *   async () => {
 *     const data = await fetchData()
 *     return NextResponse.json(data)
 *   },
 *   '/api/data',
 *   'GET'
 * )
 * return response
 * ```
 */
export async function measureResponseDelta(fn, route, method, requestId, userId) {
  const timing = startResponseTiming(route, method, requestId, userId)

  try {
    const response = await fn()
    timing.logComplete(response.status)
    return { response, timing }
  } catch (err) {
    timing.logComplete(500, 'INTERNAL_ERROR')
    throw err
  }
}

/**
 * Format a timing delta for human-readable output.
 * Useful for logging or debugging.
 * 
 * @param delta TimingDelta instance
 * @returns Formatted string with timing breakdown
 * 
 * @example
 * ```
 * GET /api/data 200 OK | total 125ms (q:10ms + g:115ms) | fast
 * ```
 */
export function formatTimingDelta(delta) {
  const statusLabel = delta.status >= 400 ? 'ERROR' : 'OK'
  const classification = delta.getDelayClassification()
  const totalMs = delta.getTotalDelayMs()
  const queuingMs = delta.getQueuingDelayMs()
  const generationMs = delta.getGenerationLatencyMs()

  return (
    `${delta.method} ${delta.route} ${delta.status} ${statusLabel} | ` +
    `total ${totalMs}ms (q:${queuingMs}ms + g:${generationMs}ms) | ` +
    classification
  )
}

/**
 * Check if response timing delta logging is enabled.
 * 
 * @returns true if timing logging is active
 */
export function isTimingDeltaLoggingEnabled() {
  return TIMING_CONFIG.ENABLE_DELTAS
}

/**
 * Get current timing configuration.
 * Useful for debugging or auditing logging behavior.
 * 
 * @returns Current timing configuration object
 */
export function getTimingConfig() {
  return { ...TIMING_CONFIG }
}
