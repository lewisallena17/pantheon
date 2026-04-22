/**
 * Response Router — logs which conditional branch executes during response routing.
 *
 * Routes responses based on type, status, and error conditions.
 * Logs decision path to understand routing patterns and edge cases.
 *
 * Writes asynchronously to avoid blocking response delivery.
 * Appends branch selection and route decision metadata to routing.log.
 *
 * Usage:
 * ```ts
 * const result = await routeResponse(responseData, context)
 * // Logs which branch (success, error, retry, fallback) was taken
 * ```
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const ROUTING_LOG_PATH = join(DEBUG_DIR, 'routing.log')

/**
 * Response type to route
 */
type ResponseType = 'success' | 'error' | 'retry' | 'fallback' | 'timeout'

/**
 * Response routing decision log entry
 */
interface RoutingDecisionLog {
  timestamp: string
  request_id: string
  route: string
  method: string

  // Branch execution
  branch_taken: ResponseType
  decision_reason: string
  
  // Context
  response_status?: number
  response_size?: number
  error_code?: string
  error_message?: string
  
  // Timing
  decision_time_ms: number
  response_time_ms?: number
  
  // Metadata
  attempt_number?: number
  fallback_activated?: boolean
}

/**
 * Response routing context
 */
interface RoutingContext {
  requestId: string
  route: string
  method: string
  status?: number
  size?: number
  error?: Error
  errorCode?: string
  startMs: number
  attemptNumber?: number
}

/**
 * Ensure debug directory exists
 */
async function ensureDebugDir(): Promise<void> {
  try {
    await mkdir(DEBUG_DIR, { recursive: true })
  } catch (err) {
    console.error('[response-router] Failed to create debug dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log a routing decision to disk
 * Runs asynchronously — does NOT block response delivery
 *
 * @param branch - Which branch was taken (success, error, retry, fallback, timeout)
 * @param context - Request/response context
 * @param reason - Human-readable reason for the decision
 * @param metadata - Additional metadata about the decision
 */
async function logRoutingDecision(
  branch: ResponseType,
  context: RoutingContext,
  reason: string,
  metadata?: {
    responseTime?: number
    fallbackActivated?: boolean
  },
): Promise<void> {
  try {
    const decisionTime = Date.now() - context.startMs

    const logEntry: RoutingDecisionLog = {
      timestamp: new Date().toISOString(),
      request_id: context.requestId,
      route: context.route,
      method: context.method,
      branch_taken: branch,
      decision_reason: reason,
      response_status: context.status,
      response_size: context.size,
      error_code: context.errorCode,
      error_message: context.error?.message,
      decision_time_ms: decisionTime,
      response_time_ms: metadata?.responseTime,
      attempt_number: context.attemptNumber,
      fallback_activated: metadata?.fallbackActivated,
    }

    await ensureDebugDir()

    const logLine = JSON.stringify(logEntry)

    // Fire-and-forget: append to log without awaiting
    appendFile(ROUTING_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[response-router] Failed to write log:', err instanceof Error ? err.message : String(err))
    })

    // Console log for debug visibility
    console.debug(`[response-router] ${context.requestId} | branch=${branch} | reason="${reason}"`)
  } catch (err) {
    console.error(
      '[response-router] Error in logRoutingDecision:',
      err instanceof Error ? err.message : String(err),
    )
  }
}

/**
 * Route a response based on status, error state, and retry logic.
 * Logs which branch is taken to understand routing patterns.
 *
 * Decision tree:
 * 1. If status 2xx → SUCCESS branch
 * 2. If timeout error → TIMEOUT branch
 * 3. If retryable error + attempts remaining → RETRY branch
 * 4. If error → ERROR branch
 * 5. Otherwise → FALLBACK branch
 *
 * @param context - Request/response context with status and error info
 * @returns Object indicating which branch was taken and metadata
 */
export async function routeResponse(
  context: RoutingContext,
): Promise<{ branch: ResponseType; retry: boolean; useFallback: boolean }> {
  const responseTimeMs = Date.now() - context.startMs
  const attemptNumber = context.attemptNumber ?? 1

  // BRANCH 1: Success path (2xx status code)
  if (context.status && context.status >= 200 && context.status < 300) {
    console.log(`[response-router] Branch: SUCCESS (status ${context.status})`)
    await logRoutingDecision(
      'success',
      context,
      `HTTP ${context.status} response received`,
      { responseTime: responseTimeMs },
    )
    return { branch: 'success', retry: false, useFallback: false }
  }

  // BRANCH 2: Timeout path
  if (context.error && context.errorCode === 'TIMEOUT') {
    console.warn(`[response-router] Branch: TIMEOUT (attempt ${attemptNumber})`)
    await logRoutingDecision(
      'timeout',
      context,
      `Timeout after ${responseTimeMs}ms`,
      { responseTime: responseTimeMs },
    )
    return { branch: 'timeout', retry: false, useFallback: true }
  }

  // BRANCH 3: Retryable error path
  if (
    context.error &&
    (context.errorCode === 'RATE_LIMIT' || context.errorCode === 'SERVICE_UNAVAILABLE') &&
    attemptNumber < 3
  ) {
    console.log(`[response-router] Branch: RETRY (attempt ${attemptNumber}/3, code: ${context.errorCode})`)
    await logRoutingDecision(
      'retry',
      context,
      `Retryable error (${context.errorCode}), attempt ${attemptNumber} of 3`,
      { responseTime: responseTimeMs },
    )
    return { branch: 'retry', retry: true, useFallback: false }
  }

  // BRANCH 4: Non-retryable error path
  if (context.error) {
    console.error(`[response-router] Branch: ERROR (code: ${context.errorCode}, attempt ${attemptNumber})`)
    await logRoutingDecision(
      'error',
      context,
      `Error (${context.errorCode || 'UNKNOWN'}): ${context.error.message}`,
      { responseTime: responseTimeMs },
    )
    return { branch: 'error', retry: false, useFallback: true }
  }

  // BRANCH 5: Fallback path (no clear status or error)
  console.warn(`[response-router] Branch: FALLBACK (unclear state, status: ${context.status})`)
  await logRoutingDecision(
    'fallback',
    context,
    `No clear status or error state; using fallback`,
    { responseTime: responseTimeMs, fallbackActivated: true },
  )
  return { branch: 'fallback', retry: false, useFallback: true }
}

/**
 * Helper to classify a response and determine routing.
 * Wraps routeResponse with additional classification metadata.
 *
 * @param context - Request/response context
 * @param responseBody - The actual response body (for additional classification)
 * @returns Classification and routing decision
 */
export async function classifyAndRoute(
  context: RoutingContext,
  responseBody?: unknown,
): Promise<{
  type: ResponseType
  retry: boolean
  useFallback: boolean
  classification: string
}> {
  const routing = await routeResponse(context)

  let classification = ''
  switch (routing.branch) {
    case 'success':
      classification = 'Response delivered successfully'
      break
    case 'error':
      classification = `Error: ${context.errorCode}`
      break
    case 'retry':
      classification = `Retriable condition, will retry`
      break
    case 'timeout':
      classification = `Timeout occurred`
      break
    case 'fallback':
      classification = `Using fallback response`
      break
  }

  return {
    type: routing.branch,
    retry: routing.retry,
    useFallback: routing.useFallback,
    classification,
  }
}
