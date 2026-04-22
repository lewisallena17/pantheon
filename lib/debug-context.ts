/**
 * Context Window Depth Logger
 * Tracks and logs context window usage at response initialization.
 * 
 * Used to debug token budget exhaustion, context limits, and measure
 * conversation depth and memory overhead in serverless environments.
 */

import { appendFileSync, existsSync } from 'fs'
import { join } from 'path'

/** Context depth snapshot at response start */
interface ContextSnapshot {
  timestamp: string
  responseId: string
  agentId?: string
  conversationId?: string
  
  // Context window metrics
  contextDepth: number          // Estimated context window depth (messages)
  contextSize: number           // Estimated context size in bytes
  contextTokens: number         // Estimated tokens used by context
  
  // Memory snapshot
  heapUsedMb: number           // V8 heap used in MB
  heapTotalMb: number          // V8 heap total in MB
  externalMb: number           // External memory in MB
  rssMemoryMb: number          // Resident set size in MB
  
  // Budget state
  tokenBudget?: number         // Total token budget for this request
  tokensAvailable?: number     // Tokens remaining before limit
  estimatedResponseTokens?: number // Est. tokens for response generation
  
  metadata?: Record<string, unknown>
}

/** In-memory buffer for context snapshots (to avoid frequent disk I/O) */
const contextBuffer: ContextSnapshot[] = []
const MAX_BUFFER_SIZE = 100

/** Context log file path */
const getLogFilePath = (): string => {
  const dir = process.cwd() ? process.cwd() : '/tmp'
  return join(dir, 'logs', 'context-depth.jsonl')
}

/**
 * Get current memory usage in MB
 */
function getMemoryMb(bytes?: number): number {
  if (!bytes) return 0
  return Math.round(bytes / 1024 / 1024 * 100) / 100
}

/**
 * Estimate token count from text length (rough heuristic: ~4 chars per token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Flush buffered snapshots to disk
 */
export function flushContextSnapshots(): void {
  if (contextBuffer.length === 0) return
  
  try {
    const logPath = getLogFilePath()
    
    for (const snapshot of contextBuffer) {
      appendFileSync(logPath, JSON.stringify(snapshot) + '\n', 'utf-8')
    }
    
    contextBuffer.length = 0
  } catch (e) {
    // Silently fail in serverless environments (write access may not be available)
    if (process.env.NODE_ENV === 'development') {
      console.error('[debug-context] Failed to flush snapshots:', e)
    }
  }
}

/**
 * Log context window depth at response initialization
 * 
 * @param responseId - Unique request/response ID
 * @param contextText - The accumulated context (conversation history, system prompt, etc.)
 * @param options - Additional metadata
 */
export function logContextDepthAtStart(
  responseId: string,
  contextText: string,
  options?: {
    agentId?: string
    conversationId?: string
    tokenBudget?: number
    tokensAvailable?: number
    estimatedResponseTokens?: number
    contextDepth?: number // Number of messages in context
    metadata?: Record<string, unknown>
  },
): void {
  let memUsage = { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 }
  
  // Capture memory snapshot (Node.js only)
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    memUsage = {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    }
  }

  const snapshot: ContextSnapshot = {
    timestamp: new Date().toISOString(),
    responseId,
    agentId: options?.agentId,
    conversationId: options?.conversationId,
    
    contextDepth: options?.contextDepth ?? 0,
    contextSize: contextText.length,
    contextTokens: estimateTokens(contextText),
    
    heapUsedMb: getMemoryMb(memUsage.heapUsed),
    heapTotalMb: getMemoryMb(memUsage.heapTotal),
    externalMb: getMemoryMb(memUsage.external),
    rssMemoryMb: getMemoryMb(memUsage.rss),
    
    tokenBudget: options?.tokenBudget,
    tokensAvailable: options?.tokensAvailable,
    estimatedResponseTokens: options?.estimatedResponseTokens,
    
    metadata: options?.metadata,
  }

  // Add to buffer
  contextBuffer.push(snapshot)

  // Flush if buffer exceeds max size
  if (contextBuffer.length >= MAX_BUFFER_SIZE) {
    flushContextSnapshots()
  }

  // Log to console in dev mode
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[debug-context] ${responseId} | depth=${snapshot.contextDepth} tokens=${snapshot.contextTokens} heap=${snapshot.heapUsedMb}MB`,
      {
        conversationId: snapshot.conversationId,
        agentId: snapshot.agentId,
        tokenBudget: snapshot.tokenBudget,
        tokensAvailable: snapshot.tokensAvailable,
      },
    )
  }
}

/**
 * Log context depth with conversation history array (convenience method)
 * 
 * @param responseId - Unique request/response ID
 * @param messages - Array of conversation messages
 * @param systemPrompt - System prompt text
 * @param options - Additional metadata
 */
export function logContextDepthFromMessages(
  responseId: string,
  messages: Array<{ role?: string; content?: string }>,
  systemPrompt?: string,
  options?: Omit<Parameters<typeof logContextDepthAtStart>[2], 'contextDepth'>,
): void {
  const contextParts = [
    systemPrompt || '',
    messages
      .map(msg => `[${msg.role || 'unknown'}] ${msg.content || ''}`)
      .join('\n'),
  ]
  const fullContext = contextParts.filter(Boolean).join('\n\n')

  logContextDepthAtStart(responseId, fullContext, {
    ...options,
    contextDepth: messages.length,
  })
}

/**
 * Retrieve all buffered snapshots (for testing/debugging)
 */
export function getBufferedSnapshots(): ContextSnapshot[] {
  return [...contextBuffer]
}

/**
 * Clear the in-memory buffer (used in tests)
 */
export function clearContextBuffer(): void {
  contextBuffer.length = 0
}
