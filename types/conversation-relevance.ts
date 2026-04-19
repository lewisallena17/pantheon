/**
 * Conversation Relevance Decay Metrics
 * 
 * Measures how much conversation context loses relevance over turn depth by:
 * - Computing semantic embeddings for each turn
 * - Computing cosine similarity between turn-N and turn-N+K
 * - Measuring decay slope (how quickly relevance drops)
 * - Tracking context utility patterns by conversation type
 * - Identifying breakpoints where context becomes effectively "expired"
 */

/**
 * Raw embedding for a conversation turn
 * Stores the vector representation for similarity computation
 */
export interface TurnEmbedding {
  turn_id: string;
  session_id: string;
  turn_index: number;
  embedding: number[];          // Dense vector (e.g., 384-1536 dimensions)
  embedding_model: string;      // e.g., "sentence-transformers/all-MiniLM-L6-v2"
  created_at: string;
}

/**
 * Pairwise similarity between two turns
 * Used to compute relevance decay curve
 */
export interface TurnPairSimilarity {
  from_turn_index: number;
  to_turn_index: number;
  depth_delta: number;          // to_turn_index - from_turn_index
  cosine_similarity: number;    // 0.0–1.0
  jaro_similarity?: number;     // String-level similarity for cross-check
  computed_at: string;
}

/**
 * Relevance decay metrics for a conversation
 * Computed from pairwise similarities across all turn pairs
 */
export interface ConversationRelevanceMetrics {
  session_id: string;
  conversation_type?: string;   // 'technical', 'support', 'creative', 'task-oriented', etc.
  topic?: string;
  
  // Raw data
  turn_count: number;
  embedding_pairs_count: number;
  
  // Decay curve characterization
  initial_relevance: number;     // avg similarity at depth_delta=1 (immediate follow-up)
  max_depth_tested: number;      // max depth_delta in measurements
  half_life_depth: number | null; // depth at which relevance drops to 50%
  relevance_at_max_depth: number; // final relevance at max tested depth
  
  // Decay pattern classification
  decay_type: 'exponential' | 'linear' | 'steep' | 'plateau' | 'unknown';
  decay_slope: number;           // negative slope of decay curve (0.0–1.0)
  decay_r_squared: number;       // goodness-of-fit for linear model (0.0–1.0)
  
  // Breakpoints: thresholds where context becomes "expired"
  breakpoint_25_percent_depth?: number;  // depth where relevance drops to 75%
  breakpoint_50_percent_depth?: number;  // depth where relevance drops to 50%
  breakpoint_75_percent_depth?: number;  // depth where relevance drops to 25%
  
  // Utility assessment
  context_window_depth: number;  // recommended context window size based on decay
  effective_memory_turns: number; // turns that retain >50% relevance
  forgetting_rate: number;       // relevance lost per turn (0.0–1.0)
  
  // Statistical summary
  mean_pairwise_similarity: number;
  std_dev_similarity: number;
  min_similarity: number;
  max_similarity: number;
  
  // Metadata
  domain?: string;
  task_category?: string;
  computed_at: string;
}

/**
 * Aggregated metrics across multiple conversations
 * For identifying domain-specific relevance patterns
 */
export interface DomainRelevanceAnalysis {
  domain: string;
  conversation_count: number;
  turn_count_total: number;
  
  // Aggregated decay patterns
  avg_decay_slope: number;
  median_half_life_depth: number | null;
  std_dev_decay_slope: number;
  
  // Distribution of decay types
  decay_type_distribution: Record<string, number>; // {exponential: 5, linear: 3, ...}
  
  // Recommended context window by domain
  recommended_context_window: number;
  
  // Confidence in patterns
  sample_size: number;
  confidence_level: number; // 0.0–1.0
  last_computed_at: string;
}

/**
 * Single data point in a relevance decay visualization
 * X-axis: depth (turn distance), Y-axis: similarity
 */
export interface RelevanceDecayPoint {
  depth: number;
  similarity: number;
  count: number;              // number of pairs at this depth
  std_error: number;          // standard error of mean similarity
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

/**
 * Visualization dataset for rendering decay curve
 */
export interface RelevanceDecayVisualizationData {
  session_id: string;
  conversation_type?: string;
  conversation_title?: string;
  
  // Main decay curve
  curve_points: RelevanceDecayPoint[];
  
  // Fitted models (for comparison)
  exponential_fit?: {
    points: RelevanceDecayPoint[];
    equation: string;           // e.g., "y = 0.95 * exp(-0.1 * x)"
    r_squared: number;
  };
  linear_fit?: {
    points: RelevanceDecayPoint[];
    equation: string;           // e.g., "y = 1.0 - 0.05 * x"
    r_squared: number;
  };
  
  // Metrics summary
  metrics: ConversationRelevanceMetrics;
  
  // Annotations for key thresholds
  annotations: Array<{
    type: 'breakpoint' | 'half_life' | 'plateau' | 'inflection';
    depth: number;
    similarity: number;
    label: string;
  }>;
}

/**
 * Configuration for relevance decay computation
 */
export interface RelevanceDecayConfig {
  // Embedding model to use
  embedding_model: 'sentence-transformers/all-MiniLM-L6-v2' | 'sentence-transformers/all-mpnet-base-v2' | 'custom';
  embedding_dimension: number;  // 384, 768, 1536, etc.
  
  // Similarity metrics to compute
  compute_cosine: boolean;
  compute_jaro: boolean;
  
  // Depth sampling
  max_depth: number;            // max turn distance to measure
  min_pairs_per_depth: number;  // threshold for statistical validity
  
  // Fit parameters
  fit_exponential: boolean;
  fit_linear: boolean;
  min_r_squared_threshold: number; // minimum goodness-of-fit
  
  // Breakpoint thresholds
  breakpoint_percentiles: number[]; // [25, 50, 75]
  
  // Conversation filtering
  min_turns: number;
  min_session_age_hours: number;
  conversation_type_filter?: string[];
}

/**
 * Database record for storing computed relevance metrics
 */
export interface ConversationRelevanceRecord {
  id: string;
  session_id: string;
  conversation_type?: string;
  topic?: string;
  turn_count: number;
  embedding_pairs_count: number;
  initial_relevance: number;
  max_depth_tested: number;
  half_life_depth: number | null;
  relevance_at_max_depth: number;
  decay_type: string;
  decay_slope: number;
  decay_r_squared: number;
  context_window_depth: number;
  effective_memory_turns: number;
  forgetting_rate: number;
  mean_pairwise_similarity: number;
  std_dev_similarity: number;
  computed_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Relevance decay insight for non-technical users
 */
export interface RelevanceInsight {
  title: string;
  summary: string;
  recommendation: string;
  confidence: number; // 0.0–1.0
  domain: string;
}
