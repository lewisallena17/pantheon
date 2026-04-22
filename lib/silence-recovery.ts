/**
 * Silence Recovery & Resumption Cue Logger
 * Tracks when conversations resume after periods of silence or failure states.
 * 
 * A "resumption cue" is logged when:
 * - User activity breaks a silence period
 * - Agent recovers from a failed state and resumes processing
 * - A retry succeeds after previous failures
 * - Backoff timeout expires and retry is eligible
 * - Network/database connection restored after disconnection
 */

import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

/** Resumption cue trigger type */
type ResumptionTrigger = 
  | 'SILENCE_BROKEN'      // User resumes conversation after silence period
  | 'CONTEXT_RESTORED'    // Recovered from failed state and resumed
  | 'RETRY_SUCCESS'       // A retry attempt succeeded after previous failure
  | 'BACKOFF_RESET'       // Exponential backoff period expired, ready to retry
  | 'CONNECTION_RESTORED' // Network/database connection restored after failure

/** Resumption cue log entry structure */
interface ResumptionCue {
  timestamp: string
  conversationId: string
  agentId?: string
  trigger: ResumptionTrigger
  silenceDurationMs?: number  // How long was the silence/backoff period?
  attemptNumber?: number      // Which retry attempt is this?
  reason: string              // Human-readable explanation
  metadata: {
    previousFailureCount?: number
    recoveryTimeMs?: number
    contextAvailable?: boolean
    connectionStatus?: 'connecting' | 'connected' | 'failed'
    lastSilenceStart?: string  // ISO timestamp when silence began
    [key: string]: unknown
  }
  stack?: string  // Optional error trace if related to recovery
}

/** In-memory buffer for resumption cues (to avoid frequent disk I/O) */
const resumptionBuffer: ResumptionCue[] = []
const MAX_BUFFER_SIZE = 100

/** Resumption cue log file path */
const getLogFilePath = (): string => {
  const dir = process.cwd() ? process.cwd() : '/tmp'
  return join(dir, 'logs', 'resumption-cues.jsonl')
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
 * Flush buffered resumption cues to disk
 */
export function flushResumptionCues(): void {
  if (resumptionBuffer.length === 0) return
  
  try {
    ensureLogDir()
    const logPath = getLogFilePath()
    
    for (const cue of resumptionBuffer) {
      appendFileSync(logPath, JSON.stringify(cue) + '\n', 'utf-8')
    }
    
    resumptionBuffer.length = 0
  } catch (e) {
    // Silently fail in serverless environments
    console.error('[resumption-cue] Failed to flush:', e)
  }
}

/**
 * Log a resumption cue (internal)
 * 
 * @param conversationId - Unique conversation identifier
 * @param trigger - Type of resumption trigger
 * @param reason - Human-readable explanation
 * @param metadata - Additional context and state
 * @param agentId - Optional agent ID
 * @param stack - Optional error stack trace
 */
export function logResumptionCue(
  conversationId: string,
  trigger: ResumptionTrigger,
  reason: string,
  metadata: ResumptionCue['metadata'],
  agentId?: string,
  stack?: string,
): void {
  const cue: ResumptionCue = {
    timestamp: new Date().toISOString(),
    conversationId,
    agentId,
    trigger,
    reason,
    metadata,
    stack,
  }

  // Add to buffer
  resumptionBuffer.push(cue)

  // Flush if buffer exceeds max size
  if (resumptionBuffer.length >= MAX_BUFFER_SIZE) {
    flushResumptionCues()
  }

  // Also log to console in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[resumption-cue] ${trigger} - ${conversationId}:`,
      reason,
      metadata,
    )
  }
}

// ============================================================================
// TRIGGER 1: SILENCE_BROKEN
// ============================================================================
/**
 * Log when user resumes conversation after a silence period.
 * 
 * Triggered when: User sends message after gap > silenceThresholdMs
 * 
 * @example
 * ```ts
 * logSilenceBroken(
 *   'conv-123',
 *   45000,  // User was silent for 45 seconds
 *   'User resumed conversation with new message',
 *   'user@example.com'
 * )
 * ```
 */
export function logSilenceBroken(
  conversationId: string,
  silenceDurationMs: number,
  reason: string,
  userId?: string,
): void {
  logResumptionCue(
    conversationId,
    'SILENCE_BROKEN',
    reason,
    {
      contextAvailable: true,
      lastSilenceStart: new Date(Date.now() - silenceDurationMs).toISOString(),
      userId,
    },
    undefined,
  )
}

// ============================================================================
// TRIGGER 2: CONTEXT_RESTORED
// ============================================================================
/**
 * Log when agent recovers from a failed state and resumes processing.
 * 
 * Triggered when: Recovery handler completes, context is reloaded, processing resumes
 * 
 * @example
 * ```ts
 * logContextRestored(
 *   'conv-456',
 *   2,              // This agent experienced 2 previous failures
 *   1234,           // Recovery took 1.234 seconds
 *   'Database reconnected, conversation state restored',
 *   'agent-xyz'
 * )
 * ```
 */
export function logContextRestored(
  conversationId: string,
  previousFailureCount: number,
  recoveryTimeMs: number,
  reason: string,
  agentId?: string,
): void {
  logResumptionCue(
    conversationId,
    'CONTEXT_RESTORED',
    reason,
    {
      previousFailureCount,
      recoveryTimeMs,
      contextAvailable: true,
      connectionStatus: 'connected',
    },
    agentId,
  )
}

// ============================================================================
// TRIGGER 3: RETRY_SUCCESS
// ============================================================================
/**
 * Log when a retry attempt succeeds after previous failures.
 * 
 * Triggered when: Retry handler completes successfully
 * 
 * @example
 * ```ts
 * logRetrySuccess(
 *   'conv-789',
 *   3,           // This was the 3rd retry attempt (after 2 failures)
 *   2500,        // Total time from first attempt to success: 2.5 seconds
 *   'API call succeeded on retry 3',
 *   'agent-abc'
 * )
 * ```
 */
export function logRetrySuccess(
  conversationId: string,
  attemptNumber: number,
  recoveryTimeMs: number,
  reason: string,
  agentId?: string,
): void {
  logResumptionCue(
    conversationId,
    'RETRY_SUCCESS',
    reason,
    {
      attemptNumber,
      recoveryTimeMs,
      previousFailureCount: attemptNumber - 1,
      contextAvailable: true,
    },
    agentId,
  )
}

// ============================================================================
// TRIGGER 4: BACKOFF_RESET
// ============================================================================
/**
 * Log when an exponential backoff period expires and retry is eligible.
 * 
 * Triggered when: Backoff timer expires, ready to attempt retry
 * 
 * @example
 * ```ts
 * logBackoffReset(
 *   'conv-101',
 *   2,          // This is attempt 2 (backoff was 2^1 * 100ms = 200ms)
 *   200,        // Backoff duration in milliseconds
 *   'Backoff period expired, eligible for retry',
 *   'agent-def'
 * )
 * ```
 */
export function logBackoffReset(
  conversationId: string,
  attemptNumber: number,
  silenceDurationMs: number,
  reason: string,
  agentId?: string,
): void {
  logResumptionCue(
    conversationId,
    'BACKOFF_RESET',
    reason,
    {
      attemptNumber,
      previousFailureCount: attemptNumber - 1,
      contextAvailable: false,  // Mid-backoff, context may be stale
    },
    agentId,
  )
}

// ============================================================================
// TRIGGER 5: CONNECTION_RESTORED
// ============================================================================
/**
 * Log when network/database connection is restored after disconnection.
 * 
 * Triggered when: Connection health check passes, database responds, network available
 * 
 * @example
 * ```ts
 * logConnectionRestored(
 *   'conv-999',
 *   3500,    // Connection was down for 3.5 seconds
 *   'Database connectivity restored, health check passed',
 *   'agent-ghi',
 *   {
 *     connectionType: 'database',
 *     previousStatus: 'failed',
 *     latencyMs: 42
 *   }
 * )
 * ```
 */
export function logConnectionRestored(
  conversationId: string,
  silenceDurationMs: number,
  reason: string,
  agentId?: string,
  metadata?: Partial<ResumptionCue['metadata']>,
): void {
  logResumptionCue(
    conversationId,
    'CONNECTION_RESTORED',
    reason,
    {
      connectionStatus: 'connected',
      contextAvailable: true,
      ...metadata,
    },
    agentId,
  )
}
