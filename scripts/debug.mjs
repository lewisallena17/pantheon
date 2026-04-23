/**
 * debug.mjs — Debug Logging Utilities
 *
 * Provides logging functions for token budget and response metrics:
 * - Token budget tracking at response start
 * - Response word count logging at generation start
 *
 * Usage:
 * ```js
 * import { logTokenBudget, logResponseWordCount, countWords } from './debug.mjs'
 *
 * // Log token budget at response initialization
 * await logTokenBudget({
 *   requestId: 'req-12345',
 *   route: '/api/agents',
 *   totalBudget: 200000,
 *   remaining: 180000,
 *   consumed: 20000,
 *   modelName: 'claude-sonnet-4-6',
 * })
 *
 * // Log response word count at generation start
 * await logResponseWordCount({
 *   requestId: 'req-12345',
 *   route: '/api/agents',
 *   responseText: 'Generated response text...',
 * })
 *
 * // Count words in a response
 * const words = countWords('Your response text here')
 * ```
 */

import { mkdir, appendFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEBUG_DIR = join(process.cwd(), 'debug')
const TOKEN_BUDGET_LOG_PATH = join(DEBUG_DIR, 'token-budget.log')
const WORD_COUNT_LOG_PATH = join(DEBUG_DIR, 'word-count.log')

/**
 * Token budget log entry shape (for reference only — .mjs is plain JS, no interfaces):
 *   { timestamp, request_id, route?, total_budget?, tokens_remaining?,
 *     tokens_consumed?, consumption_rate?, model_name?, stop_reason?,
 *     input_tokens?, output_tokens?, metadata? }
 */

/**
 * Ensure debug directory exists
 */
async function ensureDebugDir() {
  try {
    await mkdir(DEBUG_DIR, { recursive: true })
  } catch (err) {
    console.error('[debug] Failed to create debug dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log remaining token budget at response start.
 * Runs asynchronously — does NOT block response delivery.
 *
 * @param data Token budget information
 */
export async function logTokenBudget(data) {
  try {
    // Ensure directory exists
    await ensureDebugDir()

    const logEntry = {
      timestamp: new Date().toISOString(),
      request_id: data.requestId,
      route: data.route,
      total_budget: data.totalBudget,
      tokens_remaining: data.remaining,
      tokens_consumed: data.consumed,
      consumption_rate: data.consumptionRate,
      model_name: data.modelName,
      stop_reason: data.stopReason,
      input_tokens: data.inputTokens,
      output_tokens: data.outputTokens,
      metadata: data.metadata,
    }

    const logLine = JSON.stringify(logEntry)

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(TOKEN_BUDGET_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[debug] Failed to write token budget log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[debug] Error in logTokenBudget:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Log token budget with pre-computed remaining percentage.
 * Convenience wrapper for common use case.
 *
 * @param requestId Unique request identifier
 * @param route API route path
 * @param consumed Tokens already consumed
 * @param total Total token budget
 * @param modelName LLM model name
 * @param metadata Additional context
 */
export async function logTokenBudgetPercentage(
  requestId,
  route,
  consumed,
  total,
  modelName,
  metadata
) {
  const remaining = total - consumed
  const percentage = ((remaining / total) * 100).toFixed(2)

  await logTokenBudget({
    requestId,
    route,
    consumed,
    remaining,
    totalBudget: total,
    modelName,
    metadata: {
      ...metadata,
      remaining_percentage: percentage,
    },
  })
}

/**
 * Word count log entry shape (for reference — .mjs is plain JS):
 *   { timestamp, request_id, route?, response_text, word_count,
 *     character_count, metadata? }
 */

/**
 * Count words in a response text.
 * Uses simple whitespace splitting for speed.
 *
 * @param text Response text to count
 * @returns Number of words
 */
export function countWords(text) {
  if (!text || typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Log response word count at generation start.
 * Runs asynchronously — does NOT block response delivery.
 *
 * @param data Word count log information
 */
export async function logResponseWordCount(data) {
  try {
    // Ensure directory exists
    await ensureDebugDir()

    const wordCount = countWords(data.responseText)
    const charCount = (data.responseText || '').length

    const logEntry = {
      timestamp: new Date().toISOString(),
      request_id: data.requestId,
      route: data.route,
      response_text: data.responseText,
      word_count: wordCount,
      character_count: charCount,
      metadata: data.metadata,
    }

    const logLine = JSON.stringify(logEntry)

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(WORD_COUNT_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[debug] Failed to write word count log:', err.message)
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error(
      '[debug] Error in logResponseWordCount:',
      err instanceof Error ? err.message : String(err)
    )
  }
}

/**
 * Calculate token consumption rate (tokens per second).
 *
 * @param tokensConsumed Total tokens used
 * @param elapsedSeconds Time elapsed in seconds
 * @returns Tokens per second
 */
export function calculateConsumptionRate(tokensConsumed, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0
  return Math.round((tokensConsumed / elapsedSeconds) * 100) / 100
}

/**
 * Check if token budget is critically low.
 * Returns true if remaining tokens < 10% of budget.
 *
 * @param remaining Tokens remaining
 * @param total Total budget
 * @returns True if budget is critical
 */
export function isCriticalTokenBudget(remaining, total) {
  return remaining < total * 0.1
}

/**
 * Format token budget as human-readable string.
 *
 * @param remaining Tokens remaining
 * @param total Total budget
 * @returns Formatted string (e.g., "150K / 200K (75%)")
 */
export function formatTokenBudget(remaining, total) {
  const remainingK = (remaining / 1000).toFixed(0)
  const totalK = (total / 1000).toFixed(0)
  const percentage = ((remaining / total) * 100).toFixed(0)
  return `${remainingK}K / ${totalK}K (${percentage}%)`
}
