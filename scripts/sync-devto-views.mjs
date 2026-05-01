#!/usr/bin/env node
// Standalone view-sync. Pulls dev.to stats for every published post and
// writes them back to revenue-log.json. Safe to run any time — no LLM calls,
// no posting, no side effects beyond the JSON file.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH  = join(__dirname, 'revenue-log.json')
const ENV_PATH  = join(__dirname, '..', '.env.local')

// Tiny .env loader so this works without dotenv as a dependency.
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}

const KEY = process.env.DEV_TO_API_KEY
const EARN_PER_1K_VIEWS = 0.80

if (!KEY) {
  console.error('DEV_TO_API_KEY not set — aborting'); process.exit(1)
}
if (!existsSync(LOG_PATH)) {
  console.error('revenue-log.json missing — aborting'); process.exit(1)
}

const log   = JSON.parse(readFileSync(LOG_PATH, 'utf8'))
const posts = log.posts ?? []

console.log(`Syncing ${posts.length} dev.to posts…`)

let synced = 0, skipped = 0, totalViews = 0
for (const p of posts) {
  if (!p.devToId) { skipped++; continue }
  try {
    const res = await fetch(`https://dev.to/api/articles/${p.devToId}`, {
      headers: { 'api-key': KEY },
      signal:  AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      console.log(`  ✗ ${p.title.slice(0, 60)} → HTTP ${res.status}`)
      continue
    }
    const data = await res.json()
    const before = p.views ?? 0
    p.views          = data.page_views_count ?? 0
    p.reactions      = data.public_reactions_count ?? 0
    p.comments       = data.comments_count ?? 0
    p.estimatedEarns = (p.views / 1000) * EARN_PER_1K_VIEWS
    totalViews      += p.views
    const delta = p.views - before
    console.log(`  ✓ ${p.title.slice(0, 50).padEnd(50)} views=${p.views}${delta ? ` (+${delta})` : ''} reactions=${p.reactions} comments=${p.comments}`)
    synced++
  } catch (e) {
    console.log(`  ✗ ${p.title.slice(0, 60)} → ${e.message}`)
  }
}

log.totalEstimatedViews    = totalViews
log.totalEstimatedEarnings = posts.reduce((s, p) => s + (p.estimatedEarns ?? 0), 0)
log.lastUpdated            = new Date().toISOString()
writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))

console.log(`\nDone. Synced ${synced}, skipped ${skipped}.`)
console.log(`Total views: ${totalViews}  ·  Estimated earnings: $${log.totalEstimatedEarnings.toFixed(4)}`)
