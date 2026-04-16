import { dismissResolvedAnomaliesBatch } from '@/lib/supabase/connection-quality-actions'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/connection-quality/dismiss-batch
 * 
 * Batch dismisses all resolved anomalies from connection_quality_events
 * that have not yet been dismissed.
 * 
 * This endpoint calls the dismiss_resolved_anomalies_batch() stored procedure,
 * which:
 * 1. Finds all events where resolved_at IS NOT NULL and dismissed_at IS NULL
 * 2. Calls dismiss_anomaly() for each event
 * 3. Returns summary of dismissed anomalies
 * 
 * Request body: None (no parameters required)
 * 
 * Response:
 * {
 *   "total_resolved": number,
 *   "total_dismissed": number,
 *   "message": string,
 *   "timestamp": string (ISO 8601)
 * }
 * 
 * Example:
 * ```
 * const response = await fetch('/api/connection-quality/dismiss-batch', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * const result = await response.json();
 * console.log(`Dismissed ${result.total_dismissed} anomalies`);
 * ```
 */
export async function POST(req: NextRequest) {
  try {
    // Call the server action to dismiss resolved anomalies
    const result = await dismissResolvedAnomaliesBatch()

    return NextResponse.json(
      {
        ...result,
        timestamp: new Date().toISOString(),
        status: 'success',
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Connection Quality API] Batch dismiss error:', message)

    return NextResponse.json(
      {
        total_resolved: 0,
        total_dismissed: 0,
        message: `Error: ${message}`,
        timestamp: new Date().toISOString(),
        status: 'error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/connection-quality/dismiss-batch
 * 
 * Returns information about the batch dismissal operation.
 * Can be used for health checks or to understand what the endpoint does.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/connection-quality/dismiss-batch',
    method: 'POST',
    description: 'Batch dismisses all resolved anomalies from connection_quality_events',
    returns: {
      total_resolved: 'Number of anomalies with resolved_at IS NOT NULL',
      total_dismissed: 'Number of anomalies successfully dismissed in this call',
      message: 'Summary message',
      timestamp: 'ISO 8601 timestamp of the operation',
      status: 'success or error',
    },
    example_response: {
      total_resolved: 5,
      total_dismissed: 5,
      message: 'Dismissed 5 of 5 resolved anomalies',
      timestamp: '2024-01-15T10:30:45.123Z',
      status: 'success',
    },
  })
}
