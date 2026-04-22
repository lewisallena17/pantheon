/**
 * Response Envelope — Standard response wrapper with completion tracking.
 *
 * Provides a unified response envelope structure that wraps all API responses,
 * including a completion_marker field to track when a response is complete.
 *
 * Usage:
 * ```ts
 * const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 * envelope.completion_marker = 'SUCCESS'
 * return NextResponse.json(envelope)
 * ```
 */

/**
 * Completion marker values indicating response state
 */
export type CompletionMarker =
  | 'SUCCESS'          // Response completed successfully
  | 'ERROR'            // Response completed with error
  | 'PARTIAL'          // Response completed but with partial data
  | 'TIMEOUT'          // Response completion timed out
  | 'STREAMING'        // Response is streaming (not yet complete)
  | 'CANCELLED'        // Response was cancelled
  | 'RETRYING'         // Response is being retried
  | 'FALLBACK'         // Response using fallback data
  | 'PENDING'          // Response processing but not yet complete

/**
 * Standard response envelope that wraps all API responses.
 * Includes metadata for tracking completion and response lifecycle.
 *
 * @template T - The type of data contained in the response
 */
export interface ResponseEnvelope<T = unknown> {
  /**
   * Unique request identifier for tracing
   */
  request_id?: string

  /**
   * The actual response data
   */
  data?: T

  /**
   * Error message if response failed
   */
  error?: string | null

  /**
   * Error code for classification (TIMEOUT, RATE_LIMIT, SERVICE_UNAVAILABLE, etc.)
   */
  error_code?: string | null

  /**
   * HTTP status code
   */
  status?: number

  /**
   * Timestamp when response was generated
   */
  timestamp?: string

  /**
   * Route path that handled the request
   */
  route?: string

  /**
   * HTTP method (GET, POST, PATCH, DELETE, etc.)
   */
  method?: string

  /**
   * Duration in milliseconds from request start to response completion
   */
  duration_ms?: number

  /**
   * Marker indicating the completion state of this response
   * - SUCCESS: Response completed normally with data
   * - ERROR: Response failed with an error
   * - PARTIAL: Response succeeded but with incomplete/partial data
   * - TIMEOUT: Response generation timed out
   * - STREAMING: Response is still streaming (incomplete)
   * - CANCELLED: Response was cancelled before completion
   * - RETRYING: Response is being retried
   * - FALLBACK: Response is using fallback/cached data
   * - PENDING: Response is still being processed
   */
  completion_marker?: CompletionMarker

  /**
   * Additional metadata about the response
   */
  metadata?: Record<string, unknown>
}

/**
 * Create a new response envelope with sensible defaults.
 *
 * @param data - The response data
 * @param route - API route that generated this response
 * @param method - HTTP method (GET, POST, etc.)
 * @param requestId - Optional request ID for tracing
 * @returns A new ResponseEnvelope instance
 *
 * @example
 * ```ts
 * const envelope = createResponseEnvelope(
 *   { id: '123', title: 'My Task' },
 *   '/api/todos',
 *   'POST'
 * )
 * ```
 */
export function createResponseEnvelope<T>(
  data: T,
  route?: string,
  method?: string,
  requestId?: string,
): ResponseEnvelope<T> {
  return {
    request_id: requestId,
    data,
    timestamp: new Date().toISOString(),
    route,
    method,
    completion_marker: 'PENDING',
    metadata: {},
  }
}

/**
 * Create a response envelope for an error response.
 *
 * @param error - Error message
 * @param status - HTTP status code
 * @param errorCode - Error classification code
 * @param route - API route
 * @param method - HTTP method
 * @param requestId - Optional request ID for tracing
 * @returns A ResponseEnvelope in error state
 *
 * @example
 * ```ts
 * const errorEnvelope = createErrorEnvelope(
 *   'Item not found',
 *   404,
 *   'NOT_FOUND',
 *   '/api/todos',
 *   'GET'
 * )
 * ```
 */
export function createErrorEnvelope(
  error: string,
  status?: number,
  errorCode?: string,
  route?: string,
  method?: string,
  requestId?: string,
): ResponseEnvelope<null> {
  return {
    request_id: requestId,
    data: null,
    error,
    error_code: errorCode || null,
    status,
    timestamp: new Date().toISOString(),
    route,
    method,
    completion_marker: 'ERROR',
    metadata: {},
  }
}

/**
 * Create a response envelope for a partial/incomplete response.
 *
 * @param data - Partial response data
 * @param reason - Why the response is partial
 * @param route - API route
 * @param method - HTTP method
 * @param requestId - Optional request ID for tracing
 * @returns A ResponseEnvelope marked as PARTIAL
 *
 * @example
 * ```ts
 * const partialEnvelope = createPartialEnvelope(
 *   todos.slice(0, 10),
 *   'Timeout reached, returning first 10 items',
 *   '/api/todos',
 *   'GET'
 * )
 * ```
 */
export function createPartialEnvelope<T>(
  data: T,
  reason: string,
  route?: string,
  method?: string,
  requestId?: string,
): ResponseEnvelope<T> {
  return {
    request_id: requestId,
    data,
    timestamp: new Date().toISOString(),
    route,
    method,
    completion_marker: 'PARTIAL',
    metadata: {
      partial_reason: reason,
    },
  }
}

/**
 * Mark a response envelope as complete with the given marker.
 *
 * @param envelope - The envelope to mark complete
 * @param marker - The completion marker value
 * @param durationMs - Optional duration from start to completion
 * @returns The updated envelope
 *
 * @example
 * ```ts
 * const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 * markComplete(envelope, 'SUCCESS', Date.now() - startMs)
 * ```
 */
export function markComplete<T>(
  envelope: ResponseEnvelope<T>,
  marker: CompletionMarker,
  durationMs?: number,
): ResponseEnvelope<T> {
  envelope.completion_marker = marker
  if (durationMs !== undefined) {
    envelope.duration_ms = durationMs
  }
  return envelope
}

/**
 * Check if a response envelope is marked as complete.
 *
 * A response is considered complete if:
 * - completion_marker is one of: SUCCESS, ERROR, PARTIAL, TIMEOUT, CANCELLED, FALLBACK
 * - completion_marker is NOT: STREAMING, PENDING, RETRYING
 *
 * @param envelope - The envelope to check
 * @returns true if response is complete, false otherwise
 */
export function isResponseComplete(envelope: ResponseEnvelope): boolean {
  const incompleteMarkers: CompletionMarker[] = ['STREAMING', 'PENDING', 'RETRYING']
  return envelope.completion_marker
    ? !incompleteMarkers.includes(envelope.completion_marker)
    : false
}

/**
 * Serialize a response envelope to JSON.
 * Handles circular references and special types gracefully.
 *
 * @param envelope - The envelope to serialize
 * @param pretty - If true, format with indentation (default: false)
 * @returns JSON string representation
 */
export function serializeEnvelope(
  envelope: ResponseEnvelope,
  pretty: boolean = false,
): string {
  try {
    return JSON.stringify(envelope, null, pretty ? 2 : undefined)
  } catch (err) {
    // Fallback if serialization fails (e.g., due to circular refs)
    console.error(
      '[response] Failed to serialize envelope:',
      err instanceof Error ? err.message : String(err),
    )
    return JSON.stringify({
      request_id: envelope.request_id,
      error: 'Failed to serialize response',
      completion_marker: 'ERROR',
      timestamp: envelope.timestamp,
    })
  }
}

/**
 * Deserialize a JSON string into a ResponseEnvelope.
 * Validates completion_marker field if present.
 *
 * @param json - JSON string to deserialize
 * @returns Parsed ResponseEnvelope or null if invalid
 *
 * @example
 * ```ts
 * const envelope = deserializeEnvelope(jsonString)
 * if (envelope && isResponseComplete(envelope)) {
 *   // Process complete response
 * }
 * ```
 */
export function deserializeEnvelope(json: string): ResponseEnvelope | null {
  try {
    const parsed = JSON.parse(json) as unknown

    // Basic validation: must be an object
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[response] Deserialized value is not an object')
      return null
    }

    const envelope = parsed as ResponseEnvelope

    // Validate completion_marker if present
    if (envelope.completion_marker) {
      const validMarkers: CompletionMarker[] = [
        'SUCCESS',
        'ERROR',
        'PARTIAL',
        'TIMEOUT',
        'STREAMING',
        'CANCELLED',
        'RETRYING',
        'FALLBACK',
        'PENDING',
      ]
      if (!validMarkers.includes(envelope.completion_marker)) {
        console.warn(
          `[response] Invalid completion_marker: ${envelope.completion_marker}`,
        )
        // Don't reject — just warn, envelope is still usable
      }
    }

    return envelope
  } catch (err) {
    console.error(
      '[response] Failed to deserialize envelope:',
      err instanceof Error ? err.message : String(err),
    )
    return null
  }
}

/**
 * Get a summary of the response envelope for logging.
 *
 * @param envelope - The envelope to summarize
 * @returns A one-line summary suitable for logging
 *
 * @example
 * ```ts
 * console.log(getEnvelopeSummary(envelope))
 * // Output: [SUCCESS] GET /api/todos (200) in 45ms
 * ```
 */
export function getEnvelopeSummary(envelope: ResponseEnvelope): string {
  const marker = envelope.completion_marker || 'UNKNOWN'
  const method = envelope.method || 'UNKNOWN'
  const route = envelope.route || 'UNKNOWN'
  const status = envelope.status ? ` (${envelope.status})` : ''
  const duration = envelope.duration_ms ? ` in ${envelope.duration_ms}ms` : ''

  return `[${marker}] ${method} ${route}${status}${duration}`
}

/**
 * Get the canonical completion marker for a given HTTP status code and error state.
 *
 * Maps HTTP semantics to completion markers:
 * - 2xx → SUCCESS
 * - 4xx (non-timeout) → ERROR
 * - 5xx → FALLBACK (transient)
 * - timeout error → TIMEOUT
 * - undefined status → PENDING
 *
 * @param status - HTTP status code (optional)
 * @param hasError - Whether an error occurred
 * @param errorCode - Error classification code
 * @returns The appropriate CompletionMarker
 */
export function getCompletionMarkerForStatus(
  status?: number,
  hasError: boolean = false,
  errorCode?: string,
): CompletionMarker {
  // Timeout takes precedence
  if (errorCode === 'TIMEOUT') {
    return 'TIMEOUT'
  }

  // If no status, it's pending or cancelled
  if (!status) {
    return hasError ? 'ERROR' : 'PENDING'
  }

  // Success (2xx)
  if (status >= 200 && status < 300) {
    return 'SUCCESS'
  }

  // Server error (5xx) — use fallback
  if (status >= 500) {
    return 'FALLBACK'
  }

  // Client error (4xx) or other
  if (hasError) {
    return 'ERROR'
  }

  // Default to success if we got this far with a status
  return 'SUCCESS'
}
