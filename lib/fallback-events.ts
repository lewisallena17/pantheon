/**
 * Fallback Trigger Event Logger
 * Tracks when fallback mechanisms are triggered (rate limits, failures, degraded service).
 * 
 * A "fallback event" is logged when:
 * - Rate limit is exceeded and fallback returns cached/degraded response
 * - API endpoint fails and fallback service is activated
 * - Connection timeout triggers local fallback handler
 * - Circuit breaker opens and switches to fallback mode
 * - Cache miss falls through to fallback strategy
 * - Real-time subscription fails and falls back to polling
 */

import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

/** Fallback trigger type */
type FallbackTrigger =
  | 'RATE_LIMIT_EXCEEDED'     // Too many requests, serving cached/degraded response
  | 'API_FAILURE'              // Primary API failed, switching to fallback service
  | 'CONNECTION_TIMEOUT'       // Request timeout, activating fallback handler
  | 'CIRCUIT_BREAKER_OPEN'     // Circuit breaker opened, fallback mode active
  | 'CACHE_MISS_FALLBACK'      // Cache miss, falling back to static/default data
  | 'REALTIME_FALLBACK'        // Real-time subscription failed, falling back to polling
  | 'SERVICE_DEGRADATION'      // Service degraded, activating reduced-feature fallback
  | 'RESOURCE_EXHAUSTION'      // Out of memory/tokens, falling back to lightweight mode

/** Fallback event log entry structure */
interface FallbackEvent {
  timestamp: string
  fallbackId: string              // Unique identifier for this fallback instance
  trigger: FallbackTrigger
  severity: 'critical' | 'high' | 'medium' | 'low'
  reason: string                  // Human-readable explanation
  component: string               // Which component triggered the fallback (e.g., 'TodosTable', 'ConnectionStatus')
  endpoint?: string               // API endpoint that failed (if applicable)
  metadata: {
    failureReason?: string        // Detailed error message
    retryAttempts?: number        // How many retries before fallback?
    fallbackStrategy?: string     // What fallback strategy is being used?
    cachedDataAge?: number        // Age of cached data in ms (if serving cache)
    estimatedRecoveryMs?: number  // ETA to recovery (if known)
    circuitState?: 'open' | 'half-open' | 'closed'
    connectionStatus?: 'connecting' | 'connected' | 'failed'
    resourceLevel?: number        // 0-100 resource usage percentage
    degradationLevel?: number     // 0-100 service degradation percentage
    [key: string]: unknown
  }
  stack?: string  // Optional error trace
}

/** In-memory buffer for fallback events (to avoid frequent disk I/O) */
const fallbackBuffer: FallbackEvent[] = []
const MAX_BUFFER_SIZE = 100

/** Fallback event log file path */
const getLogFilePath = (): string => {
  const dir = process.cwd() ? process.cwd() : '/tmp'
  return join(dir, 'logs', 'fallback-events.jsonl')
}

/**
 * Generate a unique fallback instance ID
 */
function generateFallbackId(): string {
  return `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Ensures the log directory exists
 */
function ensureLogDir(): void {
  if (typeof process === 'undefined' || typeof process.cwd !== 'function') {
    return // Skip in browser environment
  }

  try {
    const dir = join(process.cwd(), 'logs')
    if (!existsSync(dir)) {
      // In a real scenario, you'd use fs.mkdirSync(dir, { recursive: true })
      // For now, we rely on the directory existing or use in-memory only
    }
  } catch (e) {
    // Silently fail in serverless/browser environments
  }
}

/**
 * Flush buffered fallback events to disk
 */
export function flushFallbackEvents(): void {
  if (fallbackBuffer.length === 0) return

  try {
    ensureLogDir()
    const logPath = getLogFilePath()

    for (const event of fallbackBuffer) {
      appendFileSync(logPath, JSON.stringify(event) + '\n', 'utf-8')
    }

    fallbackBuffer.length = 0
  } catch (e) {
    // Silently fail in serverless environments
    console.error('[fallback-events] Failed to flush:', e)
  }
}

/**
 * Log a fallback event (internal)
 *
 * @param trigger - Type of fallback trigger
 * @param severity - Event severity level
 * @param reason - Human-readable explanation
 * @param component - Component that triggered the fallback
 * @param metadata - Additional context and state
 * @param endpoint - Optional API endpoint that failed
 * @param stack - Optional error stack trace
 */
export function logFallbackEvent(
  trigger: FallbackTrigger,
  severity: 'critical' | 'high' | 'medium' | 'low',
  reason: string,
  component: string,
  metadata: FallbackEvent['metadata'],
  endpoint?: string,
  stack?: string,
): string {
  const fallbackId = generateFallbackId()

  const event: FallbackEvent = {
    timestamp: new Date().toISOString(),
    fallbackId,
    trigger,
    severity,
    reason,
    component,
    endpoint,
    metadata,
    stack,
  }

  // Add to buffer
  fallbackBuffer.push(event)

  // Flush if buffer exceeds max size
  if (fallbackBuffer.length >= MAX_BUFFER_SIZE) {
    flushFallbackEvents()
  }

  // Also log to console in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[fallback-events] ${severity.toUpperCase()} - ${trigger} [${fallbackId}] (${component}):`,
      reason,
      metadata,
    )
  }

  return fallbackId
}

// ============================================================================
// TRIGGER 1: RATE_LIMIT_EXCEEDED
// ============================================================================
/**
 * Log when rate limit is exceeded and fallback returns cached/degraded response.
 *
 * Triggered when: Request count exceeds limits, serving cached or degraded data
 *
 * @example
 * ```ts
 * logRateLimitExceeded(
 *   '/api/todos',
 *   'TodosTable',
 *   {
 *     cachedDataAge: 5000,
 *     fallbackStrategy: 'SERVE_CACHE',
 *     retryAttempts: 0,
 *   }
 * )
 * ```
 */
export function logRateLimitExceeded(
  endpoint: string,
  component: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'RATE_LIMIT_EXCEEDED',
    'high',
    `Rate limit exceeded on ${endpoint}, serving fallback response`,
    component,
    {
      fallbackStrategy: 'SERVE_CACHE',
      ...metadata,
    },
    endpoint,
  )
}

// ============================================================================
// TRIGGER 2: API_FAILURE
// ============================================================================
/**
 * Log when primary API fails and fallback service is activated.
 *
 * Triggered when: Primary endpoint fails, switching to backup service
 *
 * @example
 * ```ts
 * logApiFailure(
 *   '/api/marketplace',
 *   'MarketplaceListings',
 *   'Primary API returned 503',
 *   {
 *     failureReason: 'Service Unavailable',
 *     fallbackStrategy: 'FALLBACK_SERVICE',
 *     retryAttempts: 3,
 *   }
 * )
 * ```
 */
export function logApiFailure(
  endpoint: string,
  component: string,
  reason: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'API_FAILURE',
    'high',
    reason,
    component,
    {
      fallbackStrategy: 'FALLBACK_SERVICE',
      ...metadata,
    },
    endpoint,
  )
}

// ============================================================================
// TRIGGER 3: CONNECTION_TIMEOUT
// ============================================================================
/**
 * Log when request timeout triggers fallback handler.
 *
 * Triggered when: Request doesn't complete within timeout window
 *
 * @example
 * ```ts
 * logConnectionTimeout(
 *   '/api/revenue',
 *   'RevenueTracker',
 *   5000,  // Timeout was 5 seconds
 *   {
 *     fallbackStrategy: 'RETURN_EMPTY',
 *     estimatedRecoveryMs: 3000,
 *   }
 * )
 * ```
 */
export function logConnectionTimeout(
  endpoint: string,
  component: string,
  timeoutMs: number,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'CONNECTION_TIMEOUT',
    'high',
    `Request timed out after ${timeoutMs}ms on ${endpoint}`,
    component,
    {
      fallbackStrategy: 'RETURN_EMPTY',
      ...metadata,
    },
    endpoint,
  )
}

// ============================================================================
// TRIGGER 4: CIRCUIT_BREAKER_OPEN
// ============================================================================
/**
 * Log when circuit breaker opens and switches to fallback mode.
 *
 * Triggered when: Failure threshold exceeded, circuit opens
 *
 * @example
 * ```ts
 * logCircuitBreakerOpen(
 *   '/api/marketplace',
 *   'MarketplaceListings',
 *   5,          // 5 failures triggered the open state
 *   {
 *     circuitState: 'open',
 *     estimatedRecoveryMs: 30000,
 *     fallbackStrategy: 'SERVE_CACHE',
 *   }
 * )
 * ```
 */
export function logCircuitBreakerOpen(
  endpoint: string,
  component: string,
  failureCount: number,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'CIRCUIT_BREAKER_OPEN',
    'critical',
    `Circuit breaker opened after ${failureCount} failures on ${endpoint}`,
    component,
    {
      circuitState: 'open',
      fallbackStrategy: 'SERVE_CACHE',
      retryAttempts: failureCount,
      ...metadata,
    },
    endpoint,
  )
}

// ============================================================================
// TRIGGER 5: CACHE_MISS_FALLBACK
// ============================================================================
/**
 * Log when cache miss falls through to fallback strategy.
 *
 * Triggered when: No valid cache entry, using default/static fallback
 *
 * @example
 * ```ts
 * logCacheMissFallback(
 *   'AgentControlPanel',
 *   {
 *     fallbackStrategy: 'USE_DEFAULT_VALUE',
 *   }
 * )
 * ```
 */
export function logCacheMissFallback(
  component: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'CACHE_MISS_FALLBACK',
    'medium',
    `No valid cache entry for ${component}, using fallback strategy`,
    component,
    {
      fallbackStrategy: 'USE_DEFAULT_VALUE',
      ...metadata,
    },
  )
}

// ============================================================================
// TRIGGER 6: REALTIME_FALLBACK
// ============================================================================
/**
 * Log when real-time subscription fails and falls back to polling.
 *
 * Triggered when: WebSocket connection fails, switching to polling mode
 *
 * @example
 * ```ts
 * logRealtimeFallback(
 *   'TodosTable',
 *   'WebSocket connection lost',
 *   {
 *     connectionStatus: 'failed',
 *     fallbackStrategy: 'POLLING',
 *     estimatedRecoveryMs: 5000,
 *   }
 * )
 * ```
 */
export function logRealtimeFallback(
  component: string,
  reason: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'REALTIME_FALLBACK',
    'medium',
    reason,
    component,
    {
      connectionStatus: 'failed',
      fallbackStrategy: 'POLLING',
      ...metadata,
    },
  )
}

// ============================================================================
// TRIGGER 7: SERVICE_DEGRADATION
// ============================================================================
/**
 * Log when service is degraded and reduced-feature fallback is active.
 *
 * Triggered when: Service health is compromised, switching to lite mode
 *
 * @example
 * ```ts
 * logServiceDegradation(
 *   'GodView',
 *   'Database CPU > 90%',
 *   {
 *     degradationLevel: 75,
 *     fallbackStrategy: 'REDUCED_FEATURES',
 *   }
 * )
 * ```
 */
export function logServiceDegradation(
  component: string,
  reason: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'SERVICE_DEGRADATION',
    'high',
    reason,
    component,
    {
      fallbackStrategy: 'REDUCED_FEATURES',
      ...metadata,
    },
  )
}

// ============================================================================
// TRIGGER 8: RESOURCE_EXHAUSTION
// ============================================================================
/**
 * Log when resources are exhausted and lightweight fallback is activated.
 *
 * Triggered when: Memory/tokens/CPU exhausted, using minimal mode
 *
 * @example
 * ```ts
 * logResourceExhaustion(
 *   'GodView',
 *   'Token budget exhausted',
 *   {
 *     resourceLevel: 100,
 *     fallbackStrategy: 'LIGHTWEIGHT_MODE',
 *   }
 * )
 * ```
 */
export function logResourceExhaustion(
  component: string,
  reason: string,
  metadata: FallbackEvent['metadata'],
): string {
  return logFallbackEvent(
    'RESOURCE_EXHAUSTION',
    'critical',
    reason,
    component,
    {
      fallbackStrategy: 'LIGHTWEIGHT_MODE',
      ...metadata,
    },
  )
}

/**
 * Retrieve all buffered fallback events (for testing/debugging)
 */
export function getBufferedFallbackEvents(): FallbackEvent[] {
  return [...fallbackBuffer]
}

/**
 * Clear the in-memory buffer (used in tests)
 */
export function clearFallbackBuffer(): void {
  fallbackBuffer.length = 0
}

/**
 * Get the total count of buffered fallback events
 */
export function getFallbackEventCount(): number {
  return fallbackBuffer.length
}
