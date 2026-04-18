#!/usr/bin/env node
/**
 * Bootstraps Vercel env vars for the task-dashboard project via REST API.
 * Uses the project.json already created by `vercel link`.
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

const TOKEN = process.env.VERCEL_TOKEN
if (!TOKEN) { console.error('VERCEL_TOKEN not set'); process.exit(1) }

const project = JSON.parse(readFileSync(join(PROJECT_ROOT, '.vercel/project.json'), 'utf8'))
const { projectId, orgId } = project

// Read .env.local
const envLocal = {}
for (const line of readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m) envLocal[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const VARS_TO_SYNC = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ANTHROPIC_API_KEY',
  'DEV_TO_API_KEY',
  'DISCORD_WEBHOOK_URL',
  'DAILY_COST_LIMIT_USD',
  'MAX_TASK_COST_USD',
  'MAX_INPUT_TOKENS_PER_RUN',
  'GITHUB_REPO',
  'GITHUB_TOKEN',
  'GOD_AUTO_APPROVE',
  'GOD_RATE_WINDOW_MIN',
  'GOD_RATE_CAP_USD',
  'GOD_RATE_PAUSE_MIN',
]

const apiBase = `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${orgId}`

// List existing env vars so we can update instead of duplicate
const existingRes = await fetch(apiBase.replace('/v10/', '/v9/'), {
  headers: { Authorization: `Bearer ${TOKEN}` },
})
const existing = await existingRes.json()
const existingByKey = new Map()
for (const e of existing.envs ?? []) existingByKey.set(e.key, e)

console.log(`▸ Syncing ${VARS_TO_SYNC.length} env vars to Vercel project ${project.projectName}\n`)

let created = 0, updated = 0, skipped = 0

for (const key of VARS_TO_SYNC) {
  const value = envLocal[key]
  if (!value) { console.log(`  [${key}] ⚠  not in .env.local, skipping`); skipped++; continue }

  const current = existingByKey.get(key)
  if (current) {
    // Update existing
    const r = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${current.id}?teamId=${orgId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ value }),
    })
    if (r.ok) { console.log(`  [${key}] ✓ updated`); updated++ }
    else { console.log(`  [${key}] ✗ update failed: ${r.status} ${await r.text()}`) }
  } else {
    // Create new
    const r = await fetch(apiBase, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        key, value,
        type:   'encrypted',
        target: ['production', 'preview', 'development'],
      }),
    })
    if (r.ok) { console.log(`  [${key}] ✓ created`); created++ }
    else { console.log(`  [${key}] ✗ create failed: ${r.status} ${await r.text()}`) }
  }
}

console.log(`\n▸ Done: ${created} created · ${updated} updated · ${skipped} skipped`)
