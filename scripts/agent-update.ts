/**
 * Agent script — writes task status changes directly to Supabase.
 *
 * The dashboard subscribes to postgres_changes over WebSocket.
 * When this script calls .update(), Supabase emits an UPDATE event and
 * the dashboard row flashes yellow within ~100ms — no polling needed.
 *
 * Usage:
 *   npx tsx scripts/agent-update.ts <task-uuid> <status> [agent-name]
 *
 * Example:
 *   npx tsx scripts/agent-update.ts abc123 in_progress agent-worker-1
 *
 * Required env vars (add to .env.local or export before running):
 *   SUPABASE_URL               — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — service role key (bypasses RLS)
 *                                NEVER expose this client-side
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/todos'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

// Use the service role key for agent scripts — this bypasses RLS so the
// agent can write regardless of auth state. Keep this key server-side only.
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

type Status = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked'

async function updateTaskStatus(taskId: string, status: Status, agentName?: string) {
  const { data, error } = await supabase
    .from('todos')
    .update({
      status,
      ...(agentName ? { assigned_agent: agentName } : {}),
      // updated_at is handled by the DB trigger — do not set manually
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error(`[${agentName ?? 'agent'}] Failed to update ${taskId}:`, error.message)
    throw error
  }

  console.log(`[${agentName ?? 'agent'}] ${taskId} → ${status}`)
  return data
}

async function createTask(title: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium', agentName?: string) {
  const { data, error } = await supabase
    .from('todos')
    .insert({ title, priority, status: 'pending', assigned_agent: agentName ?? null })
    .select()
    .single()

  if (error) throw error
  console.log(`[${agentName ?? 'agent'}] Created task: ${data.id} — "${title}"`)
  return data
}

// ---------- CLI entry point ----------

async function main() {
  const [taskId, status, agentName] = process.argv.slice(2)

  if (!taskId || !status) {
    console.log(`
Usage:
  npx tsx scripts/agent-update.ts <task-uuid> <status> [agent-name]

Statuses: pending | in_progress | completed | failed | blocked

Demo (creates a task and simulates processing):
  npx tsx scripts/agent-update.ts --demo
    `)
    process.exit(0)
  }

  if (taskId === '--demo') {
    // Create a task, then simulate processing it
    const task = await createTask('Demo task from agent script', 'high', 'agent-demo')
    await new Promise(r => setTimeout(r, 1000))
    await updateTaskStatus(task.id, 'in_progress', 'agent-demo')
    await new Promise(r => setTimeout(r, 2000))
    await updateTaskStatus(task.id, 'completed', 'agent-demo')
    console.log('Demo complete — check your dashboard!')
    return
  }

  const validStatuses: Status[] = ['pending', 'in_progress', 'completed', 'failed', 'blocked']
  if (!validStatuses.includes(status as Status)) {
    console.error(`Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`)
    process.exit(1)
  }

  await updateTaskStatus(taskId, status as Status, agentName)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
