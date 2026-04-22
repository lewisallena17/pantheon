/**
 * Parse JSON string or return a fallback value
 * 
 * Safely parses a JSON string and returns the parsed object, or falls back to
 * a default value if parsing fails (invalid JSON, null/undefined input, etc).
 * 
 * Generic typed to ensure type-safety of both the parsed result and the fallback.
 * 
 * @template T - The expected type of the parsed object and fallback
 * @param input - The JSON string to parse (can be null/undefined)
 * @param fallback - The default value to return if parsing fails
 * @returns The parsed object if successful, or the fallback value
 * 
 * @example
 * // Basic usage with object fallback
 * const data = parseJsonOrFallback('{"name":"Alice"}', {name:"Bob"})
 * // data = {name: "Alice"}
 * 
 * @example
 * // Fallback used on invalid JSON
 * const data = parseJsonOrFallback('not json', {default: true})
 * // data = {default: true}
 * 
 * @example
 * // Works with arrays
 * const arr = parseJsonOrFallback('[1,2,3]', [])
 * // arr = [1, 2, 3]
 * 
 * @example
 * // Fallback on null/undefined
 * const data = parseJsonOrFallback(null, {safe: "default"})
 * // data = {safe: "default"}
 */
export function parseJsonOrFallback<T>(input: string | null | undefined, fallback: T): T {
  // Guard: if input is not a non-empty string, return fallback
  if (!input || typeof input !== 'string') {
    return fallback
  }

  try {
    const parsed = JSON.parse(input)
    return parsed as T
  } catch (err) {
    // JSON.parse threw an error (SyntaxError, etc)
    // Return the fallback instead of throwing
    return fallback
  }
}

/**
 * Parse JSON string or return an empty object
 * 
 * Convenience wrapper around parseJsonOrFallback for cases where you want
 * to return an empty object `{}` as the fallback.
 * 
 * @template T - The expected type of the parsed object (defaults to Record<string, unknown>)
 * @param input - The JSON string to parse
 * @returns The parsed object if successful, or an empty object
 * 
 * @example
 * const data = parseJsonOrEmptyObject('{"a":1}')
 * // data = {a: 1}
 * 
 * @example
 * const data = parseJsonOrEmptyObject('invalid')
 * // data = {}
 */
export function parseJsonOrEmptyObject<T extends Record<string, unknown> = Record<string, unknown>>(
  input: string | null | undefined
): T {
  return parseJsonOrFallback<T>(input, {} as T)
}

/**
 * Parse JSON string or return an empty array
 * 
 * Convenience wrapper around parseJsonOrFallback for cases where you want
 * to return an empty array `[]` as the fallback.
 * 
 * @template T - The expected type of array items (defaults to unknown)
 * @param input - The JSON string to parse
 * @returns The parsed array if successful, or an empty array
 * 
 * @example
 * const items = parseJsonOrEmptyArray('[1,2,3]')
 * // items = [1, 2, 3]
 * 
 * @example
 * const items = parseJsonOrEmptyArray('invalid')
 * // items = []
 */
export function parseJsonOrEmptyArray<T = unknown>(input: string | null | undefined): T[] {
  return parseJsonOrFallback<T[]>(input, [])
}
