#!/usr/bin/env node
/**
 * backup-supabase.mjs — nightly snapshot of critical Supabase tables.
 *
 * Dumps the tables that contain irreplaceable state to
 * `backups/<YYYY-MM-DD>.json`. Git-tracked so you get version history
 * for free, and can roll back any table by reading the file.
 *
 * Runs:
 *   - nightly via .github/workflows/backup.yml (cron)
 *   - on-demand: `node scripts/backup-supabase.mjs`
 *
 * Keeps the last 30 daily snapshots. Older files purged automatically.
 */

import { createClient } from '@supabase/supabase-js'
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const BACKUP_DIR   = join(PROJECT_ROOT, 'backups')

// Load .env.local if running locally (GitHub Actions uses repo secrets)
const envPath = join(PROJECT_ROOT, '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('✗ SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required')
  process.exit(1)
}
const supabase = createClient(url, key)

// Tables to back up. Anything with irreplaceable state. Skip large
// high-churn tables like `traces` which would blow past GitHub's file
// size limit — those live in Supabase's own point-in-time recovery
// on paid plans if you need them.
const TABLES = [
  { name: 'todos',                     orderBy: 'created_at' },
  { name: 'subscribers',               orderBy: 'created_at' },
  { name: 'god_status',                orderBy: 'id' },
  { name: 'task_history',              orderBy: 'created_at' },
  { name: 'agent_sql_execution_log',   orderBy: 'executed_at' },
]

async function dumpTable({ name, orderBy }) {
  try {
    const { data, error } = await supabase.from(name).select('*').order(orderBy, { ascending: true }).limit(10_000)
    if (error) return { name, error: error.message, rows: 0 }
    return { name, rows: (data ?? []).length, data }
  } catch (e) {
    return { name, error: e.message, rows: 0 }
  }
}

async function backup() {
  if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })
  const today = new Date().toISOString().slice(0, 10)
  const outFile = join(BACKUP_DIR, `${today}.json`)

  console.log(`▸ Backing up ${TABLES.length} tables → ${outFile}`)

  const tables = {}
  let totalRows = 0
  for (const spec of TABLES) {
    const r = await dumpTable(spec)
    if (r.error) {
      console.log(`  ✗ ${r.name}: ${r.error}`)
      tables[r.name] = { error: r.error, rows: 0, data: [] }
    } else {
      console.log(`  ✓ ${r.name}: ${r.rows} rows`)
      tables[r.name] = { rows: r.rows, data: r.data }
      totalRows += r.rows
    }
  }

  const payload = {
    backedUpAt: new Date().toISOString(),
    projectUrl: url,
    totalRows,
    tables,
  }

  writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`\n✓ Wrote ${totalRows.toLocaleString()} rows to ${outFile}`)

  // Purge snapshots older than 30 days — keeps git from ballooning
  const files = readdirSync(BACKUP_DIR).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()
  if (files.length > 30) {
    const toDelete = files.slice(0, files.length - 30)
    for (const f of toDelete) unlinkSync(join(BACKUP_DIR, f))
    console.log(`  purged ${toDelete.length} old snapshot(s)`)
  }
}

await backup()
