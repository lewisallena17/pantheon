/**
 * Type-safe JSON parsing with comprehensive error boundaries
 * 
 * Provides structured error handling for JSON.parse() with discriminated union
 * return types, enabling consumers to distinguish between parse success and
 * various failure modes without relying on try-catch blocks.
 * 
 * @see parseJson - Primary export with detailed error classification
 * @see safeJsonParse - Deprecated: use parseJson instead
 */

/**
 * Discriminated union for successful JSON parse result
 */
export interface JsonParseSuccess<T = unknown> {
  readonly ok: true
  readonly data: T
}

/**
 * Discriminated union for JSON parse failure
 * 
 * Includes error classification to distinguish:
 * - SyntaxError: malformed JSON (invalid JSON structure)
 * - TypeError: input validation failed (null, undefined, wrong type)
 * - Other: unexpected runtime errors
 */
export interface JsonParseError {
  readonly ok: false
  readonly error: Error
  readonly reason: 'syntax-error' | 'type-error' | 'unknown-error'
  readonly input?: string | null | undefined
}

/**
 * Discriminated union type for JSON parse operation
 * 
 * @template T - Expected type of the parsed value
 * 
 * @example
 * const result = parseJson<{name: string}>(input)
 * if (result.ok) {
 *   // result.data is safely typed as {name: string}
 *   console.log(result.data.name)
 * } else {
 *   // result.error, result.reason available
 *   console.error(`Parse failed: ${result.reason}`)
 * }
 */
export type JsonParseResult<T = unknown> = JsonParseSuccess<T> | JsonParseError

/**
 * Parse JSON string with detailed error classification
 * 
 * Safely wraps JSON.parse() in a try-catch and returns a discriminated union
 * that indicates success or specific failure mode. This allows callers to handle
 * different error types without nested try-catch blocks.
 * 
 * Error classification:
 * - 'syntax-error': JSON.parse() threw SyntaxError (invalid JSON structure)
 * - 'type-error': Input validation failed (null, undefined, non-string)
 * - 'unknown-error': Unexpected runtime error
 * 
 * @template T - Expected type of the parsed value (defaults to unknown)
 * @param input - String to parse as JSON (can be null/undefined)
 * @returns Discriminated union: {ok: true, data} on success, {ok: false, error, reason} on failure
 * 
 * @example
 * // Success case
 * const result = parseJson<{name: string}>('{"name":"Alice"}')
 * if (result.ok) {
 *   console.log(result.data.name) // "Alice"
 * }
 * 
 * @example
 * // Syntax error (malformed JSON)
 * const result = parseJson('{invalid json}')
 * if (!result.ok) {
 *   console.error(result.reason) // "syntax-error"
 * }
 * 
 * @example
 * // Type error (invalid input)
 * const result = parseJson(null)
 * if (!result.ok) {
 *   console.error(result.reason) // "type-error"
 * }
 * 
 * @example
 * // Using with async operations
 * async function loadConfig(jsonString: string) {
 *   const result = parseJson<Config>(jsonString)
 *   if (!result.ok) {
 *     throw new Error(`Failed to load config: ${result.reason}`)
 *   }
 *   return result.data
 * }
 */
export function parseJson<T = unknown>(input: string | null | undefined): JsonParseResult<T> {
  // Input validation: guard against null, undefined, non-string values
  if (input === null || input === undefined) {
    return {
      ok: false,
      error: new TypeError('Input is null or undefined'),
      reason: 'type-error',
      input,
    }
  }

  if (typeof input !== 'string') {
    return {
      ok: false,
      error: new TypeError(`Expected string, got ${typeof input}`),
      reason: 'type-error',
      input: String(input),
    }
  }

  // Empty string is technically valid JSON in some contexts but unusual
  // We treat it as a type error for clarity
  if (input.length === 0) {
    return {
      ok: false,
      error: new SyntaxError('Input is an empty string'),
      reason: 'syntax-error',
      input,
    }
  }

  try {
    const data = JSON.parse(input) as T
    return { ok: true, data }
  } catch (err) {
    // Distinguish SyntaxError (malformed JSON) from other errors
    if (err instanceof SyntaxError) {
      return {
        ok: false,
        error: err,
        reason: 'syntax-error',
        input,
      }
    }

    // Catch-all for unexpected runtime errors
    // This should rarely happen, but we handle it for robustness
    const runtimeError = err instanceof Error ? err : new Error(String(err))
    return {
      ok: false,
      error: runtimeError,
      reason: 'unknown-error',
      input,
    }
  }
}

/**
 * Legacy alias for parseJson - use parseJson() instead
 * 
 * @deprecated Use parseJson() instead for better semantics
 */
export const safeJsonParse = parseJson

/**
 * Type guard to narrow result to success type
 * 
 * Useful in conditional expressions and control flow filtering
 * 
 * @template T - Expected parsed type
 * @param result - The result from parseJson()
 * @returns true if result indicates success
 * 
 * @example
 * const result = parseJson<User>(input)
 * if (isJsonParseSuccess(result)) {
 *   // result.data is now known to be User
 *   console.log(result.data.name)
 * }
 * 
 * @example
 * // Filter array of results
 * const results = inputs.map(parseJson<Config>)
 * const successes = results.filter(isJsonParseSuccess)
 * const configs = successes.map(r => r.data)
 */
export function isJsonParseSuccess<T>(
  result: JsonParseResult<T>
): result is JsonParseSuccess<T> {
  return result.ok === true
}

/**
 * Type guard to narrow result to error type
 * 
 * Useful in conditional expressions and control flow filtering
 * 
 * @template T - Expected parsed type
 * @param result - The result from parseJson()
 * @returns true if result indicates failure
 * 
 * @example
 * const result = parseJson(input)
 * if (isJsonParseError(result)) {
 *   console.error(`Failed: ${result.reason}`)
 * }
 * 
 * @example
 * // Filter array of results
 * const results = inputs.map(parseJson)
 * const failures = results.filter(isJsonParseError)
 */
export function isJsonParseError(result: JsonParseResult): result is JsonParseError {
  return result.ok === false
}

/**
 * Unwrap JSON parse result or throw error
 * 
 * Converts the discriminated union result back to exception-based error handling.
 * Useful for legacy code or when you want to throw immediately rather than handle
 * the discriminated union.
 * 
 * @template T - Expected parsed type
 * @param result - The result from parseJson()
 * @returns The parsed data if result is successful
 * @throws The original error if result is a failure
 * 
 * @example
 * const result = parseJson<User>(input)
 * const user = unwrapJsonParseResult(result)
 * // user is typed as User or throws
 */
export function unwrapJsonParseResult<T>(result: JsonParseResult<T>): T {
  if (result.ok) {
    return result.data
  }
  throw result.error
}

/**
 * Parse JSON with custom fallback value
 * 
 * Convenience function combining parseJson() with an automatic fallback.
 * Returns the parsed data on success, or the fallback value on any error.
 * 
 * This is simpler than the discriminated union if you don't need to know
 * what went wrong, just need a value or a default.
 * 
 * @template T - Expected parsed type
 * @param input - String to parse as JSON
 * @param fallback - Value to return if parsing fails
 * @returns Parsed data on success, fallback on failure
 * 
 * @example
 * const config = parseJsonWithFallback<Config>(input, DEFAULT_CONFIG)
 * // Always returns a Config (either parsed or default)
 * 
 * @example
 * const items = parseJsonWithFallback<Item[]>(input, [])
 * // Always returns an array
 */
export function parseJsonWithFallback<T>(
  input: string | null | undefined,
  fallback: T
): T {
  const result = parseJson<T>(input)
  return result.ok ? result.data : fallback
}

/**
 * Parse multiple JSON strings and collect results
 * 
 * Convenience function to parse an array of JSON strings without throwing,
 * returning all results (both successes and failures) for batch processing.
 * 
 * @template T - Expected parsed type for each string
 * @param inputs - Array of strings to parse
 * @returns Array of results (discriminated unions)
 * 
 * @example
 * const inputs = ['{"name":"Alice"}', 'invalid', '{"name":"Bob"}']
 * const results = parseJsonBatch<{name: string}>(inputs)
 * 
 * const successes = results.filter(isJsonParseSuccess)
 * const failures = results.filter(isJsonParseError)
 * 
 * console.log(successes.length) // 2
 * console.log(failures.length)  // 1
 */
export function parseJsonBatch<T = unknown>(
  inputs: (string | null | undefined)[]
): JsonParseResult<T>[] {
  return inputs.map(input => parseJson<T>(input))
}
