// god/memory.mjs — pure-function memory dedup logic
//
// Lessons / avoid patterns / success patterns pile up as near-duplicates
// (same idea worded slightly differently every cycle). We compress each
// entry to a token set and use Jaccard similarity to drop duplicates.
//
// Pure functions only — no I/O, no external dependencies. That's why it's
// safe to extract from god-agent.mjs and unit-test in isolation.

const STOP_WORDS = new Set([
  'this','that','with','from','have','been','were','they','their','there',
  'will','would','about','which','your','when','what','then','than','some',
  'task','tasks','agent','agents','make','sure','should','just','like',
])

/** Convert a lesson string to a set of content-bearing tokens. */
export function lessonTokens(s) {
  return new Set(
    String(s).toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4)
      .filter(w => !STOP_WORDS.has(w))
  )
}

/** Jaccard coefficient between two token sets. Returns 0..1. */
export function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

/**
 * Remove lessons whose token-set overlap exceeds `threshold` with a
 * lesson already kept. Walks newest-first so the most recent phrasing
 * is preserved when duplicates collapse.
 *
 * @param {string[]} lessons     ordered oldest → newest
 * @param {number}   threshold   0..1 — higher = stricter dedup
 * @returns {string[]}           filtered list, order preserved
 */
export function dedupLessons(lessons, threshold = 0.7) {
  const kept = []
  const keptTokens = []
  for (let i = lessons.length - 1; i >= 0; i--) {
    const lesson = lessons[i]
    const toks = lessonTokens(lesson)
    const isDup = keptTokens.some(kt => jaccard(kt, toks) >= threshold)
    if (!isDup) {
      kept.unshift(lesson)
      keptTokens.unshift(toks)
    }
  }
  return kept
}

/**
 * Run dedup across the three list-shaped fields on the wisdom object.
 * Returns the wisdom object (mutated) plus a log-ready summary.
 *
 * Pure except for the console.log, which is kept as a hook for
 * observability and can be removed in tests.
 */
export function pruneWisdom(w, { log } = { log: console }) {
  const beforeL = (w.lessons ?? []).length
  const beforeA = (w.avoidPatterns ?? []).length
  const beforeP = (w.patterns ?? []).length

  w.lessons       = dedupLessons(w.lessons ?? [])
  w.avoidPatterns = dedupLessons(w.avoidPatterns ?? [], 0.6)
  w.patterns      = dedupLessons(w.patterns ?? [], 0.6)

  const saved = (beforeL - w.lessons.length) + (beforeA - w.avoidPatterns.length) + (beforeP - w.patterns.length)
  if (saved > 0) {
    log.log(`[GOD-MEMORY] Deduped: -${saved} entries (lessons ${beforeL}→${w.lessons.length}, avoid ${beforeA}→${w.avoidPatterns.length}, patterns ${beforeP}→${w.patterns.length})`)
  }
  return w
}
