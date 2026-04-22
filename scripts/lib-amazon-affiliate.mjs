// scripts/lib-amazon-affiliate.mjs
//
// Amazon Associates auto-linker. Detects mentions of hardware, books, or
// developer products in topic-page content and wraps them with Amazon search
// links tagged with the user's AMAZON_ASSOCIATE_TAG.
//
// Why Amazon specifically: it's the only affiliate network with (a) a
// self-service universal sign-up, (b) a stable link format that doesn't
// break, and (c) cookie attribution on first click — no per-product API.
//
// We link to /s?k= search URLs rather than specific product IDs because
// ASINs change. Amazon's search redirect is stable.

const TAG = process.env.AMAZON_ASSOCIATE_TAG || ''
const TLD = process.env.AMAZON_TLD || 'com'

// Curated keywords → search queries. Conservative — only terms where someone
// reading a technical article MIGHT want to buy something. Not spammy.
const LINK_RULES = [
  // Hardware / dev setup
  { match: /\bmechanical keyboard/i,     query: 'mechanical keyboard developer' },
  { match: /\bmonitor(?:s)?\b/i,         query: 'ultrawide monitor 34 inch', onlyFirst: true },
  { match: /\brazer|\blogitech|\bkeychron/i, query: '', useMatch: true },
  { match: /\braspberry\s+pi/i,          query: 'raspberry pi 5 8gb' },
  { match: /\bmac\s*(?:book|mini)\b/i,   query: 'macbook air m3', onlyFirst: true },

  // Books / reference
  { match: /\bdesigning\s+data[- ]intensive/i, query: 'designing data intensive applications book' },
  { match: /\bdesign\s+patterns(?:\s+book)?/i, query: 'design patterns gang of four book' },
  { match: /\bdeep\s+work\b/i,                 query: 'deep work cal newport' },
  { match: /\bclean\s+code\b/i,                query: 'clean code robert martin' },
  { match: /\bpragmatic\s+programmer/i,        query: 'pragmatic programmer book' },

  // Software that often has an affiliate product
  { match: /\bnotion\s+template/i,       query: 'notion for developers book' },
  { match: /\bnoise[- ]?cancel(?:ling|l?ing)/i, query: 'noise cancelling headphones' },

  // Home office
  { match: /\bstanding\s+desk/i,         query: 'standing desk' },
  { match: /\bwebcam\b/i,                query: 'logitech webcam 4k' },
  { match: /\busb[- ]c\s+hub/i,          query: 'usb-c hub' },
]

const MAX_LINKS_PER_PAGE = 3

export function isEnabled() {
  return Boolean(TAG)
}

function amazonSearchUrl(query) {
  const encoded = encodeURIComponent(query)
  if (!TAG) return `https://www.amazon.${TLD}/s?k=${encoded}`
  return `https://www.amazon.${TLD}/s?k=${encoded}&tag=${TAG}`
}

/**
 * Inject Amazon affiliate links into plain text content. Returns the modified
 * text + count of links inserted. Each keyword rule is applied at most once
 * per page (injecting 5 identical product links would be spammy).
 */
export function injectAmazonLinks(text) {
  if (!isEnabled() || !text || typeof text !== 'string') return { text, count: 0 }

  let modified = text
  let count = 0
  const seenKeys = new Set()

  for (const rule of LINK_RULES) {
    if (count >= MAX_LINKS_PER_PAGE) break
    const match = modified.match(rule.match)
    if (!match) continue
    const ruleKey = rule.query || match[0].toLowerCase()
    if (seenKeys.has(ruleKey)) continue
    seenKeys.add(ruleKey)

    const phrase = match[0]
    const query  = rule.useMatch ? phrase : rule.query
    if (!query) continue
    const url = amazonSearchUrl(query)
    const link = `[${phrase}](${url} "Amazon — affiliate")`

    // Replace only the first occurrence so we don't over-link
    modified = modified.replace(phrase, link)
    count++
  }

  return { text: modified, count }
}

/** For JSX contexts — returns HTML anchor string instead of markdown. */
export function amazonAnchor(phrase, query) {
  const q = query || phrase
  return `<a href="${amazonSearchUrl(q)}" target="_blank" rel="noopener noreferrer sponsored" class="text-amber-400 hover:underline">${phrase}</a>`
}

/** Returns a small "as an Amazon Associate..." disclosure block — FTC compliance. */
export function disclosureHtml() {
  if (!isEnabled()) return ''
  return `<p class="text-[10px] font-mono text-slate-600 mt-8 pt-4 border-t border-slate-800/40">As an Amazon Associate, pantheon earns from qualifying purchases. This does not affect what the agent writes.</p>`
}
