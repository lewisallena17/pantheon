// god/memory.test.mjs — unit tests for the memory dedup logic.
//
// Run: npm test
// Uses node's built-in test runner — zero external dependencies.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lessonTokens, jaccard, dedupLessons, pruneWisdom } from './memory.mjs'

test('lessonTokens: strips punctuation, lowercases, removes short words', () => {
  const t = lessonTokens('The Schema must be queried before any UPDATE!')
  assert.ok(t.has('schema'))
  assert.ok(t.has('queried'))
  assert.ok(t.has('before'))
  assert.ok(t.has('update'))
  assert.ok(t.has('must'))     // 4 chars, passes length filter
  assert.ok(!t.has('the'))     // 3 chars — too short
  assert.ok(!t.has('any'))     // 3 chars — too short
  assert.ok(!t.has('be'))      // 2 chars — too short
})

test('lessonTokens: filters stop-words (this, that, with, task, agent)', () => {
  const t = lessonTokens('this task agent should agents make sure')
  assert.equal(t.size, 0, 'all tokens are stop-words')
})

test('jaccard: identical sets = 1', () => {
  const a = new Set(['alpha', 'beta', 'gamma'])
  const b = new Set(['alpha', 'beta', 'gamma'])
  assert.equal(jaccard(a, b), 1)
})

test('jaccard: disjoint sets = 0', () => {
  const a = new Set(['alpha', 'beta'])
  const b = new Set(['gamma', 'delta'])
  assert.equal(jaccard(a, b), 0)
})

test('jaccard: empty set = 0', () => {
  assert.equal(jaccard(new Set(), new Set(['a'])), 0)
})

test('jaccard: half overlap = 1/3', () => {
  // a = {x, y}, b = {x, z} → intersection 1, union 3 → 1/3
  const a = new Set(['alphaword', 'betaword'])
  const b = new Set(['alphaword', 'gammaword'])
  const j = jaccard(a, b)
  assert.ok(Math.abs(j - 1/3) < 0.01, `expected ~0.33, got ${j}`)
})

test('dedupLessons: collapses near-duplicates, keeps newest phrasing', () => {
  const lessons = [
    'Schema introspection prevents failures',
    'Schema introspection prevents downstream failures',   // high overlap with previous
    'Use LIMIT clauses on production queries',
  ]
  const result = dedupLessons(lessons, 0.5)
  assert.equal(result.length, 2)
  // Newest of the pair survives
  assert.equal(result[0], 'Schema introspection prevents downstream failures')
  assert.equal(result[1], 'Use LIMIT clauses on production queries')
})

test('dedupLessons: nothing collapses below threshold', () => {
  const lessons = [
    'Database schema validation prevents errors',
    'User interface components should be responsive',
  ]
  const result = dedupLessons(lessons, 0.5)
  assert.equal(result.length, 2, 'unrelated lessons are preserved')
})

test('dedupLessons: empty input returns empty', () => {
  assert.deepEqual(dedupLessons([]), [])
})

test('pruneWisdom: reduces duplicates across lessons, avoidPatterns, patterns', () => {
  const silent = { log: () => {} }
  const w = {
    lessons: [
      'Validate inputs before running queries',
      'Validate inputs before running the queries',   // ~90% overlap → dropped
      'Monitor cost cap continuously',
    ],
    avoidPatterns: [
      'Run unfiltered DELETE statements production',
      'Running unfiltered DELETE statements production database',   // tight overlap
    ],
    patterns: [],
  }
  const result = pruneWisdom(w, { log: silent })
  assert.equal(result.lessons.length, 2, 'near-dup lesson collapsed')
  assert.equal(result.avoidPatterns.length, 1, 'near-dup avoid pattern collapsed')
  assert.equal(result.patterns.length, 0)
})

test('pruneWisdom: handles missing fields gracefully', () => {
  const silent = { log: () => {} }
  const result = pruneWisdom({}, { log: silent })
  assert.deepEqual(result.lessons, [])
  assert.deepEqual(result.avoidPatterns, [])
  assert.deepEqual(result.patterns, [])
})
