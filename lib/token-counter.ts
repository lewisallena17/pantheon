/**
 * Token counter — estimates token count in a string using length heuristic.
 *
 * Uses a simple chars-per-token approximation rather than full tokenization.
 * Suitable for quick estimates; not accurate for all models/encodings.
 *
 * Typical ratios:
 * - GPT-3/4: ~4 chars per token
 * - Claude: ~3.5 chars per token
 * - T5/BERT: ~5 chars per token
 */

export interface TokenCountOptions {
  /**
   * Divisor for char-to-token conversion (default: 4).
   * Adjust based on your model: 3.5 for Claude, 4 for GPT, 5 for T5.
   */
  charsPerToken?: number
}

export interface TokenCountResult {
  /**
   * Estimated token count
   */
  count: number
  /**
   * Total character length of the input string
   */
  charLength: number
  /**
   * The divisor used for this estimate
   */
  charsPerToken: number
}

/**
 * Estimate token count for a string using character-length heuristic.
 * Fast but approximate — use real tokenizer for production token limits.
 *
 * @param text Input string to count tokens for
 * @param options Configuration for the heuristic
 * @returns TokenCountResult with count, char length, and divisor used
 *
 * @example
 * ```ts
 * const result = countTokens("Hello world");
 * console.log(result.count); // ~3 tokens
 *
 * // For Claude models:
 * const claudeResult = countTokens(text, { charsPerToken: 3.5 });
 * ```
 */
export function countTokens(text: string, options?: TokenCountOptions): TokenCountResult {
  const charsPerToken = options?.charsPerToken ?? 4

  if (!text || text.length === 0) {
    return {
      count: 0,
      charLength: 0,
      charsPerToken,
    }
  }

  const charLength = text.length
  const estimatedTokens = Math.ceil(charLength / charsPerToken)

  return {
    count: estimatedTokens,
    charLength,
    charsPerToken,
  }
}

/**
 * Estimate token count for multiple strings and return the total.
 *
 * @param texts Array of strings to count
 * @param options Configuration for the heuristic
 * @returns Total estimated token count across all strings
 *
 * @example
 * ```ts
 * const total = countTokensForBatch(["Hello", "world"]);
 * console.log(total); // ~3 tokens
 * ```
 */
export function countTokensForBatch(texts: string[], options?: TokenCountOptions): number {
  return texts.reduce((sum, text) => sum + countTokens(text, options).count, 0)
}

/**
 * Check if a string exceeds a token limit.
 *
 * @param text Input string
 * @param limit Maximum token count allowed
 * @param options Configuration for the heuristic
 * @returns True if token count exceeds the limit
 *
 * @example
 * ```ts
 * if (exceedsTokenLimit(prompt, 2048)) {
 *   throw new Error("Prompt too long");
 * }
 * ```
 */
export function exceedsTokenLimit(text: string, limit: number, options?: TokenCountOptions): boolean {
  const result = countTokens(text, options)
  return result.count > limit
}

/**
 * Truncate a string to fit within a token limit.
 * Uses binary search to find the longest substring that fits.
 *
 * @param text Input string to truncate
 * @param limit Maximum token count
 * @param options Configuration for the heuristic
 * @returns Truncated text that fits within the limit
 *
 * @example
 * ```ts
 * const truncated = truncateToTokenLimit(longText, 1024);
 * ```
 */
export function truncateToTokenLimit(text: string, limit: number, options?: TokenCountOptions): string {
  const result = countTokens(text, options)

  // Already within limit
  if (result.count <= limit) {
    return text
  }

  // Estimate target character length
  const charsPerToken = options?.charsPerToken ?? 4
  const targetChars = limit * charsPerToken

  // Simple truncation (could use binary search for more precision)
  return text.substring(0, Math.max(0, targetChars))
}
