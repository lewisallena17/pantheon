/**
 * Specialist Agent wrapper for Event Bus integration
 *
 * Specialist agents listen to events emitted by the God agent and
 * execute specialized tasks based on event type and payload.
 *
 * Example: VerificationAgent listens for 'analysis_complete' events
 * and performs fact-checking on the analysis results.
 */

import {
  EventType,
  EventListener,
  TypedEvent,
  AnalysisCompleteEvent,
  ClassificationEvent,
  DataExtractionEvent,
  VerificationEvent,
  AggregationEvent,
  ProgressEvent,
} from './types'
import { getEventBus, EventBus } from './event-bus'

/**
 * Specialist agent configuration
 */
export interface SpecialistAgentConfig {
  name: string
  specialization: string // e.g., 'verification', 'aggregation', 'classification_refinement'
  debug?: boolean
  priority?: number // Higher priority listeners execute first (0-100)
}

/**
 * Specialist Agent Handler signature
 */
export type SpecialistHandler<T extends EventType> = (
  event: Extract<TypedEvent, { type: T }>
) => Promise<void>

/**
 * Specialist Agent class
 *
 * A specialist agent listens to specific event types and performs
 * focused work. Multiple specialists can listen to the same event type
 * and execute in priority order.
 */
export class SpecialistAgent {
  private name: string
  private specialization: string
  private debug: boolean
  private priority: number
  private eventBus: EventBus
  private listeners: Map<EventType, () => void> = new Map()

  constructor(eventBus: EventBus, config: SpecialistAgentConfig) {
    this.name = config.name
    this.specialization = config.specialization
    this.debug = config.debug ?? false
    this.priority = config.priority ?? 50
    this.eventBus = eventBus

    if (this.debug) {
      console.log(
        `[SpecialistAgent] Initialized: ${this.name} (${this.specialization}) priority=${this.priority}`
      )
    }
  }

  /**
   * Subscribe this agent to an event type
   */
  on<T extends EventType>(
    eventType: T,
    handler: SpecialistHandler<T>
  ): void {
    const unsubscribe = this.eventBus.on(
      eventType,
      handler,
      {
        name: `${this.name}@${eventType}`,
        priority: this.priority,
      }
    )

    this.listeners.set(eventType, unsubscribe)

    if (this.debug) {
      console.log(
        `[SpecialistAgent] ${this.name} subscribed to ${eventType}`
      )
    }
  }

  /**
   * Unsubscribe from a specific event type
   */
  off<T extends EventType>(eventType: T): void {
    const unsubscribe = this.listeners.get(eventType)
    if (unsubscribe) {
      unsubscribe()
      this.listeners.delete(eventType)
      if (this.debug) {
        console.log(
          `[SpecialistAgent] ${this.name} unsubscribed from ${eventType}`
        )
      }
    }
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribeAll(): void {
    for (const [eventType, unsubscribe] of this.listeners.entries()) {
      unsubscribe()
    }
    this.listeners.clear()

    if (this.debug) {
      console.log(`[SpecialistAgent] ${this.name} unsubscribed from all events`)
    }
  }

  /**
   * Get this agent's configuration
   */
  getConfig() {
    return {
      name: this.name,
      specialization: this.specialization,
      priority: this.priority,
      listeningTo: Array.from(this.listeners.keys()),
    }
  }
}

/**
 * Factory function to create a specialist agent
 */
export function createSpecialistAgent(
  config: SpecialistAgentConfig
): SpecialistAgent {
  const eventBus = getEventBus()
  return new SpecialistAgent(eventBus, config)
}

/**
 * Pre-built specialist agent factories for common specializations
 */

/**
 * Verification Specialist — fact-checks analysis results
 */
export function createVerificationSpecialist(debug?: boolean): SpecialistAgent {
  const agent = createSpecialistAgent({
    name: 'verification-specialist',
    specialization: 'verification',
    debug,
    priority: 80,
  })

  agent.on('analysis_complete', async (event) => {
    console.log(`[VerificationSpecialist] Verifying analysis: ${event.payload.analysisId}`)
    // Specialist would perform fact-checking here
    // Then could emit a verification_complete event
  })

  return agent
}

/**
 * Aggregation Specialist — combines multiple results
 */
export function createAggregationSpecialist(debug?: boolean): SpecialistAgent {
  const agent = createSpecialistAgent({
    name: 'aggregation-specialist',
    specialization: 'aggregation',
    debug,
    priority: 70,
  })

  agent.on('data_extraction_complete', async (event) => {
    console.log(
      `[AggregationSpecialist] Aggregating extraction: ${event.payload.extractionId}`
    )
    // Specialist would aggregate extracted data
    // Then could emit an aggregation_complete event
  })

  return agent
}

/**
 * Classification Refinement Specialist — improves classifications
 */
export function createClassificationRefiner(debug?: boolean): SpecialistAgent {
  const agent = createSpecialistAgent({
    name: 'classification-refiner',
    specialization: 'classification_refinement',
    debug,
    priority: 60,
  })

  agent.on('classification_complete', async (event) => {
    console.log(
      `[ClassificationRefiner] Refining classification: ${event.payload.classificationId}`
    )
    // Specialist would validate and refine classification
  })

  return agent
}

/**
 * Error Handler Specialist — responds to agent errors
 */
export function createErrorHandlerSpecialist(debug?: boolean): SpecialistAgent {
  const agent = createSpecialistAgent({
    name: 'error-handler',
    specialization: 'error_handling',
    debug,
    priority: 90, // Highest priority to handle errors quickly
  })

  agent.on('agent_error', async (event) => {
    console.error(
      `[ErrorHandlerSpecialist] Handling error from ${event.payload.agentId}: ${event.payload.error_message}`
    )
    // Specialist would log error, trigger alerts, etc.
  })

  return agent
}

/**
 * Progress Monitor Specialist — tracks long-running tasks
 */
export function createProgressMonitorSpecialist(debug?: boolean): SpecialistAgent {
  const agent = createSpecialistAgent({
    name: 'progress-monitor',
    specialization: 'progress_tracking',
    debug,
    priority: 50,
  })

  agent.on('progress', async (event) => {
    console.log(
      `[ProgressMonitor] Task ${event.payload.taskId}: ${event.payload.stage} (${event.payload.progress_percent}%)`
    )
    // Specialist could forward to dashboard, database, etc.
  })

  return agent
}


