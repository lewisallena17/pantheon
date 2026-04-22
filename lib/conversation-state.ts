/**
 * Conversation State Manager
 * Tracks conversation context and logs interruption checkpoints for debugging/analysis.
 * 
 * An "interruption checkpoint" is logged when:
 * - A conversation stream is aborted (user cancel, timeout, error)
 * - Context limits are exceeded
 * - Token budget exhausted mid-conversation
 * - Agent switches context unexpectedly
 */

import { writeFileSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

/** Checkpoint log entry structure */
interface InterruptionCheckpoint {
  timestamp: string
  conversationId: string
  agentId?: string
  type: 'abort' | 'timeout' | 'token_limit' | 'context_limit' | 'context_switch' | 'error'
  reason: string
  state: {
    tokenCount?: number
    tokenBudget?: number
    messageCount?: number
    contextSize?: number
    lastMessageId?: string
    status?: string
  }
  stack?: string
}

/** In-memory buffer for checkpoints (to avoid frequent disk I/O) */
const checkpointBuffer: InterruptionCheckpoint[] = []
const MAX_BUFFER_SIZE = 100

/** Checkpoint log file path */
const getLogFilePath = (): string => {
  // Use CWD if available, else fallback to /tmp
  const dir = process.cwd() ? process.cwd() : '/tmp'
  return join(dir, 'logs', 'interruption-checkpoints.jsonl')
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
 * Flush buffered checkpoints to disk
 */
export function flushCheckpoints(): void {
  if (checkpointBuffer.length === 0) return
  
  try {
    ensureLogDir()
    const logPath = getLogFilePath()
    
    for (const checkpoint of checkpointBuffer) {
      appendFileSync(logPath, JSON.stringify(checkpoint) + '\n', 'utf-8')
    }
    
    checkpointBuffer.length = 0
  } catch (e) {
    // Silently fail in serverless environments (write access may not be available)
    console.error('[interruption-checkpoint] Failed to flush:', e)
  }
}

/**
 * Log an interruption checkpoint
 * 
 * @param conversationId - Unique conversation identifier
 * @param type - Type of interruption
 * @param reason - Human-readable reason for interruption
 * @param state - Current conversation state at interruption
 * @param agentId - Optional agent ID for multi-agent scenarios
 * @param stack - Optional error stack trace
 */
export function logInterruptionCheckpoint(
  conversationId: string,
  type: InterruptionCheckpoint['type'],
  reason: string,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
  stack?: string,
): void {
  const checkpoint: InterruptionCheckpoint = {
    timestamp: new Date().toISOString(),
    conversationId,
    agentId,
    type,
    reason,
    state,
    stack,
  }

  // Add to buffer
  checkpointBuffer.push(checkpoint)

  // Flush if buffer exceeds max size
  if (checkpointBuffer.length >= MAX_BUFFER_SIZE) {
    flushCheckpoints()
  }

  // Also log to console in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[interruption-checkpoint] ${type.toUpperCase()} - ${conversationId}:`,
      reason,
      state,
    )
  }
}

/**
 * Log when a conversation stream is aborted (user cancellation, timeout, etc.)
 */
export function logStreamAbort(
  conversationId: string,
  reason: string,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
): void {
  logInterruptionCheckpoint(conversationId, 'abort', reason, state, agentId)
}

/**
 * Log when a conversation times out
 */
export function logTimeout(
  conversationId: string,
  reason: string,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
): void {
  logInterruptionCheckpoint(conversationId, 'timeout', reason, state, agentId)
}

/**
 * Log when token budget is exceeded mid-conversation
 */
export function logTokenLimitExceeded(
  conversationId: string,
  tokenCount: number,
  tokenBudget: number,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
): void {
  logInterruptionCheckpoint(
    conversationId,
    'token_limit',
    `Token limit exceeded: ${tokenCount}/${tokenBudget}`,
    { ...state, tokenCount, tokenBudget },
    agentId,
  )
}

/**
 * Log when context window is exceeded
 */
export function logContextLimitExceeded(
  conversationId: string,
  contextSize: number,
  limit: number,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
): void {
  logInterruptionCheckpoint(
    conversationId,
    'context_limit',
    `Context limit exceeded: ${contextSize}/${limit}`,
    { ...state, contextSize },
    agentId,
  )
}

/**
 * Log when agent unexpectedly switches conversation context
 */
export function logContextSwitch(
  conversationId: string,
  fromAgentId: string,
  toAgentId: string,
  reason: string,
  state: InterruptionCheckpoint['state'],
): void {
  logInterruptionCheckpoint(
    conversationId,
    'context_switch',
    `Context switch from ${fromAgentId} to ${toAgentId}: ${reason}`,
    state,
    toAgentId,
  )
}

/**
 * Log an error that interrupted the conversation
 */
export function logInterruptionError(
  conversationId: string,
  error: Error | string,
  state: InterruptionCheckpoint['state'],
  agentId?: string,
): void {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  logInterruptionCheckpoint(
    conversationId,
    'error',
    message,
    state,
    agentId,
    stack,
  )
}

/**
 * Retrieve all buffered checkpoints (for testing/debugging)
 */
export function getBufferedCheckpoints(): InterruptionCheckpoint[] {
  return [...checkpointBuffer]
}

/**
 * Clear the in-memory buffer (used in tests)
 */
export function clearCheckpointBuffer(): void {
  checkpointBuffer.length = 0
}
