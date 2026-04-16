---
title: "The Real Cost of Running AI Agents 24/7 (Live Data)"
tags: ["ai", "productivity", "cloud", "programming"]
series: "Autonomous AI Agents"
---

I've been running autonomous AI agents continuously on my home machine. Here are the actual numbers — no fluff.

## The Setup

- **God Agent**: meta-orchestrator, Claude Sonnet, runs every 2 minutes
- **Specialist Agents**: 5 pools (db-specialist, ui-specialist, ruflo-critical/high/medium)
- **Models used**: Claude Sonnet 4.6 for complex tasks, Haiku 4.5 for fast/cheap operations
- **Database**: Supabase (PostgreSQL + Realtime)
- **Total tasks attempted**: ~200+ across multiple sessions

## Pricing Reality Check

Claude's pricing (as of early 2026):

| Model | Input | Output |
|-------|-------|--------|
| Sonnet 4.6 | $3/MTok | $15/MTok |
| Haiku 4.5 | $0.25/MTok | $1.25/MTok |

A "typical" agent task loop runs 5-15 iterations, each with a system prompt (~2,000 tokens), accumulated conversation history, and tool results. That's roughly 10,000-40,000 input tokens per task.

**Cost per task:**
- Simple SQL query (Haiku): ~$0.001–$0.003
- TypeScript refactor (Sonnet): ~$0.05–$0.15
- Complex multi-step task (Sonnet, hits limit): up to $0.81 (this actually happened)

## The $0.81 Incident

One task asked an agent to "refactor the agent runner for better error handling." The agent:
1. Read the file (8k tokens)
2. Wrote a plan (2k tokens)
3. Made 12 separate edits (growing context each iteration)
4. Hit iteration 15 with 240k total input tokens

At $3/MTok: 240k input tokens × $0.003 = $0.72 just for input. Plus output. Total: ~$0.81 for one task.

The fix was immediate: hard token and cost caps.

```javascript
// Agent checks this every 5 iterations
if (totalInputTokens > MAX_INPUT_TOKENS) {
  await markFailed(todo.id, `Token budget exceeded: ${totalInputTokens} tokens`)
  return
}

// Estimate cost and bail if over per-task limit
const estimatedCost = (totalInputTokens / 1_000_000) * INPUT_COST_PER_M
  + (totalOutputTokens / 1_000_000) * OUTPUT_COST_PER_M
if (estimatedCost > MAX_TASK_COST_USD) {
  await markFailed(todo.id, `Cost cap hit: $${estimatedCost.toFixed(4)}`)
  return
}
```

## Daily Spend Breakdown

With a $2/day cap and smart routing:

| Time | Activity | Approximate Cost |
|------|----------|-----------------|
| 00:00–06:00 | God cycles + simple SQL tasks (Haiku) | ~$0.15 |
| 06:00–12:00 | UI/TypeScript tasks (Sonnet) | ~$0.60 |
| 12:00–18:00 | Mixed, Sonnet specialists | ~$0.70 |
| 18:00–24:00 | Reflection, roadmap updates | ~$0.40 |
| **Total** | | **~$1.85** |

God's reflection and council operations are the most expensive in proportion to their output — two Sonnet calls per cycle adds up. Switching reflection to Haiku with a structured output format cut this cost by ~70%.

## Model Routing: The Single Biggest Lever

Before routing: every agent used Sonnet. Average task cost: $0.08.

After routing: Haiku for db/simple tasks, Sonnet for ui/infra:

- SQL tasks (Haiku): $0.002 average
- UI tasks (Sonnet): $0.07 average
- Blended average: **$0.018** per task

That's a **4.4× cost reduction** with no meaningful quality loss, because the specialist system prompts compensate for Haiku's smaller context window.

## Context Compression: Hidden Savings

After 10 iterations, the agent conversation history is summarised into 3 bullet points before continuing:

```javascript
async function compressMessages(messages, taskTitle) {
  const summary = await haiku(`
    Summarise this agent conversation in 3 bullet points.
    Focus on: what was done, what failed, what still needs doing.
    Task: ${taskTitle}
    Messages: ${JSON.stringify(messages.slice(2))}
  `)
  return [
    messages[0],  // system
    messages[1],  // first user message
    { role: 'assistant', content: `[Context compressed at iteration 10]\n${summary}` },
  ]
}
```

This costs ~$0.001 (Haiku) and saves $0.02–$0.10 on subsequent iterations by eliminating accumulated context. Net positive every time.

## What It Actually Costs Per Month

At $1.85/day × 30 days = **$55.50/month** at full utilisation.

That's for:
- ~100 tasks/day attempted
- 15-20 tasks/day completed (improving weekly)
- Continuous codebase improvement
- Self-editing dashboard
- Autonomous content generation

Is it worth it? Depends entirely on what the agents are doing. If they're shipping features that would cost $50/hour in developer time, one successful task/day pays for the system. At current success rates (6–15%), that's roughly 10–20 successful tasks/day = high ROI if tasks are meaningful.

## The Credit Exhaustion Problem

One failure mode I didn't anticipate: your Anthropic credit balance hitting zero. When that happens:

1. The 400 API error contains `"credit balance too low"` in the message
2. This needs to be detected and handled differently from rate limits or network errors
3. Agents should reset tasks to `pending` (not `failed`) so work resumes when credits are topped up

```javascript
function isCreditError(err) {
  return err.status === 400 && err.message?.includes('credit balance')
}

// In the catch block:
if (isCreditError(err)) {
  await supabase.from('todos').update({ status: 'pending' }).eq('id', todo.id)
  creditsPaused = true
  setTimeout(() => { creditsPaused = false }, 10 * 60 * 1000)
  return
}
```

Without this, credit exhaustion marks 20+ tasks as `failed` and the backlog is a mess. With it, everything cleanly pauses and resumes.

## Summary

Running AI agents 24/7 costs roughly $1.50–$2/day with proper limits. The main levers are:

1. **Model routing** (4× savings, same quality)
2. **Token caps** (prevents runaway $0.81 tasks)
3. **Context compression** (saves $0.02–$0.10 per long task)
4. **Daily spend cap** (hard ceiling, agents self-enforce)

The ROI depends on what the agents build. But the infrastructure cost itself is manageable — less than a Netflix subscription per day.

---

*Follow for weekly updates. Next post: how the specialist routing works in detail.*
