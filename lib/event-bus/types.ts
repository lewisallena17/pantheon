/**
 * Typed Event Bus for crewAI Specialist Agents
 * 
 * This module defines the core event types and interfaces for a publish-subscribe
 * system where the God agent emits typed events and specialist agents listen.
 */

/**
 * Analysis event emitted when the God agent completes analysis
 */
export interface AnalysisCompleteEvent {
  type: 'analysis_complete'
  payload: {
    analysisId: string
    result: unknown
    confidence: number
    duration_ms: number
    timestamp: string
  }
}

/**
 * Classification event emitted when data is classified
 */
export interface ClassificationEvent {
  type: 'classification_complete'
  payload: {
    classificationId: string
    category: string
    subcategory?: string
    confidence: number
    timestamp: string
  }
}

/**
 * Data extraction event emitted when structured data is extracted
 */
export interface DataExtractionEvent {
  type: 'data_extraction_complete'
  payload: {
    extractionId: string
    extracted_data: Record<string, unknown>
    field_count: number
    timestamp: string
  }
}

/**
 * Verification event emitted when fact-checking or validation completes
 */
export interface VerificationEvent {
  type: 'verification_complete'
  payload: {
    verificationId: string
    verified: boolean
    claim: string
    evidence: string[]
    confidence: number
    timestamp: string
  }
}

/**
 * Aggregation event emitted when multiple results are combined
 */
export interface AggregationEvent {
  type: 'aggregation_complete'
  payload: {
    aggregationId: string
    aggregated_count: number
    summary: Record<string, unknown>
    timestamp: string
  }
}

/**
 * Error event emitted when an agent encounters a failure
 */
export interface AgentErrorEvent {
  type: 'agent_error'
  payload: {
    agentId: string
    error_message: string
    error_code: string
    context: Record<string, unknown>
    timestamp: string
  }
}

/**
 * Progress event emitted during long-running operations
 */
export interface ProgressEvent {
  type: 'progress'
  payload: {
    taskId: string
    stage: string
    progress_percent: number
    details?: Record<string, unknown>
    timestamp: string
  }
}

/**
 * Task completion event
 */
export interface TaskCompleteEvent {
  type: 'task_complete'
  payload: {
    taskId: string
    status: 'success' | 'failed'
    result?: unknown
    error?: string
    timestamp: string
  }
}

/**
 * Union of all possible event types for type-safe event bus
 */
export type TypedEvent =
  | AnalysisCompleteEvent
  | ClassificationEvent
  | DataExtractionEvent
  | VerificationEvent
  | AggregationEvent
  | AgentErrorEvent
  | ProgressEvent
  | TaskCompleteEvent

/**
 * Extract event type discriminator
 */
export type EventType = TypedEvent['type']

/**
 * Payload type for a specific event type
 */
export type EventPayload<T extends EventType> = Extract<TypedEvent, { type: T }>['payload']

/**
 * Event listener callback signature
 */
export type EventListener<T extends EventType = EventType> = (event: Extract<TypedEvent, { type: T }>) => Promise<void> | void

/**
 * Event listener with priority and name for debugging
 */
export interface NamedEventListener<T extends EventType = EventType> {
  name: string
  priority: number // Higher priority runs first
  listener: EventListener<T>
}

/**
 * Event bus options
 */
export interface EventBusOptions {
  /** Max events to keep in history for debugging */
  maxHistorySize?: number
  /** Enable debug logging */
  debug?: boolean
  /** Timeout for async listeners in ms */
  listenerTimeout?: number
}

/**
 * Event emission options
 */
export interface EmitOptions {
  /** Whether to wait for all listeners to complete */
  waitForListeners?: boolean
  /** Timeout for event processing */
  timeout?: number
}
