/**
 * Throughput Validation Types
 * 
 * Defines types for validating task throughput improvement
 * in the period following anomaly dismissal.
 */

/**
 * A measurement window with throughput metrics
 */
export interface ThroughputWindow {
  start_time: string; // ISO 8601 timestamp
  end_time: string;   // ISO 8601 timestamp
  duration_minutes: number;
  completion_count: number;
  completion_rate: number;
  rolling_mean?: number;
  rolling_stdev?: number;
  anomaly_detected: boolean;
}

/**
 * Pre/post dismissal comparison
 */
export interface DismissalComparisonMetrics {
  dismissal_id: string;
  dismissed_at: string;
  
  // Pre-dismissal baseline
  pre_baseline: ThroughputWindow;
  
  // Post-dismissal measurement
  post_measurement: ThroughputWindow;
  
  // Calculated improvements
  completion_count_delta: number;  // absolute change
  completion_rate_delta: number;   // percentage point change
  completion_rate_pct_improvement: number; // percent change (e.g., 10 = 10% improvement)
  
  // Statistical significance
  z_score_difference?: number;
  p_value?: number; // two-tailed t-test p-value
  is_statistically_significant: boolean; // typically p < 0.05
}

/**
 * Aggregated validation results
 */
export interface ThroughputValidationReport {
  // Time period covered
  analysis_period_start: string;
  analysis_period_end: string;
  
  // Sample sizes
  total_dismissals_analyzed: number;
  dismissals_with_improvement: number;
  dismissals_without_improvement: number;
  dismissals_inconclusive: number;
  
  // Aggregate statistics
  average_completion_rate_improvement: number; // percentage point
  median_completion_rate_improvement: number;
  std_dev_improvement: number;
  
  // Threshold for "improvement"
  improvement_threshold_pct: number;
  
  // Key findings
  improvement_rate: number; // percentage of dismissals with improvement
  significant_improvement_rate: number; // percentage meeting statistical significance
  
  // Details
  individual_comparisons: DismissalComparisonMetrics[];
  
  // Confidence
  recommendation: 'DISMISS_EFFECTIVE' | 'DISMISS_INEFFECTIVE' | 'INCONCLUSIVE';
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Configuration for throughput validation
 */
export interface ThroughputValidationConfig {
  // Time windows (in minutes)
  pre_baseline_window_minutes: number;  // e.g., 60: measure 60 min before dismissal
  post_measurement_window_minutes: number; // e.g., 60: measure 60 min after dismissal
  
  // Improvement thresholds
  improvement_threshold_pct: number; // e.g., 5: 5% or higher is "improvement"
  
  // Statistical significance
  use_statistical_testing: boolean;
  significance_level: number; // e.g., 0.05 for 95% confidence
  
  // Sample requirements
  min_dismissals_for_report: number; // minimum to declare valid results
  max_days_lookback: number; // only analyze dismissals from last N days
}

/**
 * Result of a single throughput validation test
 */
export interface ValidationTestResult {
  test_name: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validation test suite result
 */
export interface ValidationTestSuite {
  suite_name: string;
  run_timestamp: string;
  tests: ValidationTestResult[];
  overall_passed: boolean;
  summary: string;
}
