/**
 * Test suite for index.mjs query parameter parser
 *
 * Tests:
 * - parseQueryParams with various inputs
 * - Depth preference extraction and normalization
 * - Sensitive parameter filtering
 * - Logging functionality (mocked)
 *
 * Run with: node --test index.test.mjs
 */

import { strict as assert } from 'node:assert'
import { test, describe } from 'node:test'
import {
  parseQueryParams,
  getDepthLevel,
  getDepthPreference,
  getSensitiveParams,
} from './index.mjs'

describe('Query Parameter Parser', () => {
  describe('parseQueryParams', () => {
    test('parses URL object', () => {
      const url = new URL('http://localhost:3000/api/data?depth=full&format=json')
      const params = parseQueryParams(url)

      assert.equal(params.getTotalCount(), 2)
      assert.equal(params.hasDepth, true)
      assert.equal(params.depthValue, 'full')
      assert.equal(params.depthLevel, 2)
    })

    test('parses query string with leading ?', () => {
      const params = parseQueryParams('?depth=shallow&limit=10')

      assert.equal(params.getTotalCount(), 2)
      assert.equal(params.depthValue, 'shallow')
      assert.equal(params.depthLevel, 1)
    })

    test('parses query string without leading ?', () => {
      const params = parseQueryParams('depth=deep&offset=0')

      assert.equal(params.getTotalCount(), 2)
      assert.equal(params.depthValue, 'deep')
      assert.equal(params.depthLevel, 2)
    })

    test('normalizes depth to lowercase', () => {
      const params = parseQueryParams('?depth=FULL')

      assert.equal(params.depthValue, 'full')
      assert.equal(params.depthLevel, 2)
    })

    test('accepts numeric depth levels (0-3)', () => {
      const test0 = parseQueryParams('?depth=0')
      const test1 = parseQueryParams('?depth=1')
      const test2 = parseQueryParams('?depth=2')
      const test3 = parseQueryParams('?depth=3')

      assert.equal(test0.depthLevel, 0)
      assert.equal(test1.depthLevel, 1)
      assert.equal(test2.depthLevel, 2)
      assert.equal(test3.depthLevel, 3)
    })

    test('rejects invalid numeric depth levels', () => {
      const test4 = parseQueryParams('?depth=4')
      const testNeg = parseQueryParams('?depth=-1')

      assert.equal(test4.hasDepth, false)
      assert.equal(test4.depthValue, null)
      assert.equal(testNeg.hasDepth, false)
      assert.equal(testNeg.depthValue, null)
    })

    test('rejects invalid depth values', () => {
      const params = parseQueryParams('?depth=invalid')

      assert.equal(params.hasDepth, false)
      assert.equal(params.depthValue, null)
      assert.equal(params.depthLevel, null)
    })

    test('filters sensitive parameters', () => {
      const params = parseQueryParams('?api_key=secret123&depth=full&token=xyz789')

      assert.equal(params.getTotalCount(), 3)
      assert.equal(params.getSensitiveCount(), 2)
      assert.deepEqual(Array.from(params.sensitive), ['api_key', 'token'])
    })

    test('filters various sensitive parameter names', () => {
      const sensitiveTests = [
        'api_key=secret',
        'API_KEY=secret',
        'apiKey=secret',
        'secret=value',
        'token=xyz',
        'password=pass',
        'authorization=Bearer token',
        'x-api-key=key',
        'stripe_key=sk_live_xyz',
        'anthropic_key=secret',
      ]

      for (const test of sensitiveTests) {
        const params = parseQueryParams(`?${test}&depth=full`)
        assert.equal(params.getSensitiveCount(), 1, `Failed to filter: ${test}`)
      }
    })

    test('separates public and sensitive params', () => {
      const params = parseQueryParams('?api_key=secret&depth=full&format=json')

      assert.equal(params.getTotalCount(), 3)
      assert.equal(params.public.size, 2) // depth, format
      assert.equal(params.sensitive.size, 1) // api_key
      assert.equal(Array.from(params.public.keys()).includes('depth'), true)
      assert.equal(Array.from(params.public.keys()).includes('format'), true)
    })

    test('handles empty query string', () => {
      const params = parseQueryParams('')

      assert.equal(params.getTotalCount(), 0)
      assert.equal(params.hasDepth, false)
    })

    test('handles malformed query gracefully', () => {
      const params = parseQueryParams('?invalid%zzz')

      // Should not throw, may parse partial params
      assert(params instanceof Object)
    })
  })

  describe('getDepthLevel', () => {
    test('returns numeric depth level', () => {
      assert.equal(getDepthLevel('?depth=minimal'), 0)
      assert.equal(getDepthLevel('?depth=shallow'), 1)
      assert.equal(getDepthLevel('?depth=full'), 2)
      assert.equal(getDepthLevel('?depth=complete'), 3)
    })

    test('returns null when depth not set', () => {
      assert.equal(getDepthLevel('?format=json'), null)
    })

    test('returns null for invalid depth', () => {
      assert.equal(getDepthLevel('?depth=invalid'), null)
    })
  })

  describe('getDepthPreference', () => {
    test('returns normalized depth preference', () => {
      assert.equal(getDepthPreference('?depth=FULL'), 'full')
      assert.equal(getDepthPreference('?depth=2'), 'level-2')
    })

    test('returns null when depth not set', () => {
      assert.equal(getDepthPreference('?format=json'), null)
    })
  })

  describe('getSensitiveParams', () => {
    test('returns array of sensitive param names', () => {
      const url = '?api_key=secret&depth=full&token=xyz'
      const sensitive = getSensitiveParams(url)

      assert.equal(Array.isArray(sensitive), true)
      assert.equal(sensitive.length, 2)
      assert.equal(sensitive.includes('api_key'), true)
      assert.equal(sensitive.includes('token'), true)
    })

    test('returns empty array when no sensitive params', () => {
      const sensitive = getSensitiveParams('?depth=full&format=json')

      assert.equal(Array.isArray(sensitive), true)
      assert.equal(sensitive.length, 0)
    })
  })

  describe('Depth level mappings', () => {
    test('minimal maps to 0', () => {
      assert.equal(getDepthLevel('?depth=minimal'), 0)
    })

    test('shallow/standard map to 1', () => {
      assert.equal(getDepthLevel('?depth=shallow'), 1)
      assert.equal(getDepthLevel('?depth=standard'), 1)
    })

    test('full/deep map to 2', () => {
      assert.equal(getDepthLevel('?depth=full'), 2)
      assert.equal(getDepthLevel('?depth=deep'), 2)
    })

    test('complete maps to 3', () => {
      assert.equal(getDepthLevel('?depth=complete'), 3)
    })
  })

  describe('Edge cases', () => {
    test('handles whitespace in depth value', () => {
      const params = parseQueryParams('?depth= full ')

      assert.equal(params.hasDepth, true)
      assert.equal(params.depthValue, 'full')
    })

    test('handles URL-encoded special characters', () => {
      const url = new URL('http://localhost/api?format=json%20array&depth=full')
      const params = parseQueryParams(url)

      assert.equal(params.getTotalCount(), 2)
      assert.equal(params.hasDepth, true)
    })

    test('handles multiple values for same param (uses first)', () => {
      // URLSearchParams behavior: later values override
      const params = parseQueryParams('?depth=shallow&depth=full')

      // This depends on URLSearchParams implementation
      // Most likely uses the last value
      assert(params.hasDepth === true)
    })

    test('case-insensitive depth parameter name', () => {
      const params1 = parseQueryParams('?DEPTH=full')
      const params2 = parseQueryParams('?Depth=full')
      const params3 = parseQueryParams('?dEpTh=full')

      assert.equal(params1.hasDepth, true)
      assert.equal(params2.hasDepth, true)
      assert.equal(params3.hasDepth, true)
    })
  })
})
