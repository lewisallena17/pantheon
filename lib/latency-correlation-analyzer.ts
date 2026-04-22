/**
 * Latency Correlation Analyzer
 *
 * Cross-references:
 * - agent_sql_execution_log (execution times)
 * - tasks_search_index (task classifications)
 * - agent_exec_sql_metrics (health metrics)
 *
 * Identifies which task types correlate with API response latency outliers.
 */

import { createClient } from '@supabase/supabase-js'

interface ExecutionRecord {
  task_id: string | null
  execution_time_ms: number | null
  agent_name: string | null
  execution_status: string
  created_at: string
}

interface TaskClassification {
  task_id: string
  category?: string
  confidence_score?: number
  success_rate?: number
}

interface LatencyOutlier {
  task_id: string
  execution_time_ms: number
  agent_name: string | null
  created_at: string
  is_outlier: boolean
  percentile: number
}

interface TaskTypeLatencyProfile {
  task_type: string
  task_count: number
  total_executions: number
  avg_latency_ms: number
  p95_latency_ms: number
  p99_latency_ms: number
  max_latency_ms: number
  outlier_count: number
  outlier_ratio: number
  avg_confidence_score: number | null
}

interface CorrelationAnalysis {
  timestamp: string
  global_stats: {
    total_executions: number
    total_tasks: number
    global_p95_ms: number
    global_p99_ms: number
    outlier_threshold_ms: number
  }
  task_profiles: TaskTypeLatencyProfile[]
  high_risk_tasks: {
    task_id: string
    classification: string | null
    outlier_ratio: number
    max_latency_ms: number
    recent_outliers_count: number
  }[]
  statistical_insights: {
    mean_latency_all_tasks_ms: number
    std_dev_latency_ms: number
    percentile_95_threshold_ms: number
    percentile_99_threshold_ms: number
    low_latency_tasks: string[] // task IDs with avg < p50
    high_latency_tasks: string[] // task IDs with avg > p95
  }
}

/**
 * Fetch execution logs and classifications from Supabase.
 */
async function fetchExecutionData(supabase: ReturnType<typeof createClient>) {
  // Get execution logs
  const { data: execLogs, error: execError } = await supabase
    .from('agent_sql_execution_log')
    .select('task_id, execution_time_ms, agent_name, execution_status, created_at')
    .not('task_id', 'is', null)
    .order('created_at', { ascending: false })

  if (execError) throw new Error(`Failed to fetch execution logs: ${execError.message}`)

  // Get task classifications
  const { data: classifications, error: classError } = await supabase.from('tasks_search_index').select('task_id, confidence_metadata')

  if (classError) throw new Error(`Failed to fetch classifications: ${classError.message}`)

  return { execLogs: execLogs || [], classifications: classifications || [] }
}

/**
 * Calculate statistical measures for latency data.
 */
function calculateStats(latencies: number[]): {
  mean: number
  stdDev: number
  p50: number
  p95: number
  p99: number
  min: number
  max: number
} {
  if (latencies.length === 0) {
    return { mean: 0, stdDev: 0, p50: 0, p95: 0, p99: 0, min: 0, max: 0 }
  }

  const sorted = [...latencies].sort((a, b) => a - b)
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length
  const variance = latencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / latencies.length
  const stdDev = Math.sqrt(variance)

  const percentile = (p: number) => {
    const idx = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, idx)]
  }

  return {
    mean,
    stdDev,
    p50: percentile(50),
    p95: percentile(95),
    p99: percentile(99),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

/**
 * Identify outliers using IQR method.
 */
function identifyOutliers(latencies: number[]): { outliers: Set<number>; threshold: number } {
  if (latencies.length < 4) {
    return { outliers: new Set(), threshold: 0 }
  }

  const sorted = [...latencies].sort((a, b) => a - b)
  const q1Idx = Math.floor(sorted.length * 0.25)
  const q3Idx = Math.floor(sorted.length * 0.75)

  const q1 = sorted[q1Idx]
  const q3 = sorted[q3Idx]
  const iqr = q3 - q1
  const threshold = q3 + 1.5 * iqr

  const outliers = new Set(latencies.filter((val) => val > threshold))

  return { outliers, threshold }
}

/**
 * Group executions by task ID and extract latency profiles.
 */
function groupByTask(
  execLogs: ExecutionRecord[]
): Map<string, { executions: ExecutionRecord[]; latencies: number[] }> {
  const grouped = new Map<string, { executions: ExecutionRecord[]; latencies: number[] }>()

  for (const log of execLogs) {
    if (!log.task_id) continue

    const latency = log.execution_time_ms || 0
    if (!grouped.has(log.task_id)) {
      grouped.set(log.task_id, { executions: [], latencies: [] })
    }

    const entry = grouped.get(log.task_id)!
    entry.executions.push(log)
    entry.latencies.push(latency)
  }

  return grouped
}

/**
 * Map task classifications from search index.
 */
function mapClassifications(classifications: any[]): Map<string, TaskClassification> {
  const map = new Map<string, TaskClassification>()

  for (const row of classifications) {
    const metadata = row.confidence_metadata || {}
    map.set(row.task_id, {
      task_id: row.task_id,
      category: metadata.category,
      confidence_score: metadata.confidence_score || null,
      success_rate: metadata.success_rate || null,
    })
  }

  return map
}

/**
 * Main analysis function.
 */
export async function analyzeLatencyCorrelations(supabase: ReturnType<typeof createClient>): Promise<CorrelationAnalysis> {
  const { execLogs, classifications } = await fetchExecutionData(supabase)

  if (execLogs.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      global_stats: {
        total_executions: 0,
        total_tasks: 0,
        global_p95_ms: 0,
        global_p99_ms: 0,
        outlier_threshold_ms: 0,
      },
      task_profiles: [],
      high_risk_tasks: [],
      statistical_insights: {
        mean_latency_all_tasks_ms: 0,
        std_dev_latency_ms: 0,
        percentile_95_threshold_ms: 0,
        percentile_99_threshold_ms: 0,
        low_latency_tasks: [],
        high_latency_tasks: [],
      },
    }
  }

  const grouped = groupByTask(execLogs)
  const classMap = mapClassifications(classifications)

  // Calculate global stats
  const allLatencies = Array.from(grouped.values()).flatMap((g) => g.latencies)
  const globalStats = calculateStats(allLatencies)
  const { outliers: globalOutliers, threshold: outlierThreshold } = identifyOutliers(allLatencies)

  // Build task profiles
  const taskProfiles: TaskTypeLatencyProfile[] = []
  const lowLatencyTasks: string[] = []
  const highLatencyTasks: string[] = []

  for (const [taskId, { latencies }] of grouped.entries()) {
    const stats = calculateStats(latencies)
    const classification = classMap.get(taskId)
    const outlierCount = latencies.filter((l) => globalOutliers.has(l)).length

    const profile: TaskTypeLatencyProfile = {
      task_type: classification?.category || 'unknown',
      task_count: 1,
      total_executions: latencies.length,
      avg_latency_ms: Math.round(stats.mean * 100) / 100,
      p95_latency_ms: stats.p95,
      p99_latency_ms: stats.p99,
      max_latency_ms: stats.max,
      outlier_count: outlierCount,
      outlier_ratio: Math.round((outlierCount / latencies.length) * 10000) / 100,
      avg_confidence_score: classification?.confidence_score || null,
    }

    taskProfiles.push(profile)

    if (stats.mean < globalStats.p50) {
      lowLatencyTasks.push(taskId)
    }
    if (stats.mean > globalStats.p95) {
      highLatencyTasks.push(taskId)
    }
  }

  // Group profiles by task type and aggregate
  const profilesByType = new Map<string, TaskTypeLatencyProfile>()
  for (const profile of taskProfiles) {
    if (profilesByType.has(profile.task_type)) {
      const existing = profilesByType.get(profile.task_type)!
      existing.task_count += 1
      existing.total_executions += profile.total_executions
      existing.avg_latency_ms = (existing.avg_latency_ms + profile.avg_latency_ms) / 2
      existing.max_latency_ms = Math.max(existing.max_latency_ms, profile.max_latency_ms)
      existing.outlier_count += profile.outlier_count
    } else {
      profilesByType.set(profile.task_type, { ...profile })
    }
  }

  // Identify high-risk tasks
  const highRiskTasks = Array.from(grouped.entries())
    .map(([taskId, { latencies }]) => {
      const outlierCount = latencies.filter((l) => l > outlierThreshold).length
      const classification = classMap.get(taskId)
      return {
        task_id: taskId,
        classification: classification?.category || null,
        outlier_ratio: (outlierCount / latencies.length) * 100,
        max_latency_ms: Math.max(...latencies),
        recent_outliers_count: outlierCount,
      }
    })
    .filter((task) => task.outlier_ratio > 20 || task.max_latency_ms > globalStats.p99 * 2)
    .sort((a, b) => b.outlier_ratio - a.outlier_ratio)
    .slice(0, 10)

  return {
    timestamp: new Date().toISOString(),
    global_stats: {
      total_executions: allLatencies.length,
      total_tasks: grouped.size,
      global_p95_ms: globalStats.p95,
      global_p99_ms: globalStats.p99,
      outlier_threshold_ms: Math.round(outlierThreshold * 100) / 100,
    },
    task_profiles: Array.from(profilesByType.values()).sort((a, b) => b.avg_latency_ms - a.avg_latency_ms),
    high_risk_tasks: highRiskTasks,
    statistical_insights: {
      mean_latency_all_tasks_ms: Math.round(globalStats.mean * 100) / 100,
      std_dev_latency_ms: Math.round(globalStats.stdDev * 100) / 100,
      percentile_95_threshold_ms: globalStats.p95,
      percentile_99_threshold_ms: globalStats.p99,
      low_latency_tasks: lowLatencyTasks,
      high_latency_tasks: highLatencyTasks,
    },
  }
}

/**
 * Export analysis as formatted JSON.
 */
export function formatAnalysisReport(analysis: CorrelationAnalysis): string {
  return JSON.stringify(analysis, null, 2)
}
