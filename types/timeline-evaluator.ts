/**
 * Timeline-Aware Response Evaluator Types
 * 
 * Detects temporal inconsistencies and anachronisms in multi-turn conversations by:
 * - Extracting temporal markers (dates, durations, event sequences)
 * - Building chronological event graphs
 * - Validating causality constraints (no effect before cause)
 * - Detecting anachronisms (future events in past references)
 * - Classifying context (fiction vs. reality vs. hypothetical)
 * - Flagging violations with confidence scores
 */

/**
 * Temporal marker extracted from conversation text
 * Can be explicit (2024-01-15) or implicit (yesterday, last week, etc.)
 */
export interface TemporalMarker {
  id: string;
  text: string;
  marker_type: 'absolute_date' | 'relative_time' | 'duration' | 'event_reference';
  
  // Parsed representation
  parsed_date?: Date | string;           // ISO 8601 or null if relative
  relative_offset?: number;              // days/weeks/months relative to reference point
  relative_unit?: 'day' | 'week' | 'month' | 'year';
  
  // Position in conversation
  turn_id: string;
  turn_index: number;
  speaker: 'user' | 'assistant';
  sentence_index: number;
  character_offset: number;
  
  // Confidence scores
  extraction_confidence: number;         // 0.0-1.0: likelihood it's a temporal marker
  parsing_confidence: number;            // 0.0-1.0: confidence in date interpretation
  
  // Metadata
  raw_text: string;                      // Original text snippet
  normalized_text: string;               // Standardized representation
  context_window: string;                // Surrounding text for disambiguation
  
  created_at: string;
}

/**
 * Extracted event from conversation turn
 * Represents a claim of something happening or being true at a point in time
 */
export interface TemporalEvent {
  id: string;
  turn_id: string;
  turn_index: number;
  speaker: 'user' | 'assistant';
  
  // Event description
  event_text: string;                    // Raw event statement
  event_type: 'occurrence' | 'state' | 'change' | 'consequence';
  
  // Temporal anchoring
  temporal_markers: TemporalMarker[];    // Linked markers that anchor this event
  inferred_date?: string;                // Computed date if determinable (ISO 8601)
  temporal_uncertainty: number;          // 0.0-1.0: how precise is the timing?
  
  // Event properties
  is_hypothetical: boolean;              // "If X happened..." vs actual claim
  is_negated: boolean;                   // "Did NOT happen"
  causality_antecedents?: string[];      // IDs of events this depends on
  causality_consequents?: string[];      // IDs of events that depend on this
  
  // Confidence
  extraction_confidence: number;         // 0.0-1.0
  
  created_at: string;
}

/**
 * Temporal inconsistency violation detected in conversation
 */
export interface TemporalInconsistency {
  id: string;
  session_id: string;
  
  // Violation details
  inconsistency_type: 
    | 'causality_violation'              // Effect before cause
    | 'date_contradiction'               // Same event claimed on different dates
    | 'anachronism'                      // Event impossible in stated time period
    | 'sequence_violation'               // Events claimed in logically impossible order
    | 'future_reference_in_past'         // "I will do X" in a past context
    | 'duration_overflow'                // Time window too short for described events
    | 'event_collision'                  // Same person/thing in two places at once;
    | 'state_contradiction';             // State claimed as both true and false
  
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;                    // 0.0-1.0: how certain of violation?
  
  // Involved elements
  primary_turn_index: number;            // Turn where issue manifests
  secondary_turn_indices: number[];      // Other turns involved in conflict
  
  primary_marker_id?: string;
  conflicting_marker_ids: string[];
  
  primary_event_id?: string;
  conflicting_event_ids: string[];
  
  // Explanation
  description: string;                   // Human-readable description
  reason: string;                        // Why this is inconsistent
  
  // Context classification
  context_type: 'factual' | 'hypothetical' | 'fictional' | 'mixed' | 'unknown';
  
  // Resolution suggestions
  suggested_corrections?: Array<{
    type: 'date_fix' | 'sequence_reorder' | 'context_clarification' | 'acknowledge_fiction';
    suggestion: string;
    affected_turn_index: number;
  }>;
  
  // Metadata
  requires_human_review: boolean;
  reviewer_notes?: string;
  reviewed_at?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * Temporal consistency evaluation result for a conversation
 */
export interface TimelineEvaluationResult {
  session_id: string;
  conversation_title?: string;
  
  // Extracted components
  temporal_markers: TemporalMarker[];
  temporal_events: TemporalEvent[];
  
  // Inconsistencies found
  inconsistencies: TemporalInconsistency[];
  
  // Summary metrics
  summary: {
    total_turns: number;
    turns_with_temporal_markers: number;
    total_markers_found: number;
    total_events_extracted: number;
    total_inconsistencies: number;
    
    // Breakdown by severity
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    
    // Overall scores
    temporal_consistency_score: number;   // 0.0-1.0: higher = more consistent
    confidence_score: number;             // 0.0-1.0: confidence in evaluation
  };
  
  // Classification
  overall_context: 'factual' | 'hypothetical' | 'fictional' | 'mixed' | 'unknown';
  reliability_assessment: 'high' | 'medium' | 'low' | 'indeterminate';
  
  // Timeline visualization data
  event_timeline?: Array<{
    turn_index: number;
    event_id: string;
    event_text: string;
    inferred_date?: string;
    is_flagged: boolean;
  }>;
  
  // Metadata
  evaluation_model: string;              // e.g., "timeline-evaluator-v1"
  evaluated_at: string;
  processing_time_ms: number;
}

/**
 * Database record for storing timeline evaluation results
 */
export interface TimelineEvaluationRecord {
  id: string;
  session_id: string;
  conversation_title?: string;
  
  // Summary data (stored as JSON to preserve structure)
  markers_json: Record<string, unknown>;
  events_json: Record<string, unknown>;
  inconsistencies_json: Record<string, unknown>;
  
  // Metrics
  total_turns: number;
  markers_count: number;
  events_count: number;
  inconsistencies_count: number;
  critical_violations: number;
  high_violations: number;
  medium_violations: number;
  low_violations: number;
  
  temporal_consistency_score: number;
  confidence_score: number;
  overall_context: string;
  reliability_assessment: string;
  
  evaluation_model: string;
  evaluated_at: string;
  processing_time_ms: number;
  
  created_at: string;
  updated_at: string;
}

/**
 * Configuration for temporal inconsistency detection
 */
export interface TimelineEvaluatorConfig {
  // Detection sensitivity (0.5-1.0, higher = stricter)
  temporal_marker_threshold: number;     // min confidence to extract marker (default 0.6)
  event_extraction_threshold: number;    // min confidence for event extraction (default 0.65)
  inconsistency_threshold: number;       // min confidence to flag inconsistency (default 0.7)
  
  // Causality validation
  enable_causality_checking: boolean;    // Check for effect-before-cause (default true)
  enable_anachronism_detection: boolean; // Detect impossible historical references (default true)
  
  // Context classification
  enable_context_classification: boolean; // Distinguish fiction/hypothetical/factual (default true)
  
  // Reference data
  enable_reference_database: boolean;    // Use historical event database for anachronism detection (default true)
  reference_database_type?: 'wikipedia' | 'wikidata' | 'custom' | 'none';
  
  // Temporal bounds
  min_temporal_window_days: number;      // Reject markers outside this range (default: -18250 days / 50 years)
  max_temporal_window_days: number;      // (default: 18250 days / 50 years)
  
  // Processing
  max_turns_to_analyze: number;          // Limit for large conversations (default: 1000)
  include_hypothetical: boolean;         // Include "what if" scenarios in analysis (default true)
  
  // Output
  include_suggestions: boolean;          // Generate correction suggestions (default true)
  include_timeline_visualization: boolean; // Build timeline data (default true)
}

/**
 * Anachronism reference: historical event database entry
 * Used to detect impossible references (e.g., "In 1800, I used the internet")
 */
export interface AnachronismReference {
  id: string;
  event_name: string;
  event_type: 'invention' | 'discovery' | 'historical_event' | 'person_birth' | 'person_death' | 'other';
  
  // Dating
  earliest_date?: string;                // ISO 8601
  latest_date?: string;
  is_exact: boolean;                     // Whether date is precise or approximate
  
  // Related concepts (for matching)
  keywords: string[];
  category?: string;
  
  // Anachronism rules
  impossible_before?: string;            // ISO 8601: impossible to reference before this date
  impossible_after?: string;             // ISO 8601: impossible to reference after this date
  
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Temporal context classification for a conversation
 */
export interface TemporalContextClassification {
  primary_context: 'factual' | 'hypothetical' | 'fictional' | 'mixed' | 'unknown';
  confidence: number;                    // 0.0-1.0
  
  // Reasoning
  indicators: Array<{
    type: 'tense' | 'conditional' | 'narrative_framing' | 'modal_verb' | 'explicit_statement';
    text: string;
    confidence: number;
  }>;
  
  // Classification breakdown (if mixed)
  factual_turns: number[];
  hypothetical_turns: number[];
  fictional_turns: number[];
  
  narrative_style?: string;              // 'retrospective', 'prospective', 'simultaneous', etc.
}

/**
 * Request to evaluate timeline consistency of a conversation
 */
export interface TimelineEvaluationRequest {
  session_id: string;
  conversation_turns: Array<{
    turn_id: string;
    turn_index: number;
    speaker: 'user' | 'assistant';
    message_text: string;
    created_at: string;
  }>;
  config?: Partial<TimelineEvaluatorConfig>;
  reference_date?: string;               // ISO 8601: date to use as "now" for relative times
}

/**
 * Temporal consistency issue summary for quick UI display
 */
export interface TemporalInconsistencySummary {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  description: string;
  affected_turns: number[];
  resolvable: boolean;
}
