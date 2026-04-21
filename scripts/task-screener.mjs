/**
 * task-screener.mjs — Pre-flight task rejection guard
 *
 * Kills known-bad task patterns BEFORE they consume tokens.
 *
 * Root cause evidence (god-wisdom.json + global-lessons.json, cycles 1-301):
 *   - ruflo-high:     2,412 failures vs 605 successes
 *   - ruflo-critical:   685 failures vs  34 successes
 *
 * Failure clusters (from CURIOSITY_FAILURE_ANALYSIS.md + avoidPatterns):
 *   A) Abstract/theoretical curiosity tasks with no bounded data source
 *   B) Timeline-aware / temporal-logic evaluators
 *   C) Latency simulation or alternative-path simulation
 *   D) Multi-table joins without LIMIT that balloon to 130k input tokens
 *   E) Evaluation/framework-building tasks that produce frameworks, not outcomes
 *   F) Self-referential "analyze failure patterns" loops that create new failures
 *
 * Each REJECT_RULE has:
 *   pattern  — regex tested against lowercased title+description
 *   reason   — logged to Supabase task notes and console
 *   category — used for god_status learning
 */

// ── Hard-reject rules (ordered: most specific first) ──────────────────────
export const REJECT_RULES = [
  // ── Category A: Latency / simulation / alternative-path ───────────────
  {
    pattern: /\b(latency|throughput)\s+(pattern|analysis|framework|simulation|tier)/i,
    reason:  'Abstract latency analysis without bounded data source — always fails (avoidPattern: theoretical latency analysis).',
    category: 'curiosity-abstract',
  },
  {
    pattern: /simulate\s+(alternative|response|path|latency|throughput)/i,
    reason:  'Theoretical simulation tasks have zero empirical data source — rejected pre-flight.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /\balternative\s+(response\s+)?path(s)?\b/i,
    reason:  'Simulating alternative paths is unmeasurable — rejected pre-flight.',
    category: 'curiosity-abstract',
  },

  // ── Category B: Timeline / temporal evaluators ─────────────────────────
  {
    pattern: /timeline.{0,20}(aware|evaluator|inconsistenc|anachronism)/i,
    reason:  'Timeline-aware evaluators require unbounded temporal reasoning — always fails.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /temporal\s+(inconsistenc|logic|reasoning|anachronism)/i,
    reason:  'Temporal inconsistency detection without concrete data bounds — rejected.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /detect\s+(and\s+)?(suggest|fix|flag)\s+(temporal|anachronism|timeline)/i,
    reason:  'Abstract temporal detection without bounded dataset — rejected pre-flight.',
    category: 'curiosity-abstract',
  },

  // ── Category C: Token-generation / response-format detectors ──────────
  {
    pattern: /token.{0,15}generation\s+latency/i,
    reason:  'Token-generation latency analysis is infrastructure-opaque — rejected.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /\boptimal\s+output\s+format(s)?\b/i,
    reason:  'Output format detection without user-context data source — always ends in framework, not outcome.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /detect\s+(and\s+)?suggest\s+(optimal|best)\s+(output|format|response)/i,
    reason:  'Abstract format suggestion system — no bounded data source.',
    category: 'curiosity-abstract',
  },

  // ── Category D: Claim-source mappers / verifiers ───────────────────────
  {
    pattern: /claim.{0,20}(source|mapping|verification|flag)/i,
    reason:  'Claim-to-source mapping without a bounded claims table — unmeasurable.',
    category: 'curiosity-abstract',
  },

  // ── Category E: Goal-attainment / confidence-validator frameworks ──────
  {
    pattern: /\b(quantify|measure)\s+user\s+goal\s+attain/i,
    reason:  'User goal attainment quantification — no empirical data source.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /conversation.{0,20}(depth|confidence)\s+(validator|checkpoint|inject)/i,
    reason:  'Conversation-depth confidence validators produce frameworks, not measurable outcomes.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /fork.{0,15}(and|&).{0,15}compare/i,
    reason:  'Fork-and-compare without concrete branch data — theoretical, rejected.',
    category: 'curiosity-abstract',
  },

  // ── Category F: Self-referential analysis-of-failure loops ────────────
  {
    pattern: /analyze\s+(curiosity|failed).{0,30}(pattern|failure|log|mode)/i,
    reason:  'Analyzing failure patterns creates new failure logs — self-referential loop. Rejected.',
    category: 'meta-loop',
  },
  {
    pattern: /classify\s+(curiosity|failed)\s+task/i,
    reason:  'Classifying curiosity/failed tasks without a bounded failure corpus — loop risk.',
    category: 'meta-loop',
  },
  {
    pattern: /failure\s+(pattern|mode|analysis|categorize).{0,40}curiosity/i,
    reason:  'Curiosity failure mode analysis — self-referential meta-task, rejected.',
    category: 'meta-loop',
  },

  // ── Category G: Context-retention / user-context frameworks ──────────
  {
    pattern: /user.{0,20}context\s+(retention|system)\b/i,
    reason:  'Lightweight user-context retention systems have no bounded user data source.',
    category: 'curiosity-abstract',
  },

  // ── Category H: Frameworks without data sources (generic catch) ───────
  {
    pattern: /\[CURIOSITY\].{0,80}(framework|evaluator|system|layer|pipeline)\b/i,
    reason:  'CURIOSITY tasks that build frameworks without a concrete data source always fail or produce zero outcome delta.',
    category: 'curiosity-framework',
  },
]

// ── Screener entry point ───────────────────────────────────────────────────
/**
 * Returns { reject: true, reason, category } if the task matches a known-bad
 * pattern, or { reject: false } if it's safe to proceed.
 *
 * @param {{ title: string, description?: string }} todo
 */
export function screenTask(todo) {
  const haystack = `${todo.title ?? ''} ${todo.description ?? ''}`.toLowerCase()

  for (const rule of REJECT_RULES) {
    if (rule.pattern.test(haystack)) {
      return { reject: true, reason: rule.reason, category: rule.category }
    }
  }
  return { reject: false }
}

/**
 * Log a rejection to Supabase todos table (notes field) + console.
 * Fire-and-forget — does not throw.
 *
 * @param {object} supabase   — Supabase client
 * @param {object} todo       — task row
 * @param {string} reason     — human-readable rejection reason
 */
export async function recordRejection(supabase, todo, reason) {
  const note = `[PRE-FLIGHT REJECTED] ${new Date().toISOString()} — ${reason}`
  console.warn(`[task-screener] REJECTED "${todo.title?.slice(0, 80)}" — ${reason}`)
  try {
    await supabase
      .from('todos')
      .update({ status: 'vetoed', notes: note })
      .eq('id', todo.id)
  } catch (e) {
    // Non-fatal — rejection still logged to console
    console.error('[task-screener] Failed to write rejection to DB:', e.message?.slice(0, 120))
  }
}
