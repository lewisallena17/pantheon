/**
 * task-screener.mjs — Pre-flight task rejection guard
 *
 * Kills known-bad task patterns BEFORE they consume tokens.
 *
 * Root cause evidence (god-wisdom.json + global-lessons.json, cycles 1-340):
 *   - ruflo-high:     2,432 failures vs 639 successes
 *   - ruflo-critical:   698 failures vs  35 successes
 *
 * Failure clusters (from CURIOSITY_FAILURE_ANALYSIS.md + avoidPatterns):
 *   A) Abstract/theoretical curiosity tasks with no bounded data source
 *   B) Timeline-aware / temporal-logic evaluators
 *   C) Latency simulation or alternative-path simulation
 *   D) Multi-table joins without LIMIT that balloon to 130k input tokens
 *   E) Evaluation/framework-building tasks that produce frameworks, not outcomes
 *   F) Self-referential "analyze failure patterns" loops that create new failures
 *   G) Cross-conversation pattern inference (unbounded, no queryable table)
 *   H) Relevance/attention decay modeling across conversations (no measurable signal)
 *   K) [CURIOSITY] Log/instrument in lib/*.ts before export infrastructure exists
 *   L) Grounding/observability checks that presuppose a missing export pipeline
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

  // ── Category H: Cross-conversation pattern inference ──────────────────
  // Root cause: "Never design systems requiring cross-conversation pattern inference"
  // Recent failures: "[CURIOSITY] Detect recurring problem-solving patterns across
  //                  multiple user conversations"
  {
    pattern: /recurring.{0,30}(pattern|problem|behavior).{0,30}(across|multiple|conversation)/i,
    reason:  'Recurring pattern detection across multiple conversations requires unbounded cross-session data — no queryable table exists. Always fails.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /\bdetect\b.{0,40}\brecurring\b.{0,40}\b(conversation|session|user)\b/i,
    reason:  'Cross-conversation recurring pattern detection — no bounded dataset. Rejected pre-flight.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /problem.{0,20}solving.{0,20}pattern.{0,30}(conversation|session|across)/i,
    reason:  'Problem-solving pattern inference across conversations — unmeasurable, no concrete table. Rejected.',
    category: 'curiosity-abstract',
  },

  // ── Category I: Relevance/attention decay modeling ────────────────────
  // Root cause: "Avoid modeling subjective concepts (reasoning quality, meaning shift) directly"
  // Recent failures: "[CURIOSITY] Measure and model how relevance of earlier turns
  //                  diminishes in long conversations"
  {
    pattern: /relevance.{0,30}(diminish|decay|fade|drop|earlier\s+turn)/i,
    reason:  'Relevance diminishment in conversations is a subjective, unmeasurable concept without a concrete signal table. Always fails.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /(earlier|prior).{0,20}turn.{0,30}(diminish|decay|relevance|attention)/i,
    reason:  'Modeling earlier-turn decay across conversation turns — no empirical signal. Rejected pre-flight.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /\b(attention|relevance|salience)\s+(decay|diminish|drop|fade)\b/i,
    reason:  'Attention/relevance decay is infrastructure-opaque and subjective — rejected.',
    category: 'curiosity-abstract',
  },
  {
    pattern: /how.{0,30}(context|relevance|meaning).{0,30}(diminish|decay|fade|lost).{0,30}(long|conversation|turn)/i,
    reason:  'Modeling context/relevance loss over long conversations has no measurable signal source — rejected.',
    category: 'curiosity-abstract',
  },

  // ── Category J: Frameworks without data sources (generic catch) ───────
  {
    pattern: /\[CURIOSITY\].{0,80}(framework|evaluator|system|layer|pipeline)\b/i,
    reason:  'CURIOSITY tasks that build frameworks/evaluators/pipelines without a concrete data source always fail — no bounded input. Rejected.',
    category: 'curiosity-abstract',
  },

  // ── Category K: Logging/instrumentation in lib/*.ts before export infra ──
  //
  // Root cause (cycles 300-340, god-wisdom avoidPatterns):
  //   "Build curiosity features before supporting observability"
  //   "Log without export infrastructure ready first"
  //   "Instrument at source first, correlate later" (success pattern — but the
  //    instrument step REQUIRES the export table to already exist)
  //
  // Exact failed task: "[CURIOSITY] Log response grounding checks in lib/grounding.ts"
  // Pattern: [CURIOSITY] tasks that write a new lib/*.ts logging module whose
  // output has nowhere to land because the export/sink table hasn't been built yet.
  // These always token-budget-exhaust or produce dead code that is never queried.
  {
    pattern: /\[CURIOSITY\]\s+log\s+.{0,60}\bin\s+lib\//i,
    reason:  'CURIOSITY logging tasks in lib/*.ts require a pre-existing export pipeline/sink table — none exists. Instrument after export infra is stable (avoidPattern: Build curiosity features before supporting observability). Rejected.',
    category: 'infra-dependency',
  },
  {
    pattern: /\[CURIOSITY\]\s+(add|create|implement|write)\s+.{0,40}(log|logging|instrument|tracker)\s+.{0,40}lib\//i,
    reason:  'CURIOSITY instrumentation in lib/*.ts before export sink exists — always produces dead code. Rejected pre-flight.',
    category: 'infra-dependency',
  },
  {
    pattern: /log\s+(response\s+)?(grounding|grounding\s+check)/i,
    reason:  'Response grounding logging requires a stable export/sink table that does not yet exist — rejected (lesson: logging infrastructure must precede instrumentation layers).',
    category: 'infra-dependency',
  },
  {
    pattern: /\[CURIOSITY\]\s+.{0,60}(log|logging)\s+.{0,40}(check|hook|event|signal)\s+(in|into|to)\s+lib\//i,
    reason:  'Writing log hooks into lib/ before export infrastructure is ready — always ends in token exhaustion with no queryable output. Rejected.',
    category: 'infra-dependency',
  },

  // ── Category L: Observability/grounding curiosity tasks with no pipeline ──
  //
  // Root cause (cycles 310-340):
  //   "Curiosity prototypes need metrics export pipelines first"
  //   "Logging succeeds; correlation infrastructure remains bottleneck"
  //
  // These tasks write files that log grounding/observability signals but have no
  // export pipeline to read from. They always exhaust token budget producing stubs.
  {
    pattern: /\[CURIOSITY\]\s+.{0,80}(grounding|ground\s+check|observabilit|response\s+validat)/i,
    reason:  'CURIOSITY grounding/observability tasks presuppose an export pipeline that does not exist — always token-exhausts. Build export pipeline first (avoidPattern). Rejected.',
    category: 'infra-dependency',
  },
  {
    pattern: /grounding\s+(check|log|monitor|track).{0,40}(lib|module|ts|file)/i,
    reason:  'Grounding check instrumentation requires a pre-existing export sink — lib/*.ts stubs have no consumer. Rejected pre-flight.',
    category: 'infra-dependency',
  },
  {
    pattern: /\[CURIOSITY\]\s+.{0,60}(correlation|correlate).{0,40}(log|metric|event|rpc)/i,
    reason:  'CURIOSITY correlation tasks require stable export infrastructure — correlation on incomplete datasets always fails (avoidPattern: Don\'t attempt real-time correlation on incomplete RPC error datasets). Rejected.',
    category: 'infra-dependency',
  },
]

// ── screenTask ─────────────────────────────────────────────────────────────
/**
 * Returns { rejected: true, reason, category } if the task matches a reject
 * rule, or { rejected: false } if it is safe to proceed.
 *
 * @param {{ title: string, description?: string }} todo
 */
export function screenTask(todo) {
  const haystack = `${todo.title ?? ''} ${todo.description ?? ''}`.trim()
  for (const rule of REJECT_RULES) {
    if (rule.pattern.test(haystack)) {
      return { rejected: true, reason: rule.reason, category: rule.category }
    }
  }
  return { rejected: false }
}
