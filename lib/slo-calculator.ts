/**
 * SLO (Service Level Objective) Calculator
 * 
 * Computes SLO thresholds from execution time metrics and detects breaches.
 * Uses percentile-based thresholds (p95, p99) to define acceptable latency bands.
 */

export interface ExecutionMetrics {
  execution_time_ms: number
  execution_status: 'success' | 'failure' | 'pending'
  created_at: string
  correlation_id?: string
}

export interface SLOThresholds {
  p50_ms: number
  p95_ms: number
  p99_ms: number
  acceptable_threshold_ms: number
  warning_threshold_ms: number
  critical_threshold_ms: number
}

export interface SLOBreach {
  metric_value_ms: number
  threshold_type: 'warning' | 'critical'
  threshold_ms: number
  execution_status: string
  correlation_id?: string
  created_at: string
}

/**
 * Compute percentiles from sorted array of numbers
 */
function computePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0
  if (sortedValues.length === 1) return sortedValues[0]
  
  const index = (percentile / 100) * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index % 1
  
  if (lower === upper) return sortedValues[lower]
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

/**
 * Calculate SLO thresholds from a batch of execution metrics
 * 
 * @param metrics Array of execution time measurements
 * @returns SLO thresholds based on percentile distribution
 */
export function calculateSLOThresholds(metrics: ExecutionMetrics[]): SLOThresholds {
  if (metrics.length === 0) {
    // Return safe defaults if no data
    return {
      p50_ms: 100,
      p95_ms: 500,
      p99_ms: 1000,
      acceptable_threshold_ms: 500,
      warning_threshold_ms: 750,
      critical_threshold_ms: 1000,
    }
  }

  // Filter only successful executions for baseline SLO
  const successfulMetrics = metrics
    .filter(m => m.execution_status === 'success')
    .map(m => m.execution_time_ms)
    .sort((a, b) => a - b)

  if (successfulMetrics.length === 0) {
    // If all failed, use raw metrics
    const allMetrics = metrics
      .map(m => m.execution_time_ms)
      .sort((a, b) => a - b)
    
    const p50 = computePercentile(allMetrics, 50)
    const p95 = computePercentile(allMetrics, 95)
    const p99 = computePercentile(allMetrics, 99)

    return {
      p50_ms: Math.round(p50),
      p95_ms: Math.round(p95),
      p99_ms: Math.round(p99),
      acceptable_threshold_ms: Math.round(p95 * 1.2),
      warning_threshold_ms: Math.round(p99 * 1.1),
      critical_threshold_ms: Math.round(p99 * 1.5),
    }
  }

  // Compute percentiles from successful executions
  const p50 = computePercentile(successfulMetrics, 50)
  const p95 = computePercentile(successfulMetrics, 95)
  const p99 = computePercentile(successfulMetrics, 99)

  return {
    p50_ms: Math.round(p50),
    p95_ms: Math.round(p95),
    p99_ms: Math.round(p99),
    // Define thresholds relative to percentiles
    acceptable_threshold_ms: Math.round(p95 * 1.2), // Allow 20% above p95
    warning_threshold_ms: Math.round(p99 * 1.1),    // 10% above p99
    critical_threshold_ms: Math.round(p99 * 1.5),   // 50% above p99
  }
}

/**
 * Detect SLO breaches in a batch of metrics
 * 
 * @param metrics Array of execution measurements
 * @param thresholds SLO thresholds to check against
 * @returns Array of detected breaches
 */
export function detectSLOBreaches(
  metrics: ExecutionMetrics[],
  thresholds: SLOThresholds
): SLOBreach[] {
  return metrics
    .filter(m => m.execution_status === 'success') // Only flag successful operations that were slow
    .filter(m => m.execution_time_ms > thresholds.warning_threshold_ms)
    .map(m => {
      const threshold_type = m.execution_time_ms > thresholds.critical_threshold_ms 
        ? 'critical' 
        : 'warning'
      
      return {
        metric_value_ms: m.execution_time_ms,
        threshold_type,
        threshold_ms: threshold_type === 'critical' 
          ? thresholds.critical_threshold_ms 
          : thresholds.warning_threshold_ms,
        execution_status: m.execution_status,
        correlation_id: m.correlation_id,
        created_at: m.created_at,
      }
    })
}

/**
 * Compute execution metrics from raw execution log
 * Groups by time window and calculates key stats
 */
export interface ExecutionWindowStats {
  window_start: string
  window_end: string
  execution_count: number
  success_count: number
  failure_count: number
  avg_execution_time_ms: number
  max_execution_time_ms: number
  min_execution_time_ms: number
  p95_execution_time_ms: number
  failure_rate: number
}

export function computeExecutionWindowStats(
  metrics: ExecutionMetrics[],
  windowSize: 'minute' | 'hour' | 'day' = 'hour'
): ExecutionWindowStats[] {
  if (metrics.length === 0) return []

  const windows = new Map<string, ExecutionMetrics[]>()

  // Group metrics by time window
  for (const metric of metrics) {
    const date = new Date(metric.created_at)
    let windowKey: string

    if (windowSize === 'minute') {
      windowKey = date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
    } else if (windowSize === 'hour') {
      windowKey = date.toISOString().slice(0, 13) // YYYY-MM-DDTHH
    } else {
      windowKey = date.toISOString().slice(0, 10) // YYYY-MM-DD
    }

    if (!windows.has(windowKey)) {
      windows.set(windowKey, [])
    }
    windows.get(windowKey)!.push(metric)
  }

  // Compute stats for each window
  const stats: ExecutionWindowStats[] = []

  for (const [windowKey, windowMetrics] of windows) {
    const times = windowMetrics.map(m => m.execution_time_ms).sort((a, b) => a - b)
    const successCount = windowMetrics.filter(m => m.execution_status === 'success').length
    const failureCount = windowMetrics.filter(m => m.execution_status === 'failure').length

    stats.push({
      window_start: windowKey,
      window_end: new Date(new Date(windowKey + ':00:00Z').getTime() + (windowSize === 'minute' ? 60000 : windowSize === 'hour' ? 3600000 : 86400000)).toISOString(),
      execution_count: windowMetrics.length,
      success_count: successCount,
      failure_count: failureCount,
      avg_execution_time_ms: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      max_execution_time_ms: Math.max(...times),
      min_execution_time_ms: Math.min(...times),
      p95_execution_time_ms: Math.round(computePercentile(times, 95)),
      failure_rate: failureCount / windowMetrics.length,
    })
  }

  return stats.sort((a, b) => a.window_start.localeCompare(b.window_start))
}
