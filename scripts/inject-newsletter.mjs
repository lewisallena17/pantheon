#!/usr/bin/env node
// Adds <NewsletterSignup /> to every topic page (idempotent).
// Renders right after the inline KitCTA so the page reads:
//   article body → KitCTA banner → DisplayAd → KitCTA inline → NewsletterSignup → rest

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..', 'app', 'topics')

const slugs = readdirSync(ROOT).filter(s => {
  try { return statSync(join(ROOT, s)).isDirectory() } catch { return false }
})

let touched = 0, skipped = 0, missing = 0
for (const slug of slugs) {
  const path = join(ROOT, slug, 'page.tsx')
  let src
  try { src = readFileSync(path, 'utf8') } catch { continue }

  if (src.includes("from '@/components/NewsletterSignup'")) { skipped++; continue }

  const importAnchor = /import KitCTA from '@\/components\/KitCTA'\r?\n/
  if (!importAnchor.test(src)) { missing++; continue }
  src = src.replace(importAnchor, m => m + "import NewsletterSignup from '@/components/NewsletterSignup'\n")

  // Place after the inline KitCTA (`variant="inline"`)
  src = src.replace(
    /<KitCTA variant="inline" \/>/,
    '<KitCTA variant="inline" />\n\n        <NewsletterSignup source={`topic:' + slug + '`} />',
  )

  writeFileSync(path, src)
  touched++
}

console.log(`Done. Touched ${touched}, skipped ${skipped}${missing ? `, missing-pattern ${missing}` : ''}.`)
