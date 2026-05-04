// scripts/lib-limitation-logger.mjs
//
// Curiosity task: Log whether an agent mentions its own limitations within a response.
//
// Limitations are identified by these patterns:
//   · Explicit capability statements ("I can't", "I don't have", "unable to")
//   · Constraint acknowledgments ("limited by", "restricted to", "within bounds of")
//   · Scope boundary statements ("outside my scope", "beyond what I", "not my role")
//   · Accuracy caveats ("might miss", "could be wrong", "uncertain")
//   · Dependencies statements ("requires X", "depends on", "need access to")

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const LIMITATIONS_LOG_FILE = 'limitations-log.json'

// Patterns that signal limitation mentions
const LIMITATION_PATTERNS = [
  // Explicit capability denial
  /\b(can't|cannot|can not|unable|doesn't\s+support|don't\s+support|not\s+able|wouldn't\s+be\s+able)\b/i,
  
  // Lack/absence statements
  /\b(don't\s+have|doesn't\s+have|no\s+access|lack\s+of|missing|unavailable|not\s+available)\b/i,
  
  // Constraint/boundary statements
  /\b(limited\s+by|restricted|constraint|boundary|scope|within|bounds of)\b/i,
  
  // Uncertainty/accuracy caveats
  /\b(might\s+miss|could\s+be\s+wrong|uncertain|unsure|blindspot|accuracy\s+limit|not\s+guarantee|may\s+fail)\b/i,
  
  // Dependency statements
  /\b(requires|depends\s+on|need\s+access|relies\s+on|prerequisite)\b/i,
  
  // Risk acknowledgments
  /\b(risky|risk|dangerous|unsafe|not\s+safe|verify\s+first)\b/i,
  
  // Decomposition/task splitting (implies limitation in single task)
  /\b(too\s+large|split\s+into|decompose|subtask)\b/i,
]

export function limitationsLogPath(agentMemoryDir) {
  return join(agentMemoryDir, LIMITATIONS_LOG_FILE)
}

export function initLimitationsLog() {
  return {
    version: 1,
    entries: [],
    summary: {
      total_responses_logged: 0,
      responses_with_limitations: 0,
      responses_without_limitations: 0,
      total_limitation_mentions: 0,
    }
  }
}

export function loadLimitationsLog(agentMemoryDir) {
  const p = limitationsLogPath(agentMemoryDir)
  try {
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'))
  } catch {}
  return initLimitationsLog()
}

export function saveLimitationsLog(agentMemoryDir, state) {
  const p = limitationsLogPath(agentMemoryDir)
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true })
  try {
    writeFileSync(p, JSON.stringify(state, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to save limitations log:', e.message)
  }
}

/**
 * Scan response text for limitation mentions.
 * Returns array of detected limitation phrases.
 */
export function detectLimitations(responseText) {
  if (!responseText || typeof responseText !== 'string') return []
  
  const detected = new Set()
  const text = responseText.slice(0, 5000) // Sample first 5K chars
  
  for (const pattern of LIMITATION_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      // Extract 2-3 word phrase around the match for context
      const start = Math.max(0, match.index - 20)
      const end = Math.min(text.length, match.index + match[0].length + 20)
      const phrase = text.slice(start, end).trim()
      if (phrase.length > 5) detected.add(phrase)
    }
  }
  
  return Array.from(detected)
}

/**
 * Log a response and whether it mentions limitations.
 * Returns the updated log state.
 */
export function logResponseLimitations(agentMemoryDir, responseText, metadata = {}) {
  const state = loadLimitationsLog(agentMemoryDir)
  const limitations = detectLimitations(responseText)
  const hasMentioned = limitations.length > 0
  
  const entry = {
    timestamp: new Date().toISOString(),
    mentioned_limitations: hasMentioned,
    limitation_count: limitations.length,
    detected_phrases: limitations,
    response_length: responseText ? responseText.length : 0,
    metadata: metadata || {},
  }
  
  state.entries.push(entry)
  state.summary.total_responses_logged += 1
  
  if (hasMentioned) {
    state.summary.responses_with_limitations += 1
    state.summary.total_limitation_mentions += limitations.length
  } else {
    state.summary.responses_without_limitations += 1
  }
  
  // Keep only last 50 entries to avoid unbounded growth
  if (state.entries.length > 50) {
    state.entries = state.entries.slice(-50)
  }
  
  saveLimitationsLog(agentMemoryDir, state)
  return state
}

/**
 * Get a summary report of limitation mentions.
 */
export function getLimitationsSummary(agentMemoryDir) {
  const state = loadLimitationsLog(agentMemoryDir)
  const total = state.summary.total_responses_logged
  
  if (total === 0) {
    return 'No responses logged yet.'
  }
  
  const withLimitations = state.summary.responses_with_limitations
  const percentage = ((withLimitations / total) * 100).toFixed(1)
  
  return `
Limitations Mention Summary
===========================
Total responses logged: ${total}
Responses mentioning limitations: ${withLimitations} (${percentage}%)
Responses without limitation mentions: ${state.summary.responses_without_limitations}
Total limitation mentions detected: ${state.summary.total_limitation_mentions}

Recent entries:
${state.entries.slice(-5).map(e => 
  `  [${e.timestamp}] ${e.mentioned_limitations ? '✓' : '✗'} (${e.limitation_count} mentions, ${e.response_length} chars)`
).join('\n')}
  `.trim()
}
