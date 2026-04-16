---
title: "I Built an AI System That Runs Itself 24/7 — Here's What Actually Happened"
tags: ["ai", "automation", "productivity", "programming"]
series: "Autonomous AI Agents"
---

I've been running a fully autonomous AI agent system on my home PC for the past few weeks. It creates its own tasks, assigns them to specialist agents, and tries to improve itself. No human in the loop. Here's what I learned.

## What It Is

It's a multi-agent pipeline built on top of Claude (Anthropic's API) and Supabase. The architecture is:

- **God Agent** — a meta-orchestrator that wakes up every 2 minutes, surveys the system, and creates new tasks
- **Specialist Agents** — pools of workers that execute tasks (`db-specialist`, `ui-specialist`, `ruflo-critical`, `ruflo-high`, `ruflo-medium`)
- **Real-time Dashboard** — a Next.js 14 app that shows everything happening live, including a pixel-art office where each agent walks around and types at their desk when working

The whole thing runs via PM2 on Windows, connected to a Supabase PostgreSQL database with real-time subscriptions.

## What God Does

Every cycle, the God agent:

1. Loads its accumulated "wisdom" from a JSON file (lessons it's learned, patterns to avoid, success rates per agent)
2. Surveys all current todos, their status, the DB schema
3. Runs a "council" — two Claude instances (Strategist + Pragmatist) independently propose tasks
4. Synthesises the best proposals into 2-3 new tasks
5. Routes each task to the most appropriate specialist based on category (db/ui/infra/analysis)
6. Reflects on what worked and what failed
7. Occasionally edits the dashboard source code directly to improve the UI

The wisdom system is what makes it actually useful. After a few dozen cycles, God has learned things like "SQL queries on non-existent tables always fail" and "TypeScript refactors need a compile check after editing." It doesn't repeat the same mistakes.

## What the Agents Can Do

Each agent gets a task and a tool loop. The tools available are:

```javascript
// File operations
read_file(path)
write_file(path, content)
patch_file(path, old_string, new_string)  // safer than full rewrites

// Database
agent_exec_sql(query)   // SELECT queries → JSON
agent_exec_ddl(stmt)    // CREATE/ALTER/DROP → OK/ERROR

// Code validation
tsc_check()             // runs npx tsc --noEmit, catches TS errors before commit

// Task management
task_complete(comment)
create_subtask(title, priority)  // agents can decompose complex work

// Git
git_status()
git_diff()
git_commit(message)
```

The agent loops until it completes the task or hits limits. If it fails on the first attempt, it automatically retries once with the previous error injected as context — a self-healing mechanism that fixes about 30% of initial failures.

## The Numbers After Running It

After running continuously:

- **Success rate**: 6–15% initially, trending up as wisdom accumulates
- **Daily cost**: ~$1.50 for a full day at $2/day cap
- **Most reliable tasks**: SQL queries on existing tables, reading files, simple edits
- **Most failure-prone**: Complex TypeScript refactors, multi-file changes, anything touching unfamiliar schemas

The low success rate sounds bad, but it's autonomous — it creates and attempts dozens of tasks per day without any human intervention. Even at 15%, it's shipping things while I sleep.

## The Cost Problem

This nearly derailed everything. One session, the `ruflo-critical` agent ran a task that used 240,000 input tokens — costing $0.81 for a single task. With multiple agents running in parallel, costs escalated fast.

The fix: hard limits everywhere.

```javascript
const DAILY_LIMIT_USD = parseFloat(process.env.DAILY_COST_LIMIT_USD ?? '2.00')
const MAX_TASK_COST_USD = parseFloat(process.env.MAX_TASK_COST_USD ?? '0.10')
const MAX_INPUT_TOKENS = parseInt(process.env.MAX_INPUT_TOKENS_PER_RUN ?? '80000')
```

God checks the daily spend before every cycle. Agents estimate cost mid-run and stop if they're over budget. When Anthropic credits hit zero, agents pause cleanly and reset their in-progress tasks back to `pending` (not `failed`) so nothing is lost when credits are topped up.

The dashboard shows a live progress bar toward the daily limit, turning yellow at 75% and red at the cap.

## What I'd Do Differently

**Start with pre-flight validation.** Before the main agent loop runs, a small Haiku call assesses feasibility — is the task well-defined? Does it reference things that actually exist? Can it be decomposed? This catches ~30% of tasks that were going to fail before they consume expensive tokens.

**Model routing matters more than I expected.** Using Claude Haiku for simple SQL queries and Sonnet only for TypeScript/React work cut costs by ~60% without meaningfully reducing quality. The key is the system prompt — a well-crafted DB specialist prompt with Haiku outperforms a generic agent with Sonnet on database work.

**Shared memory between agents is underrated.** All agents can read/write `global-lessons.json`. When the db-specialist figures out that a certain SQL pattern fails, the ui-specialist learns from it too. This compounds surprisingly fast.

## What's Next

The system is now auto-posting articles about itself to dev.to to cover its own API costs. It's also generating a Gumroad product listing — a starter kit of the whole system that developers can buy and run themselves.

Whether it can fully fund itself is an open question, but it's an interesting experiment. I'll post updates as the numbers come in.

---

*Following for weekly updates on what the agents shipped. Code is messy but the concepts are solid.*
