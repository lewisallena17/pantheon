/**
 * Basic integration test for lib/safe-parse.ts
 * Ensures the error boundary works correctly with various malformed JSON inputs.
 */

import {
  safeParse,
  safeParseObject,
  safeParseArray,
  safeExtract,
  isParseSuccess,
} from '@/lib/safe-parse'

describe('lib/safe-parse', () => {
  describe('safeParse', () => {
    it('parses valid JSON successfully', () => {
      const input = '{"name":"Alice","age":30}'
      const result = safeParse(input)
      expect(result.success).toBe(true)
      expect(result.value).toEqual({ name: 'Alice', age: 30 })
    })

    it('handles malformed JSON gracefully', () => {
      const input = '{invalid json}'
      const result = safeParse(input)
      expect(result.success).toBe(false)
      expect(result.value).toBeNull()
      expect(result.error).toBeDefined()
    })

    it('handles non-string input', () => {
      const input = { already: 'parsed' }
      const result = safeParse(input as any)
      expect(result.success).toBe(false)
      expect(result.value).toBeNull()
    })

    it('uses custom fallback on error', () => {
      const input = '{broken}'
      const result = safeParse(input, { fallback: { default: true } })
      expect(result.success).toBe(false)
      expect(result.value).toEqual({ default: true })
    })

    it('respects context in error messages', () => {
      const input = '[broken'
      const result = safeParse(input, { context: 'user-data' })
      expect(result.error).toContain('user-data')
    })

    it('runs validation if provided', () => {
      const input = '{"id":123}'
      const result = safeParse(input, {
        validate: (parsed) => {
          if (!parsed || typeof parsed !== 'object' || !('id' in parsed)) {
            throw new Error('Missing id field')
          }
        },
      })
      expect(result.success).toBe(true)
    })

    it('catches validation errors', () => {
      const input = '{}'
      const result = safeParse(input, {
        validate: () => {
          throw new Error('Validation failed')
        },
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Validation failed')
    })
  })

  describe('safeParseObject', () => {
    it('returns empty object on error by default', () => {
      const result = safeParseObject('{bad json}')
      expect(result.success).toBe(false)
      expect(result.value).toEqual({})
    })

    it('parses objects successfully', () => {
      const result = safeParseObject('{"key":"value"}')
      expect(result.success).toBe(true)
      expect(result.value).toEqual({ key: 'value' })
    })
  })

  describe('safeParseArray', () => {
    it('returns empty array on error by default', () => {
      const result = safeParseArray('[bad]')
      expect(result.success).toBe(false)
      expect(result.value).toEqual([])
    })

    it('parses arrays successfully', () => {
      const result = safeParseArray('[1,2,3]')
      expect(result.success).toBe(true)
      expect(result.value).toEqual([1, 2, 3])
    })
  })

  describe('safeExtract', () => {
    it('extracts successful value', () => {
      const result = safeParse('{"a":1}')
      const value = safeExtract(result)
      expect(value).toEqual({ a: 1 })
    })

    it('uses fallback on failure', () => {
      const result = safeParse('{bad}', { fallback: null })
      const value = safeExtract(result, { default: true })
      expect(value).toBeNull()
    })
  })

  describe('isParseSuccess', () => {
    it('returns true for successful parses', () => {
      const result = safeParse('{"ok":true}')
      expect(isParseSuccess(result)).toBe(true)
    })

    it('returns false for failed parses', () => {
      const result = safeParse('{bad}')
      expect(isParseSuccess(result)).toBe(false)
    })
  })
})
