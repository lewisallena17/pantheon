/**
 * Export task_history with actor_id grouping counts using agent_exec_sql()
 *
 * This script demonstrates exporting task history data grouped by actor_id,
 * showing activity counts and patterns for each actor.
 *
 * Usage:
 *   npx tsx scripts/export-task-history.ts [options]
 *
 * Options:
 *   --format=json|csv      Output format (default: json)
 *   --group-by=actor_id|actor_name|action
 *                          Grouping field (default: actor_id)
 *   --output=filename      Save to file instead of stdout
 *   --detailed             Include additional calculated metrics
 *
 * Examples:
 *   # Export JSON grouped by actor_id
 *   npx tsx scripts/export-task-history.ts
 *
 *   # Export CSV grouped by actor_id
 *   npx tsx scripts/export-task-history.ts --format=csv
 *
 *   # Export grouped by actor_name and save to file
 *   npx tsx scripts/export-task-history.ts --group-by=actor_name --output=actor-summary.json
 *
 * Required env vars:
 *   SUPABASE_URL              — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service role key for server-side operations
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface ExportOptions {
  format: 'json' | 'csv'
  groupBy: 'actor_id' | 'actor_name' | 'action'
  output?: string
  detailed: boolean
}

async function exportTaskHistory(options: ExportOptions) {
  console.log(`[task-history-export] Starting export...`)
  console.log(`  Format: ${options.format}`)
  console.log(`  Group by: ${options.groupBy}`)

  try {
    // Build the SQL query using GROUP BY
    let query: string

    if (options.groupBy === 'actor_id') {
      query = `
        SELECT
          th.actor_id,
          MAX(th.actor_name) as actor_name,
          COUNT(*) as total_actions,
          COUNT(*) FILTER (WHERE th.action IN ('updated', 'completed')) as status_changes,
          COUNT(*) FILTER (WHERE th.action = 'created') as created_actions,
          COUNT(*) FILTER (WHERE th.action = 'updated') as updated_actions,
          COUNT(*) FILTER (WHERE th.action = 'completed') as completed_actions,
          COUNT(*) FILTER (WHERE th.action = 'failed') as failed_actions,
          COUNT(*) FILTER (WHERE th.action NOT IN ('created', 'updated', 'completed', 'failed')) as other_actions,
          MIN(th.changed_at) as first_action_at,
          MAX(th.changed_at) as last_action_at
        FROM public.task_history th
        GROUP BY th.actor_id
        ORDER BY total_actions DESC
      `
    } else if (options.groupBy === 'actor_name') {
      query = `
        SELECT
          COALESCE(th.actor_name, 'Unknown') as actor_name,
          COUNT(DISTINCT th.actor_id) as unique_actors,
          COUNT(*) as total_actions,
          COUNT(*) FILTER (WHERE th.action IN ('updated', 'completed')) as status_changes,
          COUNT(*) FILTER (WHERE th.action = 'created') as created_actions,
          COUNT(*) FILTER (WHERE th.action = 'updated') as updated_actions,
          COUNT(*) FILTER (WHERE th.action = 'completed') as completed_actions,
          COUNT(*) FILTER (WHERE th.action = 'failed') as failed_actions,
          COUNT(*) FILTER (WHERE th.action NOT IN ('created', 'updated', 'completed', 'failed')) as other_actions,
          MIN(th.changed_at) as first_action_at,
          MAX(th.changed_at) as last_action_at
        FROM public.task_history th
        GROUP BY COALESCE(th.actor_name, 'Unknown')
        ORDER BY total_actions DESC
      `
    } else {
      query = `
        SELECT
          th.action,
          COUNT(DISTINCT th.actor_id) as unique_actors,
          COUNT(*) as total_count,
          MIN(th.changed_at) as first_occurrence,
          MAX(th.changed_at) as last_occurrence,
          COUNT(DISTINCT th.task_id) as unique_tasks
        FROM public.task_history th
        GROUP BY th.action
        ORDER BY total_count DESC
      `
    }

    // Execute the query using agent_exec_sql RPC function
    console.log(`[task-history-export] Executing query via agent_exec_sql()...`)
    const { data: execResult, error: execError } = await supabase.rpc('agent_exec_sql', {
      query: query,
    })

    if (execError) {
      console.error('[task-history-export] RPC error:', execError)
      throw new Error(`agent_exec_sql failed: ${execError.message}`)
    }

    if (!execResult) {
      console.error('[task-history-export] No data returned')
      throw new Error('No data returned from agent_exec_sql')
    }

    // Handle potential error in response
    if (typeof execResult === 'object' && !Array.isArray(execResult) && 'error' in execResult) {
      console.error('[task-history-export] Query error:', execResult)
      throw new Error(`Query execution failed: ${(execResult as any).error}`)
    }

    const rows = (Array.isArray(execResult) ? execResult : []) as Record<string, unknown>[]

    console.log(`[task-history-export] Retrieved ${rows.length} groups`)

    let output: string | Buffer

    if (options.format === 'csv') {
      // Convert to CSV
      if (rows.length === 0) {
        output = ''
      } else {
        const headers = Object.keys(rows[0])
        const csvHeader = headers.map(h => `"${h}"`).join(',')
        const csvRows = rows.map(row =>
          headers
            .map(h => {
              const value = row[h]
              if (value === null || value === undefined) return '""'
              if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
              return `"${String(value)}"`
            })
            .join(',')
        )
        output = [csvHeader, ...csvRows].join('\n')
      }
    } else {
      // JSON format
      output = JSON.stringify(
        {
          group_by: options.groupBy,
          total_records: rows.length,
          data: rows,
          exported_at: new Date().toISOString(),
        },
        null,
        2
      )
    }

    if (options.output) {
      // Save to file
      const filePath = path.resolve(process.cwd(), options.output)
      fs.writeFileSync(filePath, output)
      console.log(`[task-history-export] Export saved to: ${filePath}`)
    } else {
      // Output to stdout
      console.log(output)
    }
  } catch (error) {
    console.error('[task-history-export] Error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
function parseArgs(): ExportOptions {
  const args = process.argv.slice(2)
  const options: ExportOptions = {
    format: 'json',
    groupBy: 'actor_id',
    detailed: false,
  }

  for (const arg of args) {
    if (arg.startsWith('--format=')) {
      const value = arg.split('=')[1]
      if (value === 'json' || value === 'csv') {
        options.format = value
      }
    } else if (arg.startsWith('--group-by=')) {
      const value = arg.split('=')[1]
      if (value === 'actor_id' || value === 'actor_name' || value === 'action') {
        options.groupBy = value as 'actor_id' | 'actor_name' | 'action'
      }
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1]
    } else if (arg === '--detailed') {
      options.detailed = true
    } else if (arg === '--help') {
      console.log(`
Export task_history with actor_id grouping counts using agent_exec_sql()

Usage:
  npx tsx scripts/export-task-history.ts [options]

Options:
  --format=json|csv       Output format (default: json)
  --group-by=field        Grouping field: actor_id|actor_name|action (default: actor_id)
  --output=filename       Save to file instead of stdout
  --detailed              Include additional calculated metrics
  --help                  Show this help message

Examples:
  # Export JSON grouped by actor_id
  npx tsx scripts/export-task-history.ts

  # Export CSV grouped by actor_id
  npx tsx scripts/export-task-history.ts --format=csv

  # Export grouped by actor_name and save to file
  npx tsx scripts/export-task-history.ts --group-by=actor_name --output=actor-summary.json

  # Export grouped by action type as CSV
  npx tsx scripts/export-task-history.ts --group-by=action --format=csv --output=actions.csv
      `)
      process.exit(0)
    }
  }

  return options
}

// Main entry point
const options = parseArgs()
exportTaskHistory(options)
