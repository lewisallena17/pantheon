import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ActorGroupCount {
  actor_id: string
  actor_name: string | null
  total_actions: number
  status_changes: number
  created_actions: number
  updated_actions: number
  completed_actions: number
  failed_actions: number
  other_actions: number
  first_action_at: string | null
  last_action_at: string | null
}

/**
 * GET /api/reports/task-history-export
 *
 * Exports task_history with actor_id grouping counts using agent_exec_sql() with GROUP BY.
 *
 * Query parameters:
 *   - format: 'json' | 'csv' (default: 'json')
 *   - group_by: 'actor_id' (default), or other fields
 *
 * Returns: Grouped task history activity summary by actor
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const searchParams = req.nextUrl.searchParams

  const format = searchParams.get('format') ?? 'json'
  const groupBy = searchParams.get('group_by') ?? 'actor_id'

  // Validate format
  if (!['json', 'csv'].includes(format)) {
    return NextResponse.json(
      { error: 'Invalid format. Must be "json" or "csv"' },
      { status: 400 }
    )
  }

  // Validate group_by
  if (!['actor_id', 'actor_name', 'action'].includes(groupBy)) {
    return NextResponse.json(
      { error: 'Invalid group_by. Must be "actor_id", "actor_name", or "action"' },
      { status: 400 }
    )
  }

  try {
    // Build the SQL query using GROUP BY for the specified field
    let query: string

    if (groupBy === 'actor_id') {
      // Default: group by actor_id (use the existing get_actor_activity_counts function via agent_exec_sql)
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
    } else if (groupBy === 'actor_name') {
      // Group by actor_name
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
      // Group by action type
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

    // Execute query via agent_exec_sql RPC function
    const { data: execResult, error: execError } = await supabase.rpc('agent_exec_sql', {
      query: query,
    })

    if (execError) {
      console.error('[task-history-export] agent_exec_sql error:', execError)
      return NextResponse.json(
        { error: 'Failed to execute query', details: execError.message },
        { status: 500 }
      )
    }

    if (!execResult) {
      if (format === 'csv') {
        return new NextResponse('', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="task-history-export.csv"',
          },
        })
      }
      return NextResponse.json([])
    }

    // Handle potential error response from agent_exec_sql
    if (typeof execResult === 'object' && !Array.isArray(execResult) && 'error' in execResult) {
      console.error('[task-history-export] query execution error:', execResult)
      return NextResponse.json(
        { error: 'Query execution failed', details: (execResult as any).error },
        { status: 500 }
      )
    }

    const rows = (Array.isArray(execResult) ? execResult : []) as Record<string, unknown>[]

    if (format === 'csv') {
      // Convert rows to CSV format
      if (rows.length === 0) {
        return new NextResponse('', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="task-history-export.csv"',
          },
        })
      }

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

      const csv = [csvHeader, ...csvRows].join('\n')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="task-history-export.csv"',
        },
      })
    }

    // Return JSON format
    return NextResponse.json({
      group_by: groupBy,
      total_records: rows.length,
      data: rows,
      exported_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[task-history-export] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
