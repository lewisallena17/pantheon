#!/usr/bin/env node
// Bulk-inject DisplayAd + AmazonGeoSwap into every topic page that's missing
// them. Idempotent — pages that already have the imports are skipped.
//
// Pattern (matches the 5 already-monetized pages):
//   import DisplayAd from '@/components/DisplayAd'
//   import AmazonGeoSwap from '@/components/AmazonGeoSwap'
//   ...
//   <main>
//     <AmazonGeoSwap />
//     <article>
//       ...lead paragraph...
//       <DisplayAd slot="topic-top" format="auto" className="my-6" />
//       ...sections...
//       <DisplayAd slot="topic-mid" format="auto" className="my-8" />
//       ...rest...

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..', 'app', 'topics')

const slugs = readdirSync(ROOT).filter(s => {
  try { return statSync(join(ROOT, s)).isDirectory() } catch { return false }
})

let touched = 0, skipped = 0, missingMain = 0

for (const slug of slugs) {
  const path = join(ROOT, slug, 'page.tsx')
  let src
  try { src = readFileSync(path, 'utf8') } catch { continue }

  if (src.includes("from '@/components/DisplayAd'") &&
      src.includes("from '@/components/AmazonGeoSwap'")) {
    skipped++; continue
  }

  // 1. Inject imports right after the existing `import Link` line (or after
  //    the metadata-related imports if Link isn't present).
  const importAnchor = /import Link from 'next\/link'\r?\n/
  if (!importAnchor.test(src)) { missingMain++; continue }
  src = src.replace(importAnchor, m =>
    m +
    "import DisplayAd from '@/components/DisplayAd'\n" +
    "import AmazonGeoSwap from '@/components/AmazonGeoSwap'\n",
  )

  // 2. Inject <AmazonGeoSwap /> as the first child of <main>.
  const mainOpen = /<main className="min-h-screen[^"]*">\s*\r?\n/
  if (!mainOpen.test(src)) { missingMain++; continue }
  src = src.replace(mainOpen, m => m + '      <AmazonGeoSwap />\n')

  // 3. Top display ad — after the lead paragraph (first <p> inside <article>).
  //    Matches: `<p ...>{`...`}</p>` or `<p>...</p>` and inserts after the close.
  const leadParagraph = /(<article[\s\S]*?<p [\s\S]*?<\/p>\s*\n)/
  if (leadParagraph.test(src)) {
    src = src.replace(leadParagraph, m =>
      m + '\n        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}\n        <DisplayAd slot="topic-top" format="auto" className="my-6" />\n',
    )
  }

  // 4. Mid-article ad — after the FIRST </section> in the file. Most topic
  //    pages have several sections; one mid-content slot is enough.
  const firstSectionClose = /<\/section>\s*\r?\n\s*<section/
  if (firstSectionClose.test(src)) {
    src = src.replace(firstSectionClose,
      '</section>\n\n        <DisplayAd slot="topic-mid" format="auto" className="my-8" />\n\n        <section',
    )
  }

  writeFileSync(path, src)
  console.log(`  ✓ injected: ${slug}`)
  touched++
}

console.log(`\nDone. Touched ${touched}, skipped ${skipped}${missingMain ? `, no-main pattern: ${missingMain}` : ''}.`)
