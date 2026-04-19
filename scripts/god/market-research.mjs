// god/market-research.mjs
//
// Autonomous competitor research. Every 25 cycles, God:
//   1. Uses web search to find competitors in the "AI agent starter kit" niche
//   2. Fetches their landing pages / Gumroad listings
//   3. Extracts pricing, positioning, feature lists, proof points
//   4. Compares to own product (pantheon / task-dashboard)
//   5. Writes findings to wisdom.marketResearch
//
// No paid APIs. Uses the same Jina search + fetchUrl already wired in.
// Output is advisory — feeds into listing-optimizer which proposes concrete
// product-copy changes.

import Anthropic from '@anthropic-ai/sdk'

// Query families we cycle through — each cycle picks one
const RESEARCH_QUERIES = [
  'nextjs supabase claude ai agent starter kit gumroad',
  'autonomous ai agent dashboard open source',
  'ai agent boilerplate price comparison',
  'multi-agent orchestrator claude api',
  'self-improving ai agent system github',
  'best ai agent framework 2026 indie developer',
  'claude api agent starter template saas',
  'agent orchestration dashboard open source',
]

/**
 * Fetches a URL via the same Jina reader path ruflo uses.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
async function readUrl(url) {
  try {
    const r = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-No-Cache': 'true' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!r.ok) return null
    return (await r.text()).slice(0, 4000)
  } catch { return null }
}

/**
 * Web search via Jina
 */
async function webSearch(query) {
  try {
    const r = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(query)}`, {
      headers: { 'Accept': 'text/plain', 'X-No-Cache': 'true' },
      signal: AbortSignal.timeout(20_000),
    })
    if (!r.ok) return null
    return (await r.text()).slice(0, 6000)
  } catch { return null }
}

export async function runMarketResearch({ anthropic, log = console, cycle, ownProduct }) {
  const query = RESEARCH_QUERIES[cycle % RESEARCH_QUERIES.length]
  log.log(`[GOD-MARKET] 🔍 Researching: "${query}"`)

  const searchResults = await webSearch(query)
  if (!searchResults) {
    log.log(`[GOD-MARKET] search failed`)
    return null
  }

  // Have Claude distil the search results into structured competitor data
  const prompt = `You're doing market research for a product: "${ownProduct.name}" priced at \$${ownProduct.price}.

Below are web search results for competitors in the "AI agent starter kit / multi-agent orchestrator" niche.

Extract a JSON summary:
{
  "competitors": [
    {
      "name": "...",
      "url":  "...",
      "price": "e.g. '\$29 one-time' or 'free'",
      "positioning": "one-sentence pitch",
      "key_features": ["feature 1", "feature 2", "feature 3"],
      "differentiators": "what makes them unique"
    }
  ],
  "pricing_insights": "what's the price range in this category? Are we priced right?",
  "positioning_gaps": "what positioning angle is nobody else taking?",
  "suggested_changes": [
    "concrete, 1-sentence change to our listing. e.g. 'Emphasize the self-improving angle more in the title'",
    "..."
  ]
}

Only include competitors you can actually identify by name. Skip junk results. Max 5 competitors.

Search results:
${searchResults}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])

    log.log(`[GOD-MARKET] ✓ Found ${parsed.competitors?.length ?? 0} competitors`)
    if (parsed.suggested_changes?.length) {
      log.log(`[GOD-MARKET] 💡 ${parsed.suggested_changes[0]}`)
    }

    return {
      at:     new Date().toISOString(),
      cycle,
      query,
      ...parsed,
    }
  } catch (e) {
    log.log(`[GOD-MARKET] distill failed: ${e.message?.slice(0, 80)}`)
    return null
  }
}
