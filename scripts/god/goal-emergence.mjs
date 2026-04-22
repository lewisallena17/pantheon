// scripts/god/goal-emergence.mjs
//
// Emergent goal detection. Instead of asking Haiku to "propose strategic
// goals" (which produces same-flavour output every time), this module clusters
// recent failures/vetoes by keyword overlap and spawns a goal ONLY when a
// cluster hits a size threshold — meaning the data itself has surfaced a
// pattern worth addressing.
//
// Runs every 6 cycles. Output feeds into wisdom.roadmap.goals alongside
// Haiku-proposed ones, tagged with `emergent: true` so the dashboard can
// distinguish them.

const CLUSTER_MIN_SIZE    = 5
const LOOKBACK_DAYS       = 3
const STOPWORDS = new Set([
  'the','and','for','with','from','into','this','that','task','tasks','via','using','add','build','create','write','make',
  'implement','query','select','update','insert','delete','should','could','would','will','have','been','was','were','are',
  'not','new','old','all','any','via','and','but','you','your','our','its','it','in','on','at','a','an','to','of','as','is','by',
])

function tokenize(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !STOPWORDS.has(w))
  )
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

/** Simple greedy clustering — O(n²) but we're working with ≤60 items. */
function cluster(items, similarityThreshold = 0.35) {
  const clusters = []
  for (const it of items) {
    let placed = false
    for (const c of clusters) {
      if (c.items.some(x => jaccard(it.tokens, x.tokens) >= similarityThreshold)) {
        c.items.push(it)
        // Update cluster centroid tokens
        for (const t of it.tokens) c.centroid.add(t)
        placed = true
        break
      }
    }
    if (!placed) clusters.push({ items: [it], centroid: new Set(it.tokens) })
  }
  return clusters
}

function distinctiveKeywords(centroid, allFailuresCount) {
  // Pick the tokens most unique to this cluster — drop generic ones
  return [...centroid]
    .filter(t => t.length >= 5)
    .filter(t => !STOPWORDS.has(t))
    .slice(0, 5)
}

/**
 * Detects emergent goal candidates from recent failures + vetoes.
 * Returns array of { title, rationale, keywords, sampleFailures }.
 * Caller decides whether to add them to wisdom.roadmap.goals.
 */
export async function detectEmergentGoals({ supabase, log = console, wisdom }) {
  if (!supabase) return []
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 3600_000).toISOString()

  const { data: failures } = await supabase
    .from('todos')
    .select('id, title, status, updated_at, metadata')
    .in('status', ['failed', 'vetoed'])
    .gte('updated_at', cutoff)
    .order('updated_at', { ascending: false })
    .limit(80)

  if (!failures || failures.length < CLUSTER_MIN_SIZE) return []

  const items = failures.map(f => ({ id: f.id, title: f.title, tokens: tokenize(f.title) }))
  const clusters = cluster(items).filter(c => c.items.length >= CLUSTER_MIN_SIZE)

  if (!clusters.length) return []

  const existingGoalTitles = new Set(
    (wisdom?.roadmap?.goals ?? [])
      .filter(g => g.status === 'active')
      .map(g => String(g.title ?? '').toLowerCase())
  )

  const candidates = []
  for (const c of clusters) {
    const keywords = distinctiveKeywords(c.centroid, failures.length)
    if (!keywords.length) continue

    // Rough theme inference from the first 2 keywords
    const theme = keywords.slice(0, 3).join(' · ')
    const titleDraft = `Reliability sweep: eliminate the "${keywords[0]}" failure cluster (${c.items.length} recent occurrences)`

    // Skip if a similar active goal already exists
    const duplicateCheck = [...existingGoalTitles].some(t => keywords.some(k => t.includes(k)))
    if (duplicateCheck) continue

    candidates.push({
      title:         titleDraft,
      rationale:     `Detected ${c.items.length} ${theme}-themed failures in the last ${LOOKBACK_DAYS} days. Pattern emerged from data, not proposed by council.`,
      keywords,
      theme,
      count:         c.items.length,
      sampleFailures: c.items.slice(0, 3).map(i => i.title),
      emergent:      true,
    })
  }

  if (candidates.length) {
    log.log(`[GOD-EMERGENT] 🌱 surfaced ${candidates.length} emergent goal${candidates.length === 1 ? '' : 's'} from ${failures.length} recent failures:`)
    for (const g of candidates) log.log(`  · [${g.count}× ${g.theme}] ${g.title}`)
  }

  return candidates
}
