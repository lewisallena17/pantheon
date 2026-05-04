/**
 * Pronoun Detector — logs whether 'I' or 'me' appear in console.log outputs
 *
 * Wraps the native console.log to detect first-person pronouns ('I' or 'me')
 * in log messages. Tracks the next 5 console.log calls and logs pronoun
 * occurrences to stdout with a dedicated marker.
 *
 * Detects:
 * - 'I' as a standalone word (word boundaries)
 * - 'me' as a standalone word (word boundaries)
 * - Case-insensitive matching
 *
 * Usage:
 * ```ts
 * import { initPronounDetector } from '@/lib/pronoun-detector'
 *
 * // Initialize early in app startup (e.g., in layout.tsx or _app.tsx)
 * if (typeof window === 'undefined') {
 *   initPronounDetector()
 * }
 *
 * // Then use console.log normally — pronoun detection happens automatically
 * console.log("I think this is great") // Will be detected
 * console.log("Help me with this") // Will be detected
 * console.log("Print information") // Will NOT be detected (false positive prevention)
 * ```
 */

// ── Configuration ─────────────────────────────────────────────────────────

const CONFIG = {
  // Enable/disable pronoun detection
  ENABLE_DETECTION: process.env.DISABLE_PRONOUN_DETECTION !== 'true',

  // Number of console.log calls to track
  MAX_CALLS_TO_TRACK: 5,

  // Log to console with a marker prefix
  LOG_MARKER: '[PRONOUN-DETECTOR]',
}

// ── State Management ──────────────────────────────────────────────────────

/**
 * Track how many console.log calls we've intercepted
 */
let callCount = 0

/**
 * Track whether we've already patched console.log
 */
let isInitialized = false

// ── Pronoun Detection ─────────────────────────────────────────────────────

/**
 * Regex patterns for detecting first-person pronouns.
 * Uses word boundaries (\b) to avoid false positives like:
 * - "information" (contains 'I' but not as a word)
 * - "method" (contains 'me' but not as a word)
 * - "item" (contains 'me' but not as a word)
 */
const PRONOUN_PATTERNS = {
  // Standalone 'I' with word boundaries
  i: /\bI\b/,
  // Standalone 'me' with word boundaries
  me: /\bme\b/i,
}

/**
 * Detect if a message contains first-person pronouns.
 *
 * @param message Message text to analyze
 * @returns Object with detection results
 *
 * @example
 * ```ts
 * detectPronouns("I think so") // { hasI: true, hasMe: false, text: "I think so" }
 * detectPronouns("Help me") // { hasI: false, hasMe: true, text: "Help me" }
 * detectPronouns("Information") // { hasI: false, hasMe: false, text: "Information" }
 * ```
 */
export function detectPronouns(
  message: unknown,
): {
  hasI: boolean
  hasMe: boolean
  text: string
} {
  // Convert message to string
  let text = ''
  if (typeof message === 'string') {
    text = message
  } else if (typeof message === 'object') {
    try {
      text = JSON.stringify(message)
    } catch {
      text = String(message)
    }
  } else {
    text = String(message)
  }

  // Detect pronouns using word boundaries
  const hasI = PRONOUN_PATTERNS.i.test(text)
  const hasMe = PRONOUN_PATTERNS.me.test(text)

  return {
    hasI,
    hasMe,
    text,
  }
}

/**
 * Log pronoun detection result to console with marker.
 *
 * @private
 */
function logDetectionResult(
  callNumber: number,
  hasI: boolean,
  hasMe: boolean,
  text: string,
): void {
  const pronounsFound: string[] = []
  if (hasI) pronounsFound.push("'I'")
  if (hasMe) pronounsFound.push("'me'")

  const result = pronounsFound.length > 0 ? `Found: ${pronounsFound.join(', ')}` : 'No pronouns'

  console.error(
    `${CONFIG.LOG_MARKER} [${callNumber}/${CONFIG.MAX_CALLS_TO_TRACK}] ${result} | "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
  )
}

// ── Console Patching ──────────────────────────────────────────────────────

/**
 * Initialize pronoun detector by wrapping console.log.
 *
 * This function patches the native console.log method to intercept all calls.
 * When console.log is called, the message is analyzed for first-person pronouns.
 * Detection results are logged to stderr with a marker prefix.
 *
 * Stops tracking after MAX_CALLS_TO_TRACK calls (default: 5).
 *
 * Safe to call multiple times — only patches once.
 *
 * @example
 * ```ts
 * // In layout.tsx or app initialization
 * if (typeof window === 'undefined') {
 *   initPronounDetector()
 * }
 * ```
 */
export function initPronounDetector(): void {
  // Prevent double-patching
  if (isInitialized) {
    return
  }

  if (!CONFIG.ENABLE_DETECTION) {
    return
  }

  // Store original console.log
  const originalLog = console.log

  // Wrap console.log
  console.log = function (...args: unknown[]): void {
    // Call original console.log first
    originalLog.apply(console, args)

    // Stop tracking after MAX_CALLS_TO_TRACK
    if (callCount >= CONFIG.MAX_CALLS_TO_TRACK) {
      return
    }

    // Process each argument
    for (const arg of args) {
      callCount++

      if (callCount <= CONFIG.MAX_CALLS_TO_TRACK) {
        const { hasI, hasMe, text } = detectPronouns(arg)

        if (hasI || hasMe) {
          logDetectionResult(callCount, hasI, hasMe, text)
        }
      }
    }
  }

  isInitialized = true
}

/**
 * Get current call count.
 * Useful for testing or debugging.
 *
 * @returns Number of console.log calls tracked so far
 */
export function getCallCount(): number {
  return callCount
}

/**
 * Reset call count and re-initialize detector.
 * Useful for testing multiple sequences.
 *
 * @example
 * ```ts
 * resetPronounDetector()
 * console.log("New sequence")
 * ```
 */
export function resetPronounDetector(): void {
  callCount = 0
  isInitialized = false
  initPronounDetector()
}
