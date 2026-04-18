#!/usr/bin/env node
/**
 * Appends a subscribe/product CTA to every published dev.to article.
 * Idempotent — won't double-append if the CTA marker is already present.
 *
 * Usage:
 *   SUBSCRIBE_URL=https://your.vercel.app/subscribe node scripts/update-devto-cta.mjs
 *   (falls back to http://localhost:3000/subscribe for local testing)
 *
 *   GUMROAD_URL=https://... optionally injects the product link too
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// Load .env.local
for (const line of readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const KEY          = process.env.DEV_TO_API_KEY
const SUBSCRIBE_URL = process.env.SUBSCRIBE_URL ?? 'http://localhost:3000/subscribe'
const GUMROAD_URL   = process.env.GUMROAD_URL

if (!KEY) {
  console.error('✗ DEV_TO_API_KEY not set in .env.local')
  process.exit(1)
}

// Sentinel line — looked for to detect already-appended CTA and avoid duplicates.
// Changing the version bumps ALL articles to the new CTA on next run.
const CTA_MARKER = '<!-- cta:subscribe-v2 -->'

function buildCta() {
  const lines = [
    '',
    '---',
    '',
    CTA_MARKER,
    '## 💌 Like this? Get notified when I ship the next thing',
    '',
    'I build and ship autonomous AI agents in public. Occasional updates, no spam.',
    '',
    `👉 **[Subscribe for updates](${SUBSCRIBE_URL})**`,
  ]
  if (GUMROAD_URL) {
    lines.push('')
    lines.push(`Or grab the full open-source dashboard: **[Autonomous AI Task Dashboard](${GUMROAD_URL})** — Next.js + Supabase + Claude starter kit, $39.`)
  }
  return lines.join('\n')
}

async function fetchArticles() {
  const r = await fetch('https://dev.to/api/articles/me/published?per_page=100', {
    headers: { 'api-key': KEY },
  })
  if (!r.ok) throw new Error(`GET /articles/me/published → ${r.status}: ${await r.text()}`)
  return r.json()
}

async function getArticle(id) {
  // /me endpoint truncates body_markdown on list view — need to fetch full
  const r = await fetch(`https://dev.to/api/articles/${id}`, {
    headers: { 'api-key': KEY },
  })
  if (!r.ok) throw new Error(`GET /articles/${id} → ${r.status}`)
  return r.json()
}

async function updateArticle(id, newBody) {
  const r = await fetch(`https://dev.to/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'api-key':      KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ article: { body_markdown: newBody } }),
  })
  if (!r.ok) throw new Error(`PUT /articles/${id} → ${r.status}: ${await r.text()}`)
  return r.json()
}

console.log(`▸ Fetching published articles…`)
const articles = await fetchArticles()
console.log(`  Found ${articles.length}\n`)

const cta = buildCta()

for (const a of articles) {
  console.log(`  #${a.id} · ${a.title.slice(0, 60)}`)
  const full = await getArticle(a.id)
  const body = full.body_markdown ?? ''

  if (body.includes(CTA_MARKER)) {
    console.log(`     skip — CTA already present`)
    continue
  }

  const newBody = body.trimEnd() + '\n' + cta + '\n'
  try {
    await updateArticle(a.id, newBody)
    console.log(`     ✓ CTA appended — ${a.url}`)
  } catch (e) {
    console.log(`     ✗ ${e.message}`)
  }

  // dev.to rate-limit: be polite
  await new Promise(r => setTimeout(r, 1500))
}

console.log(`\n🎉 Done. Subscribe link: ${SUBSCRIBE_URL}`)
if (!GUMROAD_URL) {
  console.log('(tip: re-run with GUMROAD_URL=... to add the product link too)')
}
