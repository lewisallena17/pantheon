/**
 * Unit tests for safe-json-parse.ts
 * 
 * Demonstrates error boundary patterns, type safety, and various failure modes
 */

import {
  parseJson,
  parseJsonWithFallback,
  parseJsonBatch,
  isJsonParseSuccess,
  isJsonParseError,
  unwrapJsonParseResult,
  JsonParseResult,
} from './safe-json-parse'

// ============================================================================
// Test: Basic Success Cases
// ============================================================================

describe('parseJson - success cases', () => {
  test('parses valid JSON object', () => {
    const result = parseJson<{ name: string }>('{"name":"Alice"}')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Alice')
    }
  })

  test('parses valid JSON array', () => {
    const result = parseJson<number[]>('[1, 2, 3]')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual([1, 2, 3])
    }
  })

  test('parses primitive values', () => {
    const strResult = parseJson<string>('"hello"')
    expect(strResult.ok).toBe(true)
    if (strResult.ok) {
      expect(strResult.data).toBe('hello')
    }

    const numResult = parseJson<number>('42')
    expect(numResult.ok).toBe(true)
    if (numResult.ok) {
      expect(numResult.data).toBe(42)
    }

    const boolResult = parseJson<boolean>('true')
    expect(boolResult.ok).toBe(true)
    if (boolResult.ok) {
      expect(boolResult.data).toBe(true)
    }
  })

  test('parses nested objects', () => {
    const input = '{"user":{"name":"Bob","age":30}}'
    const result = parseJson<{ user: { name: string; age: number } }>(input)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.user.name).toBe('Bob')
      expect(result.data.user.age).toBe(30)
    }
  })
})

// ============================================================================
// Test: Syntax Error Cases (malformed JSON)
// ============================================================================

describe('parseJson - syntax error cases', () => {
  test('handles malformed JSON', () => {
    const result = parseJson('{invalid json}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('syntax-error')
      expect(result.error).toBeInstanceOf(SyntaxError)
    }
  })

  test('handles trailing comma', () => {
    const result = parseJson('{"name":"Alice",}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('syntax-error')
    }
  })

  test('handles unquoted keys', () => {
    const result = parseJson('{name: "Alice"}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('syntax-error')
    }
  })

  test('handles empty string', () => {
    const result = parseJson('')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('syntax-error')
    }
  })
})

// ============================================================================
// Test: Type Error Cases (invalid input)
// ============================================================================

describe('parseJson - type error cases', () => {
  test('handles null input', () => {
    const result = parseJson(null)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('type-error')
      expect(result.error).toBeInstanceOf(TypeError)
    }
  })

  test('handles undefined input', () => {
    const result = parseJson(undefined)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('type-error')
    }
  })

  test('handles non-string input', () => {
    const result = parseJson(42 as unknown as string)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('type-error')
    }
  })
})

// ============================================================================
// Test: Type Guards
// ============================================================================

describe('type guards', () => {
  test('isJsonParseSuccess narrows to success type', () => {
    const result = parseJson<{ name: string }>('{"name":"Alice"}')
    if (isJsonParseSuccess(result)) {
      // TypeScript should know result.data exists and is {name: string}
      expect(result.data.name).toBe('Alice')
    }
  })

  test('isJsonParseError narrows to error type', () => {
    const result = parseJson('invalid')
    if (isJsonParseError(result)) {
      // TypeScript should know result.reason exists
      expect(result.reason).toBeDefined()
      expect(result.error).toBeDefined()
    }
  })

  test('filter array with isJsonParseSuccess', () => {
    const inputs = ['{"a":1}', 'invalid', '{"b":2}']
    const results = inputs.map(parseJson<{ a?: number; b?: number }>)
    const successes = results.filter(isJsonParseSuccess)
    expect(successes.length).toBe(2)
    expect(successes[0].data).toEqual({ a: 1 })
    expect(successes[1].data).toEqual({ b: 2 })
  })

  test('filter array with isJsonParseError', () => {
    const inputs = ['{"a":1}', 'invalid', '{"b":2}']
    const results = inputs.map(parseJson)
    const failures = results.filter(isJsonParseError)
    expect(failures.length).toBe(1)
    expect(failures[0].reason).toBe('syntax-error')
  })
})

// ============================================================================
// Test: Utility Functions
// ============================================================================

describe('unwrapJsonParseResult', () => {
  test('returns data on success', () => {
    const result = parseJson<number>('42')
    const value = unwrapJsonParseResult(result)
    expect(value).toBe(42)
  })

  test('throws error on failure', () => {
    const result = parseJson('invalid')
    expect(() => unwrapJsonParseResult(result)).toThrow()
  })
})

describe('parseJsonWithFallback', () => {
  test('returns parsed data on success', () => {
    const data = parseJsonWithFallback<{ name: string }>('{"name":"Alice"}', {
      name: 'default',
    })
    expect(data.name).toBe('Alice')
  })

  test('returns fallback on syntax error', () => {
    const data = parseJsonWithFallback<{ name: string }>('invalid', {
      name: 'default',
    })
    expect(data.name).toBe('default')
  })

  test('returns fallback on type error', () => {
    const data = parseJsonWithFallback<string[]>(null, ['default'])
    expect(data).toEqual(['default'])
  })

  test('works with arrays', () => {
    const items = parseJsonWithFallback<number[]>('[1, 2, 3]', [])
    expect(items).toEqual([1, 2, 3])

    const fallbackItems = parseJsonWithFallback<number[]>('not json', [])
    expect(fallbackItems).toEqual([])
  })
})

describe('parseJsonBatch', () => {
  test('parses multiple inputs', () => {
    const inputs = ['{"a":1}', 'invalid', '{"b":2}']
    const results = parseJsonBatch<{ a?: number; b?: number }>(inputs)

    expect(results.length).toBe(3)
    expect(results[0].ok).toBe(true)
    expect(results[1].ok).toBe(false)
    expect(results[2].ok).toBe(true)
  })

  test('handles mixed null/undefined/string inputs', () => {
    const inputs: (string | null | undefined)[] = ['{"a":1}', null, undefined, '{}']
    const results = parseJsonBatch(inputs)

    expect(results[0].ok).toBe(true)
    expect(results[1].ok).toBe(false)
    expect(results[2].ok).toBe(false)
    expect(results[3].ok).toBe(true)
  })

  test('collects statistics from batch', () => {
    const inputs = ['{"a":1}', 'invalid1', '{"b":2}', 'invalid2', '[]']
    const results = parseJsonBatch(inputs)

    const successes = results.filter(isJsonParseSuccess)
    const failures = results.filter(isJsonParseError)

    expect(successes.length).toBe(3)
    expect(failures.length).toBe(2)
    expect(failures.every(f => f.reason === 'syntax-error')).toBe(true)
  })
})

// ============================================================================
// Test: Real-world Scenarios
// ============================================================================

describe('real-world scenarios', () => {
  test('config loading with fallback', () => {
    const loadConfig = (json: string) => {
      const result = parseJson<{ port: number; host: string }>(json)
      if (!result.ok) {
        console.warn(`Config load failed: ${result.reason}`)
        return null
      }
      return result.data
    }

    const config1 = loadConfig('{"port":8080,"host":"localhost"}')
    expect(config1).toEqual({ port: 8080, host: 'localhost' })

    const config2 = loadConfig('invalid')
    expect(config2).toBeNull()
  })

  test('API response parsing', () => {
    interface ApiResponse<T> {
      success: boolean
      data?: T
      error?: string
    }

    const parseApiResponse = (json: string): ApiResponse<{ id: number; name: string }> => {
      const result = parseJson<{ id: number; name: string }>(json)
      if (result.ok) {
        return { success: true, data: result.data }
      }
      return {
        success: false,
        error: `Parse failed: ${result.reason}`,
      }
    }

    const ok = parseApiResponse('{"id":123,"name":"test"}')
    expect(ok.success).toBe(true)
    expect(ok.data?.id).toBe(123)

    const err = parseApiResponse('invalid')
    expect(err.success).toBe(false)
    expect(err.error).toContain('syntax-error')
  })

  test('batch processing with error tracking', () => {
    const processLogs = (
      logLines: string[]
    ): { parsed: number; failed: number; errors: string[] } => {
      const results = parseJsonBatch<{ timestamp: number; message: string }>(logLines)
      const errors: string[] = []

      results.forEach((result, i) => {
        if (!result.ok) {
          errors.push(`Line ${i}: ${result.reason}`)
        }
      })

      return {
        parsed: results.filter(isJsonParseSuccess).length,
        failed: results.filter(isJsonParseError).length,
        errors,
      }
    }

    const logs = [
      '{"timestamp":1000,"message":"start"}',
      'malformed json',
      '{"timestamp":2000,"message":"end"}',
    ]

    const report = processLogs(logs)
    expect(report.parsed).toBe(2)
    expect(report.failed).toBe(1)
    expect(report.errors).toContain('Line 1: syntax-error')
  })
})
