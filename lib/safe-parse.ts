/**
 * Safe JSON parsing wrapper with error boundary and fallback handling.
 *
 * Provides utilities to parse JSON strings safely without throwing,
 * with automatic logging and configurable fallback values.
 *
 * Features:
 * - Catches JSON.parse errors gracefully
 * - Logs malformed JSON with context
 * - Returns safe defaults (null or empty object)
 * - Type-safe with generics
 * - Optional validation callback
 *
 * Usage:
 * ```ts
 * import { safeParse, safeParseArray, safeParseObject } from '@/lib/safe-parse'
 *
 * // Parse with default null fallback
 * const data = safeParse(jsonString)
 *
 * // Parse with default empty object
 * const metadata = safeParseObject(metadataString)
 *
 * // Parse with custom fallback and context
 * const config = safeParse(configString, { fallback: {}, context: 'app-config' })
 * ```
 */

/**
 * Options for safe JSON parsing
 */
export interface SafeParseOptions<T> {
  /**
   * Default value to return if parsing fails
   * @default null
   */
  fallback?: T

  /**
   * Context string for error logging (e.g., 'response_metadata', 'user-config')
   * Included in error messages for debugging
   * @default undefined
   */
  context?: string

  /**
   * Optional validation function to run after successful parse
   * Should throw if validation fails
   * @default undefined
   */
  validate?: (parsed: unknown) => void

  /**
   * Enable console logging of parse errors
   * @default true
   */
  logErrors?: boolean

  /**
   * Maximum string length to log on error (chars)
   * Prevents huge JSON strings from flooding logs
   * @default 500
   */
  maxLogLength?: number
}

/**
 * Result of a safe parse operation
 */
export interface SafeParseResult<T> {
  /**
   * The parsed value if successful, or fallback if failed
   */
  value: T

  /**
   * true if parsing succeeded
   */
  success: boolean

  /**
   * Error message if parsing failed
   */
  error?: string

  /**
   * Timestamp when parse was attempted
   */
  attemptedAt: string
}

/**
 * Safely parse a JSON string with error boundary.
 *
 * Returns the parsed value on success, or the fallback value on error.
 * Always logs errors unless disabled.
 *
 * @template T - Expected type of the parsed value
 * @param input - JSON string to parse
 * @param options - Configuration options
 * @returns Parsed value (or fallback), wrapped in SafeParseResult
 *
 * @example
 * ```ts
 * const result = safeParse<User>(jsonString, {
 *   fallback: null,
 *   context: 'user-profile',
 *   validate: (parsed) => {
 *     if (!parsed || typeof parsed !== 'object') throw new Error('Invalid structure')
 *   }
 * })
 *
 * if (result.success) {
 *   console.log('User loaded:', result.value)
 * } else {
 *   console.warn('Failed to parse user:', result.error)
 * }
 * ```
 */
export function safeParse<T = unknown>(
  input: unknown,
  options?: SafeParseOptions<T>,
): SafeParseResult<T> {
  const opts = {
    fallback: null as T,
    context: undefined,
    validate: undefined,
    logErrors: true,
    maxLogLength: 500,
    ...options,
  }

  const attemptedAt = new Date().toISOString()

  try {
    // Type guard: if not a string, return fallback
    if (typeof input !== 'string') {
      const errorMsg =
        opts.context && opts.logErrors
          ? `[safeParse] Expected string in context '${opts.context}', got ${typeof input}`
          : `[safeParse] Expected string, got ${typeof input}`

      if (opts.logErrors) {
        console.warn(errorMsg)
      }

      return {
        value: opts.fallback,
        success: false,
        error: errorMsg,
        attemptedAt,
      }
    }

    // Attempt JSON parse
    const parsed = JSON.parse(input)

    // Run optional validation
    if (opts.validate) {
      opts.validate(parsed)
    }

    return {
      value: parsed as T,
      success: true,
      attemptedAt,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Prepare context-aware error log
    let logMessage = '[safeParse] JSON parse error'
    if (opts.context) {
      logMessage += ` in context '${opts.context}'`
    }
    logMessage += `: ${errorMessage}`

    // Include truncated input sample if requested
    if (opts.logErrors && typeof input === 'string' && input.length > 0) {
      const truncated =
        input.length > opts.maxLogLength ? input.slice(0, opts.maxLogLength) + '...' : input
      logMessage += ` | Input (first ${opts.maxLogLength} chars): "${truncated}"`
    }

    if (opts.logErrors) {
      console.error(logMessage)
    }

    return {
      value: opts.fallback,
      success: false,
      error: errorMessage,
      attemptedAt,
    }
  }
}

/**
 * Safely parse a JSON string, expecting an object as the result.
 *
 * Shorthand for safeParse with a default empty object fallback.
 * Type is narrowed to Record<string, unknown>.
 *
 * @param input - JSON string to parse
 * @param options - Configuration options
 * @returns SafeParseResult with object value
 *
 * @example
 * ```ts
 * const metadata = safeParseObject(metadataJsonString, {
 *   context: 'response-metadata'
 * })
 *
 * if (metadata.success) {
 *   console.log('Metadata loaded:', metadata.value)
 * }
 * ```
 */
export function safeParseObject(
  input: unknown,
  options?: SafeParseOptions<Record<string, unknown>>,
): SafeParseResult<Record<string, unknown>> {
  return safeParse<Record<string, unknown>>(input, {
    fallback: {},
    ...options,
  })
}

/**
 * Safely parse a JSON string, expecting an array as the result.
 *
 * Shorthand for safeParse with a default empty array fallback.
 * Type is narrowed to unknown[].
 *
 * @template T - Element type of the array
 * @param input - JSON string to parse
 * @param options - Configuration options
 * @returns SafeParseResult with array value
 *
 * @example
 * ```ts
 * const todos = safeParseArray<Todo>(todosJsonString, {
 *   context: 'todos-list',
 *   validate: (parsed) => {
 *     if (!Array.isArray(parsed)) throw new Error('Expected array')
 *   }
 * })
 *
 * if (todos.success) {
 *   todos.value.forEach(todo => console.log(todo))
 * }
 * ```
 */
export function safeParseArray<T = unknown>(
  input: unknown,
  options?: SafeParseOptions<T[]>,
): SafeParseResult<T[]> {
  return safeParse<T[]>(input, {
    fallback: [],
    ...options,
  })
}

/**
 * Extract the parsed value from a SafeParseResult, with optional fallback.
 *
 * Useful for one-liner access when you don't need the full result envelope.
 *
 * @template T - Type of the value
 * @param result - SafeParseResult to extract from
 * @param fallback - Alternative fallback if result.value is falsy
 * @returns The parsed value, fallback from result, or provided fallback
 *
 * @example
 * ```ts
 * const metadata = safeExtract(result, {})
 * // Returns result.value if success, result.fallback otherwise, or {} as final fallback
 * ```
 */
export function safeExtract<T>(result: SafeParseResult<T>, fallback?: T): T {
  return result.value ?? fallback ?? (null as unknown as T)
}

/**
 * Check if a SafeParseResult indicates success.
 *
 * @param result - SafeParseResult to check
 * @returns true if parsing succeeded
 *
 * @example
 * ```ts
 * const result = safeParse(jsonString)
 * if (isParseSuccess(result)) {
 *   // result.value is safe to use
 * }
 * ```
 */
export function isParseSuccess<T>(result: SafeParseResult<T>): boolean {
  return result.success === true
}

/**
 * Batch parse multiple JSON strings with error recovery.
 *
 * Useful for parsing arrays of JSON objects where some may be malformed.
 * Returns both successful parses and errors for diagnostics.
 *
 * @template T - Expected type of each parsed value
 * @param inputs - Array of JSON strings to parse
 * @param options - Configuration options
 * @returns Array of SafeParseResults, one per input
 *
 * @example
 * ```ts
 * const results = safeParseMany<User>(jsonLines, {
 *   context: 'user-batch-import',
 *   fallback: null
 * })
 *
 * const successful = results.filter(isParseSuccess)
 * const failed = results.filter(r => !r.success)
 * console.log(`Loaded ${successful.length}, failed ${failed.length}`)
 * ```
 */
export function safeParseMany<T = unknown>(
  inputs: unknown[],
  options?: SafeParseOptions<T>,
): SafeParseResult<T>[] {
  return inputs.map((input) => safeParse<T>(input, options))
}
