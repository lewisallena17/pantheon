import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ActorActivitySummary {
  actor_id: string
  actor_name: string | null
  status_transition_count: number
  total_actions: number
  average_time_between_actions_seconds: number | null
  last_seen_at: string | null
  first_seen_at: string | null
  action_rate_per_hour?: number
}

/**
 * GET /api/reports/actor-activity
 * 
 * Query parameters:
 *   - days: number of days to look back (default: 30)
 *   - detailed: boolean to include additional calculated metrics (default: false)
 * 
 * Returns: array of actor activity summaries
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const searchParams = req.nextUrl.searchParams
  
  const days = parseInt(searchParams.get('days') ?? '30', 10)
  const detailed = searchParams.get('detailed') === 'true'

  if (days < 1 || days > 365) {
    return NextResponse.json(
      { error: 'days parameter must be between 1 and 365' },
      { status: 400 }
    )
  }

  try {
    // Use the agent_exec_sql function to query task_history
    const query = `
      SELECT 
        th.actor_id,
        th.actor_name,
        COUNT(*) FILTER (WHERE th.new_values ? 'status') as status_transition_count,
        COUNT(*) as total_actions,
        ROUND(AVG(
          EXTRACT(EPOCH FROM (
            LEAD(th.changed_at) OVER (
              PARTITION BY th.actor_id 
              ORDER BY th.changed_at
            ) - th.changed_at
          ))
        )::numeric, 2) as average_time_between_actions_seconds,
        MAX(th.changed_at) as last_seen_at,
        MIN(th.changed_at) as first_seen_at,
        COUNT(*) FILTER (
          WHERE th.action IN ('create', 'update', 'delete')
        ) as tracked_action_count
      FROM task_history th
      WHERE th.changed_at >= now() - interval '${days} days'
      GROUP BY th.actor_id, th.actor_name
      ORDER BY total_actions DESC
    `

    // Execute via agent_exec_sql
    const { data: execResult, error: execError } = await supabase.rpc('agent_exec_sql', {
      query,
    })

    if (execError) {
      console.error('[actor-activity] agent_exec_sql error:', execError)
      return NextResponse.json(
        { error: 'Failed to execute query', details: execError.message },
        { status: 500 }
      )
    }

    if (!execResult || (Array.isArray(execResult) && execResult.length === 0)) {
      return NextResponse.json([])
    }

    // Handle potential error response from agent_exec_sql
    if (typeof execResult === 'object' && !Array.isArray(execResult) && 'error' in execResult) {
      console.error('[actor-activity] query execution error:', execResult)
      return NextResponse.json(
        { error: 'Query execution failed', details: (execResult as any).error },
        { status: 500 }
      )
    }

    const summaries = (Array.isArray(execResult) ? execResult : []) as ActorActivitySummary[]

    // Calculate additional metrics if detailed view requested
    if (detailed) {
      return NextResponse.json(
        summaries.map(s => ({
          ...s,
          action_rate_per_hour: s.total_actions > 0 && s.first_seen_at && s.last_seen_at
            ? parseFloat((
                (s.total_actions * 3600) / 
                ((new Date(s.last_seen_at).getTime() - new Date(s.first_seen_at).getTime()) / 1000)
              ).toFixed(2))
            : 0,
        }))
      )
    }

    return NextResponse.json(summaries)
  } catch (error) {
    console.error('[actor-activity] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
