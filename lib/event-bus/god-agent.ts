/**
 * God Agent wrapper for Event Bus integration
 *
 * The God agent is the central orchestrator that:
 * - Executes primary tasks (analysis, classification, extraction)
 * - Emits TypedEvents to notify specialist agents
 * - Tracks task progress and completion
 */

import {
  TypedEvent,
  EventPayload,
  AnalysisCompleteEvent,
  ClassificationEvent,
  DataExtractionEvent,
  ProgressEvent,
  TaskCompleteEvent,
  AgentErrorEvent,
} from './types'
import { getEventBus } from './event-bus'

/**
 * God Agent configuration
 */
export interface GodAgentConfig {
  name?: string
  debug?: boolean
  emitDefaults?: {
    waitForListeners?: boolean
    timeout?: number
  }
}

/**
 * God Agent class with event emission capabilities
 */
export class GodAgent {
  private name: string
  private debug: boolean
  private eventBus = getEventBus()
  private emitDefaults: { waitForListeners: boolean; timeout: number }

  constructor(config: GodAgentConfig = {}) {
    this.name = config.name ?? 'god-orchestrator'
    this.debug = config.debug ?? false
    this.emitDefaults = {
      waitForListeners: config.emitDefaults?.waitForListeners ?? true,
      timeout: config.emitDefaults?.timeout ?? 5000,
    }

    if (this.debug) {
      console.log(`[GodAgent] Initialized: ${this.name}`)
    }
  }

  /**
   * Emit analysis complete event
   */
  async emitAnalysisComplete(
    analysisId: string,
    result: unknown,
    confidence: number,
    duration_ms: number
  ): Promise<void> {
    const event: AnalysisCompleteEvent = {
      type: 'analysis_complete',
      payload: {
        analysisId,
        result,
        confidence,
        duration_ms,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.debug) {
      console.log(`[GodAgent] Emitting analysis_complete: ${analysisId}`)
    }

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Emit classification complete event
   */
  async emitClassificationComplete(
    classificationId: string,
    category: string,
    subcategory?: string,
    confidence: number = 1.0
  ): Promise<void> {
    const event: ClassificationEvent = {
      type: 'classification_complete',
      payload: {
        classificationId,
        category,
        subcategory,
        confidence,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.debug) {
      console.log(`[GodAgent] Emitting classification_complete: ${classificationId} → ${category}`)
    }

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Emit data extraction complete event
   */
  async emitDataExtractionComplete(
    extractionId: string,
    extracted_data: Record<string, unknown>,
    field_count: number
  ): Promise<void> {
    const event: DataExtractionEvent = {
      type: 'data_extraction_complete',
      payload: {
        extractionId,
        extracted_data,
        field_count,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.debug) {
      console.log(`[GodAgent] Emitting data_extraction_complete: ${extractionId} (${field_count} fields)`)
    }

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Emit progress event for long-running tasks
   */
  async emitProgress(
    taskId: string,
    stage: string,
    progress_percent: number,
    details?: Record<string, unknown>
  ): Promise<void> {
    const event: ProgressEvent = {
      type: 'progress',
      payload: {
        taskId,
        stage,
        progress_percent,
        details,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.debug) {
      console.log(`[GodAgent] Progress: ${taskId} → ${stage} (${progress_percent}%)`)
    }

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Emit task completion event
   */
  async emitTaskComplete(
    taskId: string,
    status: 'success' | 'failed',
    result?: unknown,
    error?: string
  ): Promise<void> {
    const event: TaskCompleteEvent = {
      type: 'task_complete',
      payload: {
        taskId,
        status,
        result,
        error,
        timestamp: new Date().toISOString(),
      },
    }

    if (this.debug) {
      console.log(`[GodAgent] Task complete: ${taskId} → ${status}`)
    }

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Emit agent error event
   */
  async emitAgentError(
    agentId: string,
    error_message: string,
    error_code: string,
    context: Record<string, unknown> = {}
  ): Promise<void> {
    const event: AgentErrorEvent = {
      type: 'agent_error',
      payload: {
        agentId,
        error_message,
        error_code,
        context,
        timestamp: new Date().toISOString(),
      },
    }

    console.error(`[GodAgent] Agent error: ${agentId} (${error_code}): ${error_message}`)

    await this.eventBus.emit(event, this.emitDefaults)
  }

  /**
   * Get the underlying event bus instance
   */
  getEventBus() {
    return this.eventBus
  }

  /**
   * Debug: print God agent state
   */
  debugState(): void {
    console.log(`[GodAgent] ${this.name} State:`)
    this.eventBus.debugState()
  }
}

/**
 * Factory function to create a God agent with event bus integration
 */
export function createGodAgent(config: GodAgentConfig = {}): GodAgent {
  return new GodAgent(config)
}
