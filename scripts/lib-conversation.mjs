// scripts/lib-conversation.mjs
//
// Pre-task conversation: a quick 3-turn exchange between God and the
// assigned specialist BEFORE the specialist picks up the task. Makes the
// system feel like a team reasoning together, not a queue of silent tasks.
//
// Shape stored on todo.metadata.conversation as an array of turns:
//   [{ role: 'god' | 'specialist', text, at }]
//
// The dashboard subscribes to todos realtime and renders these as chat
// bubbles. Fire-and-forget — if the conversation fails we still run the task.

const MAX_TURN_CHARS = 240

/**
 * Generate a brief exchange between God and a specialist pool.
 *
 *  turn 1: God assigns the task with a one-line context
 *  turn 2: specialist responds with a plan or a concern (1 sentence)
 *  turn 3: God acknowledges, possibly refining
 *
 * @param {object} opts
 * @param {object} opts.anthropic — Anthropic SDK client
 * @param {string} opts.taskTitle
 * @param {string} opts.poolName  — e.g. 'db-specialist', 'ui-specialist', 'ruflo-high'
 * @param {string[]} [opts.recentLessons]
 * @param {string} [opts.activeGoal]
 */
export async function generateTaskConversation({ anthropic, taskTitle, poolName, recentLessons = [], activeGoal }) {
  const personaByPool = {
    'db-specialist':   { name: 'db-specialist',  tone: 'careful, SQL-savvy, cautious about migrations' },
    'ui-specialist':   { name: 'ui-specialist',  tone: 'design-minded, attentive to mobile + accessibility' },
    'ruflo-critical':  { name: 'ruflo-critical', tone: 'terse, triage-mode, incident-response energy' },
    'ruflo-high':      { name: 'ruflo-high',     tone: 'confident, shipping-focused, pragmatic' },
    'ruflo-medium':    { name: 'ruflo-medium',   tone: 'steady, methodical, no drama' },
    'ruflo-low':       { name: 'ruflo-low',      tone: 'exploratory, curious, open-ended' },
  }
  const persona = personaByPool[poolName] ?? { name: poolName, tone: 'practical' }

  const prompt = `You are simulating a brief exchange on GOD's autonomous-agent council. Output a JSON array of exactly 3 turns.

CONTEXT:
  Active goal: ${activeGoal ?? '(no active goal)'}
  Recent lessons: ${recentLessons.slice(0, 2).join(' | ') || 'none'}
  Task to be assigned: "${taskTitle}"
  Specialist receiving the task: ${persona.name} (tone: ${persona.tone})

TURNS:
  1. GOD assigns the task in one sentence. Warm but directive.
  2. ${persona.name} responds in one sentence with either a plan, a brief concern, or a clarifying question. Match the tone.
  3. GOD acknowledges in one sentence. Concise, final word.

RULES:
  - Each turn ≤ ${MAX_TURN_CHARS} chars
  - No stage directions, no quotes, no "GOD says"
  - Just the dialogue itself, natural and in-character

Output ONLY valid JSON:
[
  { "role": "god",        "text": "..." },
  { "role": "specialist", "text": "..." },
  { "role": "god",        "text": "..." }
]`

  try {
    const resp = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = resp.content.find(b => b.type === 'text')?.text ?? ''
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return null
    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed)) return null

    const now = new Date().toISOString()
    return parsed
      .filter(t => t && typeof t.text === 'string' && (t.role === 'god' || t.role === 'specialist'))
      .slice(0, 3)
      .map((t, i) => ({
        role: t.role,
        text: t.text.slice(0, MAX_TURN_CHARS).trim(),
        at:   new Date(Date.now() + i * 50).toISOString().replace(/Z$/, now.slice(-1)),
      }))
  } catch {
    return null
  }
}
