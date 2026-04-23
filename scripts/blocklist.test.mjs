// scripts/blocklist.test.mjs
//
// Asserts that every TASK_BLOCKLIST_PATTERNS regex catches the real failure
// titles that motivated it, and that known-good task titles are NOT caught.
//
// Run: node scripts/blocklist.test.mjs
// Integrates with CI via a `npm test` script.

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Pull the regex list out of god-agent.mjs without importing the module
// (importing triggers Supabase connection etc.). The inner patterns contain
// `]` inside char classes like [\w\s], so we require the closing bracket
// to be at column 0 on its own line — anchors the end unambiguously.
const godSrc = readFileSync(join(__dirname, 'god-agent.mjs'), 'utf8')
const blockMatch = godSrc.match(/const TASK_BLOCKLIST_PATTERNS = \[\r?\n([\s\S]*?)\r?\n\]/)
if (!blockMatch) {
  console.error('✕ Could not locate TASK_BLOCKLIST_PATTERNS in god-agent.mjs')
  process.exit(1)
}

const PATTERNS = []
for (const line of blockMatch[1].split('\n')) {
  // Real regex lines start with `  /` (after indent), not `  // `. Skip comments.
  const trimmed = line.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) continue
  // Match the first /.../flags on the line — stop before the trailing `,` or comment
  const m = trimmed.match(/^\/(.+)\/([gimsuy]*)(?:,|\s*(?:\/\/|$))/)
  if (m && m[1].length > 0) {
    try { PATTERNS.push(new RegExp(m[1], m[2])) } catch {}
  }
}

// Each entry: { title, mustBlock }
const CASES = [
  // ── Must-block — real failures that motivated each pattern ──────────────
  { title: 'Implement bounded query validation wrapper for agent_exec_sql', mustBlock: true },
  { title: 'Inject LIMIT enforcement into agent_exec_sql calls',             mustBlock: true },
  { title: 'Build schema introspection validator',                           mustBlock: true },
  { title: 'Measure outcome delta between pools',                            mustBlock: true },
  { title: 'Implement pre-execution schema validator for SELECT queries',    mustBlock: true },
  { title: 'Compare db category success rate delta before/after wrapper',    mustBlock: true },
  { title: 'Query god_status + task_history LIMIT 10 ordered by success',    mustBlock: true },
  { title: 'Classify db category success patterns via regexp_matches',       mustBlock: true },
  { title: 'Extract db category via regexp_matches from task_history',       mustBlock: true },
  { title: '[CURIOSITY] Build uncertainty quantification for factual claims', mustBlock: true },
  { title: '[CURIOSITY] Measure and model how relevance diminishes',         mustBlock: true },
  { title: '[CURIOSITY] Detect recurring problem-solving patterns across N', mustBlock: true },
  { title: '[CURIOSITY] Predict token generation time based on complexity',  mustBlock: true },
  // Round 3 — "Export/Read X + Y + classify by" shapes (12 fails 2026-04-22)
  { title: 'Export agent_sql_execution_log + task_throughput_events via agent_exec_sql', mustBlock: true },
  { title: 'Build task-priority classifier: read task_history + problem_solving_patterns', mustBlock: true },
  { title: 'Export RPC errors from rpc_error_log classified by error_type',              mustBlock: true },

  // Round 4 — consumer-less utility sprawl (6,668 lines deleted 2026-04-23)
  { title: 'Create lib/response-finish-logger.ts for tracking',                          mustBlock: true },
  { title: 'Add lib/silence-recovery-handler.ts utility',                                mustBlock: true },
  { title: 'Build instrumentation layer for response lifecycle',                         mustBlock: true },
  { title: 'Implement response completion marker detector',                              mustBlock: true },
  // Must NOT block: utilities with named consumers
  { title: 'Add lib/useProgress.ts used by AgentRPGStats component',                     mustBlock: false },

  // ── Must-NOT-block — known good tasks ─────────────────────────────────
  { title: 'Add a CreditBalance pill in the header',                 mustBlock: false },
  { title: 'Query todos LIMIT 10 for the inbox',                     mustBlock: false },
  { title: 'Create app/api/health/route.ts',                         mustBlock: false },
  { title: 'Update README with ELEVENLABS_API_KEY setup',            mustBlock: false },
  { title: 'Fix type error in components/TaskKanban.tsx',            mustBlock: false },
  { title: 'Add test for priority ordering',                         mustBlock: false },
  { title: '[CURIOSITY] Add sms-alerts env doc to README.md',        mustBlock: false },
  { title: '[CURIOSITY] Write a 10-line helper in lib/format-bytes.ts', mustBlock: false },
]

let pass = 0, fail = 0
for (const c of CASES) {
  const matchedBy = PATTERNS.find(p => p.test(c.title.toLowerCase()))
  const blocked = Boolean(matchedBy)
  const ok = blocked === c.mustBlock
  if (ok) {
    pass++
    process.stdout.write(`  ✓ ${c.mustBlock ? 'blocks' : 'allows'}: ${c.title.slice(0, 70)}\n`)
  } else {
    fail++
    process.stdout.write(`  ✕ ${c.mustBlock ? 'SHOULD block' : 'SHOULD allow'}: ${c.title.slice(0, 70)}\n`)
    if (matchedBy) process.stdout.write(`       matched by: ${matchedBy.source}\n`)
  }
}

console.log('')
console.log(`Patterns: ${PATTERNS.length} · cases: ${CASES.length} · pass: ${pass} · fail: ${fail}`)
if (fail > 0) process.exit(1)
process.exit(0)
