// scripts/lib-llm.mjs
//
// LLM provider abstraction with automatic fallback. Primary: Anthropic Claude.
// Fallback: local Ollama (free, no credits needed).
//
// When Anthropic returns credit-low / 429, or is otherwise unhealthy, calls
// route to Ollama at http://localhost:11434 using a model set by
// `OLLAMA_FALLBACK_MODEL` (default: llama3.2:3b — ~2GB download).
//
// If Ollama is unreachable too, we propagate the original error instead of
// silently returning null — callers need to know.
//
// Instrumentation lessons encoded:
//   "Never assume response delays without measuring timestamp deltas."
//   "Don't assume performance—measure timestamps between each phase."
//   "Don't assume performance problems—measure first-token latency and response depth."
//   "Distributed timestamps across layers catch cascading latency faster than aggregation."
//   "SLO thresholds convert abstract performance into concrete, actionable alerts."

import { logResponseWordCount, countWords } from './debug.mjs'

const OLLAMA_URL   = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'llama3.2:3b'
const FALLBACK_COOLDOWN_MS = 30 * 60_000  // once we fail over, stay on Ollama for 30 min

// ── First-token latency SLOs ────────────────────────────────────────────────
// Emit a warning when a call exceeds these bounds. Values are deliberately
// generous (not tight) so only genuinely slow calls surface.
// Lesson: "SLO thresholds convert abstract performance into concrete, actionable alerts."
const LLM_SLO_MS = {
  'haiku':  { call: 15_000, warn: 8_000 },   // haiku should respond within 15s; warn at 8s
  'sonnet': { call: 30_000, warn: 15_000 },  // sonnet can be slower
  'opus':   { call: 60_000, warn: 30_000 },  // opus is slow by design
}

let inFallback    = false
let fallbackSince = 0

export function isInFallback() {
  if (inFallback && Date.now() - fallbackSince > FALLBACK_COOLDOWN_MS) {
    inFallback = false
    console.log('[LLM] fallback cooldown expired — trying Anthropic again')
  }
  return inFallback
}

export function forceFallback(reason) {
  if (!inFallback) {
    inFallback = true
    fallbackSince = Date.now()
    console.log(`[LLM] ⇄ falling back to Ollama — ${reason}`)
  }
}

function isCreditOrRateError(err) {
  const msg = String(err?.message ?? '')
  if (err?.status === 429) return true
  if (/credit|balance.*low|rate_limit|quota/i.test(msg)) return true
  return false
}

async function ollamaCall({ prompt, system, maxTokens = 800 }) {
  const r = await fetch(`${OLLAMA_URL}/api/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      model:  OLLAMA_MODEL,
      prompt: system ? `${system}\n\n${prompt}` : prompt,
      stream: false,
      options: { num_predict: maxTokens },
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!r.ok) throw new Error(`ollama HTTP ${r.status}`)
  const data = await r.json()
  return data.response ?? ''
}

/**
 * Measure and log LLM call latency with SLO thresholds.
 *
 * Emits structured log lines at three points:
 *   [LLM-LATENCY] pre-call  — wall-clock timestamp just before the API call
 *   [LLM-LATENCY] response  — ms elapsed to receive the full response
 *   [LLM-LATENCY] SLO BREACH — if elapsed > SLO warn threshold
 *
 * This gives distributed timestamps across the call so cascading latency
 * (slow Anthropic vs. slow tool execution) can be attributed correctly.
 *
 * Lesson: "Never assume response delays without measuring timestamp deltas."
 * Lesson: "Don't assume performance problems—measure first-token latency and response depth."
 *
 * @param {string} modelKey  — 'haiku' | 'sonnet' | 'opus'
 * @param {string} provider  — 'anthropic' | 'ollama'
 * @param {Function} callFn  — async function to instrument
 * @returns {Promise<{ result: any, latencyMs: number, sloBreached: boolean }>}
 */
async function measureLlmCall(modelKey, provider, callFn) {
  const t0 = Date.now()
  const t0iso = new Date(t0).toISOString()
  console.log(`[LLM-LATENCY] pre-call provider=${provider} model=${modelKey} ts=${t0iso}`)

  let result
  let threw = null
  try {
    result = await callFn()
  } catch (e) {
    threw = e
  }

  const latencyMs = Date.now() - t0
  const slo = LLM_SLO_MS[modelKey] ?? LLM_SLO_MS['sonnet']
  const sloBreached = latencyMs > slo.warn

  if (threw) {
    console.log(`[LLM-LATENCY] error provider=${provider} model=${modelKey} latency=${latencyMs}ms error=${threw.message?.slice(0, 80)}`)
    throw threw
  }

  if (sloBreached) {
    const severity = latencyMs > slo.call ? 'SLO BREACH' : 'SLO WARN'
    console.warn(`[LLM-LATENCY] ${severity} provider=${provider} model=${modelKey} latency=${latencyMs}ms (warn=${slo.warn}ms call=${slo.call}ms)`)
  } else {
    console.log(`[LLM-LATENCY] response provider=${provider} model=${modelKey} latency=${latencyMs}ms ✓`)
  }

  return { result, latencyMs, sloBreached }
}

/**
 * Primary entry point. Tries Anthropic; falls back to Ollama on credit/rate.
 *
 * Now instruments every call with timestamp deltas so latency is measurable
 * at the source rather than requiring aggregation to diagnose.
 *
 * @param {object} opts
 * @param {object} opts.anthropic — the Anthropic SDK client
 * @param {string} opts.prompt    — user prompt
 * @param {string} [opts.system]  — system message (used as prefix for Ollama)
 * @param {string} [opts.model]   — 'sonnet' | 'haiku' | 'opus' (Anthropic side)
 * @param {number} [opts.maxTokens]
 * @param {object} [opts.models]  — MODELS map ({ haiku: '...', sonnet: '...' })
 */
export async function askLLM({ anthropic, prompt, system, model = 'haiku', maxTokens = 800, models }) {
  if (isInFallback()) {
    try {
      const { result: text } = await measureLlmCall(model, 'ollama', () =>
        ollamaCall({ prompt, system, maxTokens })
      )
      return { text, provider: 'ollama', model: OLLAMA_MODEL }
    } catch (ollamaErr) {
      // Fallback is down too — reset and try Anthropic
      inFallback = false
      console.log('[LLM] Ollama fallback also failed, trying Anthropic again')
    }
  }

  try {
    const messages = [{ role: 'user', content: prompt }]
    const payload = {
      model:      models?.[model] ?? models?.haiku ?? 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages,
    }
    if (system) payload.system = system

    const { result: msg, latencyMs } = await measureLlmCall(model, 'anthropic', () =>
      anthropic.messages.create(payload)
    )

    const text = msg.content.find(b => b.type === 'text')?.text ?? ''

    // Log response depth so shallow/empty replies are immediately visible
    // Lesson: "Don't assume performance problems—measure first-token latency and response depth."
    const wordCount = countWords(text)
    if (wordCount < 5 && maxTokens > 100) {
      console.warn(`[LLM-DEPTH] shallow response: ${wordCount} words for maxTokens=${maxTokens} model=${model} latency=${latencyMs}ms`)
    }

    return { text, provider: 'anthropic', model: payload.model, usage: msg.usage, latencyMs }
  } catch (err) {
    if (isCreditOrRateError(err)) {
      forceFallback(`Anthropic ${err.status ?? 'error'}: ${err.message?.slice(0, 80)}`)
      try {
        const { result: text } = await measureLlmCall(model, 'ollama', () =>
          ollamaCall({ prompt, system, maxTokens })
        )
        return { text, provider: 'ollama', model: OLLAMA_MODEL, fallbackReason: err.message?.slice(0, 120) }
      } catch (ollamaErr) {
        // Both down — throw original Anthropic error so caller sees credit issue
        throw err
      }
    }
    throw err
  }
}

/** Health ping — used by the /api/health endpoint and the UI provider pill. */
export async function ollamaHealth() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(2500) })
    if (!r.ok) return { ok: false, reason: `HTTP ${r.status}` }
    const data = await r.json()
    const models = (data.models ?? []).map(m => m.name)
    const hasTarget = models.includes(OLLAMA_MODEL)
    return { ok: true, models, targetAvailable: hasTarget, targetModel: OLLAMA_MODEL }
  } catch (e) {
    return { ok: false, reason: e.message?.slice(0, 80) ?? 'unreachable' }
  }
}
