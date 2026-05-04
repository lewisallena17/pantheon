/**
 * Tone Marker Logger — logs response tone markers to responses/audit.log
 * 
 * Tracks the "tone" of API responses across consecutive exchanges and logs them
 * with exchange count and timestamp. Tone markers help analyze conversational
 * patterns and response characteristics.
 * 
 * Supported tone markers:
 * - formal: professional, structured, technical language
 * - casual: conversational, relaxed tone
 * - curious: investigative, questioning, exploratory
 * - concise: brief, direct, minimal verbosity
 * - verbose: detailed, explanatory, comprehensive
 * - technical: code-focused, system-oriented
 * - friendly: warm, encouraging, supportive
 * - warning: cautionary, alert-focused
 * 
 * Usage:
 * ```ts
 * import { logToneMarker, getToneMarker } from '@/lib/tone-marker-logger'
 * 
 * // Manually specify tone
 * await logToneMarker('/api/todos', 'formal')
 * 
 * // Auto-detect tone from response body
 * const tone = getToneMarker(responseBody)
 * await logToneMarker('/api/todos', tone)
 * ```
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// ── Configuration ─────────────────────────────────────────────────────────

const CONFIG = {
  // Enable/disable tone marker logging
  ENABLE_LOGGING: process.env.LOG_TONE_MARKERS !== 'false',
  
  // Log to console (in addition to file)
  LOG_TO_CONSOLE: process.env.LOG_TONE_MARKERS_CONSOLE === 'true',
  
  // Directory and file paths
  LOG_DIR: join(process.cwd(), 'responses'),
  LOG_FILE: 'audit.log',
  
  // Track up to this many consecutive exchanges
  MAX_EXCHANGES: 5,
}

// ── Type Definitions ──────────────────────────────────────────────────────

/**
 * Supported tone markers
 */
export type ToneMarker =
  | 'formal'
  | 'casual'
  | 'curious'
  | 'concise'
  | 'verbose'
  | 'technical'
  | 'friendly'
  | 'warning'
  | 'unknown'

/**
 * Tone marker log entry
 */
interface ToneMarkerEntry {
  at: string
  event: string
  route: string
  tone: ToneMarker
  exchange_count: number
  exchange_sequence?: ToneMarker[]
}

// ── State Management ──────────────────────────────────────────────────────

/**
 * Track tone markers for the current exchange sequence
 */
let exchangeSequence: ToneMarker[] = []

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
export function getExchangeSequence(): ToneMarker[] {
  return [...exchangeSequence]
}

// ── Tone Detection ────────────────────────────────────────────────────────

/**
 * Keywords and patterns for automatic tone detection
 */
const TONE_PATTERNS = {
  formal: {
    keywords: ['furthermore', 'therefore', 'moreover', 'consequently', 'according', 'hereby', 'thereof', 'herein'],
    patterns: [/professional|formal|official|accordance|regarding/i],
  },
  casual: {
    keywords: ["yeah", "cool", "awesome", "hey", "btw", "gonna", "wanna", "kinda", "sorta"],
    patterns: [/\b(really|very|just|actually|honestly)\b/i],
  },
  curious: {
    keywords: ['question', 'wonder', 'explore', 'investigate', 'examine', 'what if', 'how about'],
    patterns: [/\?{2,}|\b(curious|interesting|investigating)\b/i],
  },
  concise: {
    keywords: ['done', 'ok', 'yes', 'no', 'brief', 'quick'],
    patterns: [/^.{0,100}$/m],
  },
  verbose: {
    keywords: ['comprehensive', 'detailed', 'elaborate', 'extensive', 'thoroughly'],
    patterns: [/^.{500,}$/m],
  },
  technical: {
    keywords: ['api', 'database', 'schema', 'query', 'function', 'method', 'algorithm', 'protocol', 'module', 'type'],
    patterns: [/\b(async|await|function|const|let|var|return|import|export)\b/i, /[{}(){}\[\];:]/],
  },
  friendly: {
    keywords: ['thank', 'appreciate', 'sorry', 'love', 'happy', 'pleasure', 'cheers', 'welcome'],
    patterns: [/\b(friend|buddy|pal|great|wonderful|amazing)\b/i, /[😊😃👍❤️]/],
  },
  warning: {
    keywords: ['warning', 'error', 'critical', 'urgent', 'danger', 'caution', 'alert', 'emergency'],
    patterns: [/⚠️|🚨|alert|error|failed|cannot|unable/i],
  },
}

/**
 * Detect tone from response body text.
 * Scans for keywords and patterns matching known tone categories.
 * Returns the tone with the highest match score.
 * 
 * @param text Response body text to analyze
 * @returns Detected tone marker, or 'unknown' if no matches found
 */
export function getToneMarker(text: unknown): ToneMarker {
  if (!text) return 'unknown'

  // Convert to string
  let content: string
  if (typeof text === 'string') {
    content = text
  } else if (typeof text === 'object') {
    try {
      content = JSON.stringify(text)
    } catch {
      return 'unknown'
    }
  } else {
    return 'unknown'
  }

  // Skip very short responses
  if (content.length < 10) return 'unknown'

  const lowerContent = content.toLowerCase()
  const scores: Map<ToneMarker, number> = new Map()

  // Score each tone category
  for (const [tone, patterns] of Object.entries(TONE_PATTERNS)) {
    let score = 0

    // Keyword matches (1 point each)
    for (const keyword of (patterns as any).keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = content.match(regex) || []
      score += matches.length
    }

    // Pattern matches (5 points each)
    for (const pattern of (patterns as any).patterns) {
      if (pattern.test(content)) {
        score += 5
      }
    }

    if (score > 0) {
      scores.set(tone as ToneMarker, score)
    }
  }

  // Return tone with highest score
  if (scores.size === 0) return 'unknown'

  let highestTone: ToneMarker = 'unknown'
  let highestScore = 0

  for (const [tone, score] of scores) {
    if (score > highestScore) {
      highestScore = score
      highestTone = tone
    }
  }

  return highestTone
}

// ── File Operations ──────────────────────────────────────────────────────

/**
 * Ensure audit log directory exists
 * 
 * @private
 */
async function ensureLogDir(): Promise<void> {
  try {
    await mkdir(CONFIG.LOG_DIR, { recursive: true })
  } catch (err) {
    console.error('[tone-marker-logger] Failed to create log directory:', (err as Error).message)
  }
}

/**
 * Write tone marker to audit log file
 * 
 * @private
 */
async function logToFile(entry: ToneMarkerEntry): Promise<void> {
  try {
    await ensureLogDir()

    const logPath = join(CONFIG.LOG_DIR, CONFIG.LOG_FILE)
    const line = JSON.stringify(entry) + '\n'

    await appendFile(logPath, line)
  } catch (err) {
    console.error('[tone-marker-logger] Failed to write audit log:', (err as Error).message)
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Log a tone marker for the current API response.
 * Tracks tone across up to 5 consecutive exchanges.
 * Fire-and-forget: logs asynchronously without blocking response delivery.
 * 
 * @param route API route identifier
 * @param tone Tone marker to log (auto-detected if not provided)
 * @param responseBody Optional response body for auto-detection if tone is unknown
 */
export async function logToneMarker(
  route: string,
  tone: ToneMarker | unknown = 'unknown',
  responseBody?: unknown
): Promise<void> {
  if (!CONFIG.ENABLE_LOGGING) return

  // Detect tone from response body if needed
  let detectedTone: ToneMarker = 'unknown'
  if (typeof tone === 'string' && ['formal', 'casual', 'curious', 'concise', 'verbose', 'technical', 'friendly', 'warning'].includes(tone)) {
    detectedTone = tone as ToneMarker
  } else if (responseBody) {
    detectedTone = getToneMarker(responseBody)
  } else if (typeof tone === 'object' || typeof tone === 'string') {
    detectedTone = getToneMarker(tone)
  }

  // Update exchange sequence
  resetSequenceIfNeeded()
  exchangeSequence.push(detectedTone)
  const exchangeCount = exchangeSequence.length

  // Build log entry
  const entry: ToneMarkerEntry = {
    at: new Date().toISOString(),
    event: 'tone_marker',
    route,
    tone: detectedTone,
    exchange_count: exchangeCount,
  }

  // Include sequence if at or near max exchanges
  if (exchangeCount >= 3) {
    entry.exchange_sequence = [...exchangeSequence]
  }

  // Console logging if enabled
  if (CONFIG.LOG_TO_CONSOLE) {
    console.log('[tone-marker]', JSON.stringify(entry))
  }

  // Fire-and-forget file logging
  logToFile(entry).catch((err) => {
    console.error('[tone-marker-logger] Error logging to file:', (err as Error).message)
  })
}

/**
 * Clear the exchange sequence (e.g., when starting a new conversation)
 */
export function clearExchangeSequence(): void {
  exchangeSequence = []
}

/**
 * Get a summary of the current exchange session
 */
export function getExchangeSummary(): {
  totalExchanges: number
  sequence: ToneMarker[]
  toneCounts: Record<ToneMarker, number>
} {
  const toneCounts: Record<string, number> = {}

  for (const tone of exchangeSequence) {
    toneCounts[tone] = (toneCounts[tone] || 0) + 1
  }

  return {
    totalExchanges: exchangeSequence.length,
    sequence: [...exchangeSequence],
    toneCounts: toneCounts as Record<ToneMarker, number>,
  }
}

/**
 * Check if logging is enabled
 */
export function isToneMarkerLoggingEnabled(): boolean {
  return CONFIG.ENABLE_LOGGING
}
