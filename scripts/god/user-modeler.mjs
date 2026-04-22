// scripts/god/user-modeler.mjs
//
// Theory of mind for God — keeps a *dynamic* model of what the user cares
// about right now, not just baseline facts. Runs every 8 cycles and when
// `/api/user-profile` receives a PATCH. Output used by council to weight
// proposals toward user-aligned goals.
//
// Signals consumed:
//   1. Recent dashboard interactions (TODO — needs logged PATCH events)
//   2. Recent tasks the user manually created vs God-decreed
//   3. Recent tasks user explicitly vetoed/promoted
//   4. Keywords trending in completed work
//   5. Last ~6 tag-like observations in the user-profile file
//
// Writes back to scripts/user-profile.json under `currentFocus`, `frustrations`,
// and `excitements`. Cheap — one Haiku call per update.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const MIN_CYCLES_BETWEEN_UPDATES = 8

export async function updateUserModel({ supabase, anthropic, cycle, projectRoot, log = console }) {
  const path = join(projectRoot, 'scripts', 'user-profile.json')
  if (!existsSync(path)) {
    log.log('[GOD-USER] no user-profile.json yet, skipping')
    return null
  }

  let profile
  try { profile = JSON.parse(readFileSync(path, 'utf8')) } catch {
    log.log('[GOD-USER] user-profile.json unreadable, skipping')
    return null
  }

  const lastUpdateCycle = profile.lastDynamicUpdate?.cycle ?? -999
  if (cycle - lastUpdateCycle < MIN_CYCLES_BETWEEN_UPDATES) return null

  // Collect recent signal — tasks user touched + recent activity
  const sinceIso = new Date(Date.now() - 24 * 3600_000).toISOString()

  const [{ data: recentTasks }, { data: userAdded }, { data: vetoed }] = await Promise.all([
    supabase.from('todos').select('title, status, updated_at').gte('updated_at', sinceIso).order('updated_at', { ascending: false }).limit(40),
    supabase.from('todos').select('title, status').is('assigned_agent', null).order('created_at', { ascending: false }).limit(10),
    supabase.from('todos').select('title, metadata').eq('status', 'vetoed').order('updated_at', { ascending: false }).limit(10),
  ])

  const inferredContext = {
    userAddedTasks:    (userAdded ?? []).slice(0, 5).map(t => t.title?.slice(0, 80)),
    userVetoedTasks:   (vetoed ?? []).slice(0, 5).map(t => t.title?.slice(0, 80)),
    recentCompleted:   (recentTasks ?? []).filter(t => t.status === 'completed').slice(0, 8).map(t => t.title?.slice(0, 70)),
    recentFailed:      (recentTasks ?? []).filter(t => t.status === 'failed').slice(0, 5).map(t => t.title?.slice(0, 70)),
    existingInferred:  profile.inferred ?? {},
    cycle,
    at:                new Date().toISOString(),
  }

  const prompt = `You maintain a dynamic model of what a solo developer (Lewis) currently cares about in his autonomous agent dashboard project.

EXISTING STATIC PROFILE:
${JSON.stringify(inferredContext.existingInferred, null, 2)}

RECENT SIGNAL (last 24h):
• User-created tasks (manual inbox adds, highest signal): ${JSON.stringify(inferredContext.userAddedTasks)}
• User-vetoed tasks (signal for what they DON'T want): ${JSON.stringify(inferredContext.userVetoedTasks)}
• Recent completions: ${JSON.stringify(inferredContext.recentCompleted.slice(0, 5))}
• Recent failures: ${JSON.stringify(inferredContext.recentFailed.slice(0, 3))}

Infer what Lewis is CURRENTLY focused on, frustrated by, or excited about based on the recent signal. Be specific and grounded in the data — if nothing clear has shifted, say so.

Output JSON:
{
  "currentFocus":   ["1-2 specific things he's actively pursuing right now"],
  "frustrations":   ["1-2 pain points from recent failures or vetoes"],
  "excitements":    ["1-2 areas he seems enthusiastic about"],
  "nextSuggestion": "one concrete next move that would delight him, 1 sentence"
}`

  try {
    const msg = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages:   [{ role: 'user', content: prompt }],
    })
    const text = msg.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    const parsed = JSON.parse(match[0])

    // Write back to profile, preserving static fields
    const updated = {
      ...profile,
      inferred: {
        ...profile.inferred,
        currentFocus:   parsed.currentFocus   ?? [],
        frustrations:   parsed.frustrations   ?? [],
        excitements:    parsed.excitements    ?? [],
        nextSuggestion: parsed.nextSuggestion ?? '',
      },
      lastDynamicUpdate: { cycle, at: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }
    writeFileSync(path, JSON.stringify(updated, null, 2), 'utf8')
    log.log(`[GOD-USER] ✓ model updated — focus: ${(parsed.currentFocus ?? []).join(', ').slice(0, 80)}`)
    return updated.inferred
  } catch (e) {
    log.log(`[GOD-USER] update failed: ${e.message?.slice(0, 100)}`)
    return null
  }
}

/** Cheap read — returns just the dynamic fields for inclusion in council context. */
export function readUserModelSummary(projectRoot) {
  const path = join(projectRoot, 'scripts', 'user-profile.json')
  if (!existsSync(path)) return null
  try {
    const p = JSON.parse(readFileSync(path, 'utf8'))
    const inf = p.inferred ?? {}
    return {
      currentFocus:   inf.currentFocus ?? [],
      frustrations:   inf.frustrations ?? [],
      excitements:    inf.excitements ?? [],
      nextSuggestion: inf.nextSuggestion ?? '',
    }
  } catch { return null }
}
