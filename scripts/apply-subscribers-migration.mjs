#!/usr/bin/env node
/**
 * One-shot migration runner. Applies 0016_subscribers.sql via the existing
 * agent_exec_ddl() Supabase function. Idempotent — safe to run multiple times.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// Load .env.local
for (const line of readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Each statement executed individually — agent_exec_ddl takes ONE statement
const STATEMENTS = [
  `CREATE EXTENSION IF NOT EXISTS citext`,
  `CREATE TABLE IF NOT EXISTS public.subscribers (
      id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
      email           citext      UNIQUE NOT NULL,
      source          text        NOT NULL DEFAULT 'unknown',
      referrer        text,
      confirmed       boolean     NOT NULL DEFAULT false,
      created_at      timestamptz NOT NULL DEFAULT now(),
      unsubscribed_at timestamptz
   )`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_created_at
      ON public.subscribers (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_source
      ON public.subscribers (source)`,
  `ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY`,
  `DROP POLICY IF EXISTS "anyone can subscribe" ON public.subscribers`,
  `CREATE POLICY "anyone can subscribe"
      ON public.subscribers
      FOR INSERT
      WITH CHECK (true)`,
  `DROP POLICY IF EXISTS "service role can read all" ON public.subscribers`,
  `CREATE POLICY "service role can read all"
      ON public.subscribers
      FOR SELECT
      USING (auth.role() = 'service_role')`,
]

console.log(`▸ Applying ${STATEMENTS.length} DDL statements via agent_exec_ddl…\n`)

let ok = 0
for (const [i, sql] of STATEMENTS.entries()) {
  const label = sql.split('\n')[0].slice(0, 80)
  process.stdout.write(`  [${i + 1}/${STATEMENTS.length}] ${label}… `)
  const { data, error } = await supabase.rpc('agent_exec_ddl', {
    statement:    sql,
    p_agent_name: 'migration-runner',
    p_task_id:    '00000000-0000-0000-0000-000000000000',
  })

  if (error) {
    console.log(`✗`)
    console.log(`     ERROR: ${error.message}`)
    continue
  }
  if (typeof data === 'string' && data.startsWith('ERROR')) {
    console.log(`✗`)
    console.log(`     ${data}`)
    continue
  }
  console.log(`✓ ${data}`)
  ok++
}

console.log(`\n▸ ${ok}/${STATEMENTS.length} statements applied.`)

// Sanity check: insert + delete a test row
console.log(`\n▸ Verifying table is writable…`)
const testEmail = `migration-test-${Date.now()}@example.invalid`
const { error: insErr } = await supabase
  .from('subscribers')
  .insert({ email: testEmail, source: 'migration-test' })
if (insErr) {
  console.log(`  ✗ insert failed: ${insErr.message}`)
  process.exit(1)
}
await supabase.from('subscribers').delete().eq('email', testEmail)
console.log(`  ✓ insert + delete round-trip succeeded`)

console.log(`\n🎉 Subscribers table is live. Restart Next.js dev server to pick it up.`)
