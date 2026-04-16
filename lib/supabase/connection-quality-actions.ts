'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Type for connection quality events in the database
 */
export interface ConnectionQualityEvent {
  id: string
  event_type: string
  p95_latency_ms: number
  threshold_ms: number
  channel_name?: string
  fallback_mode?: string
  details?: Record<string, unknown>
  created_at: string
  dismissed_at?: string
  resolution_notes?: string
  updated_at: string
  resolved_at?: string
}

/**
 * Response type for dismiss_anomaly RPC
 */
export interface DismissAnomalyResponse {
  success: boolean
  message: string
  dismissed_at: string
  event_id: string
}

/**
 * Response type for dismiss_resolved_anomalies_batch RPC
 */
export interface DismissBatchResponse {
  total_resolved: number
  total_dismissed: number
  message: string
}

/**
 * Fetches all resolved but not yet dismissed anomalies from the database
 * 
 * @returns Promise resolving to array of connection quality events
 * 
 * @example
 * const anomalies = await getResolvedAnomalies();
 */
export async function getResolvedAnomalies(): Promise<ConnectionQualityEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('connection_quality_events')
    .select('*')
    .not('resolved_at', 'is', null)
    .is('dismissed_at', null)
    .order('resolved_at', { ascending: false })

  if (error) {
    console.error('[Connection Quality] Failed to fetch resolved anomalies:', error)
    return []
  }

  return data || []
}

/**
 * Dismisses a single anomaly event
 * 
 * @param eventId UUID of the event to dismiss
 * @param resolutionNotes Optional notes about the dismissal
 * @returns Promise resolving to dismissal result
 * 
 * @example
 * const result = await dismissSingleAnomaly(
 *   '123e4567-e89b-12d3-a456-426614174000',
 *   'Network recovered after failover'
 * );
 * if (result.success) {
 *   console.log('Dismissed at:', result.dismissed_at);
 * }
 */
export async function dismissSingleAnomaly(
  eventId: string,
  resolutionNotes?: string
): Promise<DismissAnomalyResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('dismiss_anomaly', {
    p_event_id: eventId,
    p_resolution_notes: resolutionNotes || 'Dismissed from dashboard',
  })

  if (error) {
    console.error('[Connection Quality] Failed to dismiss anomaly:', error)
    return {
      success: false,
      message: error.message,
      dismissed_at: '',
      event_id: eventId,
    }
  }

  // RPC returns array of results
  const result = Array.isArray(data) ? data[0] : data
  return result || {
    success: false,
    message: 'No response from dismiss_anomaly function',
    dismissed_at: '',
    event_id: eventId,
  }
}

/**
 * Batch dismisses all resolved anomalies that haven't been dismissed yet
 * 
 * This is the main function for the task:
 * "Dismiss resolved anomalies from connection_quality_events using dismiss_resolved_anomalies_batch()"
 * 
 * It identifies all events where resolved_at IS NOT NULL and dismissed_at IS NULL,
 * then marks them all as dismissed in a single batch operation.
 * 
 * @returns Promise resolving to batch dismissal summary
 * 
 * @example
 * const result = await dismissResolvedAnomaliesBatch();
 * console.log(`Dismissed ${result.total_dismissed} of ${result.total_resolved} anomalies`);
 * console.log(result.message); // e.g., "Dismissed 5 of 5 resolved anomalies"
 */
export async function dismissResolvedAnomaliesBatch(): Promise<DismissBatchResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('dismiss_resolved_anomalies_batch')

  if (error) {
    console.error('[Connection Quality] Batch dismissal failed:', error)
    return {
      total_resolved: 0,
      total_dismissed: 0,
      message: `Error: ${error.message}`,
    }
  }

  // RPC returns array of results
  const result = Array.isArray(data) ? data[0] : data
  return result || {
    total_resolved: 0,
    total_dismissed: 0,
    message: 'No response from batch dismissal function',
  }
}

/**
 * Gets unresolved anomalies (not yet dismissed)
 * 
 * @returns Promise resolving to array of unresolved anomalies
 * 
 * @example
 * const unresolved = await getUnresolvedAnomalies();
 */
export async function getUnresolvedAnomalies(): Promise<ConnectionQualityEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_unresolved_anomalies')

  if (error) {
    console.error('[Connection Quality] Failed to fetch unresolved anomalies:', error)
    return []
  }

  return data || []
}

/**
 * Gets summary statistics of connection quality events
 * 
 * @returns Promise resolving to summary stats
 */
export async function getConnectionQualitySummary() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('connection_quality_events')
    .select('id, resolved_at, dismissed_at', { count: 'exact' })

  if (error) {
    console.error('[Connection Quality] Failed to fetch summary:', error)
    return {
      total_events: 0,
      resolved_count: 0,
      dismissed_count: 0,
      pending_dismiss_count: 0,
    }
  }

  const events = data || []
  const resolved_count = events.filter(e => e.resolved_at).length
  const dismissed_count = events.filter(e => e.dismissed_at).length
  const pending_dismiss_count = events.filter(
    e => e.resolved_at && !e.dismissed_at
  ).length

  return {
    total_events: events.length,
    resolved_count,
    dismissed_count,
    pending_dismiss_count,
  }
}
