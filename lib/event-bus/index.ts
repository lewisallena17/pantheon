/**
 * EventBus Public API
 */

export { EventBus, getEventBus, resetEventBus } from './event-bus'
export type {
  TypedEvent,
  EventType,
  EventListener,
  NamedEventListener,
  EventBusOptions,
  EmitOptions,
  AnalysisCompleteEvent,
  ClassificationEvent,
  DataExtractionEvent,
  VerificationEvent,
  AggregationEvent,
  AgentErrorEvent,
  ProgressEvent,
  TaskCompleteEvent,
  EventPayload,
} from './types'
export { createGodAgent } from './god-agent'
export { createSpecialistAgent, SpecialistAgent } from './specialist-agent'
