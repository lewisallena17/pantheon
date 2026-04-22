/**
 * Truncate signal — logs when response hits 80% token limit.
 *
 * Provides a simple utility to detect when token usage crosses the 80% threshold,
 * signaling that the response is approaching its limit and may need truncation.
 *
 * Does NOT block response delivery — logging is fire-and-forget.
 */

interface TruncateSignalConfig {
  /**
   * Threshold ratio at which to trigger the signal (0.0 - 1.0).
   * Default: 0.8 (80%)
   */
  threshold?: number
  /**
   * Prefix for log messages (default: '[truncate-signal]')
   */
  logPrefix?: string
  /**
   * Whether to log to console (default: true)
   */
  verbose?: boolean
}

interface TruncateCheckResult {
  /**
   * Current usage ratio (currentTokens / maxTokens)
   */
  ratio: number
  /**
   * Whether the threshold was crossed
   */
  thresholdCrossed: boolean
  /**
   * Remaining tokens available before limit
   */
  remainingTokens: number
  /**
   * Current token count
   */
  currentTokens: number
  /**
   * Maximum token limit
   */
  maxTokens: number
}

/**
 * Check if token usage has crossed the warning threshold.
 * Logs a warning message when the threshold is exceeded.
 *
 * @param currentTokens Current token count (e.g., from countTokens)
 * @param maxTokens Maximum token limit for the response
 * @param config Configuration options for threshold and logging
 * @returns Result object with ratio, threshold status, and remaining tokens
 *
 * @example
 * ```ts
 * import { checkTruncateSignal } from '@/lib/truncate-signal'
 * import { countTokens } from '@/lib/token-counter'
 *
 * const usage = countTokens(responseText)
 * const result = checkTruncateSignal(usage.count, 2048)
 *
 * if (result.thresholdCrossed) {
 *   console.warn(`Response approaching limit: ${result.remainingTokens} tokens left`)
 * }
 * ```
 */
export function checkTruncateSignal(
  currentTokens: number,
  maxTokens: number,
  config?: TruncateSignalConfig
): TruncateCheckResult {
  const threshold = config?.threshold ?? 0.8
  const logPrefix = config?.logPrefix ?? '[truncate-signal]'
  const verbose = config?.verbose !== false

  const ratio = maxTokens > 0 ? currentTokens / maxTokens : 0
  const thresholdCrossed = ratio >= threshold
  const remainingTokens = Math.max(0, maxTokens - currentTokens)

  if (thresholdCrossed && verbose) {
    const usagePercent = Math.round(ratio * 100)
    const message = `${logPrefix} ⚠️  Token limit warning: ${usagePercent}% usage (${currentTokens}/${maxTokens} tokens). ${remainingTokens} tokens remaining.`

    // Fire-and-forget: log without blocking
    console.warn(message)
  }

  return {
    ratio,
    thresholdCrossed,
    remainingTokens,
    currentTokens,
    maxTokens,
  }
}

/**
 * Convenience function to check if we should truncate based on token usage.
 * Returns true if the threshold has been crossed.
 *
 * @param currentTokens Current token count
 * @param maxTokens Maximum token limit
 * @param threshold Warning threshold (0.0-1.0). Default: 0.8
 * @returns True if usage >= threshold
 *
 * @example
 * ```ts
 * if (shouldTruncate(currentUsage, maxLimit)) {
 *   // Start truncating or limiting further output
 *   response = truncateToTokenLimit(response, maxLimit)
 * }
 * ```
 */
export function shouldTruncate(currentTokens: number, maxTokens: number, threshold: number = 0.8): boolean {
  return maxTokens > 0 && currentTokens / maxTokens >= threshold
}

/**
 * Get a human-readable message for token usage status.
 * Useful for debugging or logging response context.
 *
 * @param currentTokens Current token count
 * @param maxTokens Maximum token limit
 * @returns Formatted status string (e.g., "45% (512/1024 tokens)")
 *
 * @example
 * ```ts
 * console.log(`Token usage: ${getTokenStatusMessage(512, 1024)}`)
 * // Output: Token usage: 50% (512/1024 tokens)
 * ```
 */
export function getTokenStatusMessage(currentTokens: number, maxTokens: number): string {
  if (maxTokens <= 0) return '0% (0/0 tokens)'

  const ratio = currentTokens / maxTokens
  const percent = Math.round(ratio * 100)

  return `${percent}% (${currentTokens}/${maxTokens} tokens)`
}
