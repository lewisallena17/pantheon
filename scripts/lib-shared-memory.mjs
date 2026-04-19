// Shared cross-agent memory.
//
// v2 — triaged into three types (mem0 2026 pattern):
//   episodic   — what happened, dated events, outcome-linked
//   semantic   — facts & invariants ("X requires Y")
//   procedural — workflows ("to ship: build → test → commit → push")
//
// On publish we auto-classify via keyword heuristics. On conflict with an
// existing lesson (>70% token overlap AND opposing polarity) we archive the
// older one instead of blindly appending — prevents stale lessons from
// dragging God's decisions.
//
// Back-compat: the old single-array `lessons` field is preserved by flattening
// all three buckets. Readers that don't know about the split still work.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const MAX_PER_BUCKET = 60
const MAX_ARCHIVED   = 40

export function sharedMemoryPath(agentMemoryDir) {
  return `${agentMemoryDir}/global-lessons.json`
}

// ── Classification ─────────────────────────────────────────────────────────
export function classifyLesson(text) {
  const s = String(text || '').toLowerCase()

  // Procedural: describes an ordered workflow
  if (/\b(step\s*\d|first[,.]?\s|then[,.]?\s|finally[,.]?\s|→|->)/i.test(s))           return 'procedural'
  if (/\bto\s+(\w+\s+)?(build|ship|deploy|run|handle|fix|commit)/i.test(s))            return 'procedural'
  if (/\b(workflow|process|sequence|pipeline|procedure)\b/.test(s))                    return 'procedural'

  // Episodic: time-anchored events
  if (/\b(cycle\s*\d+|at\s+\d{2}:\d{2}|yesterday|today|this\s+morning|^\w.*? happened)/i.test(s)) return 'episodic'
  if (/\b(failed|succeeded|completed|crashed|hit\s+.*\s+limit|cost\s+cap\s+hit)\b/.test(s)) {
    // Only episodic if there's a specific event signature; otherwise semantic
    if (/\"[^\"]+\"/.test(s) || /\d/.test(s)) return 'episodic'
  }

  // Default: semantic (facts/invariants)
  return 'semantic'
}

function tokenize(s) {
  return new Set(String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 4))
}

function overlap(a, b) {
  const A = tokenize(a), B = tokenize(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.min(A.size, B.size)
}

// Rough polarity: +1 for positive/succeeded, -1 for negative/failed, 0 neutral
function polarity(s) {
  const lower = String(s || '').toLowerCase()
  const positives = /\b(succeed|success|worked|fixed|resolved|✓|good|prefer)\b/
  const negatives = /\b(fail|failed|broken|avoid|wrong|bad|❌|skip|no\s+longer)\b/
  const p = positives.test(lower) ? 1 : 0
  const n = negatives.test(lower) ? 1 : 0
  return p - n
}

// ── Storage ────────────────────────────────────────────────────────────────
function emptyMem() {
  return {
    episodic:   [],
    semantic:   [],
    procedural: [],
    archived:   [],
    lessons:    [], // back-compat flat array
    taskCount:  0,
    version:    2,
  }
}

function migrate(raw) {
  if (raw && raw.version === 2) return raw
  const mem = emptyMem()
  const legacy = Array.isArray(raw?.lessons) ? raw.lessons : []
  for (const l of legacy) {
    const bucket = classifyLesson(l)
    mem[bucket].push({ text: l, at: null })
  }
  mem.lessons   = legacy.slice(-MAX_PER_BUCKET * 3)
  mem.taskCount = raw?.taskCount ?? legacy.length
  return mem
}

export function loadShared(agentMemoryDir) {
  const p = sharedMemoryPath(agentMemoryDir)
  try { if (existsSync(p)) return migrate(JSON.parse(readFileSync(p, 'utf8'))) } catch {}
  return emptyMem()
}

export function saveShared(agentMemoryDir, state) {
  const p = sharedMemoryPath(agentMemoryDir)
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true })
  try { writeFileSync(p, JSON.stringify(state, null, 2), 'utf8') } catch {}
}

// ── Publish ────────────────────────────────────────────────────────────────
/** Add a lesson. Auto-classifies, archives stale conflicts, caps per bucket. */
export function publishShared(agentMemoryDir, lesson) {
  if (!lesson || typeof lesson !== 'string') return
  const mem = loadShared(agentMemoryDir)
  const bucket = classifyLesson(lesson)
  mem[bucket] ??= []

  // Duplicate?
  if (mem[bucket].some(e => (typeof e === 'string' ? e : e.text) === lesson)) return

  // Conflict detection: high overlap + opposing polarity → archive old one
  const newPol = polarity(lesson)
  if (newPol !== 0) {
    for (let i = mem[bucket].length - 1; i >= 0; i--) {
      const existing = mem[bucket][i]
      const txt = typeof existing === 'string' ? existing : existing.text
      if (overlap(lesson, txt) >= 0.7 && polarity(txt) === -newPol) {
        mem.archived = [...(mem.archived ?? []).slice(-(MAX_ARCHIVED - 1)), { text: txt, archived_at: new Date().toISOString(), reason: 'contradicted' }]
        mem[bucket].splice(i, 1)
      }
    }
  }

  mem[bucket] = [...mem[bucket].slice(-(MAX_PER_BUCKET - 1)), { text: lesson, at: new Date().toISOString() }]

  // Rebuild the flat back-compat lessons list (keeps consumers that read it working)
  mem.lessons   = [...mem.episodic, ...mem.semantic, ...mem.procedural]
                    .map(e => typeof e === 'string' ? e : e.text)
                    .slice(-(MAX_PER_BUCKET * 3))
  mem.taskCount = (mem.taskCount ?? 0) + 1
  mem.version   = 2
  saveShared(agentMemoryDir, mem)
}

export function publishSharedBatch(agentMemoryDir, lessons) {
  if (!Array.isArray(lessons) || lessons.length === 0) return
  for (const l of lessons) publishShared(agentMemoryDir, l)
}
