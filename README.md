# 👁 Autonomous AI Task Dashboard

> **Self-improving AI agents that work 24/7, learn from failures, auto-commit their edits, and tell you when they break.**

A production-ready **Next.js 14 + Supabase + Claude API** starter kit. The God agent improves its own code every cycle — each edit is version-controlled and auto-reverted if it breaks the build. Specialist agents pick up tasks in parallel. You watch it work in real time.

[![Subscribe](https://img.shields.io/badge/📧-Subscribe-0891b2?style=for-the-badge)](https://task-dashboard-sigma-three.vercel.app/subscribe)
[![Live Demo](https://img.shields.io/badge/Live%20Dashboard-vercel-black?style=for-the-badge)](https://task-dashboard-sigma-three.vercel.app)
![Stack](https://img.shields.io/badge/Next.js-14-black?style=flat) ![Claude](https://img.shields.io/badge/Claude-Opus%204.7-ff6a00?style=flat) ![Supabase](https://img.shields.io/badge/Supabase-live-3ecf8e?style=flat) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat)

---

## What makes it different

Most AI agent frameworks are brittle — they forget context between runs, silently burn credits, and give you no visibility. This one is built to run continuously and self-correct.

- 🧠 **Self-improving God orchestrator** — wakes every 2 min, surveys state, creates tasks, learns from failures. Edits its own dashboard + agent scripts every N cycles.
- ⚡ **4 parallel specialist pools** — critical / high / medium / orchestrator, plus db-specialist + ui-specialist + revenue agent + promote agent.
- 📥 **Task Inbox** — God proposes, you approve or veto. Auto-approve available.
- 💾 **Auto-commit + auto-revert** — every God edit is a git commit. If it introduces new TypeScript errors, it's reverted automatically.
- 💰 **Cost controls** — daily $ cap, per-task cap, rate-of-spend circuit breaker. Track spend live per agent.
- 📢 **Notifications** — Discord / Slack / Pushover / Telegram on credit exhaustion, failures, reverts.
- 🏙 **Pixel-art agent office** — watch agents move between zones (Revenue · Dev · QC · God Chamber). Not a gimmick; genuinely useful for spotting stuck agents.
- 🛡 **Stuck-task watchdog** — any task in_progress > 15–25 min gets auto-failed + logged.
- 📊 **Contribution graph** — 365-day heatmap of commits (human in green, God in amber).
- 🧵 **Memory dedup** — Jaccard similarity on wisdom tokens; near-duplicate lessons collapsed automatically.
- 🤖 **GitHub Actions CI** — every commit type-checks and builds. Status shown in the dashboard.
- 📨 **Email capture + subscriber list** — public `/subscribe` page, CSV export, embed HTML for dev.to.
- 🎯 **Revenue engine** — drafts dev.to articles, generates Gumroad listings, prepares HackerNews + Reddit promotion URLs.

## Quick tour

```
Command palette     ⌘K / Ctrl+K from anywhere
Switch tab          1–5
Live agents         http://localhost:3000 · Agents tab
Stop/start agents   Agents tab → Agent Controls (no SSH needed)
Revenue dashboard   Revenue tab → Marketplace Listings + Dev.to stats
Git history         Code tab → click any commit to revert
```

## Architecture

```
┌─ GOD AGENT ────────────────────────────────────┐
│  every 2 min:                                  │
│    survey todos + metrics                      │
│    convene council of perspectives             │
│    propose tasks toward self-chosen goals      │
│    extract lessons from failures AND successes │
│    web-search errors for fixes                 │
│    every 5 cycles  → edit dashboard files      │
│    every 10 cycles → edit agent scripts        │
│    every 10 cycles → prune duplicate lessons   │
│    every 10 cycles → write SEO landing page    │
│    every 15 cycles → generate new goals        │
│    every 20 cycles → research inspiration repo │
│    every 25 cycles → meta-reflection on self   │
│    every 50 cycles → cut a GitHub release      │
└──────────┬─────────────────────────────────────┘
           ▼
┌─ TASK INBOX ───────────────────────────────────┐
│  status: 'proposed' → user approves            │
│                    → status: 'pending'         │
└──────────┬─────────────────────────────────────┘
           ▼
┌─ ORCHESTRATOR ─────────────────────────────────┐
│  auto-assigns pending tasks to best pool       │
│  using past success rate per agent per         │
│  category. Reaps stuck tasks > 15 min.         │
└──────────┬─────────────────────────────────────┘
           ▼
┌─ SPECIALIST POOLS (4 parallel) ────────────────┐
│  ruflo-critical · ruflo-high                   │
│  ruflo-medium   · ruflo-orchestrator           │
│  db-specialist  · ui-specialist                │
│  Claude tool use, web search, per-task cost    │
│  cap, context compression, auto-revert.        │
└────────────────────────────────────────────────┘
```

## Get started

```bash
git clone https://github.com/lewisallena17/pantheon.git
cd task-dashboard
npm install
cp .env.example .env.local
# fill .env.local — see INSTALL.md for each variable
npx supabase db push      # runs all migrations
pm2 start ecosystem.config.cjs
npm run dev               # dashboard at localhost:3000
```

Full setup guide: [INSTALL.md](./INSTALL.md)

## Tech stack

| Piece | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + Tailwind |
| Backend | Next.js API routes + Supabase (Postgres + Realtime) |
| AI | Anthropic Claude (Opus / Sonnet / Haiku routing) |
| Process mgmt | PM2 |
| Deploy | Vercel (UI) + your own box (agents) |

## Pricing

| Tier | Price | What you get |
|---|---|---|
| **Open Source (this repo)** | Free | Everything visible here. Roll your own deploy. |
| **Complete Starter Kit** | [$39 on Gumroad](https://ltagb.gumroad.com/l/gferg) | Source code + deployment guide + pre-configured `.env.example` + priority email support |
| **Done-for-you setup** | $297 one-time | I personally wire up your Supabase, env vars, deploy to Vercel, and hand you the URL |
| **Custom builds** | from $1500 | Modify agent roles for your team's workflow. Email me. |

## What others are building with it

- **[Add yours here]** — email `lta.gb@outlook.com` with a link and I'll feature you.

## Promote pantheon & earn

Want to earn commission promoting Autonomous AI Task Dashboard? Apply to the affiliate program:
👉 **[ogkush.lemonsqueezy.com/affiliates](https://ogkush.lemonsqueezy.com/affiliates)**

## Articles

- [I Built an AI System That Runs Itself 24/7](https://dev.to/lewisallena17/i-built-an-ai-system-that-runs-itself-247-heres-what-actually-happened-1p17)
- [Building a Self-Improving God Agent with Claude AI](https://dev.to/lewisallena17/building-a-self-improving-god-agent-with-claude-ai-2g4m)
- [The Real Cost of Running Autonomous AI Agents (with live data)](https://dev.to/lewisallena17/the-real-cost-of-running-autonomous-ai-agents-with-live-data-acm)

## Roadmap

Open to-dos live in the dashboard's **Task Inbox** — God is perpetually adding. High-level:

- [x] 5 parallel agent pools with intelligent routing
- [x] Auto-commit + auto-revert on TS regression
- [x] Task Inbox approval workflow
- [x] Cost + rate-of-spend controls
- [x] Discord/Slack/Pushover/Telegram notifications
- [x] Reddit OAuth auto-promotion
- [x] Marketplace listing generator (Gumroad/LS/IH/PH/CodeCanyon)
- [ ] Stripe-direct checkout (skip marketplace fees)
- [ ] Multi-tenant hosted SaaS version
- [ ] Vector memory via pgvector (replace flat wisdom.json)
- [ ] Agent A/B testing framework

## Contributing

PRs welcome. Please:

1. Run `npx tsc --noEmit` before pushing — it must be clean.
2. If you add a migration, number it sequentially in `supabase/migrations/`.
3. Prefer small, focused PRs. God reviews its own code now; happy to extend that to human PRs.

Bug reports via [Issues](https://github.com/lewisallena17/pantheon/issues) — they sync into the dashboard's Task Inbox, so God might actually fix them while you sleep.

## Sponsors

Building this in public. If the repo or articles helped you, [GitHub Sponsors](https://github.com/sponsors/lewisallena17) keeps me shipping. Tiers start at $5/mo.

## License

MIT for the source code. Commercial deployments are fine — not for reselling the code itself (Gumroad buyers get an extended license).

---

Built by [@lewisallena17](https://github.com/lewisallena17). Watching the agents do the work so I don't have to.
