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

import { logResponseWordCount, countWords } from './debug.mjs'

const OLLAMA_URL   = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'llama3.2:3b'
const FALLBACK_COOLDOWN_MS = 30 * 60_000  // once we fail over, stay on Ollama for 30 min

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
 * Primary entry point. Tries Anthropic; falls back to Ollama on credit/rate.
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
      const text = await ollamaCall({ prompt, system, maxTokens })
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

    const msg = await anthropic.messages.create(payload)
    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    return { text, provider: 'anthropic', model: payload.model, usage: msg.usage }
  } catch (err) {
    if (isCreditOrRateError(err)) {
      forceFallback(`Anthropic ${err.status ?? 'error'}: ${err.message?.slice(0, 80)}`)
      try {
        const text = await ollamaCall({ prompt, system, maxTokens })
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
