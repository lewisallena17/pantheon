#!/usr/bin/env node
// Injects KitCTA into every topic page that doesn't already have it.
// Banner variant after the lead paragraph + AmazonGeoSwap, inline variant
// after the last <DisplayAd>.

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

  if (src.includes("from '@/components/KitCTA'")) { skipped++; continue }

  // 1. Inject the import beside DisplayAd's import (CRLF-safe).
  const importAnchor = /import DisplayAd from '@\/components\/DisplayAd'\r?\n/
  if (!importAnchor.test(src)) { missing++; continue }
  src = src.replace(importAnchor, m => m + "import KitCTA from '@/components/KitCTA'\n")

  // 2. Banner variant — replace the existing top DisplayAd with KitCTA banner
  //    + DisplayAd. Above-the-fold real estate is the highest-leverage place
  //    for a paid CTA.
  src = src.replace(
    /<DisplayAd slot="topic-top" format="auto" className="my-6" \/>/,
    '<KitCTA variant="banner" />\n        <DisplayAd slot="topic-top" format="auto" className="my-6" />',
  )

  // 3. Inline variant — append after the mid display ad as a softer second CTA.
  src = src.replace(
    /<DisplayAd slot="topic-mid" format="auto" className="my-8" \/>/,
    '<DisplayAd slot="topic-mid" format="auto" className="my-8" />\n\n        <KitCTA variant="inline" />',
  )

  writeFileSync(path, src)
  console.log(`  ✓ ${slug}`)
  touched++
}

console.log(`\nDone. Touched ${touched}, skipped ${skipped}${missing ? `, missing-pattern ${missing}` : ''}.`)
