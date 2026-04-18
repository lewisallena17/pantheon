/**
 * Conversation Helpfulness Metrics
 * 
 * Measures user satisfaction signals without explicit ratings by analyzing:
 * - Lexical sentiment (word choice, language patterns)
 * - Interaction patterns (follow-ups, engagement, task completion)
 * - Behavioral proxies (response time, message length variance, edit frequency)
 * - Temporal signals (time-to-response, revisit patterns)
 * - Task completion rates and outcomes
 */

/**
 * Individual satisfaction signal weights
 * Sum should ideally equal 1.0 for normalized score
 * Configurable per use case (support vs dev assistance vs content recommendations)
 */
export interface HelpfulnessWeights {
  lexicalSentiment: number;      // 0.25 — explicit positive/negative language
  engagementDepth: number;       // 0.20 — follow-ups, multi-turn interactions
  taskCompletion: number;        // 0.25 — task succeeded / was resolved
  responsePatterns: number;      // 0.15 — time-to-response, message coherence
  revisitBehavior: number;       // 0.10 — user returns, saves, re-engages
  contextRetention: number;      // 0.05 — agent remembered prior context
}

/**
 * Parsed signal from a single user turn/message
 */
export interface SatisfactionSignal {
  messageId: string;
  userId: string;
  conversationId: string;
  timestamp: string;
  
  // Lexical signals
  sentimentScore: number;        // -1 (negative) to +1 (positive)
  sentimentConfidence: number;   // 0–1, how confident the sentiment is
  emotionalValence: string;      // 'positive' | 'neutral' | 'negative' | 'frustrated' | 'grateful'
  
  // Behavioral signals
  messageLength: number;         // word count
  responseTimeMs?: number;       // ms since last agent message
  isFollowUp: boolean;           // true if part of multi-turn
  isQuestionAsking: boolean;     // true if contains ? or asks for clarification
  isEditorially: boolean;        // true if user edited/corrected previous message
  
  // Task completion signals
  mentionedTaskId?: string;
  taskStatus?: 'proposed' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked';
  taskCompletionRate?: number;   // 0–1 if multiple tasks in conversation
  
  // Engagement signals
  hasLinks: boolean;             // user shared/bookmarked/linked something
  hasMention: boolean;           // @mentioned agent or another user
  hasReaction: boolean;          // emoji reaction, bookmark, or similar
  revisitedConversation: boolean; // user returned to this conversation later
  
  // Context retention signals
  referencedPriorContext: boolean;
  referencedSpecificDetail: boolean;
}

/**
 * Aggregated helpfulness score for a conversation
 */
export interface ConversationHelpfulness {
  conversationId: string;
  agentName: string;
  startedAt: string;
  endedAt?: string;
  
  // Overall scores
  helpfulnessScore: number;      // 0–1, weighted average of all signals
  confidence: number;            // 0–1, how confident in this measurement
  inferredSatisfaction: 'likely_satisfied' | 'neutral' | 'likely_dissatisfied' | 'unknown';
  
  // Component scores
  lexicalScore: number;
  engagementScore: number;
  completionScore: number;
  responseScore: number;
  revisitScore: number;
  contextScore: number;
  
  // Metadata
  signalCount: number;
  messageCount: number;
  taskCount: number;
  completedTaskCount: number;
  averageResponseTimeMs?: number;
  
  // Validation flags
  hasEnoughData: boolean;        // true if >3 signals or >2 turns
  isFromValidConversation: boolean; // true if not synthetic/test
  warnings: string[];
}

/**
 * User satisfaction sample for calibration
 * Used to validate inferred signals against ground truth
 */
export interface SatisfactionSample {
  conversationId: string;
  inferredScore: number;
  explicitRating?: number;       // 1–5 if user provided explicit rating
  userFeedback?: string;
  recordedAt: string;
  validatedAt?: string;
  isOutlier: boolean;
}

/**
 * Metric accuracy report
 */
export interface MetricAccuracy {
  totalSamples: number;
  correlationWithRatings: number;
  meanAbsoluteError: number;
  highConfidenceAccuracy: number; // accuracy on signals with confidence > 0.7
  falsePositiveRate: number;      // inferred satisfied but user said otherwise
  falseNegativeRate: number;      // inferred dissatisfied but user rated positively
  recommendedThreshold: number;   // cutoff for "likely satisfied"
}

/**
 * Signal detection rules for lexical analysis
 */
export interface LexicalRule {
  pattern: RegExp;
  weight: number;                // positive = satisfaction, negative = dissatisfaction
  confidence: number;            // 0–1
  category: 'positive' | 'negative' | 'neutral' | 'question' | 'correction';
}

/**
 * Configuration for per-use-case metric tuning
 */
export interface HelpfulnessConfig {
  domain: 'support' | 'technical_assistance' | 'content_recommendations' | 'general';
  weights?: Partial<HelpfulnessWeights>;
  lexicalRules?: LexicalRule[];
  minSignalsForConfidence?: number;
  minTurnsForEngagement?: number;
  responseTimeThresholdMs?: number;
  enableSampling?: boolean;
  samplingRate?: number;
}

/**
 * Database record for storing computed helpfulness metrics
 */
export interface HelpfulnessRecord {
  id: string;
  conversation_id: string;
  agent_name: string;
  helpfulness_score: number;
  confidence: number;
  inferred_satisfaction: string;
  signal_count: number;
  message_count: number;
  task_count: number;
  completed_task_count: number;
  has_enough_data: boolean;
  is_from_valid_conversation: boolean;
  warnings: string;
  created_at: string;
  updated_at: string;
}
