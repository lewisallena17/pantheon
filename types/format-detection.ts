/**
 * Output Format Detection & Suggestion System
 * 
 * Automatically detects user intent and suggests optimal output formats
 * based on context, conversation history, message characteristics, and prior usage patterns.
 */

/**
 * Supported output format types
 */
export type OutputFormat =
  | 'bullet-points'    // Concise list format
  | 'narrative'        // Prose paragraph
  | 'code'             // Code snippet/example
  | 'json'             // Structured JSON
  | 'table'            // Tabular data
  | 'checklist'        // Interactive checklist
  | 'timeline'         // Chronological flow
  | 'comparison'       // Side-by-side comparison
  | 'structured'       // Numbered steps/outline
  | 'minimal'          // Ultra-concise (one-liner/key term)

/**
 * Message characteristics extracted from user input
 */
export interface MessageCharacteristics {
  length: 'short' | 'medium' | 'long'
  complexity: 'simple' | 'moderate' | 'complex'
  isQuestion: boolean
  isRequest: boolean
  isFollowUp: boolean
  estimatedTokens: number
  hasCodeKeywords: boolean
  hasDataKeywords: boolean
  hasComparisonKeywords: boolean
  hasProcessKeywords: boolean
}

/**
 * User context accumulated over a session
 */
export interface UserContext {
  sessionId: string
  userId?: string
  messageCount: number
  previousFormats: OutputFormat[]
  preferredFormat?: OutputFormat
  topicDomain?: 'technical' | 'business' | 'creative' | 'analytical' | 'instructional' | 'other'
  avgMessageLength: number
  recentKeywords: string[]
  isFirstMessage: boolean
  conversationAge: number // seconds
}

/**
 * Detection signals that influence format ranking
 */
export interface FormatDetectionSignals {
  explicitFormat?: OutputFormat     // User explicitly asked for a format
  implicitFormat?: OutputFormat     // Format inferred from keywords
  contextFormat?: OutputFormat      // Format suggested by conversation topic
  habitFormat?: OutputFormat        // User's most-used format historically
  semanticFormat?: OutputFormat     // Format based on semantic analysis
  dataStructureFormat?: OutputFormat // Format based on data type (table for tabular, etc.)
  complexityFormat?: OutputFormat   // Format based on message/answer complexity
}

/**
 * Ranked format suggestion with confidence
 */
export interface FormatSuggestion {
  format: OutputFormat
  confidence: number          // 0.0-1.0
  reasons: string[]           // Explanation for why this format was suggested
  signalsMatched: (keyof FormatDetectionSignals)[] // Which signals triggered this suggestion
}

/**
 * Complete detection result
 */
export interface FormatDetectionResult {
  topSuggestions: FormatSuggestion[]
  allSignals: FormatDetectionSignals
  messageCharacteristics: MessageCharacteristics
  userContext: UserContext
  confidence: number // Overall confidence in the top suggestion (0.0-1.0)
  detectionTimestamp: string
}

/**
 * Configuration for format detection
 */
export interface FormatDetectionConfig {
  // Enable/disable specific detection methods
  enableExplicitDetection: boolean
  enableImplicitDetection: boolean
  enableContextDetection: boolean
  enableHabitDetection: boolean
  enableSemanticDetection: boolean
  
  // Weighting for signal combination (must sum to 1.0)
  weights: {
    explicit: number     // 0.3
    implicit: number     // 0.25
    context: number      // 0.2
    habit: number        // 0.15
    semantic: number     // 0.1
  }
  
  // Thresholds
  minConfidenceToSuggest: number  // 0.4
  minSuggestionsToShow: number    // 2
  maxSuggestionsToShow: number    // 4
  
  // Context tracking
  trackUserHistory: boolean
  historyWindow: number          // Last N messages to consider
}

/**
 * Serializable format preference for storage
 */
export interface FormatPreference {
  userId?: string
  format: OutputFormat
  score: number                   // Positive if user liked it, negative if not
  context: string                 // What was the context of this interaction
  timestamp: string
}

/**
 * Keywords mapped to format suggestions
 */
export const FORMAT_KEYWORDS: Record<OutputFormat, RegExp> = {
  'bullet-points': /\b(list|bullet|point|items|quick|summary|overview|brief)\b/i,
  'narrative': /\b(explain|describe|tell|story|narrative|detail|elaborate|prose)\b/i,
  'code': /\b(code|example|snippet|implement|function|class|script|how do i write)\b/i,
  'json': /\b(json|api|structure|format|schema|data model|payload)\b/i,
  'table': /\b(table|comparison|data|rows|columns|matrix|vs\.?|versus|compare)\b/i,
  'checklist': /\b(check|todo|task|step|action|do|follow|guide|walkthrough)\b/i,
  'timeline': /\b(timeline|history|sequence|order|progression|when|then|next)\b/i,
  'comparison': /\b(compare|difference|better|worse|pros and cons|advantage|disadvantage)\b/i,
  'structured': /\b(structure|outline|numbered|step by step|hierarchy|organize|order)\b/i,
  'minimal': /\b(short|quick|one liner|tl;?dr|essence|core|key word|term|name)\b/i,
}

/**
 * Common patterns that indicate format intent
 */
export const FORMAT_PATTERNS: Record<OutputFormat, RegExp[]> = {
  'bullet-points': [
    /^give me.*list/i,
    /^list (all|the)\b/i,
    /^\* /m,  // Markdown bullet
  ],
  'narrative': [
    /^explain.*how/i,
    /^tell me.*story/i,
    /^describe.*in detail/i,
  ],
  'code': [
    /^(show|write|create).*code/i,
    /^example:?/i,
    /^```/m,  // Code block
  ],
  'json': [
    /^as json/i,
    /^json format/i,
    /^\{/m,  // JSON object
  ],
  'table': [
    /^(create|make|show).*table/i,
    /^\|.*\|/m,  // Markdown table
    /^compare.*in a table/i,
  ],
  'checklist': [
    /^(create|make|show).*checklist/i,
    /^steps? to\b/i,
    /^how (can|do|do i)/i,
  ],
  'timeline': [
    /^(timeline|history|sequence)/i,
    /^what happened/i,
  ],
  'comparison': [
    /^(compare|difference|what.*better)/i,
    /vs\.?/i,
  ],
  'structured': [
    /^(structure|outline)/i,
    /^in order:/i,
  ],
  'minimal': [
    /^tl;?dr/i,
    /^(just|only).*(word|name|term)/i,
  ],
}

/**
 * Confidence boost for formats based on domain context
 */
export const DOMAIN_FORMAT_AFFINITY: Record<string, Partial<Record<OutputFormat, number>>> = {
  technical: {
    'code': 0.9,
    'json': 0.8,
    'structured': 0.7,
    'bullet-points': 0.6,
  },
  business: {
    'bullet-points': 0.85,
    'table': 0.8,
    'comparison': 0.7,
    'structured': 0.65,
  },
  creative: {
    'narrative': 0.85,
    'bullet-points': 0.6,
    'timeline': 0.55,
  },
  analytical: {
    'table': 0.85,
    'comparison': 0.8,
    'json': 0.65,
    'structured': 0.6,
  },
  instructional: {
    'checklist': 0.9,
    'structured': 0.85,
    'timeline': 0.65,
    'bullet-points': 0.6,
  },
}

/**
 * Complexity thresholds
 */
export const COMPLEXITY_THRESHOLDS = {
  SHORT_MESSAGE: 100,      // tokens
  MEDIUM_MESSAGE: 300,
  LONG_MESSAGE: 1000,
} as const
