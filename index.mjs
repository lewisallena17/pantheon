/**
 * Query Parameter Parser with Response Depth Preference Logging
 *
 * Safely extracts and logs query parameters, with focus on response depth preference.
 * Implements privacy-aware filtering to avoid logging sensitive data (API keys, tokens).
 *
 * Usage:
 * ```js
 * import { parseQueryParams, logDepthPreference } from './index.mjs'
 *
 * const url = new URL('http://localhost:3000/api/data?depth=full&api_key=secret123')
 * const params = parseQueryParams(url)
 * logDepthPreference(params, 'api-data')
 * ```
 *
 * Output (console + file log):
 * ```json
 * {
 *   "at": "2024-01-15T12:34:56.789Z",
 *   "event": "query_depth_preference",
 *   "route": "api-data",
 *   "depth_preference": "full",
 *   "depth_level": 2,
 *   "param_count": 2,
 *   "sensitive_params_filtered": 1
 * }
 * ```
 */

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdir, appendFile } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Configuration ─────────────────────────────────────────────────────────

const CONFIG = {
  // Enable/disable depth preference logging
  ENABLE_LOGGING: process.env.LOG_QUERY_DEPTH_PREFERENCE !== 'false',

  // Log to console (in addition to file)
  LOG_TO_CONSOLE: process.env.LOG_QUERY_DEPTH_PREFERENCE_CONSOLE === 'true',

  // Log file path
  LOG_DIR: join(process.cwd(), 'logs'),
  LOG_FILE: 'query-depth-preference.log',

  // Depth level mappings
  DEPTH_LEVELS: {
    'minimal': 0,
    'shallow': 1,
    'standard': 1,
    'full': 2,
    'deep': 2,
    'complete': 3,
  },

  // Parameters that should never be logged (sensitive data)
  SENSITIVE_PARAM_PATTERNS: [
    /^(api[-_]?key|secret|token|password|auth|apikey|api_key)$/i,
    /^(x[-_]?api[-_]?key|bearer|authorization)$/i,
    /^(stripe|anthropic|supabase|github)[-_]?key$/i,
    /^(private|sk[-_]|sk_).*$/i,
  ],
}

// ── Type Definitions ──────────────────────────────────────────────────────

/**
 * Parsed query parameters with metadata
 */
class QueryParams {
  constructor() {
    this.all = new Map()      // All params (public and sensitive)
    this.public = new Map()   // Only public params (safe to log)
    this.sensitive = new Set()// Names of params that were filtered
    this.hasDepth = false
    this.depthValue = null
    this.depthLevel = null
  }

  /**
   * Get count of all parameters
   */
  getTotalCount() {
    return this.all.size
  }

  /**
   * Get count of sensitive parameters filtered
   */
  getSensitiveCount() {
    return this.sensitive.size
  }

  /**
   * Check if a parameter name matches sensitive patterns
   */
  isSensitive(paramName) {
    return CONFIG.SENSITIVE_PARAM_PATTERNS.some((pattern) => pattern.test(paramName))
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      total_params: this.getTotalCount(),
      public_params: Array.from(this.public.keys()),
      sensitive_count: this.getSensitiveCount(),
      has_depth: this.hasDepth,
      depth_preference: this.depthValue,
      depth_level: this.depthLevel,
    }
  }
}

// ── Core Functions ────────────────────────────────────────────────────────

/**
 * Check if a parameter name is sensitive (API key, token, etc.)
 *
 * @param {string} paramName - Parameter name to check
 * @returns {boolean} true if parameter matches sensitive patterns
 */
function isSensitiveParam(paramName) {
  return CONFIG.SENSITIVE_PARAM_PATTERNS.some((pattern) => pattern.test(paramName))
}

/**
 * Validate and normalize depth preference value
 *
 * @param {string|null} depthValue - Raw depth value from query params
 * @returns {Object|null} { value: string, level: number } or null if invalid
 */
function parseDepthPreference(depthValue) {
  if (!depthValue) return null

  const normalized = String(depthValue).toLowerCase().trim()

  // Check if it's a valid named depth level
  if (CONFIG.DEPTH_LEVELS.hasOwnProperty(normalized)) {
    return {
      value: normalized,
      level: CONFIG.DEPTH_LEVELS[normalized],
    }
  }

  // Check if it's a numeric depth level (0-3)
  const numericLevel = parseInt(normalized, 10)
  if (!isNaN(numericLevel) && numericLevel >= 0 && numericLevel <= 3) {
    return {
      value: `level-${numericLevel}`,
      level: numericLevel,
    }
  }

  // Invalid depth value
  return null
}

/**
 * Parse query parameters from a URL or query string.
 * Safely extracts and separates public vs. sensitive parameters.
 *
 * @param {URL|string} urlOrQuery - URL object or query string
 * @returns {QueryParams} Parsed parameters with metadata
 */
export function parseQueryParams(urlOrQuery) {
  const result = new QueryParams()

  let searchParams
  try {
    if (typeof urlOrQuery === 'string') {
      // Parse as query string (with or without leading ?)
      const query = urlOrQuery.startsWith('?') ? urlOrQuery : `?${urlOrQuery}`
      searchParams = new URLSearchParams(query)
    } else if (urlOrQuery instanceof URL) {
      // Extract from URL
      searchParams = urlOrQuery.searchParams
    } else {
      console.warn('[index.mjs] Invalid URL type:', typeof urlOrQuery)
      return result
    }
  } catch (err) {
    console.error('[index.mjs] Error parsing URL:', err.message)
    return result
  }

  // Process all parameters
  for (const [key, value] of searchParams) {
    // Store in all (including sensitive)
    result.all.set(key, value)

    // Check if this is the depth parameter
    if (key.toLowerCase() === 'depth') {
      const depthInfo = parseDepthPreference(value)
      if (depthInfo) {
        result.hasDepth = true
        result.depthValue = depthInfo.value
        result.depthLevel = depthInfo.level
      }
    }

    // Filter sensitive parameters
    if (isSensitiveParam(key)) {
      result.sensitive.add(key)
    } else {
      result.public.set(key, value)
    }
  }

  return result
}

/**
 * Ensure logging directory exists
 *
 * @private
 */
async function ensureLogDir() {
  try {
    await mkdir(CONFIG.LOG_DIR, { recursive: true })
  } catch (err) {
    console.error('[index.mjs] Failed to create log directory:', err.message)
  }
}

/**
 * Log query depth preference to file (fire-and-forget)
 *
 * @private
 */
async function logToFile(logEntry) {
  try {
    await ensureLogDir()

    const logPath = join(CONFIG.LOG_DIR, CONFIG.LOG_FILE)
    const line = JSON.stringify(logEntry) + '\n'

    await appendFile(logPath, line)
  } catch (err) {
    console.error('[index.mjs] Failed to write depth preference log:', err.message)
  }
}

/**
 * Log the response depth preference from query parameters.
 * Writes to both console (if enabled) and file log asynchronously.
 *
 * Never blocks request processing — logging is fire-and-forget.
 *
 * @param {QueryParams|URL|string} paramsOrUrl - Parsed params, URL, or query string
 * @param {string} routeName - API route identifier for logging context
 * @param {Object} [metadata={}] - Additional metadata to include in log
 */
export function logDepthPreference(paramsOrUrl, routeName, metadata = {}) {
  if (!CONFIG.ENABLE_LOGGING) return

  // Parse params if needed
  let params
  if (paramsOrUrl instanceof QueryParams) {
    params = paramsOrUrl
  } else {
    params = parseQueryParams(paramsOrUrl)
  }

  // Build log entry
  const logEntry = {
    at: new Date().toISOString(),
    event: 'query_depth_preference',
    route: routeName,
    depth_preference: params.depthValue,
    depth_level: params.depthLevel,
    has_depth_param: params.hasDepth,
    total_params: params.getTotalCount(),
    public_params: Array.from(params.public.keys()).length,
    sensitive_params_filtered: params.getSensitiveCount(),
    ...metadata,
  }

  // Console logging if enabled
  if (CONFIG.LOG_TO_CONSOLE) {
    console.log('[depth-preference]', JSON.stringify(logEntry))
  }

  // Fire-and-forget file logging
  logToFile(logEntry).catch((err) => {
    console.error('[index.mjs] Error logging to file:', err.message)
  })
}

/**
 * Extract just the depth preference level from a URL or query string.
 *
 * Convenience function for getting only the depth level without full parsing.
 *
 * @param {URL|string} urlOrQuery - URL object or query string
 * @returns {number|null} Depth level (0-3) or null if not set/invalid
 */
export function getDepthLevel(urlOrQuery) {
  const params = parseQueryParams(urlOrQuery)
  return params.depthLevel
}

/**
 * Extract just the depth preference value from a URL or query string.
 *
 * Convenience function for getting only the depth value without full parsing.
 *
 * @param {URL|string} urlOrQuery - URL object or query string
 * @returns {string|null} Depth preference (e.g., 'full', 'level-2') or null if not set
 */
export function getDepthPreference(urlOrQuery) {
  const params = parseQueryParams(urlOrQuery)
  return params.depthValue
}

/**
 * Check if a query string contains sensitive parameters that would be filtered.
 *
 * Useful for validating that sensitive data isn't being logged.
 *
 * @param {URL|string} urlOrQuery - URL object or query string
 * @returns {Array<string>} Names of sensitive parameters detected
 */
export function getSensitiveParams(urlOrQuery) {
  const params = parseQueryParams(urlOrQuery)
  return Array.from(params.sensitive)
}

// ── Default Export ────────────────────────────────────────────────────────

export default {
  parseQueryParams,
  logDepthPreference,
  getDepthLevel,
  getDepthPreference,
  getSensitiveParams,
  CONFIG,
  QueryParams,
}
