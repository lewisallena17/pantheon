/**
 * Query Router — logs decision point when a query has >1 valid handler.
 *
 * Validates handlers against a query request and logs whenever multiple
 * handlers are considered valid. This helps identify routing ambiguities
 * and understand handler selection logic.
 *
 * Writes asynchronously to avoid blocking request processing.
 * Appends handler validation logs to debug/handler-selection.log.
 *
 * Usage:
 * ```js
 * const handlers = [GET, POST, PUT]
 * const decision = await validateAndRoute(query, handlers)
 * // Logs if multiple handlers are valid for the query
 * ```
 */

const fs = require('node:fs/promises')
const path = require('node:path')

const DEBUG_DIR = path.join(process.cwd(), 'debug')
const HANDLER_SELECTION_LOG = path.join(DEBUG_DIR, 'handler-selection.log')

/**
 * Handler validation result
 */
class HandlerValidation {
  constructor(handlerName, isValid, reason) {
    this.handlerName = handlerName
    this.isValid = isValid
    this.reason = reason
  }
}

/**
 * Handler selection decision log entry
 */
class HandlerDecisionLog {
  constructor(requestId, route, method, timestamp) {
    this.timestamp = timestamp
    this.request_id = requestId
    this.route = route
    this.method = method
    this.validHandlers = []
    this.selectedHandler = null
    this.decisionReason = ''
    this.handlerCount = 0
    this.multipleValidHandlers = false
  }
}

/**
 * Ensure debug directory exists
 */
async function ensureDebugDir() {
  try {
    await fs.mkdir(DEBUG_DIR, { recursive: true })
  } catch (err) {
    console.error(
      '[router] Failed to create debug dir:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Log handler selection decision to disk
 * Runs asynchronously — does NOT block request processing
 *
 * @param {HandlerDecisionLog} logEntry - Decision log entry to write
 */
async function logHandlerDecision(logEntry) {
  try {
    await ensureDebugDir()

    const logLine = JSON.stringify({
      timestamp: logEntry.timestamp,
      request_id: logEntry.request_id,
      route: logEntry.route,
      method: logEntry.method,
      valid_handlers: logEntry.validHandlers,
      valid_handler_count: logEntry.validHandlers.length,
      selected_handler: logEntry.selectedHandler,
      multiple_valid_handlers: logEntry.multipleValidHandlers,
      decision_reason: logEntry.decisionReason,
    })

    // Fire-and-forget: append to log without awaiting
    fs.appendFile(HANDLER_SELECTION_LOG, logLine + '\n').catch((err) => {
      console.error('[router] Failed to write handler selection log:', err.message)
    })

    // Console log for debug visibility when multiple handlers found
    if (logEntry.multipleValidHandlers) {
      console.warn(
        `[router] DECISION POINT: ${logEntry.request_id} | route=${logEntry.route} | ` +
        `method=${logEntry.method} | valid_handlers=[${logEntry.validHandlers.join(', ')}] | ` +
        `selected="${logEntry.selectedHandler}" | reason="${logEntry.decisionReason}"`
      )
    }
  } catch (err) {
    console.error(
      '[router] Error in logHandlerDecision:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Validate a single handler against a query.
 * Returns whether the handler is valid for this request.
 *
 * @param {string} handlerName - Name of the handler (e.g., 'GET', 'POST')
 * @param {Function} handler - The handler function to validate
 * @param {Object} query - Query object containing request metadata
 * @param {string} query.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} query.path - Request path
 * @param {Object} [query.headers] - Request headers
 * @returns {HandlerValidation} Validation result with reason
 */
function validateHandler(handlerName, handler, query) {
  // Handler must be a function
  if (typeof handler !== 'function') {
    return new HandlerValidation(
      handlerName,
      false,
      'handler is not a function'
    )
  }

  // Handler name must match the HTTP method (GET, POST, PUT, DELETE, PATCH, etc.)
  const methodMatch = handlerName.toUpperCase() === query.method.toUpperCase()
  if (!methodMatch) {
    return new HandlerValidation(
      handlerName,
      false,
      `method mismatch: handler="${handlerName}" but query.method="${query.method}"`
    )
  }

  // If this handler has route constraints, validate them
  if (handler.routes && Array.isArray(handler.routes)) {
    const pathMatches = handler.routes.some((route) => {
      // Simple wildcard matching for route patterns
      if (route === '*') return true
      if (route === query.path) return true
      // TODO: Add regex/pattern matching if needed
      return false
    })

    if (!pathMatches) {
      return new HandlerValidation(
        handlerName,
        false,
        `path not in handler routes: ${handler.routes.join(', ')}`
      )
    }
  }

  // All validations passed
  return new HandlerValidation(
    handlerName,
    true,
    'matches method and constraints'
  )
}

/**
 * Validate and select a handler from a list of candidates.
 * Logs when multiple handlers are valid for a query.
 *
 * @param {Object} query - Query object with request metadata
 * @param {string} query.requestId - Unique request identifier
 * @param {string} query.method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param {string} query.path - Request path
 * @param {string} [query.route] - API route identifier
 * @param {Object} handlers - Object mapping handler names to handler functions
 *   Example: { GET: getHandler, POST: postHandler, PUT: putHandler }
 * @returns {Promise<{handler: Function, selectedName: string}>} Selected handler and its name
 */
async function validateAndRoute(query, handlers) {
  const startMs = Date.now()
  const timestamp = new Date().toISOString()
  const requestId = query.requestId || `req-${Date.now()}`
  const route = query.route || 'unknown'

  // Validate all handlers
  const validations = []
  const handlerEntries = Object.entries(handlers || {})

  for (const [handlerName, handler] of handlerEntries) {
    const validation = validateHandler(handlerName, handler, query)
    validations.push(validation)
  }

  // Filter to only valid handlers
  const validHandlers = validations
    .filter((v) => v.isValid)
    .map((v) => v.handlerName)

  // Create decision log
  const decisionLog = new HandlerDecisionLog(requestId, route, query.method, timestamp)
  decisionLog.validHandlers = validHandlers
  decisionLog.handlerCount = validHandlers.length

  // Determine selection strategy
  let selectedHandler = null
  let decisionReason = ''

  if (validHandlers.length === 0) {
    // No valid handlers
    selectedHandler = null
    decisionReason = 'no valid handlers found for this query'
    console.error(
      `[router] ERROR: ${requestId} | route=${route} | method=${query.method} | ` +
      `No valid handlers. Available: ${handlerEntries.map((e) => e[0]).join(', ')}`
    )
  } else if (validHandlers.length === 1) {
    // Single valid handler - deterministic selection
    selectedHandler = validHandlers[0]
    decisionReason = 'single valid handler matched'
  } else {
    // **DECISION POINT: Multiple valid handlers found**
    decisionLog.multipleValidHandlers = true
    
    // Select first valid handler as fallback
    selectedHandler = validHandlers[0]
    decisionReason = `multiple valid handlers found (${validHandlers.join(', ')}); selected first`

    console.warn(
      `[router] DECISION POINT: Multiple valid handlers detected for ${requestId}`
    )
    console.warn(
      `  Route: ${route} | Method: ${query.method} | Path: ${query.path}`
    )
    console.warn(`  Valid handlers: [${validHandlers.join(', ')}]`)
    console.warn(`  Selected: "${selectedHandler}" (first match)`)
  }

  decisionLog.selectedHandler = selectedHandler
  decisionLog.decisionReason = decisionReason

  // Log the decision (async, non-blocking)
  await logHandlerDecision(decisionLog)

  // Return selected handler
  if (!selectedHandler || !handlers[selectedHandler]) {
    return {
      handler: null,
      selectedName: null,
      error: decisionReason,
    }
  }

  return {
    handler: handlers[selectedHandler],
    selectedName: selectedHandler,
    allValidHandlers: validHandlers,
    decisionTimeMs: Date.now() - startMs,
  }
}

/**
 * Get handler selection statistics.
 * Returns counts of decision points with multiple valid handlers.
 *
 * @returns {Object} Statistics object
 */
let multipleHandlerCount = 0
let totalDecisions = 0

function recordDecision(hadMultiple) {
  totalDecisions++
  if (hadMultiple) {
    multipleHandlerCount++
  }
}

function getHandlerStats() {
  return {
    totalDecisions,
    multipleHandlerDecisions: multipleHandlerCount,
    multipleHandlerPercentage:
      totalDecisions > 0
        ? ((multipleHandlerCount / totalDecisions) * 100).toFixed(2)
        : '0.00',
  }
}

function resetHandlerStats() {
  multipleHandlerCount = 0
  totalDecisions = 0
}

// Export API
module.exports = {
  validateAndRoute,
  validateHandler,
  HandlerValidation,
  HandlerDecisionLog,
  getHandlerStats,
  resetHandlerStats,
  recordDecision,
}
