// scripts/lib-verify.mjs
//
// Output verification helpers — for every autonomous action the agents claim
// succeeded, fetch or inspect the real artifact to confirm it actually exists
// and has the expected shape. Catches "silent success" bugs like:
//   • revenue agent reports "published to dev.to" but the URL 404s
//   • seo-topic-generator writes a page but the HTML is malformed
//   • autoCommit returns a SHA but the commit isn't in git log
//
// Verifications are logged to scripts/verification-log.json with a rolling
// 200-entry history. Dashboard reads this to flag agents that ship broken
// artifacts. Each verification is non-blocking (fire-and-forget) so a slow
// or failing fetch never stalls the pipeline.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'

const LOG_MAX   = 200
const TIMEOUT   = 15_000

function nowIso() { return new Date().toISOString() }

function logPath(projectRoot) {
  return join(projectRoot, 'scripts', 'verification-log.json')
}

export function loadLog(projectRoot) {
  const p = logPath(projectRoot)
  try { if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')) } catch {}
  return { entries: [] }
}

export function appendLog(projectRoot, entry) {
  const p = logPath(projectRoot)
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true })
  const log = loadLog(projectRoot)
  log.entries = [...(log.entries ?? []).slice(-(LOG_MAX - 1)), { at: nowIso(), ...entry }]
  try { writeFileSync(p, JSON.stringify(log, null, 2), 'utf8') } catch {}
}

// ── URL verification (dev.to, arbitrary pages) ────────────────────────────
/**
 * @param {string} url
 * @param {object} [opts]
 * @param {string[]} [opts.mustContain]       — substrings that must all appear in body
 * @param {string[]} [opts.mustNotContain]    — substrings that must NOT appear
 * @param {number}   [opts.minBytes]          — response body minimum size
 * @returns {Promise<{ ok: boolean, status: number, bytes: number, missing?: string[], detail?: string }>}
 */
export async function verifyUrl(url, opts = {}) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), redirect: 'follow' })
    const body = await r.text()
    const bytes = body.length

    if (!r.ok) return { ok: false, status: r.status, bytes, detail: `HTTP ${r.status}` }
    if (opts.minBytes && bytes < opts.minBytes) {
      return { ok: false, status: r.status, bytes, detail: `body only ${bytes} bytes (expected ≥${opts.minBytes})` }
    }
    const missing = (opts.mustContain ?? []).filter(s => !body.includes(s))
    if (missing.length) return { ok: false, status: r.status, bytes, missing, detail: `missing: ${missing.slice(0, 2).join(', ')}` }
    if (opts.mustNotContain) {
      const contraband = opts.mustNotContain.filter(s => body.includes(s))
      if (contraband.length) return { ok: false, status: r.status, bytes, detail: `contained forbidden: ${contraband[0]}` }
    }
    return { ok: true, status: r.status, bytes }
  } catch (e) {
    return { ok: false, status: 0, bytes: 0, detail: e.message?.slice(0, 120) ?? 'fetch-failed' }
  }
}

// ── HTML file structure verification (local SEO pages) ────────────────────
/**
 * Checks a generated topic page .tsx source for expected elements.
 * Cheap substring check — we're not trying to actually render JSX here,
 * just confirm the agent didn't write an empty or corrupted file.
 */
export function verifyTsxPage(filePath, opts = {}) {
  try {
    if (!existsSync(filePath)) return { ok: false, detail: 'file missing' }
    const src = readFileSync(filePath, 'utf8')
    const required = [
      'export const metadata',
      'export default function',
      'title:',
      '<main',
      '</main>',
      ...(opts.mustContain ?? []),
    ]
    const missing = required.filter(s => !src.includes(s))
    if (missing.length) return { ok: false, bytes: src.length, missing, detail: `missing: ${missing.slice(0, 2).join(', ')}` }
    if (src.length < 600) return { ok: false, bytes: src.length, detail: `file too short (${src.length} bytes)` }
    return { ok: true, bytes: src.length }
  } catch (e) {
    return { ok: false, detail: e.message?.slice(0, 120) }
  }
}

// ── Git commit verification (confirms auto-commit SHA landed) ─────────────
export function verifyGitCommit(sha, projectRoot) {
  if (!sha) return { ok: false, detail: 'no sha provided' }
  try {
    const short = sha.replace(/^['"]|['"]$/g, '').slice(0, 40)
    const out = execSync(`git cat-file -e ${short} && git log -1 --format=%H ${short}`, {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 5_000,
    }).trim()
    if (!out) return { ok: false, detail: 'commit not found' }
    return { ok: true, fullSha: out }
  } catch (e) {
    return { ok: false, detail: e.message?.slice(0, 120) ?? 'git lookup failed' }
  }
}

// ── Convenience wrappers — fire-and-forget log helpers ────────────────────
/**
 * Non-blocking verifier — runs the check, logs the outcome. Returns the
 * verification promise (callers usually ignore it). Use:
 *
 *   verifyAndLog(projectRoot, 'devto-post', () => verifyUrl(url, { mustContain: [title] }), { url, title, taskId })
 */
export async function verifyAndLog(projectRoot, kind, runner, context = {}) {
  try {
    const result = await runner()
    appendLog(projectRoot, { kind, ok: result.ok, detail: result.detail, context, ...result })
    if (!result.ok) {
      console.log(`[VERIFY] ✕ ${kind}: ${result.detail ?? 'failed'} · ${JSON.stringify(context).slice(0, 120)}`)
    } else {
      console.log(`[VERIFY] ✓ ${kind} · ${JSON.stringify(context).slice(0, 80)}`)
    }
    return result
  } catch (e) {
    const detail = e.message?.slice(0, 120) ?? 'verification-threw'
    appendLog(projectRoot, { kind, ok: false, detail, context })
    console.log(`[VERIFY] ✕ ${kind}: ${detail}`)
    return { ok: false, detail }
  }
}
