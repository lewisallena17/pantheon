// Lightweight citation type + helpers. Used to annotate God's decisions
// (decrees, vetoes, mood shifts) with the specific evidence that informed
// them. Rendered in the "Why?" hover inspector + the Decision History panel.

export interface Citation {
  kind:      'lesson' | 'observation' | 'prior_failure' | 'prior_success' | 'blocklist_pattern' | 'goal' | 'cycle_event'
  text:      string
  // Optional pointers back to the source
  lessonId?: string
  taskId?:   string
  cycle?:    number
  pattern?:  string
}

export interface CitedDecision {
  decision:  string        // what God decided
  rationale: string        // short reasoning
  citations: Citation[]    // evidence
  at:        string        // ISO timestamp
  cycle:     number
}

export function formatCitation(c: Citation): string {
  switch (c.kind) {
    case 'lesson':            return `📘 Lesson: ${c.text}`
    case 'observation':       return `👁 Observation: ${c.text}`
    case 'prior_failure':     return `✕ Prior failure (task ${c.taskId?.slice(0, 6)}): ${c.text}`
    case 'prior_success':     return `✓ Prior success: ${c.text}`
    case 'blocklist_pattern': return `🛡 Blocklist pattern /${c.pattern}/: ${c.text}`
    case 'goal':              return `◎ Active goal: ${c.text}`
    case 'cycle_event':       return `⟳ Cycle ${c.cycle ?? '?'}: ${c.text}`
  }
}
