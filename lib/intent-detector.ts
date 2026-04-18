/**
 * Lightweight Intent Detector
 * 
 * Routes user queries to specialized response modes without heavy ML.
 * Uses keyword matching, regex patterns, and confidence scoring.
 * 
 * Response Modes:
 * - 'task_creation'     → Create/inject new tasks
 * - 'task_search'       → Find/filter existing tasks
 * - 'agent_control'     → Start/stop/restart agents
 * - 'navigation'        → Jump to dashboard sections
 * - 'analytics'         → Query metrics, cost, revenue
 * - 'clarification'     → Ambiguous query, needs more info
 */

export type ResponseMode =
  | 'task_creation'
  | 'task_search'
  | 'agent_control'
  | 'navigation'
  | 'analytics'
  | 'clarification'

export interface IntentResult {
  mode: ResponseMode
  confidence: number // 0-1: how confident we are in this classification
  entity?: string    // extracted entity (task name, agent name, metric, section, etc.)
  action?: string    // action to take (start, stop, create, find, etc.)
  keywords: string[] // matched keywords that informed the decision
}

/**
 * Keyword patterns for each intent type
 */
const INTENT_PATTERNS: Record<ResponseMode, { keywords: string[]; regex?: RegExp }> = {
  task_creation: {
    keywords: ['create', 'add', 'inject', 'new', 'make', 'open', 'start', 'schedule', 'assign', 'focus'],
    regex: /^(create|add|inject|new|make|open|focus|assign)[\s:]/i,
  },
  task_search: {
    keywords: ['find', 'search', 'show', 'list', 'get', 'filter', 'where', 'status', 'priority', 'which', 'what'],
    regex: /^(find|search|show|list|get|filter|where)[\s:]/i,
  },
  agent_control: {
    keywords: ['start', 'stop', 'restart', 'kill', 'pause', 'run', 'agent', 'god', 'pixel', 'ruflo', 'revenue'],
    regex: /(start|stop|restart|kill|pause|run|launch)\s+(agent|god|pixel|ruflo|revenue|all)/i,
  },
  navigation: {
    keywords: ['go', 'jump', 'nav', 'view', 'show', 'open', 'section', 'panel', 'inbox', 'controls', 'feed', 'todos', 'analytics', 'cost', 'revenue'],
    regex: /(jump|go|nav|view|open|show)\s+(to|view)?\s*(inbox|controls|feed|todos|analytics|cost|revenue|god|agent|active)/i,
  },
  analytics: {
    keywords: ['cost', 'revenue', 'stats', 'metrics', 'report', 'budget', 'spend', 'earnings', 'performance', 'average', 'total', 'chart'],
    regex: /(cost|revenue|stats|metrics|budget|spend|earnings|performance|total|average)/i,
  },
  clarification: {
    keywords: [],
  },
}

/**
 * Extract potential entity from query
 * - Task names: "Create Fix login page" → entity = "Fix login page"
 * - Agent names: "Stop god" → entity = "god"
 * - Sections: "Go to analytics" → entity = "analytics"
 */
function extractEntity(query: string, mode: ResponseMode): string | undefined {
  const cleaned = query.trim().toLowerCase()

  // Task creation: everything after the action verb
  if (mode === 'task_creation') {
    const match = cleaned.match(/^(create|add|inject|new|make|open|focus|assign)\s+[:\s]*(.+)$/i)
    if (match?.[2]) return match[2].trim()
  }

  // Agent control: agent name
  if (mode === 'agent_control') {
    const match = cleaned.match(/(god|pixel|ruflo|revenue|all)/i)
    if (match?.[1]) return match[1].toLowerCase()
  }

  // Navigation: section name
  if (mode === 'navigation') {
    const match = cleaned.match(/(inbox|controls|feed|todos|analytics|cost|revenue|god|agent|active)/i)
    if (match?.[1]) return match[1].toLowerCase()
  }

  // Analytics: metric name
  if (mode === 'analytics') {
    const match = cleaned.match(/(cost|revenue|budget|spend|earnings|performance)/i)
    if (match?.[1]) return match[1].toLowerCase()
  }

  return undefined
}

/**
 * Extract action verb from query
 * - "Create task" → "create"
 * - "Stop agent" → "stop"
 * - "Find todos" → "find"
 */
function extractAction(query: string): string | undefined {
  const verbs = ['create', 'add', 'inject', 'new', 'start', 'stop', 'restart', 'kill', 'pause',
                 'find', 'search', 'show', 'list', 'get', 'filter', 'jump', 'go', 'nav', 'view']
  const cleaned = query.trim().toLowerCase()

  for (const verb of verbs) {
    if (cleaned.startsWith(verb)) {
      return verb
    }
  }

  return undefined
}

/**
 * Calculate confidence based on:
 * 1. Regex match (high confidence)
 * 2. Keyword match count (medium confidence)
 * 3. Entity extraction success (boosts confidence)
 */
function calculateConfidence(
  query: string,
  mode: ResponseMode,
  regexMatched: boolean,
  keywordCount: number,
  entityExtracted: boolean,
): number {
  let score = 0

  if (regexMatched) {
    score += 0.7
  }

  if (keywordCount >= 2) {
    score += 0.15
  } else if (keywordCount === 1) {
    score += 0.08
  }

  if (entityExtracted) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}

/**
 * Main intent detection function
 * Returns the best matching intent with confidence score
 */
export function detectIntent(query: string): IntentResult {
  const trimmed = query.trim()
  if (!trimmed) {
    return {
      mode: 'clarification',
      confidence: 0,
      keywords: [],
    }
  }

  const results: IntentResult[] = []
  const lowerQuery = trimmed.toLowerCase()

  // Score each intent type
  for (const [mode, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (mode === 'clarification') continue // Handle at the end

    const regexMatched = pattern.regex?.test(trimmed) ?? false
    const matchedKeywords = pattern.keywords.filter(kw => lowerQuery.includes(kw))
    const keywordCount = matchedKeywords.length
    const entity = extractEntity(trimmed, mode as ResponseMode)
    const action = extractAction(trimmed)

    // Skip if no match at all
    if (!regexMatched && keywordCount === 0) continue

    const confidence = calculateConfidence(
      trimmed,
      mode as ResponseMode,
      regexMatched,
      keywordCount,
      !!entity,
    )

    results.push({
      mode: mode as ResponseMode,
      confidence,
      entity,
      action,
      keywords: matchedKeywords,
    })
  }

  // Return highest confidence result, or clarification if nothing matches
  if (results.length === 0) {
    return {
      mode: 'clarification',
      confidence: 0,
      keywords: [],
    }
  }

  results.sort((a, b) => b.confidence - a.confidence)
  const best = results[0]

  // If confidence is very low, ask for clarification
  if (best.confidence < 0.3) {
    return {
      mode: 'clarification',
      confidence: 0,
      keywords: best.keywords,
    }
  }

  return best
}

/**
 * Batch detect intents from multiple queries
 * Useful for analyzing user patterns or processing command history
 */
export function detectIntentsBatch(queries: string[]): IntentResult[] {
  return queries.map(q => detectIntent(q))
}

/**
 * Get a human-friendly description of the detected intent
 */
export function describeIntent(result: IntentResult): string {
  const base = `Intent: ${result.mode} (${Math.round(result.confidence * 100)}% confident)`
  const parts = [base]

  if (result.action) parts.push(`Action: ${result.action}`)
  if (result.entity) parts.push(`Entity: ${result.entity}`)
  if (result.keywords.length > 0) parts.push(`Keywords: ${result.keywords.join(', ')}`)

  return parts.join(' | ')
}
