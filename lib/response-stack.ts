/**
 * Response Stack Depth Logger
 * 
 * Logs nesting depth when Claude references prior turns in the conversation.
 * Tracks context-chain operations and detects when prior-turn data is accessed.
 * 
 * Usage:
 * ```ts
 * const stack = new ResponseStack(requestId)
 * stack.pushContext('system_prompt', systemPromptText)
 * stack.pushContext('prior_turn_1', priorTurnData)
 * stack.logDepthOnPriorTurnReference()
 * ```
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const RESPONSE_STACK_LOG_PATH = join(DEBUG_DIR, 'response-stack.log')

/** A single context layer in the stack */
interface ContextLayer {
  id: string
  type: 'system_prompt' | 'prior_turn' | 'user_input' | 'agent_state' | 'memory' | 'other'
  sizeBytes: number
  tokenEstimate: number
  timestamp: string
  isPriorTurn: boolean
}

/** Stack depth log entry when prior turn is referenced */
interface StackDepthLog {
  timestamp: string
  request_id: string
  route?: string
  
  // Nesting depth metrics
  current_depth: number                 // Total layers currently on stack
  prior_turn_references: number         // Count of prior-turn context layers
  max_depth_reached: number            // Peak depth during this request
  
  // Context chain details
  context_chain: Array<{
    layer_id: string
    type: string
    size_bytes: number
    token_estimate: number
    is_prior_turn: boolean
  }>
  
  // Memory and performance metrics
  total_context_size_bytes: number
  total_tokens_estimated: number
  operation: 'push' | 'pop' | 'reference_detected'
  
  // Debug info
  level: 'info' | 'debug' | 'warn'
  metadata?: Record<string, unknown>
}

/**
 * Response stack tracker — maintains depth metrics for a single request
 */
export class ResponseStack {
  private requestId: string
  private route?: string
  private contextLayers: ContextLayer[] = []
  private maxDepthReached: number = 0
  private priorTurnReferences: number = 0

  constructor(requestId: string, route?: string) {
    this.requestId = requestId
    this.route = route
  }

  /**
   * Estimate tokens from byte count (rough heuristic: ~4 chars per token)
   */
  private estimateTokens(sizeBytes: number): number {
    // Assuming UTF-8 encoding: ~1 byte per character, ~4 characters per token
    return Math.ceil(sizeBytes / 4)
  }

  /**
   * Push a context layer onto the stack
   * @param layerId - Unique identifier for this context layer
   * @param type - Type of context layer
   * @param contentOrSizeBytes - Either the content string or a byte count
   * @param isSameTurn - If false or undefined, assumes it's from a prior turn
   */
  public pushContext(
    layerId: string,
    type: ContextLayer['type'],
    contentOrSizeBytes: string | number,
    isSameTurn: boolean = true,
  ): void {
    const sizeBytes = typeof contentOrSizeBytes === 'string'
      ? Buffer.byteLength(contentOrSizeBytes, 'utf-8')
      : contentOrSizeBytes

    const isPriorTurn = !isSameTurn

    const layer: ContextLayer = {
      id: layerId,
      type,
      sizeBytes,
      tokenEstimate: this.estimateTokens(sizeBytes),
      timestamp: new Date().toISOString(),
      isPriorTurn,
    }

    this.contextLayers.push(layer)

    // Track peak depth
    if (this.contextLayers.length > this.maxDepthReached) {
      this.maxDepthReached = this.contextLayers.length
    }

    // Count prior-turn references
    if (isPriorTurn) {
      this.priorTurnReferences += 1
    }
  }

  /**
   * Pop a context layer from the stack
   * @returns The popped layer, or undefined if stack is empty
   */
  public popContext(): ContextLayer | undefined {
    return this.contextLayers.pop()
  }

  /**
   * Get current stack depth
   */
  public getDepth(): number {
    return this.contextLayers.length
  }

  /**
   * Get total size of all context on stack in bytes
   */
  public getTotalContextSize(): number {
    return this.contextLayers.reduce((sum, layer) => sum + layer.sizeBytes, 0)
  }

  /**
   * Get total estimated tokens for all context on stack
   */
  public getTotalTokens(): number {
    return this.contextLayers.reduce((sum, layer) => sum + layer.tokenEstimate, 0)
  }

  /**
   * Get count of prior-turn references currently on stack
   */
  public getPriorTurnReferenceCount(): number {
    return this.contextLayers.filter((layer) => layer.isPriorTurn).length
  }

  /**
   * Log the current stack depth when Claude references prior turns
   * Called when a prior-turn context layer is detected or accessed
   */
  public async logDepthOnPriorTurnReference(
    operation: 'push' | 'pop' | 'reference_detected' = 'reference_detected',
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      // Only log if there are actual prior-turn references
      const priorTurnCount = this.getPriorTurnReferenceCount()
      if (priorTurnCount === 0 && operation === 'reference_detected') {
        return
      }

      const logLevel = this.contextLayers.length > 10 ? 'warn' : 'info'

      const logEntry: StackDepthLog = {
        timestamp: new Date().toISOString(),
        request_id: this.requestId,
        route: this.route,
        
        current_depth: this.getDepth(),
        prior_turn_references: priorTurnCount,
        max_depth_reached: this.maxDepthReached,
        
        context_chain: this.contextLayers.map((layer) => ({
          layer_id: layer.id,
          type: layer.type,
          size_bytes: layer.sizeBytes,
          token_estimate: layer.tokenEstimate,
          is_prior_turn: layer.isPriorTurn,
        })),
        
        total_context_size_bytes: this.getTotalContextSize(),
        total_tokens_estimated: this.getTotalTokens(),
        operation,
        
        level: logLevel,
        metadata,
      }

      // Ensure debug directory exists
      await mkdir(DEBUG_DIR, { recursive: true }).catch((err) => {
        if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw err
        }
      })

      const logLine = JSON.stringify(logEntry)

      // Fire-and-forget: append to log without awaiting
      appendFile(RESPONSE_STACK_LOG_PATH, logLine + '\n').catch((err) => {
        console.error('[response-stack] Failed to write log:', err instanceof Error ? err.message : String(err))
      })

      // Console log for warn level
      if (logLevel === 'warn') {
        console.warn(
          `[response-stack] DEEP NESTING: ${this.requestId} | depth=${this.getDepth()} | prior_refs=${priorTurnCount} | max=${this.maxDepthReached}`,
        )
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development' && operation !== 'push') {
        console.log(
          `[response-stack] ${this.requestId} | depth=${this.getDepth()} | prior=${priorTurnCount} | tokens=${this.getTotalTokens()}`,
        )
      }
    } catch (err) {
      console.error(
        '[response-stack] Error in logDepthOnPriorTurnReference:',
        err instanceof Error ? err.message : String(err),
      )
    }
  }

  /**
   * Get a snapshot of the current stack state (for testing or debugging)
   */
  public getSnapshot(): {
    depth: number
    maxDepth: number
    priorTurnCount: number
    totalBytes: number
    totalTokens: number
    layers: ContextLayer[]
  } {
    return {
      depth: this.getDepth(),
      maxDepth: this.maxDepthReached,
      priorTurnCount: this.getPriorTurnReferenceCount(),
      totalBytes: this.getTotalContextSize(),
      totalTokens: this.getTotalTokens(),
      layers: [...this.contextLayers],
    }
  }

  /**
   * Clear all context layers from the stack
   * Useful for testing or resetting between requests
   */
  public clear(): void {
    this.contextLayers = []
    this.maxDepthReached = 0
    this.priorTurnReferences = 0
  }
}

/**
 * Global stack instance manager (optional)
 * Allows per-request stack tracking without manual instance passing
 */
const activeStacks = new Map<string, ResponseStack>()

/**
 * Get or create a stack for a request
 */
export function getOrCreateStack(requestId: string, route?: string): ResponseStack {
  if (!activeStacks.has(requestId)) {
    activeStacks.set(requestId, new ResponseStack(requestId, route))
  }
  return activeStacks.get(requestId)!
}

/**
 * Remove a completed request's stack from tracking
 */
export function removeStack(requestId: string): void {
  activeStacks.delete(requestId)
}

/**
 * Get all active stacks (for debugging)
 */
export function getActiveStacks(): Map<string, ResponseStack> {
  return new Map(activeStacks)
}
