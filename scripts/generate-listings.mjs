/**
 * generate-listings.mjs — produces tailored listing copy + packaged zips
 * per marketplace. Each marketplace has different tone, field limits, and
 * expected asset structure.
 *
 * Run:  node scripts/generate-listings.mjs
 * Output: dist/listings/<marketplace>/
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const DIST_ROOT    = join(PROJECT_ROOT, 'dist', 'listings')

// ── Product metadata ─────────────────────────────────────────────────────────
const PRODUCT = {
  name:     'Autonomous AI Task Dashboard',
  tagline:  'Deploy self-improving AI agents that work 24/7, learn from failures, and manage your tasks autonomously.',
  priceUSD: 39,
  demoUrl:  'https://dev.to/lewisallena17/building-a-self-improving-god-agent-with-claude-ai-2g4m',
  tags:     ['nextjs', 'ai', 'claude', 'supabase', 'typescript', 'agents', 'automation', 'dashboard'],
  keyFeatures: [
    'Self-improving God orchestrator that learns from every task outcome',
    'Specialist agent pools (database, UI, infra) with automatic routing',
    'Task inbox + approval workflow so you\'re always in control',
    'Built-in cost tracking with daily spend caps and per-task budget',
    'Auto-commit to git + one-click revert if God breaks something',
    'Live agent visualization (pixel-art office with zones)',
    'Command palette (Ctrl+K) for keyboard-driven operations',
    'Discord/Slack/Telegram notifications on failures and rate limits',
    'GitHub Issues sync → tasks, PR mode, CI integration',
    'Article promotion agent for Reddit, dev.to, HackerNews',
  ],
  stack: ['Next.js 14', 'TypeScript', 'Supabase', 'Claude API', 'PM2', 'Tailwind CSS'],
}

// ── Templates per marketplace ────────────────────────────────────────────────
const MARKETPLACES = [
  {
    slug:    'gumroad',
    name:    'Gumroad',
    submitUrl: 'https://app.gumroad.com/products/new',
    reviewDays: 0,
    priceHint: '$39 (sweet spot for solo devs)',
    listing: () => `# ${PRODUCT.name}

${PRODUCT.tagline}

## The problem

Building autonomous AI agents from scratch takes months. Most end up as brittle one-shot scripts that forget everything between runs and silently burn API credits.

## What you get

A production-ready Next.js + Supabase + Claude starter that runs autonomous agents 24/7. Tested, real, opinionated.

### Core system
${PRODUCT.keyFeatures.map(f => `- ${f}`).join('\n')}

### Tech stack
${PRODUCT.stack.map(s => `- ${s}`).join('\n')}

## Who this is for

- **Founders** building AI features into their product
- **Agencies** automating repeatable client work
- **Indie devs** who want agents that self-correct instead of silently failing
- **Teams** that need visibility into what their AI is actually doing

## What's included

- Complete source code (Next.js 14, TypeScript)
- Supabase migrations (todos, agents, costs, wisdom)
- 5 pre-configured agent types (God, ruflo, orchestrator, revenue, promote)
- Full dashboard UI with 20+ panels
- Deployment guide (Vercel + Supabase)
- \`.env.example\` with every knob documented

## License

Personal use + unlimited internal/commercial deployments you build.
Not for reselling the code itself.

## Demo

${PRODUCT.demoUrl}
`,
  },

  {
    slug: 'codecanyon',
    name: 'CodeCanyon (Envato)',
    submitUrl: 'https://codecanyon.net/user/dashboard/portfolio',
    reviewDays: 14,
    priceHint: '$49–89 (CodeCanyon takes ~40% — price accordingly)',
    listing: () => `ITEM TITLE (max 60 chars):
${PRODUCT.name}

SHORT DESCRIPTION (max 150 chars):
${PRODUCT.tagline.slice(0, 150)}

LONG DESCRIPTION (HTML allowed):

<h3>Self-improving AI agent system. Production-ready Next.js starter.</h3>

<p>${PRODUCT.tagline}</p>

<h3>Key Features</h3>
<ul>
${PRODUCT.keyFeatures.map(f => `  <li>${f}</li>`).join('\n')}
</ul>

<h3>Tech Stack</h3>
<ul>
${PRODUCT.stack.map(s => `  <li>${s}</li>`).join('\n')}
</ul>

<h3>What You Get</h3>
<ul>
  <li>Complete source code — no watermarks, no limits</li>
  <li>Supabase schema + migrations (11 tables, RLS configured)</li>
  <li>5 PM2-managed agent processes</li>
  <li>50+ React components, fully typed</li>
  <li>API routes for control, git, revenue, promotion</li>
  <li>Deployment guide for Vercel + self-hosted options</li>
</ul>

<h3>Requirements</h3>
<ul>
  <li>Node.js 20+</li>
  <li>Supabase account (free tier works)</li>
  <li>Anthropic API key</li>
</ul>

<h3>Changelog</h3>
<ul>
  <li><strong>v1.0.0</strong> — Initial release</li>
</ul>

TAGS (comma-separated, max 15):
${PRODUCT.tags.join(', ')}

CATEGORY: JavaScript / Node.js
COMPATIBILITY: Next.js 14, React 18, TypeScript 5
FILES INCLUDED: TS, TSX, JS, MJS, CSS, JSON, SQL, MD

NOTES TO REVIEWER:
- All API keys in .env.example are placeholders
- No third-party paid services required beyond Anthropic (docs link to free tiers)
- Demo video will be added post-approval
`,
  },

  {
    slug: 'lemonsqueezy',
    name: 'Lemon Squeezy',
    submitUrl: 'https://app.lemonsqueezy.com/products/new',
    reviewDays: 1,
    priceHint: '$39–99 (choose your cut vs Gumroad)',
    listing: () => `PRODUCT NAME:
${PRODUCT.name}

TAGLINE:
${PRODUCT.tagline}

DESCRIPTION (Markdown supported):

${PRODUCT.tagline}

**What you're buying**: A complete, production-ready starter kit for building autonomous AI agents on top of Next.js 14, Supabase, and the Claude API. This isn't a prompt template — it's a full system with a self-improving orchestrator, specialist agents, dashboard, cost controls, and version-controlled auto-edits.

---

### 🧠 What makes it different

${PRODUCT.keyFeatures.map(f => `- ${f}`).join('\n')}

---

### 🛠 Stack

${PRODUCT.stack.map(s => `- ${s}`).join('\n')}

---

### 📦 What's in the zip

- Full Next.js 14 app (\`app/\`, \`components/\`, \`lib/\`)
- All agent scripts (\`scripts/*.mjs\`)
- Supabase migrations (\`supabase/migrations/*.sql\`)
- PM2 ecosystem config
- \`.env.example\` with every knob documented
- README.md + INSTALL.md

---

### 🚀 Who should buy this

- Building a SaaS that needs automated backend ops
- Running a dev agency wanting to resell autonomous workflows
- Solo dev who wants to skip months of wiring up multi-agent plumbing

Demo article: ${PRODUCT.demoUrl}

---

### 📄 License

Single purchase = unlimited deployments you build. Not for reselling the source itself.

TAGS: ${PRODUCT.tags.join(', ')}
`,
  },

  {
    slug: 'indiehackers',
    name: 'Indie Hackers Directory',
    submitUrl: 'https://www.indiehackers.com/product/new',
    reviewDays: 2,
    priceHint: 'Free listing, drives awareness/traffic',
    listing: () => `PRODUCT NAME:
${PRODUCT.name}

TAGLINE (max 90 chars):
${PRODUCT.tagline.slice(0, 90)}

WEBSITE:
(your Gumroad URL after publishing — required field)

DESCRIPTION:

${PRODUCT.tagline}

I built this because most AI agent frameworks are brittle — they forget context between runs, silently burn credits, and give you no visibility. This is a complete Next.js + Supabase starter for building agents that self-improve, track their own spend, auto-commit their changes, and notify you when things break.

What's inside:
${PRODUCT.keyFeatures.slice(0, 6).map(f => `- ${f}`).join('\n')}

Tech: ${PRODUCT.stack.join(', ')}.

Pricing: $${PRODUCT.priceUSD} one-time on Gumroad.
Demo: ${PRODUCT.demoUrl}

FOUNDER STORY (optional but increases visibility):

After building several one-shot AI scripts that kept forgetting everything between invocations and burning API credits in silent loops, I built a persistent orchestrator that runs continuously, learns from failures, and routes work to specialist agents. It's been running in production on my own PC for weeks — it's currently improving its own dashboard UI and writing articles for me. Turns out the demo is the product.

CATEGORIES: Developer Tools, AI, Productivity
`,
  },

  {
    slug: 'producthunt',
    name: 'Product Hunt',
    submitUrl: 'https://www.producthunt.com/posts/new',
    reviewDays: 0,
    priceHint: 'Free. Launch day matters — post on a Tuesday/Wednesday at 12:01am PT',
    listing: () => `PRODUCT NAME:
${PRODUCT.name}

TAGLINE (max 60 chars):
${PRODUCT.tagline.slice(0, 60)}

DESCRIPTION (max 260 chars):
A Next.js + Supabase + Claude starter kit that runs autonomous AI agents 24/7. Self-improves, tracks spend, auto-commits, and tells you when it breaks. Built-in task inbox so you're always in control.

TOPICS (pick 3):
- Developer Tools
- Artificial Intelligence
- Productivity

WEBSITE: (your Gumroad URL after publishing)

FIRST COMMENT (post this yourself right after launching — important):

Hey Product Hunt 👋

I built ${PRODUCT.name} after getting frustrated with one-shot AI scripts that forget everything between runs and silently burn credits.

This is the full stack — the God orchestrator agent improves its own code over time (every edit is auto-committed and auto-reverted if it breaks the build), specialists handle the actual work in parallel, and the dashboard shows you exactly what's happening + where the money is going.

It's been running on my own machine for weeks — it wrote and published the demo article linked above, and it's currently editing its own UI to make this launch page better.

Happy to answer any questions!

— Lewis
`,
  },
]

// ── Build ────────────────────────────────────────────────────────────────────
function buildZip(slug) {
  const zipPath = join(DIST_ROOT, slug, `${PRODUCT.name.toLowerCase().replace(/\s+/g, '-')}-${slug}.zip`)
  try {
    execSync(`git archive --format=zip --output="${zipPath}" HEAD`, {
      cwd: PROJECT_ROOT, stdio: 'pipe',
    })
    return zipPath
  } catch (e) {
    return null
  }
}

function main() {
  if (!existsSync(DIST_ROOT)) mkdirSync(DIST_ROOT, { recursive: true })

  console.log(`\n📦 Preparing ${MARKETPLACES.length} marketplace listings...\n`)

  const manifest = {
    generatedAt: new Date().toISOString(),
    product:     PRODUCT,
    listings:    [],
  }

  for (const mp of MARKETPLACES) {
    const dir = join(DIST_ROOT, mp.slug)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    const copyPath = join(dir, 'LISTING.md')
    writeFileSync(copyPath, mp.listing(), 'utf8')

    const zipPath = buildZip(mp.slug)

    manifest.listings.push({
      slug:        mp.slug,
      name:        mp.name,
      submitUrl:   mp.submitUrl,
      reviewDays:  mp.reviewDays,
      priceHint:   mp.priceHint,
      listingPath: copyPath,
      zipPath:     zipPath ?? null,
    })

    console.log(`   ✓ ${mp.name.padEnd(30)} → ${dir}`)
  }

  const manifestPath = join(DIST_ROOT, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')

  console.log(`\n📋 Manifest: ${manifestPath}`)
  console.log(`\nNext steps:`)
  console.log(`  1. Open the dashboard → Revenue tab → Marketplace Listings`)
  console.log(`  2. For each marketplace: click submit URL, paste LISTING.md, upload the zip`)
  console.log(`  3. After submitting, click "Mark submitted" to track status\n`)
}

main()
