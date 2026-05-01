#!/usr/bin/env node
// One-shot: submit every existing topic page to IndexNow so search engines
// re-crawl them after the monetization + Kit-CTA injection.

import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pingIndexNow } from './indexnow.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ENV_PATH  = join(__dirname, '..', '.env.local')
if (existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}

const TOPICS_DIR = join(__dirname, '..', 'app', 'topics')
const SITE       = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://task-dashboard-sigma-three.vercel.app'

const slugs = readdirSync(TOPICS_DIR).filter(s => {
  try { return statSync(join(TOPICS_DIR, s)).isDirectory() } catch { return false }
})

// Plus the static landing pages
const urls = [
  `${SITE}/`,
  `${SITE}/topics`,
  `${SITE}/subscribe`,
  ...slugs.map(s => `${SITE}/topics/${s}`),
]

console.log(`Submitting ${urls.length} URLs to IndexNow…`)
// IndexNow allows up to 10,000 URLs in one POST; we're well under.
const ok = await pingIndexNow(urls)
console.log(ok ? 'Done. Bing/Yandex/Google will re-crawl.' : 'Submission failed — check the log line above.')
