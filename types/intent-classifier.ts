/**
 * Lightweight Intent Confidence Scorer for User Messages
 * 
 * Distinguishes between three primary user intents:
 * 1. EXPLORATORY — seeking knowledge, understanding, learning (e.g., "Why does X happen?", "Tell me about Y")
 * 2. TRANSACTIONAL — requesting an action, decision, or result (e.g., "Create a task for...", "List all...")
 * 3. CLARIFICATION — seeking to understand or clarify previous context (e.g., "What did you mean?", "Can you clarify?")
 * 
 * Uses lightweight heuristics:
 * - Keyword/phrase matching (question markers, imperatives, modal verbs)
 * - Syntactic patterns (question vs. statement, sentence structure)
 * - Semantic intent signals (exploratory verbs like "explain", transactional verbs like "create")
 * - Confidence scoring based on signal strength and clarity
 * 
 * No external API calls or embeddings required—runs locally on CPU.
 */

/**
 * The three primary intent categories
 */
export type UserIntent = 'exploratory' | 'transactional' | 'clarification';

/**
 * Confidence tier for UI presentation
 */
export type IntentConfidenceTier = 'high' | 'medium' | 'low';

/**
 * Individual signal that contributes to intent classification
 */
export interface IntentSignal {
  type: SignalType;
  category: UserIntent;           // which intent this signal suggests
  match: string;                  // the matched text or pattern
  position: number;               // character position in message
  weight: number;                 // 0.0–1.0, importance of this signal
  confidence: number;             // 0.0–1.0, certainty of this match
  reasoning: string;              // brief explanation for debugging
}

/**
 * Types of signals used to classify intent
 */
export type SignalType = 
  | 'question_marker'             // ?, multiple questions
  | 'imperative_verb'             // create, delete, list, check
  | 'exploratory_verb'            // explain, tell, why, how, what is
  | 'clarification_marker'        // what do you mean, clarify, repeat
  | 'modal_auxiliary'             // can you, could you, would you, will you
  | 'polarity_indicator'          // is/isn't, will/won't (yes/no questions)
  | 'context_reference'           // "that", "this", "you said", "previous"
  | 'action_noun'                 // task, reminder, note, project
  | 'request_hedge'               // "could you", "can you", "would you mind"
  | 'comparative_language'        // more, less, better, alternative
  | 'negation_with_query'         // "don't have", "can't find"
  | 'meta_question';              // "what", "which", "who" at start

/**
 * Raw classification result before confidence thresholding
 */
export interface IntentClassificationResult {
  message: string;
  message_length: number;
  
  // Primary classification
  primary_intent: UserIntent;
  primary_confidence: number;     // 0.0–1.0
  
  // Alternative intents (runner-ups)
  alternative_intents: Array<{
    intent: UserIntent;
    confidence: number;
  }>;
  
  // Signal analysis
  signals: IntentSignal[];
  signal_count: number;
  dominant_signal_type?: SignalType;
  
  // Score breakdown
  intent_scores: {
    exploratory_score: number;    // 0.0–1.0
    transactional_score: number;  // 0.0–1.0
    clarification_score: number;  // 0.0–1.0
  };
  
  // Confidence components
  confidence_factors: {
    signal_count_factor: number;  // more signals = higher confidence
    signal_agreement_factor: number; // all signals agree = higher confidence
    dominant_signal_strength: number; // strength of the strongest signal
    ambiguity_factor: number;     // 0.0–1.0, how close are the top two intents?
  };
  
  // Metadata
  is_confident: boolean;          // true if primary_confidence >= confidence_threshold
  confidence_tier: IntentConfidenceTier;
  is_ambiguous: boolean;          // true if top two intents are very close
  
  computed_at: string;
  computation_time_ms: number;
}

/**
 * User-friendly representation of classification result
 */
export interface IntentClassificationSummary {
  intent: UserIntent;
  confidence: IntentConfidenceTier;
  description: string;             // e.g., "Seeking knowledge or understanding"
  icon: string;                    // ⚙️, 🔍, ❓
  color: 'slate' | 'cyan' | 'amber' | 'emerald' | 'red'; // Tailwind colors
  
  // Actionable feedback
  interpretation: string;          // how the system will interpret this message
  next_steps?: string[];           // suggested actions
}

/**
 * Configuration for intent classification
 */
export interface IntentClassificationConfig {
  // Confidence thresholding
  confidence_threshold: number;   // minimum confidence to consider classification reliable (default 0.60)
  ambiguity_threshold: number;    // if (score[0] - score[1]) < this, mark as ambiguous (default 0.15)
  
  // Signal weights
  signal_weights: {
    question_marker: number;      // 0.8 (strong indicator)
    imperative_verb: number;      // 0.85 (very strong for transactional)
    exploratory_verb: number;     // 0.8 (strong for exploratory)
    clarification_marker: number; // 0.9 (very strong)
    modal_auxiliary: number;      // 0.6 (moderate)
    polarity_indicator: number;   // 0.5 (weak)
    context_reference: number;    // 0.7 (for clarification)
    action_noun: number;          // 0.6
    request_hedge: number;        // 0.65
    comparative_language: number; // 0.55
    negation_with_query: number;  // 0.6
    meta_question: number;        // 0.75
  };
  
  // Intent-specific configurations
  exploratory_config: {
    enabled: boolean;
    keywords: string[];           // why, explain, tell, how, what is, describe
    question_weight_boost: number; // extra weight if it's a question
  };
  
  transactional_config: {
    enabled: boolean;
    action_verbs: string[];       // create, delete, list, update, mark, check, set, add
    imperatives_weight_boost: number;
  };
  
  clarification_config: {
    enabled: boolean;
    keywords: string[];           // clarify, what do you mean, repeat, again, unclear
    context_reference_weight_boost: number;
  };
  
  // Scoring algorithm
  use_normalized_scores: boolean; // divide by sum of all scores (default true)
  apply_confidence_penalty: boolean; // reduce confidence for ambiguous cases
  
  // Performance tuning
  case_insensitive: boolean;      // default true
  normalize_whitespace: boolean;  // default true
  min_message_length: number;     // skip classification for messages shorter than this
}

/**
 * Confidence score breakdown for debugging and transparency
 */
export interface IntentConfidenceBreakdown {
  signal_count_contribution: number;
  signal_agreement_contribution: number;
  dominant_signal_strength_contribution: number;
  ambiguity_penalty: number;
  
  final_confidence: number;       // 0.0–1.0
}

/**
 * Batch classification result for multiple messages
 */
export interface BatchIntentClassification {
  results: IntentClassificationResult[];
  total_messages: number;
  intent_distribution: {
    exploratory_count: number;
    transactional_count: number;
    clarification_count: number;
  };
  intent_percentages: {
    exploratory_percent: number;
    transactional_percent: number;
    clarification_percent: number;
  };
  average_confidence: number;
  ambiguous_count: number;        // messages where top 2 intents are close
}

/**
 * Default configuration constants
 */
export const DEFAULT_INTENT_CONFIG: IntentClassificationConfig = {
  confidence_threshold: 0.60,
  ambiguity_threshold: 0.15,
  
  signal_weights: {
    question_marker: 0.8,
    imperative_verb: 0.85,
    exploratory_verb: 0.8,
    clarification_marker: 0.9,
    modal_auxiliary: 0.6,
    polarity_indicator: 0.5,
    context_reference: 0.7,
    action_noun: 0.6,
    request_hedge: 0.65,
    comparative_language: 0.55,
    negation_with_query: 0.6,
    meta_question: 0.75,
  },
  
  exploratory_config: {
    enabled: true,
    keywords: [
      'why', 'how', 'what', 'explain', 'tell me', 'describe', 'show me',
      'how does', 'what is', 'what are', 'what about', 'how about',
      'learn', 'understand', 'background', 'context', 'information'
    ],
    question_weight_boost: 0.15,
  },
  
  transactional_config: {
    enabled: true,
    action_verbs: [
      'create', 'make', 'add', 'delete', 'remove', 'update', 'edit',
      'mark', 'set', 'check', 'list', 'show', 'get', 'fetch', 'do',
      'save', 'store', 'assign', 'schedule', 'plan'
    ],
    imperatives_weight_boost: 0.20,
  },
  
  clarification_config: {
    enabled: true,
    keywords: [
      'clarify', 'clarification', 'what do you mean', 'can you clarify',
      'what did you mean', 'did you mean', 'i don\'t understand', 'unclear',
      'repeat', 'again', 'once more', 'say that again', 'explain that',
      'rephrase', 'different way'
    ],
    context_reference_weight_boost: 0.25,
  },
  
  use_normalized_scores: true,
  apply_confidence_penalty: true,
  case_insensitive: true,
  normalize_whitespace: true,
  min_message_length: 3,
};

/**
 * Intent description and UI metadata
 */
export const INTENT_METADATA: Record<UserIntent, {
  label: string;
  description: string;
  icon: string;
  color: 'slate' | 'cyan' | 'amber' | 'emerald' | 'red';
  icon_emoji: string;
}> = {
  exploratory: {
    label: 'Exploratory',
    description: 'Seeking knowledge, understanding, or explanation',
    icon: '🔍',
    color: 'cyan',
    icon_emoji: '🔍',
  },
  transactional: {
    label: 'Transactional',
    description: 'Requesting an action, decision, or task completion',
    icon: '⚙️',
    color: 'amber',
    icon_emoji: '⚙️',
  },
  clarification: {
    label: 'Clarification',
    description: 'Seeking to clarify or better understand previous context',
    icon: '❓',
    color: 'slate',
    icon_emoji: '❓',
  },
};

/**
 * Confidence tier ranges for UI presentation
 */
export const INTENT_CONFIDENCE_TIERS = {
  high: { min: 0.70, max: 1.0, label: 'High confidence' },
  medium: { min: 0.50, max: 0.70, label: 'Moderate confidence' },
  low: { min: 0.0, max: 0.50, label: 'Low confidence' },
} as const;
