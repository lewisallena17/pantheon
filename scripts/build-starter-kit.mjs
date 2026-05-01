#!/usr/bin/env node
// Bundles a sellable starter-kit zip from the task-dashboard repo.
// Strips secrets + build artefacts + private operational logs.
//
// Output: ../pantheon-starter-kit-v1.zip (next to task-dashboard/)
//
// Run from project root:  node scripts/build-starter-kit.mjs

import { execSync } from 'node:child_process'
import { mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')              // task-dashboard/
const PARENT    = resolve(ROOT, '..')                   // C:\Users\LTAGB\
const STAGING   = join(PARENT, 'pantheon-starter-kit-staging')
const ZIP_OUT   = join(PARENT, 'pantheon-starter-kit-v1.zip')

// Files / dirs that must NEVER ship to a buyer.
const NEVER_SHIP = new Set([
  '.env.local',
  '.env',
  '.env.production',
  '.env.development',
  '.next',
  'node_modules',
  '.git',
  '.vercel',
  '.turbo',
  'tsconfig.tsbuildinfo',
  'vercel-env.json',
  'vercel-proj.json',
  'pantheon-starter-kit-staging',
])

// Operational/private data files inside scripts/ that shouldn't ship.
const STRIP_IN_SCRIPTS = new Set([
  'cost-log.json',
  'revenue-log.json',
  'god-wisdom.json',
  'god-research.json',
  'verification-log.json',
  'promote-log.json',
  'pending-commits.json',
  'user-profile.json',
])

console.log('▸ Cleaning staging dir…')
if (existsSync(STAGING)) rmSync(STAGING, { recursive: true, force: true })
mkdirSync(STAGING, { recursive: true })

console.log('▸ Copying repo (excluding secrets, build, node_modules)…')
function copyTree(src, dst) {
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (NEVER_SHIP.has(entry.name)) continue
    const s = join(src, entry.name)
    const d = join(dst, entry.name)
    if (entry.isDirectory()) {
      mkdirSync(d, { recursive: true })
      copyTree(s, d)
    } else {
      cpSync(s, d)
    }
  }
}
copyTree(ROOT, STAGING)

console.log('▸ Stripping operational JSON from scripts/…')
const scriptsDst = join(STAGING, 'scripts')
if (existsSync(scriptsDst)) {
  for (const f of readdirSync(scriptsDst)) {
    if (STRIP_IN_SCRIPTS.has(f)) {
      rmSync(join(scriptsDst, f))
      console.log(`  ✗ removed scripts/${f}`)
    }
  }
}

console.log('▸ Writing fresh .env.example so buyers know what to fill…')
writeFileSync(join(STAGING, '.env.example'), `# Required ── fill these to run the dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=

# Optional ── auto-content + monetization
DEV_TO_API_KEY=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_AMAZON_US_TAG=
NEXT_PUBLIC_AMAZON_UK_TAG=
GITHUB_TOKEN=

# Cost guardrails
DAILY_COST_LIMIT_USD=2
MAX_TASK_COST_USD=0.10
GOD_RATE_CAP_USD=1
GOD_RATE_PAUSE_MIN=10
GOD_RATE_WINDOW_MIN=60
`)

console.log('▸ Writing buyer-facing SETUP.md…')
writeFileSync(join(STAGING, 'SETUP.md'), `# Pantheon Starter Kit — Setup

You bought it; here's how to run it.

## What you have

A complete autonomous AI agent system: a "God" orchestrator that wakes up
every 2 minutes, plans tasks, dispatches them to specialist agent pools,
and ships results to a real-time dashboard. Includes 44 pre-written SEO
topic pages with AdSense + Amazon affiliate slots wired in.

## Prerequisites

- Node.js 20+
- A Supabase project (free tier works)
- An Anthropic API key with credits
- Optional: PM2 for keeping agents alive (\`npm install -g pm2\`)

## 5-minute setup

1. \`npm install\`
2. \`cp .env.example .env.local\` and fill in your keys
3. Apply the schema: open Supabase SQL editor, paste the contents of
   \`supabase/migrations/*.sql\` in order
4. \`npm run dev\` — dashboard at http://localhost:3000
5. Start the agents: \`pm2 start ecosystem.config.cjs\`
6. Watch \`pm2 logs god\` to see the orchestrator wake up

## What runs

\`ecosystem.config.cjs\` defines 9 PM2 processes:

| Process | Purpose |
|---|---|
| god | Strategic orchestrator. Wakes every 2 min, plans, dispatches. |
| ruflo-orchestrator | Routes tasks to specialist pools by category. |
| ruflo-agents | The specialist worker pool (db / ui / infra / analysis). |
| promote | Auto-creates dev.to articles + Gumroad listings. |
| watchdog | Detects stuck agents and force-restarts. |
| jarvis-briefings | Generates the daily voice-over briefing. |
| god-poster | Cross-posts content. |
| god-dreams | Off-cycle creative goal generation. |

## Cost guardrails

- \`DAILY_COST_LIMIT_USD\` is a hard cap; agents pause at the limit.
- \`MAX_TASK_COST_USD\` is per-task — runaway prompts are cancelled.
- \`GOD_RATE_CAP_USD\` + \`GOD_RATE_PAUSE_MIN\` is a circuit breaker:
  if God spends \$1 in a 60-min window it pauses for 10 min.

## Monetization (already wired)

- All 44 \`app/topics/*\` pages render two AdSense slots + an Amazon
  affiliate banner. Set the env vars and they monetize automatically.
- The revenue agent posts to dev.to every 24h with adaptive back-off.
- The Gumroad listing generator is in \`scripts/generate-listings.mjs\`.

## Deploying

\`vercel deploy --prod\` — env vars need to be added in Vercel's dashboard
or via \`vercel env add\`. Same keys as \`.env.local\`.

## Support

This is a code-as-product offering, not a SaaS. You own the code; you
host it; you keep what it earns. No support contract included.

Build something good with it.
`)

console.log('▸ Cleaning staging README of any private references (best-effort)…')
const readmePath = join(STAGING, 'README.md')
if (existsSync(readmePath)) {
  let r = readFileSync(readmePath, 'utf8')
  // Remove any token-shaped strings just in case
  r = r.replace(/sk-ant-api[a-zA-Z0-9_-]+/g, 'sk-ant-api••••')
       .replace(/vcp_[a-zA-Z0-9]+/g,           'vcp_••••')
       .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, 'eyJ••••.••••.••••')
  writeFileSync(readmePath, r)
}

console.log('▸ Zipping…')
if (existsSync(ZIP_OUT)) rmSync(ZIP_OUT)

// Use PowerShell's Compress-Archive — works on Windows without external deps.
try {
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${STAGING}\\*' -DestinationPath '${ZIP_OUT}' -Force"`, { stdio: 'inherit' })
} catch {
  // Fall back to system zip if powershell missing
  execSync(`zip -rq "${ZIP_OUT}" .`, { cwd: STAGING, stdio: 'inherit' })
}

const sizeMb = (statSync(ZIP_OUT).size / (1024 * 1024)).toFixed(2)
console.log(`\n✓ Built: ${ZIP_OUT}  (${sizeMb} MB)`)
console.log(`  Upload this single file to Gumroad's "Content" section.\n`)

// Tidy: keep staging for inspection but tell the user it's there.
console.log(`  (Staging dir at ${STAGING} kept for inspection — safe to delete.)`)
