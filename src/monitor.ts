/**
 * Token consumption monitor — logs token usage checkpoint on each API call.
 *
 * Tracks estimated input/output token counts per API request and writes
 * asynchronously to .meta/token-consumption.log for analysis and quota monitoring.
 *
 * Does NOT block response delivery — all logging is fire-and-forget.
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { countTokens } from '../lib/token-counter'

const META_DIR = join(process.cwd(), '.meta')
const TOKEN_LOG_PATH = join(META_DIR, 'token-consumption.log')

interface TokenConsumptionCheckpoint {
  timestamp: string
  conversation_id: string
  route: string
  method: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  status?: number
}

/**
 * Ensure .meta directory exists before writing
 * Uses lazy directory creation to avoid startup overhead
 */
async function ensureMetaDir(): Promise<void> {
  try {
    await mkdir(META_DIR, { recursive: true })
  } catch (err) {
    console.error('[monitor] Failed to create .meta dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log a token consumption checkpoint.
 * Runs asynchronously — does NOT block response delivery.
 *
 * @param conversationId - Unique conversation identifier
 * @param route - API route path
 * @param method - HTTP method (GET, POST, etc.)
 * @param inputText - Request input text (for token estimation)
 * @param outputText - Response output text (for token estimation)
 * @param status - Optional HTTP status code
 */
export async function logTokenConsumption(
  conversationId: string,
  route: string,
  method: string,
  inputText: string,
  outputText: string,
  status?: number,
): Promise<void> {
  try {
    const inputTokens = countTokens(inputText).count
    const outputTokens = countTokens(outputText).count
    const totalTokens = inputTokens + outputTokens

    const checkpoint: TokenConsumptionCheckpoint = {
      timestamp: new Date().toISOString(),
      conversation_id: conversationId,
      route,
      method,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      status,
    }

    await ensureMetaDir()

    const logLine = JSON.stringify(checkpoint)

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(TOKEN_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[monitor] Failed to write token log:', err instanceof Error ? err.message : String(err))
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error('[monitor] Error in logTokenConsumption:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log token consumption for a batch of strings.
 * Useful for requests with multiple message turns or documents.
 *
 * @param conversationId - Unique conversation identifier
 * @param route - API route path
 * @param method - HTTP method
 * @param inputTexts - Array of request input strings
 * @param outputTexts - Array of response output strings
 * @param status - Optional HTTP status code
 */
export async function logTokenConsumptionBatch(
  conversationId: string,
  route: string,
  method: string,
  inputTexts: string[],
  outputTexts: string[],
  status?: number,
): Promise<void> {
  try {
    const inputTokens = inputTexts.reduce((sum, text) => sum + countTokens(text).count, 0)
    const outputTokens = outputTexts.reduce((sum, text) => sum + countTokens(text).count, 0)
    const totalTokens = inputTokens + outputTokens

    const checkpoint: TokenConsumptionCheckpoint = {
      timestamp: new Date().toISOString(),
      conversation_id: conversationId,
      route,
      method,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      status,
    }

    await ensureMetaDir()

    const logLine = JSON.stringify(checkpoint)

    // Fire-and-forget: append to log without awaiting
    appendFile(TOKEN_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[monitor] Failed to write token log:', err instanceof Error ? err.message : String(err))
    })
  } catch (err) {
    console.error('[monitor] Error in logTokenConsumptionBatch:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Get current token consumption statistics from in-memory tracking.
 * Useful for monitoring quota and usage patterns.
 *
 * @returns Object with token consumption summary
 */
interface TokenStats {
  totalTokens: number
  totalRequests: number
  averageTokensPerRequest: number
  lastCheckpoint: TokenConsumptionCheckpoint | null
}

let lastCheckpoint: TokenConsumptionCheckpoint | null = null
let totalTokensLogged = 0
let totalRequestsLogged = 0

/**
 * Track token stats in memory (called internally after logging).
 * Reset on server restart.
 */
function updateStats(checkpoint: TokenConsumptionCheckpoint): void {
  lastCheckpoint = checkpoint
  totalTokensLogged += checkpoint.total_tokens
  totalRequestsLogged += 1
}

/**
 * Get current token consumption statistics.
 * @returns TokenStats object with summary metrics
 */
export function getTokenStats(): TokenStats {
  return {
    totalTokens: totalTokensLogged,
    totalRequests: totalRequestsLogged,
    averageTokensPerRequest: totalRequestsLogged > 0 ? Math.round(totalTokensLogged / totalRequestsLogged) : 0,
    lastCheckpoint,
  }
}

/**
 * Reset all token statistics to zero.
 * Useful for testing or periodic stat rotation.
 */
export function resetTokenStats(): void {
  totalTokensLogged = 0
  totalRequestsLogged = 0
  lastCheckpoint = null
}

/**
 * Log current token statistics to console (for debugging).
 */
export function logTokenStats(): void {
  const stats = getTokenStats()
  console.log('[monitor] Token Stats:', JSON.stringify(stats, null, 2))
}
