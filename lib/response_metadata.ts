/**
 * Response metadata — captures token counts and other metadata for responses.
 *
 * Provides utilities to enrich ResponseEnvelope objects with token-count footers
 * for tracking token consumption across API responses.
 *
 * Usage:
 * ```ts
 * const envelope = createResponseEnvelope(data, '/api/todos', 'GET')
 * addTokenCountFooter(envelope, responseText)
 * return NextResponse.json(envelope)
 * ```
 */

import { countTokens } from './token-counter'
import type { ResponseEnvelope } from './response'

export interface ResponseMetadata {
  /**
   * Token count information for the response
   */
  token_count?: TokenCountFooter
  /**
   * Other arbitrary metadata fields
   */
  [key: string]: unknown
}

export interface TokenCountFooter {
  /**
   * Estimated number of tokens in the response data
   */
  response_tokens: number

  /**
   * Estimated number of tokens in the request (if provided)
   */
  request_tokens?: number

  /**
   * Total estimated tokens (request + response)
   */
  total_tokens?: number

  /**
   * Character count of the response
   */
  response_char_length: number

  /**
   * Character count of the request (if provided)
   */
  request_char_length?: number

  /**
   * Chars-per-token divisor used for estimation
   */
  chars_per_token: number

  /**
   * Timestamp when token count was calculated
   */
  calculated_at: string
}

/**
 * Calculate token count footer for a response.
 *
 * @param responseText - The response text to count tokens for
 * @param requestText - Optional request text to count tokens for
 * @param charsPerToken - Optional chars-per-token divisor (default: 4)
 * @returns TokenCountFooter with token count information
 *
 * @example
 * ```ts
 * const footer = calculateTokenCountFooter(
 *   JSON.stringify(responseData),
 *   JSON.stringify(requestData)
 * )
 * ```
 */
export function calculateTokenCountFooter(
  responseText: string,
  requestText?: string,
  charsPerToken?: number,
): TokenCountFooter {
  const responseResult = countTokens(responseText, { charsPerToken })
  const requestResult = requestText
    ? countTokens(requestText, { charsPerToken })
    : undefined

  const footer: TokenCountFooter = {
    response_tokens: responseResult.count,
    response_char_length: responseResult.charLength,
    chars_per_token: responseResult.charsPerToken,
    calculated_at: new Date().toISOString(),
  }

  if (requestResult) {
    footer.request_tokens = requestResult.count
    footer.request_char_length = requestResult.charLength
    footer.total_tokens = responseResult.count + requestResult.count
  }

  return footer
}

/**
 * Add token count footer to a response envelope's metadata.
 *
 * Mutates the envelope's metadata field to include token_count information.
 * Non-blocking and safe for production use.
 *
 * @param envelope - The ResponseEnvelope to enhance
 * @param responseText - The response data as a string (typically JSON.stringify(envelope.data))
 * @param requestText - Optional request data as a string
 * @param charsPerToken - Optional chars-per-token divisor
 * @returns The mutated envelope for chaining
 *
 * @example
 * ```ts
 * const envelope = createResponseEnvelope(todos, '/api/todos', 'GET')
 * addTokenCountFooter(envelope, JSON.stringify(todos))
 * return NextResponse.json(envelope)
 * ```
 */
export function addTokenCountFooter<T>(
  envelope: ResponseEnvelope<T>,
  responseText: string,
  requestText?: string,
  charsPerToken?: number,
): ResponseEnvelope<T> {
  try {
    const footer = calculateTokenCountFooter(responseText, requestText, charsPerToken)

    // Ensure metadata exists
    if (!envelope.metadata) {
      envelope.metadata = {}
    }

    // Add token count footer
    envelope.metadata.token_count = footer

    return envelope
  } catch (err) {
    // Swallow errors — token counting should never fail the main response
    console.error(
      '[response_metadata] Error adding token count footer:',
      err instanceof Error ? err.message : String(err),
    )
    return envelope
  }
}

/**
 * Add token count footer to multiple response envelopes.
 *
 * Useful for batch processing or streaming responses.
 *
 * @param envelopes - Array of ResponseEnvelopes to enhance
 * @param responseTexts - Array of response texts (must match envelope count)
 * @param requestTexts - Optional array of request texts
 * @param charsPerToken - Optional chars-per-token divisor
 * @returns Array of mutated envelopes
 *
 * @example
 * ```ts
 * const envelopes = todos.map(t => createResponseEnvelope(t, '/api/todos', 'GET'))
 * const texts = todos.map(t => JSON.stringify(t))
 * addTokenCountFooterBatch(envelopes, texts)
 * ```
 */
export function addTokenCountFooterBatch<T>(
  envelopes: ResponseEnvelope<T>[],
  responseTexts: string[],
  requestTexts?: string[],
  charsPerToken?: number,
): ResponseEnvelope<T>[] {
  return envelopes.map((envelope, index) => {
    const responseText = responseTexts[index]
    const requestText = requestTexts?.[index]
    return addTokenCountFooter(envelope, responseText, requestText, charsPerToken)
  })
}

/**
 * Extract token count footer from a response envelope.
 *
 * @param envelope - The ResponseEnvelope to extract from
 * @returns TokenCountFooter if present, null otherwise
 *
 * @example
 * ```ts
 * const footer = getTokenCountFooter(envelope)
 * if (footer) {
 *   console.log(`Response used ${footer.response_tokens} tokens`)
 * }
 * ```
 */
export function getTokenCountFooter(envelope: ResponseEnvelope): TokenCountFooter | null {
  return (envelope.metadata?.token_count as TokenCountFooter) || null
}

/**
 * Format token count footer as a human-readable string.
 *
 * @param footer - The TokenCountFooter to format
 * @returns Formatted string like "Response: 150 tokens | Total: 250 tokens"
 *
 * @example
 * ```ts
 * const footer = calculateTokenCountFooter(responseText)
 * console.log(formatTokenCountFooter(footer))
 * // Output: "Response: 150 tokens | Total: 250 tokens"
 * ```
 */
export function formatTokenCountFooter(footer: TokenCountFooter): string {
  const parts: string[] = []

  parts.push(`Response: ${footer.response_tokens} tokens`)

  if (footer.request_tokens !== undefined) {
    parts.push(`Request: ${footer.request_tokens} tokens`)
  }

  if (footer.total_tokens !== undefined) {
    parts.push(`Total: ${footer.total_tokens} tokens`)
  }

  return parts.join(' | ')
}

/**
 * Create a summary of token usage across multiple envelopes.
 *
 * @param envelopes - Array of ResponseEnvelopes with token_count metadata
 * @returns Summary object with aggregate token statistics
 *
 * @example
 * ```ts
 * const summary = summarizeTokenUsage(envelopes)
 * console.log(`Average tokens per response: ${summary.averageResponseTokens}`)
 * ```
 */
export interface TokenUsageSummary {
  /**
   * Total response tokens across all envelopes
   */
  totalResponseTokens: number

  /**
   * Total request tokens across all envelopes
   */
  totalRequestTokens: number

  /**
   * Combined total tokens
   */
  totalTokens: number

  /**
   * Number of envelopes with token metadata
   */
  envelopesWithMetadata: number

  /**
   * Average response tokens per envelope
   */
  averageResponseTokens: number

  /**
   * Average request tokens per envelope
   */
  averageRequestTokens: number
}

export function summarizeTokenUsage(envelopes: ResponseEnvelope[]): TokenUsageSummary {
  const summary: TokenUsageSummary = {
    totalResponseTokens: 0,
    totalRequestTokens: 0,
    totalTokens: 0,
    envelopesWithMetadata: 0,
    averageResponseTokens: 0,
    averageRequestTokens: 0,
  }

  for (const envelope of envelopes) {
    const footer = getTokenCountFooter(envelope)
    if (footer) {
      summary.envelopesWithMetadata += 1
      summary.totalResponseTokens += footer.response_tokens
      if (footer.request_tokens !== undefined) {
        summary.totalRequestTokens += footer.request_tokens
      }
    }
  }

  summary.totalTokens = summary.totalResponseTokens + summary.totalRequestTokens

  if (summary.envelopesWithMetadata > 0) {
    summary.averageResponseTokens = Math.round(
      summary.totalResponseTokens / summary.envelopesWithMetadata,
    )
    summary.averageRequestTokens = Math.round(
      summary.totalRequestTokens / summary.envelopesWithMetadata,
    )
  }

  return summary
}
