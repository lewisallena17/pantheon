// scripts/lib-observations.mjs
//
// Observational memory (Mastra pattern): captures non-obvious facts an agent
// noticed *during* tool use — separate from the "lesson learned" bucket which
// only records outcomes. Observations are incidental:
//   • "the todos.metadata column also stores quality_score"
//   • "agent_exec_sql enforces LIMIT 10000 by default"
//   • "the staging env has SUPABASE_URL override via middleware"
//
// These are surfaced to future agents as ambient context — cheaper than
// full RAG but richer than outcome-only lessons.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const MAX_OBSERVATIONS = 40
const MIN_LENGTH       = 20
const MAX_LENGTH       = 240

export function observationsPath(agentMemoryDir) {
  return join(agentMemoryDir, 'observations.json')
}

export function loadObservations(agentMemoryDir) {
  const p = observationsPath(agentMemoryDir)
  try { if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')) } catch {}
  return { observations: [] }
}

export function saveObservations(agentMemoryDir, state) {
  const p = observationsPath(agentMemoryDir)
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true })
  try { writeFileSync(p, JSON.stringify(state, null, 2), 'utf8') } catch {}
}

/**
 * Heuristic extractor — scans tool_result content for observation-shaped text.
 * Looks for "I noticed", "Interestingly", "Note:", "observed", and factual
 * one-liners with domain keywords (column, table, env var, flag).
 */
export function extractObservations(toolResultText) {
  const results = []
  if (!toolResultText || typeof toolResultText !== 'string') return results
  const text = toolResultText.slice(0, 3000)

  const patterns = [
    /(?:I\s+noticed|I\s+observed|Interestingly|It\s+seems?|Note(?:d)?:?|Apparently)\s+([^.!?\n]+[.!?])/gi,
    /(?:Unexpectedly|Surprisingly|Oddly)\s+([^.!?\n]+[.!?])/gi,
  ]
  for (const pat of patterns) {
    for (const m of text.matchAll(pat)) {
      const obs = m[1].trim()
      if (obs.length >= MIN_LENGTH && obs.length <= MAX_LENGTH) {
        results.push(obs)
      }
    }
  }

  // Also: factual standalone sentences with schema/infra keywords
  const keywords = /\b(column|table|schema|env(ironment)?\s+var|flag|middleware|rpc|migration|hook|tool_choice|system\s+prompt|cache_control)\b/i
  for (const sentence of text.split(/[.!?]\s+/)) {
    const s = sentence.trim()
    if (s.length >= MIN_LENGTH && s.length <= MAX_LENGTH && keywords.test(s)) {
      results.push(s + '.')
    }
  }

  // Dedupe
  return [...new Set(results)].slice(0, 4)
}

export function publishObservations(agentMemoryDir, observations, { agentName } = {}) {
  if (!observations || !observations.length) return
  const state = loadObservations(agentMemoryDir)
  const existing = new Set(state.observations.map(o => o.text.toLowerCase()))
  const fresh = observations
    .filter(o => typeof o === 'string' && o.length >= MIN_LENGTH)
    .filter(o => !existing.has(o.toLowerCase()))
    .map(text => ({ text, at: new Date().toISOString(), by: agentName ?? null }))

  if (!fresh.length) return
  state.observations = [...state.observations, ...fresh].slice(-MAX_OBSERVATIONS)
  saveObservations(agentMemoryDir, state)
}

/** Format observations as a system-prompt bullet block. */
export function observationsForPrompt(agentMemoryDir, limit = 6) {
  const { observations } = loadObservations(agentMemoryDir)
  if (!observations.length) return ''
  const recent = observations.slice(-limit)
  return 'Ambient observations from recent tasks:\n' + recent.map(o => `  · ${o.text}`).join('\n')
}
