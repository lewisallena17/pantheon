/**
 * Lightweight Ambiguity Scorer for Multi-Interpretation Prompts
 * 
 * Measures semantic and pragmatic ambiguity in user prompts by computing:
 * - Lexical ambiguity (word polysemy counts, homonyms)
 * - Syntactic ambiguity (parse tree alternatives, attachment ambiguities)
 * - Semantic ambiguity (plausible interpretation clustering, variance)
 * - Pragmatic ambiguity (context-dependency, missing referents)
 * - Overall ambiguity severity score (0.0–1.0)
 * 
 * Designed for lightweight inference—minimal external calls, local heuristics.
 */

/**
 * Individual word with polysemy analysis
 */
export interface PolysemousWord {
  word: string;
  position: number;              // character offset in prompt
  sense_count: number;           // number of distinct meanings
  senses: {
    definition: string;
    part_of_speech: string;
    frequency_rank?: number;     // 1 = most common
  }[];
  is_homonym: boolean;           // true if pronunciation differs across senses
  ambiguity_score: number;       // 0.0–1.0, entropy of sense frequencies
}

/**
 * Syntactic ambiguity source
 */
export interface SyntacticAmbiguity {
  type: 'attachment' | 'coordination' | 'scope' | 'ellipsis' | 'prepositional_phrase' | 'other';
  location: {
    start: number;
    end: number;
  };
  span: string;                  // text segment with ambiguity
  alternative_parses: string[];  // human-readable alternative parse descriptions
  parse_count: number;           // number of valid parse trees
  severity: 'mild' | 'moderate' | 'severe';
}

/**
 * Plausible interpretation from semantic analysis
 */
export interface PlausibleInterpretation {
  id: string;
  interpretation: string;        // human-readable paraphrase
  confidence: number;            // 0.0–1.0, likelihood this is intended meaning
  requires_context: boolean;     // true if depends on external knowledge
  speaker_intent_likelihood: number; // estimated P(user meant this)
}

/**
 * Semantic ambiguity analysis
 */
export interface SemanticAmbiguity {
  root_cause: 'pronoun_reference' | 'noun_reference' | 'verb_scope' | 'temporal_scope' | 'quantification' | 'other';
  plausible_interpretations: PlausibleInterpretation[];
  interpretation_entropy: number;  // Shannon entropy of interpretation distribution (0.0–1.0)
  mean_interpretation_confidence: number; // avg confidence across interpretations
  max_interpretation_spread: number;  // max difference in confidence between interpretations
  contextual_clues: string[];    // hints about intended meaning
}

/**
 * Pragmatic ambiguity source
 */
export interface PragmaticAmbiguity {
  type: 'missing_referent' | 'implicit_context' | 'unclear_intent' | 'indirect_speech_act' | 'cultural_context' | 'domain_jargon';
  description: string;
  requires_clarification: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  clarification_questions: string[];
}

/**
 * Comprehensive ambiguity analysis for a single prompt
 */
export interface PromptAmbiguityAnalysis {
  prompt_id: string;
  prompt_text: string;
  prompt_length: number;         // character count
  
  // Lexical ambiguity
  lexical_analysis: {
    polysemous_words: PolysemousWord[];
    polysemy_count: number;      // total polysemous words found
    average_senses_per_word: number;
    total_lexical_entropy: number; // sum of word ambiguity scores
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  };
  
  // Syntactic ambiguity
  syntactic_analysis: {
    ambiguities: SyntacticAmbiguity[];
    ambiguity_count: number;
    total_parse_alternatives: number;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  };
  
  // Semantic ambiguity
  semantic_analysis: {
    ambiguities: SemanticAmbiguity[];
    ambiguity_count: number;
    interpretations_count: number;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  };
  
  // Pragmatic ambiguity
  pragmatic_analysis: {
    ambiguities: PragmaticAmbiguity[];
    ambiguity_count: number;
    missing_context_count: number;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
  };
  
  // Overall scoring
  ambiguity_score: number;       // 0.0–1.0, weighted composite
  ambiguity_tier: AmbiguityTier; // semantic classification
  overall_severity: 'none' | 'mild' | 'moderate' | 'severe';
  confidence: number;            // 0.0–1.0, how confident in this analysis
  
  // Component weights (configurable)
  weights: {
    lexical_weight: number;      // default 0.20
    syntactic_weight: number;    // default 0.25
    semantic_weight: number;     // default 0.35
    pragmatic_weight: number;    // default 0.20
  };
  
  // Actionable feedback
  resolution_suggestions: string[];
  needs_clarification: boolean;
  clarification_priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadata
  computed_at: string;
  computation_time_ms: number;
}

/**
 * Summary tier for UI presentation
 */
export type AmbiguityTier = 'clear' | 'slightly_ambiguous' | 'ambiguous' | 'highly_ambiguous';

export const AMBIGUITY_TIER_RANGES = {
  clear: { min: 0.0, max: 0.25, icon: '✓', color: 'emerald', label: 'Clear', description: 'Single clear interpretation' },
  slightly_ambiguous: { min: 0.25, max: 0.5, icon: '◐', color: 'cyan', label: 'Slightly ambiguous', description: 'Minor ambiguity, context clears it' },
  ambiguous: { min: 0.5, max: 0.75, icon: '◑', color: 'amber', label: 'Ambiguous', description: 'Multiple plausible interpretations' },
  highly_ambiguous: { min: 0.75, max: 1.0, icon: '⚠', color: 'red', label: 'Highly ambiguous', description: 'Many interpretations, needs clarification' },
} as const;

export function getTierFromScore(score: number): AmbiguityTier {
  if (score < AMBIGUITY_TIER_RANGES.slightly_ambiguous.min) return 'clear';
  if (score < AMBIGUITY_TIER_RANGES.ambiguous.min) return 'slightly_ambiguous';
  if (score < AMBIGUITY_TIER_RANGES.highly_ambiguous.min) return 'ambiguous';
  return 'highly_ambiguous';
}

/**
 * Ambiguity score breakdown for debugging/transparency
 */
export interface AmbiguityScoreBreakdown {
  lexical_component: number;     // 0.0–1.0, normalized lexical ambiguity
  syntactic_component: number;   // 0.0–1.0, normalized syntactic ambiguity
  semantic_component: number;    // 0.0–1.0, normalized semantic ambiguity
  pragmatic_component: number;   // 0.0–1.0, normalized pragmatic ambiguity
  
  // Weighted sum
  final_score: number;           // 0.0–1.0
  
  // Component contributions
  contributions: {
    lexical_contribution: number;
    syntactic_contribution: number;
    semantic_contribution: number;
    pragmatic_contribution: number;
  };
}

/**
 * Configuration for ambiguity scoring sensitivity
 */
export interface AmbiguityConfig {
  // Lexical configuration
  lexical_enabled: boolean;
  polysemy_threshold: number;    // minimum sense count to flag (default 2)
  entropy_weight: number;        // weight for polysemy entropy (default 0.5)
  
  // Syntactic configuration
  syntactic_enabled: boolean;
  parse_complexity_threshold: number; // minimum parse alternatives to flag (default 2)
  syntactic_severity_multiplier: number; // boost score for "severe" syntactic ambiguities
  
  // Semantic configuration
  semantic_enabled: boolean;
  interpretation_count_threshold: number; // minimum plausible interpretations to flag (default 2)
  interpretation_entropy_weight: number; // weight for interpretation variance (default 0.6)
  
  // Pragmatic configuration
  pragmatic_enabled: boolean;
  missing_context_weight: number;
  indirect_speech_weight: number;
  
  // Scoring
  normalize_by_length: boolean;  // adjust score for prompt length (default true)
  min_length_for_scoring: number; // minimum characters for meaningful scoring (default 10)
  length_normalization_factor: number; // how much to penalize very short prompts (default 1.2)
  
  // Weights
  lexical_weight: number;        // default 0.20
  syntactic_weight: number;      // default 0.25
  semantic_weight: number;       // default 0.35
  pragmatic_weight: number;      // default 0.20
}

/**
 * Default configuration
 */
export const DEFAULT_AMBIGUITY_CONFIG: AmbiguityConfig = {
  lexical_enabled: true,
  polysemy_threshold: 2,
  entropy_weight: 0.5,
  
  syntactic_enabled: true,
  parse_complexity_threshold: 2,
  syntactic_severity_multiplier: 1.3,
  
  semantic_enabled: true,
  interpretation_count_threshold: 2,
  interpretation_entropy_weight: 0.6,
  
  pragmatic_enabled: true,
  missing_context_weight: 0.4,
  indirect_speech_weight: 0.3,
  
  normalize_by_length: true,
  min_length_for_scoring: 10,
  length_normalization_factor: 1.2,
  
  lexical_weight: 0.20,
  syntactic_weight: 0.25,
  semantic_weight: 0.35,
  pragmatic_weight: 0.20,
};

/**
 * Database record for storing computed ambiguity scores
 */
export interface AmbiguityScoreRecord {
  id: string;
  prompt_id: string;
  prompt_text: string;
  prompt_length: number;
  
  // Component scores
  lexical_score: number;
  syntactic_score: number;
  semantic_score: number;
  pragmatic_score: number;
  
  // Overall
  ambiguity_score: number;
  ambiguity_tier: string;
  overall_severity: string;
  confidence: number;
  
  // Details (JSON)
  polysemous_words_count: number;
  syntactic_ambiguities_count: number;
  interpretations_count: number;
  pragmatic_issues_count: number;
  
  needs_clarification: boolean;
  clarification_priority: string;
  
  // Suggestions (JSON array)
  resolution_suggestions: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Quick ambiguity check result (minimal version)
 * For fast scoring without full analysis details
 */
export interface QuickAmbiguityScore {
  prompt_text: string;
  ambiguity_score: number;
  ambiguity_tier: AmbiguityTier;
  needs_clarification: boolean;
  primary_issue: string | null; // e.g., "polysemy", "pronoun_reference", "missing_context"
}

/**
 * Ambiguity detection result with user suggestions
 * For UI display and user guidance
 */
export interface AmbiguityFeedback {
  score: number;
  tier: AmbiguityTier;
  summary: string;
  issues: Array<{
    type: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    suggestion?: string;
  }>;
  clarification_questions: string[];
  next_steps: string[];
}
