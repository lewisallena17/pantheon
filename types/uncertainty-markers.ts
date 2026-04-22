/**
 * Uncertainty Markers for Claim-Level Confidence in Long-Form Responses
 * 
 * Provides multi-dimensional confidence annotation for individual claims within
 * longer responses, helping readers understand:
 * - Evidence quality (empirical, theoretical, anecdotal)
 * - Logical certainty (definite, probable, speculative)
 * - Factual vs. inference status
 * - Temporal stability (fixed fact vs. subject to change)
 * - Reviewer confidence in the assessment
 */

/**
 * Individual claim extracted from a response segment
 */
export interface ResponseClaim {
  id: string;
  response_id: string;
  turn_id: string;
  session_id: string;
  
  // Claim text and position
  claim_text: string;
  segment_index: number;          // Position in the response (for highlighting)
  character_offset: number;       // Start position in raw response
  character_length: number;       // Length of claim text
  
  // Claim classification
  claim_type: 'factual' | 'inference' | 'opinion' | 'recommendation' | 'speculation' | 'definition' | 'procedure';
  is_hedged: boolean;             // Contains uncertainty language: "may", "could", "suggests", etc.
  hedging_phrases: string[];      // ["may", "could", "arguably"]
  
  // Primary confidence dimensions
  confidence_markers: ConfidenceMarker;
  
  // Context
  surrounding_context: string;    // Text before and after claim for disambiguation
  depends_on_previous?: string;   // ID of claim this is contingent on
  supports_claim?: string;        // ID of claim this provides evidence for
  
  // Creation and updates
  created_at: string;
  updated_at: string;
}

/**
 * Multi-dimensional confidence marker for a single claim
 * Designed to be transparent and interpretable, not opaque
 */
export interface ConfidenceMarker {
  claim_id: string;
  
  // 1. EVIDENCE QUALITY (what sources/data back this claim?)
  evidence_quality: EvidenceQuality;
  
  // 2. LOGICAL CERTAINTY (how certain is the reasoning?)
  logical_certainty: LogicalCertainty;
  
  // 3. FACTUAL VS INFERENCE (is this a fact or an interpretation?)
  factual_status: FactualStatus;
  
  // 4. TEMPORAL STABILITY (is this claim likely to remain true?)
  temporal_stability: TemporalStability;
  
  // 5. MODEL CONFIDENCE (how confident is the LLM in this claim?)
  model_confidence: ModelConfidence;
  
  // 6. REVIEWER ASSESSMENT (if manually reviewed)
  reviewer_assessment?: ReviewerAssessment;
  
  // Overall composite score (weighted average of dimensions)
  composite_confidence: number;  // 0.0–1.0
  
  // Timestamp
  computed_at: string;
}

/**
 * Evidence quality dimension
 * What type and amount of evidence backs this claim?
 */
export interface EvidenceQuality {
  level: 'empirical' | 'theoretical' | 'anecdotal' | 'indirect' | 'none';
  
  // Description of evidence level
  // 'empirical': backed by studies, data, measurements
  // 'theoretical': derived from established models/frameworks
  // 'anecdotal': based on example(s) or personal experience
  // 'indirect': inferred from related evidence
  // 'none': no explicit evidence given
  
  score: number;                 // 0.0–1.0: how strong is the evidence?
  confidence: number;            // 0.0–1.0: certainty in this assessment
  reasoning: string;             // Explanation of score (for UI tooltip)
  weight: number;                // How much this dimension contributes (default 0.25)
}

/**
 * Logical certainty dimension
 * How certain is the reasoning/inference chain?
 */
export interface LogicalCertainty {
  level: 'definite' | 'probable' | 'plausible' | 'speculative' | 'unknown';
  
  // 'definite': follows necessarily from premises (no ambiguity)
  // 'probable': likely but not certain (>75% confidence)
  // 'plausible': reasonable but far from certain (40–75%)
  // 'speculative': possible but not well-justified (<40%)
  // 'unknown': insufficient info to judge
  
  score: number;                 // 0.0–1.0
  confidence: number;            // 0.0–1.0
  reasoning: string;
  weight: number;                // How much this dimension contributes (default 0.25)
}

/**
 * Factual status dimension
 * Is this a directly verifiable fact or an interpretation?
 */
export interface FactualStatus {
  category: 'directly_verifiable' | 'interpretation' | 'extrapolation' | 'counterfactual' | 'value_judgment';
  
  // 'directly_verifiable': can be checked against ground truth (factual claims)
  // 'interpretation': reasonable reading of facts but subject to alternative readings
  // 'extrapolation': extending beyond known data (educational guess)
  // 'counterfactual': hypothetical or alternative scenario
  // 'value_judgment': involves ethical/aesthetic evaluation
  
  is_factual: boolean;           // true if independently verifiable
  score: number;                 // 0.0–1.0
  confidence: number;            // 0.0–1.0
  reasoning: string;
  weight: number;                // How much this dimension contributes (default 0.20)
}

/**
 * Temporal stability dimension
 * Is this claim likely to remain true, or subject to change?
 */
export interface TemporalStability {
  stability: 'permanent' | 'long_term' | 'medium_term' | 'short_term' | 'volatile';
  
  // 'permanent': unlikely to change (e.g., historical facts, laws of physics)
  // 'long_term': stable for years (e.g., institution policies)
  // 'medium_term': stable for months (e.g., current market conditions)
  // 'short_term': stable for days/weeks (e.g., current weather, short-term forecasts)
  // 'volatile': subject to frequent change (e.g., specific prices, breaking news)
  
  half_life_days?: number;       // Estimated days until claim becomes 50% out-of-date
  score: number;                 // 0.0–1.0
  confidence: number;            // 0.0–1.0
  reasoning: string;
  weight: number;                // How much this dimension contributes (default 0.15)
}

/**
 * Model confidence dimension
 * How confident is the LLM in generating this claim?
 * (Inferred from token probabilities, repetition, hedging language)
 */
export interface ModelConfidence {
  token_probability: number;     // Average token probability (0.0–1.0)
  perplexity: number;           // Perplexity of claim generation (lower = higher confidence)
  repetition_count: number;      // How many similar claims in same response
  uses_hedging: boolean;         // Uses "may", "could", "likely", etc.
  
  score: number;                 // 0.0–1.0: inferred confidence
  confidence: number;            // 0.0–1.0: how confident in this inference?
  reasoning: string;
  weight: number;                // How much this dimension contributes (default 0.15)
}

/**
 * Human reviewer assessment (optional)
 * If a human has reviewed and corrected this claim
 */
export interface ReviewerAssessment {
  reviewed_by: string;           // User ID or name
  reviewed_at: string;           // Timestamp
  verdict: 'accurate' | 'partially_accurate' | 'misleading' | 'inaccurate' | 'unclear';
  correction?: string;           // Suggested correction or clarification
  notes?: string;                // Additional context from reviewer
  
  // Updated confidence based on review
  revised_score: number;         // 0.0–1.0
  confidence: number;            // 0.0–1.0
}

/**
 * Summary confidence tier for UI presentation
 * Maps composite score to user-friendly categories
 */
export type ConfidenceTier = 'high' | 'medium' | 'low' | 'uncertain';

export const CONFIDENCE_TIER_RANGES = {
  high: { min: 0.75, max: 1.0, icon: '✓', color: 'emerald', label: 'High confidence' },
  medium: { min: 0.5, max: 0.75, icon: '◐', color: 'amber', label: 'Moderate confidence' },
  low: { min: 0.25, max: 0.5, icon: '◑', color: 'orange', label: 'Low confidence' },
  uncertain: { min: 0.0, max: 0.25, icon: '?', color: 'red', label: 'Uncertain' },
} as const;

export function getTierFromScore(score: number): ConfidenceTier {
  if (score >= CONFIDENCE_TIER_RANGES.high.min) return 'high';
  if (score >= CONFIDENCE_TIER_RANGES.medium.min) return 'medium';
  if (score >= CONFIDENCE_TIER_RANGES.low.min) return 'low';
  return 'uncertain';
}

/**
 * Claim verification against knowledge base
 * Links claims to supporting/contradicting information
 */
export interface ClaimVerificationLink {
  claim_id: string;
  kb_entry_id?: string;
  verification_status: 'supported' | 'contradicted' | 'neutral' | 'unverified';
  similarity_score: number;      // 0.0–1.0
  match_evidence?: string;       // Snippet from knowledge base
  conflicting_evidence?: string; // Contradictory information if any
}

/**
 * Response with uncertainty annotations
 * Contains full response text plus claim-level markers
 */
export interface AnnotatedResponse {
  id: string;
  response_id: string;
  session_id: string;
  turn_id: string;
  
  // Raw response
  response_text: string;
  
  // Extracted and marked claims
  claims: ResponseClaim[];
  
  // Claim markers indexed by claim_id for quick lookup
  markers: Record<string, ConfidenceMarker>;
  
  // Overall response quality
  response_quality: {
    average_confidence: number;
    confidence_distribution: {
      high: number;     // % of claims with high confidence
      medium: number;
      low: number;
      uncertain: number;
    };
    highest_risk_claims: ResponseClaim[];  // Claims with lowest confidence
    has_significant_uncertainty: boolean;  // true if >30% of claims are low/uncertain
  };
  
  created_at: string;
  updated_at: string;
}

/**
 * Configuration for uncertainty marker computation
 */
export interface UncertaintyMarkerConfig {
  // Claim extraction thresholds
  min_claim_confidence: number;          // 0.5–1.0, default 0.65
  min_claim_length: number;              // Minimum characters, default 10
  
  // Dimension weights (sum to 1.0)
  weight_evidence_quality: number;       // default 0.25
  weight_logical_certainty: number;      // default 0.25
  weight_factual_status: number;         // default 0.20
  weight_temporal_stability: number;     // default 0.15
  weight_model_confidence: number;       // default 0.15
  
  // Scoring rules
  evidence_level_scores: Record<string, number>; // {empirical: 1.0, theoretical: 0.8, ...}
  certainty_level_scores: Record<string, number>;
  
  // Risk flagging
  flag_low_confidence_threshold: number; // default 0.35
  flag_factual_interpretations: boolean; // default true
  flag_temporal_volatility: boolean;     // default true
  
  // Model-specific tuning
  model_name?: string;
  model_temperature?: number;            // Affects token probability weighting
  
  // Knowledge base integration
  enable_kb_verification: boolean;       // Link to knowledge base
  kb_similarity_threshold: number;       // default 0.65
}

/**
 * Batch processing result for multiple responses
 */
export interface UncertaintyMarkerBatch {
  batch_id: string;
  session_id: string;
  
  responses_processed: number;
  total_claims_extracted: number;
  claims_by_confidence: {
    high: number;
    medium: number;
    low: number;
    uncertain: number;
  };
  
  avg_response_quality: number;
  flagged_responses: Array<{
    response_id: string;
    reason: 'high_uncertainty' | 'many_low_confidence_claims' | 'temporal_volatility';
    severity: 'high' | 'medium' | 'low';
  }>;
  
  processing_time_ms: number;
  created_at: string;
}

/**
 * Database record for storing uncertainty markers
 */
export interface UncertaintyMarkerRecord {
  id: string;
  claim_id: string;
  response_id: string;
  session_id: string;
  
  // Marker data (stored as JSON to preserve structure)
  marker_json: Record<string, unknown>;
  
  // Computed scores
  composite_confidence: number;
  confidence_tier: string;
  
  // Flags
  is_flagged: boolean;
  flag_reason?: string;
  
  // Metadata
  computed_at: string;
  created_at: string;
  updated_at: string;
}
