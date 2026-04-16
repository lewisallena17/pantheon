/**
 * System Health Dashboard Types
 * Comprehensive types for health monitoring and anomaly trend analysis
 */

export interface HealthMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold?: number
  trend?: 'improving' | 'stable' | 'degrading'
}

export interface SystemHealthStatus {
  timestamp: string
  overallStatus: 'healthy' | 'warning' | 'critical'
  metrics: HealthMetric[]
  uptime: number // seconds
  lastCheckAt: string
}

export interface AnomalyTrend {
  window_minutes: number
  anomaly_count: number
  frequency_per_hour: number
  avg_z_score: number
  max_z_score: number
  min_z_score: number
  trend: 'improving' | 'stable' | 'worsening'
  last_anomaly_at?: string
  resolution_rate: number // % of anomalies resolved
}

export interface AnomalyTimeseries {
  timestamp: string
  anomaly_detected: boolean
  z_score: number
  completion_rate: number
  rolling_mean: number
  rolling_stdev: number
  window_minutes: number
  anomaly_reason?: string
}

export interface ConnectionQualityMetric {
  event_type: string
  p95_latency_ms: number
  threshold_ms: number
  status: 'healthy' | 'warning' | 'critical'
  channel_name?: string
  fallback_mode?: string
  last_event_at: string
}

export interface ThroughputStats {
  total_events: number
  anomalies_detected: number
  anomaly_rate: number // percentage
  avg_completion_rate: number
  avg_z_score: number
  time_period_hours: number
}

export interface SystemHealthSummary {
  timestamp: string
  status: SystemHealthStatus
  throughput: ThroughputStats
  connection_quality: ConnectionQualityMetric[]
  anomaly_trends: AnomalyTrend[]
  recent_anomalies: AnomalyTimeseries[]
  health_score: number // 0-100
}

export interface HealthCheckResult {
  check_name: string
  passed: boolean
  message: string
  timestamp: string
  duration_ms: number
}

export interface TrendAnalysis {
  metric: string
  current_value: number
  previous_value?: number
  change_percent: number
  trend_direction: 'up' | 'down' | 'stable'
  anomaly_likelihood: number // 0-1 probability
  confidence: number // 0-1
}
