import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface AnomalySummary {
  status: string
  count: number
  total_events: number
  percentage: number
  latest_event_at: string | null
  oldest_event_at: string | null
}

/**
 * GET /api/reports/connection-quality-anomalies
 *
 * Exports connection_quality_events anomaly summary count by status using agent_exec_sql().
 *
 * Query parameters:
 *   - format: 'json' | 'csv' (default: 'json')
 *   - include_dismissed: boolean to include dismissed anomalies (default: false)
 *   - days: number of days to look back (default: 30)
 *
 * Returns: Anomaly summary counts grouped by status
 *
 * Status categories:
 *   - 'resolved': has resolved_at IS NOT NULL
 *   - 'dismissed': has dismissed_at IS NOT NULL
 *   - 'open': has resolved_at IS NULL AND dismissed_at IS NULL
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const searchParams = req.nextUrl.searchParams

  const format = searchParams.get('format') ?? 'json'
  const includeDismissed = searchParams.get('include_dismissed') === 'true'
  const days = parseInt(searchParams.get('days') ?? '30', 10)

  // Validate format
  if (!['json', 'csv'].includes(format)) {
    return NextResponse.json(
      { error: 'Invalid format. Must be "json" or "csv"' },
      { status: 400 }
    )
  }

  // Validate days
  if (days < 1 || days > 365) {
    return NextResponse.json(
      { error: 'days parameter must be between 1 and 365' },
      { status: 400 }
    )
  }

  try {
    // Build the SQL query to get anomaly summary counts by status
    const query = `
      WITH anomaly_statuses AS (
        SELECT
          CASE
            WHEN resolved_at IS NOT NULL THEN 'resolved'
            WHEN dismissed_at IS NOT NULL THEN 'dismissed'
            ELSE 'open'
          END as status,
          id,
          created_at
        FROM connection_quality_events
        WHERE created_at >= now() - interval '${days} days'
          ${includeDismissed ? '' : "AND (dismissed_at IS NULL OR dismissed_at <= resolved_at)"}
      ),
      status_counts AS (
        SELECT
          status,
          COUNT(*) as count,
          MIN(created_at) as oldest_event_at,
          MAX(created_at) as latest_event_at
        FROM anomaly_statuses
        GROUP BY status
      ),
      total_count AS (
        SELECT COUNT(*) as total FROM anomaly_statuses
      )
      SELECT
        sc.status,
        sc.count,
        tc.total as total_events,
        ROUND(100.0 * sc.count / NULLIF(tc.total, 0), 2) as percentage,
        sc.latest_event_at,
        sc.oldest_event_at
      FROM status_counts sc
      CROSS JOIN total_count tc
      ORDER BY sc.count DESC
    `

    // Execute query via agent_exec_sql RPC function
    const { data: execResult, error: execError } = await supabase.rpc('agent_exec_sql', {
      query: query,
    })

    if (execError) {
      console.error('[connection-quality-anomalies] agent_exec_sql error:', execError)
      return NextResponse.json(
        { error: 'Failed to execute query', details: execError.message },
        { status: 500 }
      )
    }

    if (!execResult) {
      if (format === 'csv') {
        return new NextResponse('status,count,total_events,percentage,latest_event_at,oldest_event_at\n', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="connection-quality-anomalies.csv"',
          },
        })
      }
      return NextResponse.json({
        summary_by_status: [],
        filters: {
          days,
          include_dismissed: includeDismissed,
        },
        total_anomalies: 0,
        exported_at: new Date().toISOString(),
      })
    }

    // Handle potential error response from agent_exec_sql
    if (typeof execResult === 'object' && !Array.isArray(execResult) && 'error' in execResult) {
      console.error('[connection-quality-anomalies] query execution error:', execResult)
      return NextResponse.json(
        { error: 'Query execution failed', details: (execResult as any).error },
        { status: 500 }
      )
    }

    const rows = (Array.isArray(execResult) ? execResult : []) as AnomalySummary[]

    if (format === 'csv') {
      // Convert rows to CSV format
      if (rows.length === 0) {
        return new NextResponse('status,count,total_events,percentage,latest_event_at,oldest_event_at\n', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="connection-quality-anomalies.csv"',
          },
        })
      }

      const headers = Object.keys(rows[0])
      const csvHeader = headers.map(h => `"${h}"`).join(',')
      const csvRows = rows.map(row =>
        headers
          .map(h => {
            const value = row[h as keyof AnomalySummary]
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
          'Content-Disposition': 'attachment; filename="connection-quality-anomalies.csv"',
        },
      })
    }

    // Calculate total anomalies
    const totalAnomalies = rows.reduce((sum, row) => sum + row.count, 0)

    // Return JSON format
    return NextResponse.json({
      summary_by_status: rows,
      filters: {
        days,
        include_dismissed: includeDismissed,
      },
      total_anomalies: totalAnomalies,
      status_count: rows.length,
      exported_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[connection-quality-anomalies] error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint (metadata) - returns information about the endpoint
 */
export async function HEAD(req: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/reports/connection-quality-anomalies',
    method: 'GET',
    description: 'Export connection_quality_events anomaly summary count by status',
    query_parameters: {
      format: 'json | csv (default: json)',
      include_dismissed: 'boolean to include dismissed anomalies (default: false)',
      days: 'number of days to look back, 1-365 (default: 30)',
    },
    returns: {
      summary_by_status: 'Array of anomaly counts by status',
      filters: 'Applied filters',
      total_anomalies: 'Total count of anomalies',
      status_count: 'Number of distinct statuses',
      exported_at: 'ISO 8601 timestamp of export',
    },
    status_values: ['open', 'resolved', 'dismissed'],
    example_response: {
      summary_by_status: [
        {
          status: 'open',
          count: 12,
          total_events: 25,
          percentage: 48.0,
          latest_event_at: '2024-01-15T10:30:45.123Z',
          oldest_event_at: '2024-01-10T14:20:00.000Z',
        },
        {
          status: 'resolved',
          count: 10,
          total_events: 25,
          percentage: 40.0,
          latest_event_at: '2024-01-15T09:45:30.456Z',
          oldest_event_at: '2024-01-08T08:15:20.789Z',
        },
        {
          status: 'dismissed',
          count: 3,
          total_events: 25,
          percentage: 12.0,
          latest_event_at: '2024-01-14T16:20:10.321Z',
          oldest_event_at: '2024-01-12T11:05:00.654Z',
        },
      ],
      filters: {
        days: 30,
        include_dismissed: false,
      },
      total_anomalies: 25,
      status_count: 3,
      exported_at: '2024-01-15T10:35:00.000Z',
    },
  })
}
