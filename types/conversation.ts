/**
 * Conversation-to-Summary System Types
 * Lightweight types for multi-turn dialogue extraction and cross-session preference retrieval
 */

export type ConversationSpeaker = 'user' | 'assistant'

export interface ConversationTurn {
  id: string
  session_id: string
  turn_index: number
  speaker: ConversationSpeaker
  content: string
  extracted_facts: Record<string, unknown>
  metadata?: Record<string, unknown>
  created_at: string
}

export interface ConversationSession {
  id: string
  user_id: string
  session_title?: string
  topic?: string
  summary?: string
  turn_count: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UserFact {
  id: string
  user_id: string
  topic: string
  fact_key: string
  fact_value: unknown
  confidence: number  // 0.0 to 1.0
  source_session_id?: string
  source_turn_id?: string
  extracted_at: string
  last_confirmed_at?: string
  last_seen_at: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface FactConflict {
  id: string
  user_id: string
  topic: string
  fact_key: string
  conflicting_values: Array<{
    value: unknown
    confidence: number
    source_session_id?: string
  }>
  resolved_value?: unknown
  resolved_at?: string
  resolution_note?: string
  created_at: string
  updated_at: string
}

/**
 * Extracted facts from a single turn
 * Used internally during fact extraction
 */
export interface ExtractedFacts {
  [topic: string]: {
    [key: string]: {
      value: unknown
      confidence: number
      type: 'preference' | 'constraint' | 'fact'
    }
  }
}

/**
 * Request/response types for fact extraction API
 */
export interface ExtractFactsRequest {
  user_id: string
  session_id: string
  turn_index: number
  speaker: ConversationSpeaker
  content: string
}

export interface ExtractFactsResponse {
  extracted_facts: ExtractedFacts
  turn_id: string
}

/**
 * Request/response types for fact retrieval API
 */
export interface GetUserFactsRequest {
  user_id: string
  topic?: string
  min_confidence?: number  // default: 0.5
  limit?: number  // default: 50
}

export interface GetUserFactsResponse {
  facts: UserFact[]
  total_count: number
}

/**
 * Summary of user preferences for cross-session context
 */
export interface UserPreferenceSummary {
  user_id: string
  profile: UserProfile | null
  recent_topics: string[]
  top_facts_by_topic: Record<string, UserFact[]>
  high_confidence_facts: UserFact[]
  recent_sessions_count: number
  last_active: string
}

/**
 * Reconciliation request for conflicting facts
 */
export interface ReconcileFactConflictRequest {
  conflict_id: string
  resolved_value: unknown
  resolution_note?: string
}

export interface ReconcileFactConflictResponse {
  conflict: FactConflict
  updated_fact: UserFact
}
