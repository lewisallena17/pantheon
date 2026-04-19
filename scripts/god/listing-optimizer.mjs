// god/listing-optimizer.mjs
//
// Every 40 cycles, God takes:
//   - the latest market research (what competitors do)
//   - the latest funnel analysis (where you're leaking)
//   - the current Gumroad listing copy
// and proposes a new listing: title, tagline, description, bullet points.
//
// Output saved to revenue-log.json under `pendingListingUpdates`. The
// dashboard's Revenue tab will surface it with "Copy & paste to Gumroad"
// and "Mark applied" buttons — takes you ~30 seconds.
//
// Keeps a history of up to 10 past proposals so you can see how God's
// thinking evolves.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

function loadRevenueLog(projectRoot) {
  const path = join(projectRoot, 'scripts', 'revenue-log.json')
  if (!existsSync(path)) return null
  try { return JSON.parse(readFileSync(path, 'utf8')) }
  catch { return null }
}

function saveRevenueLog(projectRoot, log) {
  const path = join(projectRoot, 'scripts', 'revenue-log.json')
  writeFileSync(path, JSON.stringify(log, null, 2), 'utf8')
}

export async function runListingOptimizer({ anthropic, log = console, cycle, projectRoot, marketResearch, funnelSummary }) {
  const revenueLog = loadRevenueLog(projectRoot)
  if (!revenueLog) {
    log.log('[GOD-LISTING] no revenue-log.json yet, skipping')
    return null
  }

  const current = revenueLog.gumroadProducts?.[0]
  if (!current) {
    log.log('[GOD-LISTING] no Gumroad product in revenue-log, skipping')
    return null
  }

  log.log('[GOD-LISTING] 📝 Optimising listing copy')

  const prompt = `You are a direct-response copywriter optimising a digital product listing for maximum conversion.

## Current listing
Product: ${current.name}
Price: \$${current.price}
Tagline: ${current.tagline}

Description:
${current.description.slice(0, 1200)}

## What we know about competitors
${marketResearch ? JSON.stringify({
  competitors:       (marketResearch.competitors ?? []).slice(0, 3),
  pricing_insights:  marketResearch.pricing_insights,
  positioning_gaps:  marketResearch.positioning_gaps,
}, null, 2) : '(no market research available yet)'}

## Funnel data
${funnelSummary ? JSON.stringify(funnelSummary, null, 2) : '(no funnel analysis available yet)'}

## Your job
Rewrite the listing to fix the weakest-performing funnel step. Specifically:
- If traffic is low: make the title more searchable + punchy
- If subscribe rate is low: no listing change (wrong layer), note that
- If Gumroad conversion is low (likely): tighter hook, clearer value, better objection handling

Output ONLY valid JSON:
{
  "rationale": "2 sentences: what you changed and why",
  "new_title": "max 60 chars",
  "new_tagline": "max 140 chars",
  "new_description": "max 800 chars, formatted with line breaks, no emoji spam",
  "confidence": "low | medium | high"
}

Be honest. If the current copy is already good, set confidence=low and make minimal changes. Don't rewrite for the sake of rewriting.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',   // worth the extra cost — copywriting is high-leverage
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const proposed = JSON.parse(match[0])

    log.log(`[GOD-LISTING] confidence=${proposed.confidence} — "${(proposed.new_title ?? '').slice(0, 60)}"`)
    log.log(`[GOD-LISTING] rationale: ${(proposed.rationale ?? '').slice(0, 120)}`)

    const entry = {
      at: new Date().toISOString(),
      cycle,
      applied: false,
      ...proposed,
      priorTitle:       current.name,
      priorTagline:     current.tagline,
      priorDescription: current.description,
    }

    revenueLog.pendingListingUpdates = [
      ...(revenueLog.pendingListingUpdates ?? []).slice(-9),
      entry,
    ]
    saveRevenueLog(projectRoot, revenueLog)

    return entry
  } catch (e) {
    log.log(`[GOD-LISTING] failed: ${e.message?.slice(0, 80)}`)
    return null
  }
}
