/**
 * Response Analysis — logs emotional valence markers to responses/valence.log
 *
 * Analyzes response text for emotional valence (sentiment polarity: negative/neutral/positive)
 * and logs structured markers with timing data. Valence analysis helps track the emotional
 * tone and user sentiment in API responses without storing raw content.
 *
 * Supported valence markers:
 * - negative: critical errors, warnings, disappointment, frustration, concern
 * - neutral: factual, informative, objective statements
 * - positive: success, confirmation, encouragement, satisfaction, appreciation
 *
 * Usage:
 * ```ts
 * import { logValenceMarker, getValenceMarker } from '@/lib/response-analysis'
 *
 * // Manually specify valence
 * await logValenceMarker('/api/todos', 'positive')
 *
 * // Auto-detect valence from response body
 * const valence = getValenceMarker(responseBody)
 * await logValenceMarker('/api/todos', valence)
 * ```
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// ── Configuration ─────────────────────────────────────────────────────────

const CONFIG = {
  // Enable/disable valence marker logging
  ENABLE_LOGGING: process.env.LOG_VALENCE_MARKERS !== 'false',

  // Log to console (in addition to file)
  LOG_TO_CONSOLE: process.env.LOG_VALENCE_MARKERS_CONSOLE === 'true',

  // Directory and file paths
  LOG_DIR: join(process.cwd(), 'responses'),
  LOG_FILE: 'valence.log',

  // Track up to this many consecutive exchanges
  MAX_EXCHANGES: 5,
}

// ── Type Definitions ──────────────────────────────────────────────────────

/**
 * Emotional valence marker representing sentiment polarity
 */
export type ValenceMarker = 'negative' | 'neutral' | 'positive' | 'unknown'

/**
 * Valence marker log entry
 */
interface ValenceMarkerEntry {
  at: string
  event: string
  route: string
  valence: ValenceMarker
  exchange_count: number
  exchange_sequence?: ValenceMarker[]
  confidence?: number
}

// ── State Management ──────────────────────────────────────────────────────

/**
 * Track valence markers for the current exchange sequence
 */
let exchangeSequence: ValenceMarker[] = []

/**
 * Reset exchange sequence when it reaches max
 */
function resetSequenceIfNeeded(): void {
  if (exchangeSequence.length >= CONFIG.MAX_EXCHANGES) {
    exchangeSequence = []
  }
}

/**
 * Get current exchange count
 */
export function getExchangeCount(): number {
  return exchangeSequence.length
}

/**
 * Get current exchange sequence
 */
export function getExchangeSequence(): ValenceMarker[] {
  return [...exchangeSequence]
}

// ── Valence Detection ─────────────────────────────────────────────────────

/**
 * Keywords and patterns for emotional valence detection.
 * Organized by valence category with keywords and regex patterns.
 */
const VALENCE_PATTERNS = {
  negative: {
    keywords: [
      'error',
      'failed',
      'failure',
      'cannot',
      'unable',
      'denied',
      'reject',
      'warning',
      'critical',
      'danger',
      'dangerous',
      'problem',
      'issue',
      'broken',
      'crash',
      'fail',
      'fatal',
      'disaster',
      'catastrophic',
      'sorry',
      'apologize',
      'unfortunately',
      'regret',
      'frustrat',
      'disappoint',
      'concern',
      'worried',
      'afraid',
      'panic',
    ],
    patterns: [
      /\b(error|failed|failure|cannot|unable|denied|warning|critical|danger|problem|issue|broken|crash)\b/i,
      /⚠️|🚨|❌|😞|😡|😤|😠/,
      /\b(no|not|never|neither|nobody|nothing|nowhere)\b/i,
    ],
  },
  positive: {
    keywords: [
      'success',
      'successful',
      'successfully',
      'perfect',
      'great',
      'awesome',
      'wonderful',
      'excellent',
      'amazing',
      'fantastic',
      'happy',
      'joy',
      'pleased',
      'satisfied',
      'delighted',
      'congratulations',
      'thank',
      'appreciate',
      'love',
      'like',
      'enjoy',
      'glad',
      'cheerful',
      'optimistic',
      'positive',
      'winning',
      'victory',
      'triumph',
      'approved',
      'confirmed',
      'verified',
      'completed',
      'finished',
      'ready',
    ],
    patterns: [
      /\b(success|successful|perfect|great|awesome|wonderful|excellent|amazing|fantastic|happy|pleased|thank|appreciate)\b/i,
      /✓|✅|👍|😊|😃|😍|🎉|🏆|⭐|💯/,
      /\b(yes|sure|absolutely|definitely|certainly|indeed)\b/i,
    ],
  },
  neutral: {
    keywords: [
      'information',
      'data',
      'record',
      'report',
      'note',
      'details',
      'description',
      'summary',
      'statistics',
      'analysis',
      'findings',
      'results',
      'status',
      'update',
      'notification',
      'pending',
      'processing',
      'queued',
      'scheduled',
      'confirmed',
    ],
    patterns: [
      /\b(information|data|record|report|note|status|update|result|analysis|finding|summary|statistics|notification)\b/i,
      /\b(is|are|was|were|being|have|has|had)\b/i,
    ],
  },
}

/**
 * Detect emotional valence (sentiment) from response text.
 * Scans for keywords and patterns matching negative, positive, and neutral sentiment.
 * Returns the valence with the highest match score.
 *
 * @param text Response body text to analyze
 * @returns Detected valence marker and confidence score (0-1)
 */
export function getValenceMarker(text: unknown): { valence: ValenceMarker; confidence: number } {
  if (!text) {
    return { valence: 'unknown', confidence: 0 }
  }

  // Convert to string
  let content: string
  if (typeof text === 'string') {
    content = text
  } else if (typeof text === 'object') {
    try {
      content = JSON.stringify(text)
    } catch {
      return { valence: 'unknown', confidence: 0 }
    }
  } else {
    return { valence: 'unknown', confidence: 0 }
  }

  // Skip very short responses
  if (content.length < 10) {
    return { valence: 'neutral', confidence: 0.3 }
  }

  const scores: Map<ValenceMarker, number> = new Map()

  // Score each valence category
  for (const [valence, patterns] of Object.entries(VALENCE_PATTERNS)) {
    let score = 0

    // Keyword matches (1 point each)
    for (const keyword of (patterns as any).keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = content.match(regex) || []
      score += matches.length
    }

    // Pattern matches (2 points each)
    for (const pattern of (patterns as any).patterns) {
      if (pattern.test(content)) {
        score += 2
      }
    }

    if (score > 0) {
      scores.set(valence as ValenceMarker, score)
    }
  }

  // Return valence with highest score
  if (scores.size === 0) {
    return { valence: 'neutral', confidence: 0.5 }
  }

  let highestValence: ValenceMarker = 'neutral'
  let highestScore = 0
  let totalScore = 0

  for (const [valence, score] of scores) {
    totalScore += score
    if (score > highestScore) {
      highestScore = score
      highestValence = valence as ValenceMarker
    }
  }

  // Calculate confidence as ratio of highest score to total
  const confidence = totalScore > 0 ? highestScore / totalScore : 0

  return {
    valence: highestValence,
    confidence: Math.min(1, confidence),
  }
}

// ── File Operations ──────────────────────────────────────────────────────

/**
 * Ensure valence log directory exists
 *
 * @private
 */
async function ensureLogDir(): Promise<void> {
  try {
    await mkdir(CONFIG.LOG_DIR, { recursive: true })
  } catch (err) {
    console.error('[response-analysis] Failed to create log directory:', (err as Error).message)
  }
}

/**
 * Write valence marker to log file
 *
 * @private
 */
async function logToFile(entry: ValenceMarkerEntry): Promise<void> {
  try {
    await ensureLogDir()

    const logPath = join(CONFIG.LOG_DIR, CONFIG.LOG_FILE)
    const line = JSON.stringify(entry) + '\n'

    await appendFile(logPath, line, 'utf-8')
  } catch (err) {
    console.error('[response-analysis] Failed to write valence marker:', (err as Error).message)
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Log an emotional valence marker for a response.
 *
 * @param route API route that generated the response (e.g. '/api/todos')
 * @param valence Emotional valence marker
 * @param responseBody Optional response body for auto-detection (overrides valence param if provided)
 *
 * @example
 * // Manual valence
 * await logValenceMarker('/api/todos', 'positive')
 *
 * // Auto-detect from response body
 * const { valence, confidence } = getValenceMarker(responseBody)
 * await logValenceMarker('/api/todos', valence)
 */
export async function logValenceMarker(
  route: string,
  valence: ValenceMarker | { valence: ValenceMarker; confidence: number },
  responseBody?: unknown,
): Promise<void> {
  if (!CONFIG.ENABLE_LOGGING) {
    return
  }

  // Handle object with valence + confidence
  let resolvedValence: ValenceMarker
  let confidence: number | undefined

  if (typeof valence === 'object' && 'valence' in valence) {
    resolvedValence = valence.valence
    confidence = valence.confidence
  } else {
    resolvedValence = valence
  }

  // Auto-detect if response body provided
  if (responseBody && resolvedValence === 'unknown') {
    const detected = getValenceMarker(responseBody)
    resolvedValence = detected.valence
    confidence = detected.confidence
  }

  // Update exchange sequence
  exchangeSequence.push(resolvedValence)
  resetSequenceIfNeeded()

  // Build log entry
  const entry: ValenceMarkerEntry = {
    at: new Date().toISOString(),
    event: 'valence_marker',
    route,
    valence: resolvedValence,
    exchange_count: exchangeSequence.length,
    exchange_sequence: exchangeSequence.length > 1 ? [...exchangeSequence] : undefined,
    confidence: confidence !== undefined ? Number(confidence.toFixed(3)) : undefined,
  }

  // Write to file
  await logToFile(entry)

  // Log to console if enabled
  if (CONFIG.LOG_TO_CONSOLE) {
    const color = resolvedValence === 'negative' ? '🔴' : resolvedValence === 'positive' ? '🟢' : '⚪'
    console.log(
      `[${color} valence] ${route} → ${resolvedValence}${confidence ? ` (${(confidence * 100).toFixed(0)}%)` : ''}`,
    )
  }
}

/**
 * Clear the exchange sequence (typically called on session end)
 */
export function clearExchangeSequence(): void {
  exchangeSequence = []
}

/**
 * Get the current logging configuration
 */
export function getConfig() {
  return { ...CONFIG }
}
