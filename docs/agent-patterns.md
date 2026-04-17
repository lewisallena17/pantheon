# Agent patterns to borrow from

A reading list of proven patterns worth stealing when you next refactor
the God / ruflo / specialist agents.

## Claude-specific (official)

### anthropics/courses
https://github.com/anthropics/courses
- `anthropic_api_fundamentals` — message shape, streaming, system prompts
- `tool_use` — the canonical way to think about multi-step tool loops
- `prompt_engineering_interactive_tutorial` — concrete evals for system prompts

**What to steal:** The loop pattern in `tool_use/05_tool_use_workflow.ipynb`
is cleaner than ours. They use a single `run_until_done()` helper instead of
the bespoke while-loop we have in `ruflo-runner.mjs` and `specialists.mjs`.
Also note how they handle rate-limit backoff with exponential delays.

### anthropics/anthropic-cookbook
https://github.com/anthropics/anthropic-cookbook
- `multimodal` — for when you want God to read screenshots
- `patterns/agents` — parallel agents, orchestrator-worker, routing
- `skills/retrieval_augmented_generation` — if/when you add vector search

**What to steal:** `patterns/agents/orchestrator_workers.ipynb` — replace
your bespoke "council + skeptic + prereq" system with a cleaner 3-role
setup. Less code, easier to reason about.

## Multi-agent orchestration

### langchain-ai/langgraph
https://github.com/langchain-ai/langgraph
State machines for agent workflows. Each node is a step; edges define
transitions. Built-in checkpointing + time-travel debugging.

**What to steal:** Their `StateGraph` model would let you replace God's
ad-hoc `if wisdom.cycles % 5 === 0` branching with named states:
`survey → plan → propose → approve → execute → reflect → learn`. Every
transition is logged and replayable — huge for debugging.

Tradeoff: a full port is 2-3 days. Worth it if you start hitting weird
state bugs in God.

### crewAIInc/crewAI
https://github.com/crewAIInc/crewAI
Each agent has a role, goal, backstory. They collaborate via shared tasks.

**What to steal:** The "role + goal + backstory" system prompt pattern.
Our specialists already have system prompts but they're not personified.
Adding personality ("You are the DB specialist who has seen too many
migration disasters...") improves Claude's reasoning noticeably.

### humanlayer/humanlayer
https://github.com/humanlayer/humanlayer
Human-in-the-loop approvals for destructive agent actions.

**What to steal:** You already have Task Inbox approval. Their webhook
pattern is nicer — a task gets PAUSED pending human approval via Slack/
email, agent resumes when approved. Much better for async approval than
our "wait for dashboard click" approach.

## Structured outputs

### jxnl/instructor
https://github.com/jxnl/instructor
Force LLM outputs into typed schemas via Pydantic (Python) or Zod (JS).

**What to steal:** Our God council proposals are JSON-parsed from free
text, which occasionally fails with malformed JSON. Instructor-style
"validate + retry" would cut those errors. In Node use `zod` +
`@ai-sdk/anthropic` `generateObject()`.

## Observability

### logfire-sh/logfire
https://github.com/pydantic/logfire (sidetrack: Python-only, but conceptual)
- OR: **Langfuse** https://github.com/langfuse/langfuse (TS/JS native)

**What to steal:** Trace every agent decision end-to-end. Right now we log
to PM2 stdout; hard to answer "why did God propose this task?" 5 minutes
later. Langfuse self-host + a few SDK calls would give us that.

## Cost / rate limiting

### Vercel AI SDK (`vercel/ai`)
https://github.com/vercel/ai
Not really "multi-agent" but has built-in cost tracking + streaming
primitives worth stealing. `streamText()` + `@ai-sdk/anthropic` is nicer
than hand-rolling `anthropic.messages.create()`.

## Dashboard / UI references

### shadcn-ui/ui
https://github.com/shadcn-ui/ui
Already installed as dependency (see `components.json`). Components
available: https://ui.shadcn.com/docs/components

### tremor/tremor
https://github.com/tremorlabs/tremor
Dashboard-specific charts (KPI cards, sparklines, area charts). Better
than Recharts for our use case if we want analytics over time.

## Marketing / growth

### ShipFast (Marc Lou)
https://shipfa.st (closed source) — the reference for monetization patterns
- Pricing tables
- Email capture → onboarding sequence
- Stripe integration
- SEO meta tags

### umami-software/umami, plausible/analytics
https://github.com/umami-software/umami
https://github.com/plausible/analytics
Already wired (see `app/layout.tsx`). Just set the env vars when ready.

---

## Recommended order for next refactor session

1. **Langfuse tracing** (1-2 hrs) — gives you observability before you
   touch anything else. Diagnoses every future bug.
2. **Zod schemas on God's proposals** (2 hrs) — kills the JSON parsing
   errors for good.
3. **anthropics/courses loop pattern** (3-4 hrs) — cleaner tool loops in
   ruflo-runner and specialists (which is now merged into ruflo).
4. **crewAI-style personified prompts** (1 hr) — cheap win, noticeable
   quality bump.
5. **Langgraph port** (2-3 days) — only if you're hitting state bugs.
   Skip until you need it.
