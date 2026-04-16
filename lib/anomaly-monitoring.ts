import { createClient } from '@/lib/supabase/client'

/**
 * Configuration for throughput anomaly detection
 */
export interface AnomalyMonitorConfig {
  windowMinutes: number
  zScoreThreshold: number
  pollIntervalMs?: number
  onAnomalyDetected?: (event: AnomalyEvent) => void
}

/**
 * Anomaly event returned by RPC and pg_notify
 */
export interface AnomalyEvent {
  event_id: string
  anomaly_detected: boolean
  completion_rate: number
  rolling_mean: number
  rolling_stdev: number
  z_score: number
  reason: string
  detected_at: string
  window_minutes: number
}

/**
 * RPC response from get_task_throughput_anomaly
 */
export interface ThroughputAnomalyResult {
  anomaly_detected: boolean
  window_minutes: number
  z_score_threshold: number
  completion_rate: number
  rolling_mean: number
  rolling_stdev: number
  z_score: number
  anomaly_reason: string | null
  detected_at: string
}

/**
 * Initializes real-time throughput anomaly monitoring with pg_notify
 * 
 * @param config Configuration for anomaly detection
 * @returns Unsubscribe function to stop monitoring
 * 
 * @example
 * const unsubscribe = setupThroughputMonitoring({
 *   windowMinutes: 60,
 *   zScoreThreshold: -2.0,
 *   onAnomalyDetected: (event) => {
 *     console.log('Anomaly:', event.reason);
 *   }
 * });
 * 
 * // Later, stop monitoring:
 * unsubscribe();
 */
export function setupThroughputMonitoring(config: AnomalyMonitorConfig) {
  const supabase = createClient()
  
  // Subscribe to real-time anomaly events via pg_notify
  const channel = supabase
    .channel('throughput_anomalies')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'task_throughput_events',
        filter: 'anomaly_detected=eq.true'
      },
      (payload: any) => {
        const event: AnomalyEvent = {
          event_id: payload.new.id,
          anomaly_detected: payload.new.anomaly_detected,
          completion_rate: payload.new.completion_rate,
          rolling_mean: payload.new.rolling_mean,
          rolling_stdev: payload.new.rolling_stdev,
          z_score: payload.new.z_score,
          reason: payload.new.anomaly_reason,
          detected_at: payload.new.detected_at,
          window_minutes: payload.new.window_minutes
        }
        
        config.onAnomalyDetected?.(event)
      }
    )
    .subscribe((status) => {
      console.log('[Throughput Monitor] Subscription status:', status)
    })

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Manually trigger throughput anomaly detection
 * Useful for polling or event-driven checks
 * 
 * @param windowMinutes Window size in minutes (default 60)
 * @param zScoreThreshold Z-score threshold (default -2.0)
 * @returns Promise resolving to anomaly detection results
 * 
 * @example
 * const result = await checkThroughputAnomaly(60, -2.0);
 * if (result.anomaly_detected) {
 *   console.log('Anomaly detected:', result.anomaly_reason);
 * }
 */
export async function checkThroughputAnomaly(
  windowMinutes: number = 60,
  zScoreThreshold: number = -2.0
): Promise<ThroughputAnomalyResult | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .rpc('get_task_throughput_anomaly', {
      p_window_minutes: windowMinutes,
      p_z_score_threshold: zScoreThreshold
    })

  if (error) {
    console.error('[Throughput Monitor] RPC error:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Fetches recent anomaly events from the database
 * Useful for displaying historical anomalies
 * 
 * @param limit Maximum number of events to fetch (default 50)
 * @param onlyDismissed If true, fetch only dismissed events
 * @returns Promise resolving to anomaly events
 */
export async function fetchAnomalyHistory(
  limit: number = 50,
  onlyDismissed: boolean = false
) {
  const supabase = createClient()

  let query = supabase
    .from('task_throughput_events')
    .select('*')
    .order('detected_at', { ascending: false })
    .limit(limit)

  if (onlyDismissed) {
    query = query.not('dismissed_at', 'is', null)
  }

  const { data, error } = await query

  if (error) {
    console.error('[Throughput Monitor] Fetch error:', error)
    return []
  }

  return data || []
}

/**
 * Dismisses an anomaly event
 * 
 * @param eventId Event UUID to dismiss
 */
export async function dismissAnomalyEvent(eventId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('task_throughput_events')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', eventId)

  if (error) {
    console.error('[Throughput Monitor] Dismiss error:', error)
  }
}

/**
 * Gets summary statistics of recent anomalies
 */
export async function getAnomalySummary(hours: number = 24) {
  const supabase = createClient()
  
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('task_throughput_events')
    .select('*')
    .gte('detected_at', since)
    .order('detected_at', { ascending: false })

  if (error) {
    console.error('[Throughput Monitor] Summary error:', error)
    return {
      total: 0,
      anomalies: 0,
      dismissalRate: 0,
      avgZScore: 0,
      minZScore: 0
    }
  }

  const events = data || []
  const anomalyEvents = events.filter(e => e.anomaly_detected)
  const dismissedCount = events.filter(e => e.dismissed_at !== null).length

  return {
    total: events.length,
    anomalies: anomalyEvents.length,
    dismissalRate: events.length > 0 ? dismissedCount / events.length : 0,
    avgZScore: anomalyEvents.length > 0 
      ? anomalyEvents.reduce((sum, e) => sum + e.z_score, 0) / anomalyEvents.length
      : 0,
    minZScore: anomalyEvents.length > 0
      ? Math.min(...anomalyEvents.map(e => e.z_score))
      : 0
  }
}
