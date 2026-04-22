/**
 * Core format detection engine
 * Analyzes user messages and context to suggest optimal output formats
 */

import type {
  OutputFormat,
  MessageCharacteristics,
  UserContext,
  FormatDetectionSignals,
  FormatSuggestion,
  FormatDetectionResult,
  FormatDetectionConfig,
} from '@/types/format-detection'

import {
  FORMAT_KEYWORDS,
  FORMAT_PATTERNS,
  DOMAIN_FORMAT_AFFINITY,
  COMPLEXITY_THRESHOLDS,
} from '@/types/format-detection'

/**
 * Default configuration for format detection
 */
const DEFAULT_CONFIG: FormatDetectionConfig = {
  enableExplicitDetection: true,
  enableImplicitDetection: true,
  enableContextDetection: true,
  enableHabitDetection: true,
  enableSemanticDetection: true,
  weights: {
    explicit: 0.3,
    implicit: 0.25,
    context: 0.2,
    habit: 0.15,
    semantic: 0.1,
  },
  minConfidenceToSuggest: 0.4,
  minSuggestionsToShow: 2,
  maxSuggestionsToShow: 4,
  trackUserHistory: true,
  historyWindow: 10,
}

/**
 * Estimate token count for message (rough approximation)
 * ~4 characters ≈ 1 token
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Classify message length
 */
function classifyLength(tokens: number): 'short' | 'medium' | 'long' {
  if (tokens < COMPLEXITY_THRESHOLDS.SHORT_MESSAGE) return 'short'
  if (tokens < COMPLEXITY_THRESHOLDS.MEDIUM_MESSAGE) return 'medium'
  return 'long'
}

/**
 * Extract message characteristics from user input
 */
export function extractMessageCharacteristics(message: string): MessageCharacteristics {
  const trimmed = message.trim()
  const tokens = estimateTokens(trimmed)
  
  // Determine complexity based on punctuation, length, vocabulary
  const sentenceCount = (trimmed.match(/[.!?]/g) ?? []).length
  const hasComplexPunctuation = /[;:—-]/g.test(trimmed)
  const wordCount = trimmed.split(/\s+/).length
  const avgWordLength = trimmed.replace(/\s+/g, '').length / wordCount
  
  let complexity: 'simple' | 'moderate' | 'complex'
  if (wordCount > 30 || avgWordLength > 6 || hasComplexPunctuation) {
    complexity = 'complex'
  } else if (wordCount > 15) {
    complexity = 'moderate'
  } else {
    complexity = 'simple'
  }

  return {
    length: classifyLength(tokens),
    complexity,
    isQuestion: /[?]/.test(trimmed),
    isRequest: /\b(please|can you|could you|would you|show|give|make|create|generate)\b/i.test(trimmed),
    isFollowUp: /\b(also|additionally|furthermore|moreover|furthermore|next|then|what about)\b/i.test(trimmed),
    estimatedTokens: tokens,
    hasCodeKeywords: /\b(code|function|class|script|python|javascript|sql|api)\b/i.test(trimmed),
    hasDataKeywords: /\b(data|dataset|file|json|csv|table|row|column)\b/i.test(trimmed),
    hasComparisonKeywords: /\b(compare|difference|better|worse|vs|versus|pros|cons)\b/i.test(trimmed),
    hasProcessKeywords: /\b(step|process|how|guide|tutorial|walkthrough|follow)\b/i.test(trimmed),
  }
}

/**
 * Detect explicit format requests (user explicitly asked for a format)
 */
export function detectExplicitFormat(message: string): OutputFormat | undefined {
  const lower = message.toLowerCase()
  
  for (const format of Object.keys(FORMAT_PATTERNS) as OutputFormat[]) {
    const patterns = FORMAT_PATTERNS[format]
    if (patterns.some(p => p.test(message))) {
      return format
    }
  }
  
  return undefined
}

/**
 * Detect implicit format based on keywords
 */
export function detectImplicitFormat(
  message: string,
  characteristics: MessageCharacteristics,
): OutputFormat | undefined {
  let bestMatch: OutputFormat | undefined
  let bestScore = 0

  for (const [format, regex] of Object.entries(FORMAT_KEYWORDS) as [OutputFormat, RegExp][]) {
    const matches = (message.match(regex) ?? []).length
    const score = matches > 0 ? 1 + matches * 0.1 : 0
    
    if (score > bestScore) {
      bestScore = score
      bestMatch = format as OutputFormat
    }
  }

  // Boost scores based on message characteristics
  if (characteristics.hasCodeKeywords && bestMatch !== 'code') {
    bestMatch = 'code'
    bestScore = Math.max(bestScore, 0.8)
  }
  if (characteristics.hasDataKeywords && bestMatch !== 'table' && bestMatch !== 'json') {
    bestMatch = 'table'
    bestScore = Math.max(bestScore, 0.75)
  }
  if (characteristics.hasComparisonKeywords) {
    bestMatch = 'comparison'
    bestScore = Math.max(bestScore, 0.8)
  }

  return bestScore > 0.3 ? bestMatch : undefined
}

/**
 * Detect format based on conversation domain/topic context
 */
export function detectContextFormat(
  domain: string | undefined,
  characteristics: MessageCharacteristics,
): OutputFormat | undefined {
  if (!domain || domain === 'other') return undefined

  const affinities = DOMAIN_FORMAT_AFFINITY[domain]
  if (!affinities) return undefined

  // Pick the highest-affinity format for this domain
  let bestFormat: OutputFormat | undefined
  let bestScore = 0

  for (const [format, score] of Object.entries(affinities) as [OutputFormat, number][]) {
    if (score > bestScore) {
      bestScore = score
      bestFormat = format
    }
  }

  return bestScore > 0.5 ? bestFormat : undefined
}

/**
 * Infer domain from conversation history and message
 */
export function inferDomain(
  message: string,
  previousFormats: OutputFormat[],
): string | undefined {
  // Check for technical keywords
  if (/\b(code|api|database|function|algorithm|architecture|system|error|debug|deploy)\b/i.test(message)) {
    return 'technical'
  }

  // Check for business keywords
  if (/\b(budget|revenue|team|plan|strategy|meeting|project|timeline|goal|kpi|roi)\b/i.test(message)) {
    return 'business'
  }

  // Check for creative keywords
  if (/\b(story|character|plot|creative|design|art|music|narrative|scene)\b/i.test(message)) {
    return 'creative'
  }

  // Check for analytical keywords
  if (/\b(analyze|data|metric|trend|pattern|insight|statistic|research)\b/i.test(message)) {
    return 'analytical'
  }

  // Check for instructional keywords
  if (/\b(learn|teach|guide|tutorial|step|instruction|how to|process)\b/i.test(message)) {
    return 'instructional'
  }

  // Infer from previous formats
  const techFormats: OutputFormat[] = ['code', 'json', 'structured']
  const businessFormats: OutputFormat[] = ['bullet-points', 'table', 'comparison']
  
  const techCount = previousFormats.filter(f => techFormats.includes(f)).length
  const bizCount = previousFormats.filter(f => businessFormats.includes(f)).length

  if (techCount > bizCount && techCount > 2) return 'technical'
  if (bizCount > techCount && bizCount > 2) return 'business'

  return undefined
}

/**
 * Detect format based on user habits (most-used format)
 */
export function detectHabitFormat(context: UserContext): OutputFormat | undefined {
  if (context.previousFormats.length === 0) return undefined

  // Count format frequency
  const formatCounts = new Map<OutputFormat, number>()
  context.previousFormats.forEach(f => {
    formatCounts.set(f, (formatCounts.get(f) ?? 0) + 1)
  })

  // Get most common format
  let mostCommon: OutputFormat | undefined
  let maxCount = 0
  for (const [format, count] of formatCounts) {
    if (count > maxCount) {
      maxCount = count
      mostCommon = format
    }
  }

  // Only suggest habit format if it's been used frequently (at least 3 times)
  return maxCount >= 3 ? mostCommon : undefined
}

/**
 * Rank format suggestions by confidence
 */
export function rankSuggestions(
  signals: FormatDetectionSignals,
  characteristics: MessageCharacteristics,
  context: UserContext,
  config: FormatDetectionConfig = DEFAULT_CONFIG,
): FormatSuggestion[] {
  const scores = new Map<OutputFormat, { score: number; reasons: string[]; signalKeys: (keyof FormatDetectionSignals)[] }>()

  // Initialize all formats with zero score
  const allFormats: OutputFormat[] = [
    'bullet-points', 'narrative', 'code', 'json', 'table', 'checklist', 'timeline', 'comparison', 'structured', 'minimal',
  ]
  allFormats.forEach(f => scores.set(f, { score: 0, reasons: [], signalKeys: [] }))

  // Apply signals with weighted confidence
  const signalWeights: Record<keyof FormatDetectionSignals, number> = {
    explicitFormat: config.weights.explicit,
    implicitFormat: config.weights.implicit,
    contextFormat: config.weights.context,
    habitFormat: config.weights.habit,
    semanticFormat: config.weights.semantic,
    dataStructureFormat: 0.12,
    complexityFormat: 0.08,
  }

  for (const [key, format] of Object.entries(signals) as [keyof FormatDetectionSignals, OutputFormat | undefined][]) {
    if (!format) continue

    const weight = signalWeights[key] ?? 0.1
    const entry = scores.get(format)
    if (entry) {
      entry.score += weight
      entry.signalKeys.push(key)
      
      // Add reason
      const reasons: Record<keyof FormatDetectionSignals, string> = {
        explicitFormat: 'You explicitly asked for this format',
        implicitFormat: 'Keywords in your message suggest this format',
        contextFormat: 'This format matches your conversation topic',
        habitFormat: 'You frequently use this format',
        semanticFormat: 'This format fits the semantic intent of your message',
        dataStructureFormat: 'This format fits the data type you\'re asking about',
        complexityFormat: 'This format matches your message complexity',
      }
      entry.reasons.push(reasons[key])
    }
  }

  // Normalize scores and filter by confidence threshold
  const suggestions: FormatSuggestion[] = Array.from(scores.entries())
    .map(([format, { score, reasons, signalKeys }]) => ({
      format,
      confidence: Math.min(score, 1.0),
      reasons: [...new Set(reasons)],
      signalsMatched: signalKeys,
    }))
    .filter(s => s.confidence >= config.minConfidenceToSuggest)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, config.maxSuggestionsToShow)

  return suggestions.length >= config.minSuggestionsToShow
    ? suggestions
    : suggestions
}

/**
 * Detect format based on expected output data structure
 */
export function detectDataStructureFormat(
  characteristics: MessageCharacteristics,
): OutputFormat | undefined {
  if (characteristics.hasDataKeywords && characteristics.hasComparisonKeywords) {
    return 'table'
  }
  if (characteristics.hasCodeKeywords) {
    return 'code'
  }
  if (characteristics.hasDataKeywords) {
    return 'json'
  }
  return undefined
}

/**
 * Suggest format based on message and answer complexity
 */
export function detectComplexityFormat(characteristics: MessageCharacteristics): OutputFormat | undefined {
  // Long, complex questions benefit from structured formats
  if (characteristics.complexity === 'complex' && characteristics.length === 'long') {
    return 'structured'
  }
  // Simple questions → minimal answer
  if (characteristics.complexity === 'simple' && characteristics.length === 'short') {
    return 'minimal'
  }
  // Process-heavy → checklist
  if (characteristics.hasProcessKeywords) {
    return 'checklist'
  }
  return undefined
}

/**
 * Comprehensive format detection
 */
export function detectFormatSuggestions(
  message: string,
  context: UserContext,
  config: FormatDetectionConfig = DEFAULT_CONFIG,
): FormatDetectionResult {
  const characteristics = extractMessageCharacteristics(message)
  const domain = inferDomain(message, context.previousFormats)

  const signals: FormatDetectionSignals = {
    explicitFormat: config.enableExplicitDetection ? detectExplicitFormat(message) : undefined,
    implicitFormat: config.enableImplicitDetection ? detectImplicitFormat(message, characteristics) : undefined,
    contextFormat: config.enableContextDetection ? detectContextFormat(domain, characteristics) : undefined,
    habitFormat: config.enableHabitDetection ? detectHabitFormat(context) : undefined,
    semanticFormat: config.enableSemanticDetection ? undefined : undefined, // Can be enhanced with ML model
    dataStructureFormat: detectDataStructureFormat(characteristics),
    complexityFormat: detectComplexityFormat(characteristics),
  }

  const topSuggestions = rankSuggestions(signals, characteristics, context, config)
  
  const result: FormatDetectionResult = {
    topSuggestions,
    allSignals: signals,
    messageCharacteristics: characteristics,
    userContext: context,
    confidence: topSuggestions[0]?.confidence ?? 0,
    detectionTimestamp: new Date().toISOString(),
  }

  return result
}

/**
 * Export default instance with default config
 */
export const formatDetector = {
  detectFormatSuggestions,
  extractMessageCharacteristics,
  detectExplicitFormat,
  detectImplicitFormat,
  detectContextFormat,
  detectHabitFormat,
  inferDomain,
}
