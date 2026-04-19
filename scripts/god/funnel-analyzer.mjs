// god/funnel-analyzer.mjs
//
// Every 15 cycles, God pulls together the funnel data you actually have
// access to and figures out where conversion is leaking. Output feeds into
// listing-optimizer + suggests which step of the funnel to fix next.
//
// Signals currently available:
//   1. dev.to article views / reactions / comments (via dev.to API)
//   2. /subscribe signups (Supabase subscribers table)
//   3. SEO topic pages count (filesystem)
//   4. Gumroad sales count (revenue-log.json if populated)
//
// Signals NOT available (Gumroad doesn't expose via public API):
//   - Product page views
//   - Click-through rate from listing to checkout
//   - Refund rate
//
// So the analysis is approximate — comparing top-of-funnel (traffic proxies)
// to bottom-of-funnel (subscribers, known sales).

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

async function devToStats(apiKey) {
  if (!apiKey) return null
  try {
    const r = await fetch('https://dev.to/api/articles/me/published?per_page=30', {
      headers: { 'api-key': apiKey },
      signal: AbortSignal.timeout(10_000),
    })
    if (!r.ok) return null
    const arr = await r.json()
    return {
      articles:  arr.length,
      views:     arr.reduce((s, a) => s + (a.page_views_count || 0), 0),
      reactions: arr.reduce((s, a) => s + (a.public_reactions_count || 0), 0),
      comments:  arr.reduce((s, a) => s + (a.comments_count || 0), 0),
    }
  } catch { return null }
}

async function subscriberCount(supabase) {
  if (!supabase) return { total: 0 }
  try {
    const { count } = await supabase
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
    return { total: count ?? 0 }
  } catch { return { total: 0 } }
}

function seoPageCount(projectRoot) {
  const dir = join(projectRoot, 'app', 'topics')
  if (!existsSync(dir)) return 0
  return readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).length
}

function revenueStats(projectRoot) {
  const path = join(projectRoot, 'scripts', 'revenue-log.json')
  if (!existsSync(path)) return { salesCount: 0, published: false }
  try {
    const log = JSON.parse(readFileSync(path, 'utf8'))
    // We don't have sales data via API — track whether a product is published
    // and whether Gumroad listings exist
    const gumroadLive = (log.gumroadProducts ?? []).some(p => p.publishedUrl)
    return {
      salesCount:   log.salesKnown ?? 0,   // updated manually when user reports
      published:    gumroadLive,
      articlesOwn:  (log.posts ?? []).length,
    }
  } catch { return { salesCount: 0, published: false } }
}

export async function runFunnelAnalysis({ anthropic, log = console, cycle, supabase, projectRoot, devToApiKey }) {
  log.log(`[GOD-FUNNEL] 📊 Analysing conversion funnel`)

  const [devto, subs, seoCount, rev] = await Promise.all([
    devToStats(devToApiKey),
    subscriberCount(supabase),
    Promise.resolve(seoPageCount(projectRoot)),
    Promise.resolve(revenueStats(projectRoot)),
  ])

  // Build funnel summary
  const devtoViews   = devto?.views ?? 0
  const devtoEng     = (devto?.reactions ?? 0) + (devto?.comments ?? 0)
  const subRate      = devtoViews > 0 ? (subs.total / devtoViews * 100) : 0
  const gumroadLive  = rev.published

  const summary = {
    at:     new Date().toISOString(),
    cycle,
    devto:        { articles: devto?.articles ?? 0, views: devtoViews, engagement: devtoEng },
    subscribers:  { total: subs.total, subRatePct: Number(subRate.toFixed(2)) },
    seoPages:     { count: seoCount, note: seoCount < 20 ? 'under 20 — still scaling' : seoCount < 60 ? 'scaling' : 'seed list exhausted' },
    gumroad:      { live: gumroadLive, knownSales: rev.salesCount },
  }

  // Have Claude identify the weakest funnel step + suggest one concrete fix
  const prompt = `You're analysing a digital-product sales funnel.

Data:
${JSON.stringify(summary, null, 2)}

The funnel is:
  dev.to article READER → /subscribe signup → Gumroad purchase

Questions to answer:
1. Where is the biggest leak? (low views, low subscribe rate, or low Gumroad conversion?)
2. What SPECIFIC, SMALL change would help? (e.g. "rewrite Gumroad title to emphasise X", "add new article about Y", "move subscribe CTA higher on topic pages")
3. Which specialist (db, ui, infra, analysis) should implement it?

Reply ONLY with JSON:
{
  "weakest_step": "top-of-funnel-traffic | subscribe-conversion | gumroad-conversion | unknown",
  "diagnosis":    "1-sentence explanation",
  "fix":          "one concrete action, under 120 chars",
  "category":     "db | ui | infra | analysis",
  "priority":     "low | medium | high"
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return { summary, diagnosis: null }
    const diagnosis = JSON.parse(match[0])

    log.log(`[GOD-FUNNEL] Weakest: ${diagnosis.weakest_step} — ${diagnosis.diagnosis}`)
    log.log(`[GOD-FUNNEL] 💡 Fix: ${diagnosis.fix}`)

    return { summary, diagnosis }
  } catch (e) {
    log.log(`[GOD-FUNNEL] diagnosis failed: ${e.message?.slice(0, 80)}`)
    return { summary, diagnosis: null }
  }
}
