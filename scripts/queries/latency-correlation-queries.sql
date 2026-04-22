-- ============================================================================
-- Latency Correlation Analysis Queries
-- 
-- These queries cross-reference task classifications from tasks_search_index
-- with execution latencies from agent_sql_execution_log to identify which
-- task types correlate with API response latency outliers.
-- ============================================================================

-- Query 1: Global Latency Statistics
-- Provides baseline metrics for all executions
SELECT
  COUNT(*) as total_executions,
  COUNT(DISTINCT task_id) as unique_tasks,
  ROUND(AVG(execution_time_ms::numeric), 2) as avg_latency_ms,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY execution_time_ms) as p50_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_latency_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY execution_time_ms) as p99_latency_ms,
  MAX(execution_time_ms) as max_latency_ms
FROM agent_sql_execution_log
WHERE execution_time_ms IS NOT NULL;

-- Query 2: Per-Task Latency Distribution
-- Shows latency patterns broken down by task ID
SELECT
  task_id,
  COUNT(*) as execution_count,
  ROUND(AVG(execution_time_ms::numeric), 2) as avg_latency_ms,
  MIN(execution_time_ms) as min_latency_ms,
  MAX(execution_time_ms) as max_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_latency_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY execution_time_ms) as p99_latency_ms,
  COUNT(*) FILTER (WHERE execution_status = 'success') as success_count,
  COUNT(*) FILTER (WHERE execution_status = 'failed') as failed_count
FROM agent_sql_execution_log
WHERE task_id IS NOT NULL
GROUP BY task_id
ORDER BY avg_latency_ms DESC;

-- Query 3: Task Classification with Latency Metrics
-- Joins search index classifications with execution latencies
SELECT
  asel.task_id,
  (tsi.confidence_metadata -> 'category')::text as task_category,
  ROUND((tsi.confidence_metadata -> 'confidence_score')::numeric, 2) as confidence_score,
  (tsi.confidence_metadata -> 'success_rate')::numeric as success_rate,
  COUNT(*) as execution_count,
  ROUND(AVG(asel.execution_time_ms::numeric), 2) as avg_latency_ms,
  MAX(asel.execution_time_ms) as max_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY asel.execution_time_ms) as p95_latency_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY asel.execution_time_ms) as p99_latency_ms
FROM agent_sql_execution_log asel
LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
WHERE asel.task_id IS NOT NULL AND asel.execution_time_ms IS NOT NULL
GROUP BY asel.task_id, task_category, confidence_score, success_rate
ORDER BY avg_latency_ms DESC;

-- Query 4: Outlier Detection (IQR Method)
-- Identifies executions with latencies beyond the interquartile range
WITH latency_stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY execution_time_ms) as q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY execution_time_ms) as q3
  FROM agent_sql_execution_log
  WHERE execution_time_ms IS NOT NULL
),
outlier_threshold AS (
  SELECT
    q1,
    q3,
    (q3 - q1) * 1.5 as iqr_mult,
    q3 + ((q3 - q1) * 1.5) as outlier_threshold
  FROM latency_stats
)
SELECT
  asel.task_id,
  asel.execution_time_ms as latency_ms,
  (tsi.confidence_metadata -> 'category')::text as task_category,
  asel.agent_name,
  asel.created_at,
  ot.outlier_threshold,
  ROUND((asel.execution_time_ms / ot.outlier_threshold)::numeric, 2) as outlier_severity_ratio
FROM agent_sql_execution_log asel
LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
CROSS JOIN outlier_threshold ot
WHERE asel.execution_time_ms > ot.outlier_threshold
ORDER BY asel.execution_time_ms DESC;

-- Query 5: Task Type Correlation with Latency Outliers
-- Groups by task classification and counts outliers per category
WITH latency_stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY execution_time_ms) as q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY execution_time_ms) as q3
  FROM agent_sql_execution_log
  WHERE execution_time_ms IS NOT NULL
),
outlier_threshold AS (
  SELECT q3 + ((q3 - q1) * 1.5) as threshold FROM latency_stats
),
outliers AS (
  SELECT
    asel.task_id,
    asel.execution_time_ms,
    (tsi.confidence_metadata -> 'category')::text as task_category
  FROM agent_sql_execution_log asel
  LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
  CROSS JOIN outlier_threshold ot
  WHERE asel.execution_time_ms > ot.threshold
)
SELECT
  COALESCE(task_category, 'unknown') as task_category,
  COUNT(*) as total_outliers,
  COUNT(DISTINCT task_id) as unique_tasks_with_outliers,
  ROUND(MAX(execution_time_ms)::numeric, 2) as max_outlier_latency_ms,
  ROUND(AVG(execution_time_ms)::numeric, 2) as avg_outlier_latency_ms
FROM outliers
GROUP BY task_category
ORDER BY total_outliers DESC;

-- Query 6: High-Risk Tasks (Outlier Ratio Analysis)
-- Identifies tasks where >20% of executions are outliers
WITH latency_stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY execution_time_ms) as q1,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY execution_time_ms) as q3
  FROM agent_sql_execution_log
  WHERE execution_time_ms IS NOT NULL
),
outlier_threshold AS (
  SELECT q3 + ((q3 - q1) * 1.5) as threshold FROM latency_stats
),
task_outlier_stats AS (
  SELECT
    asel.task_id,
    (tsi.confidence_metadata -> 'category')::text as task_category,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE asel.execution_time_ms > (SELECT threshold FROM outlier_threshold)) as outlier_count,
    ROUND(COUNT(*) FILTER (WHERE asel.execution_time_ms > (SELECT threshold FROM outlier_threshold))::numeric / COUNT(*) * 100, 2) as outlier_ratio,
    MAX(asel.execution_time_ms) as max_latency_ms
  FROM agent_sql_execution_log asel
  LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
  WHERE asel.task_id IS NOT NULL
  GROUP BY asel.task_id, task_category
)
SELECT
  task_id,
  COALESCE(task_category, 'unknown') as task_category,
  total_executions,
  outlier_count,
  outlier_ratio,
  max_latency_ms,
  CASE
    WHEN outlier_ratio > 50 THEN 'CRITICAL'
    WHEN outlier_ratio > 30 THEN 'HIGH'
    WHEN outlier_ratio > 20 THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level
FROM task_outlier_stats
WHERE outlier_ratio > 20
ORDER BY outlier_ratio DESC;

-- Query 7: Agent-based Latency Analysis
-- Shows which agents/tools are associated with latency outliers
SELECT
  agent_name,
  tool_name,
  COUNT(*) as execution_count,
  ROUND(AVG(execution_time_ms::numeric), 2) as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_latency_ms,
  MAX(execution_time_ms) as max_latency_ms,
  COUNT(*) FILTER (WHERE execution_status = 'failed') as failed_count
FROM agent_sql_execution_log
WHERE execution_time_ms IS NOT NULL
GROUP BY agent_name, tool_name
ORDER BY avg_latency_ms DESC;

-- Query 8: Temporal Latency Trends
-- Shows how latency has evolved over time
SELECT
  DATE_TRUNC('hour', created_at) as time_bucket,
  COUNT(*) as execution_count,
  ROUND(AVG(execution_time_ms::numeric), 2) as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_latency_ms,
  MAX(execution_time_ms) as max_latency_ms
FROM agent_sql_execution_log
WHERE execution_time_ms IS NOT NULL
GROUP BY time_bucket
ORDER BY time_bucket DESC;

-- Query 9: Correlation between Success Rate and Latency
-- Tasks with low success rates may have different latency patterns
SELECT
  asel.task_id,
  (tsi.confidence_metadata -> 'category')::text as task_category,
  (tsi.confidence_metadata -> 'success_rate')::numeric as classification_success_rate,
  COUNT(*) as total_executions,
  COUNT(*) FILTER (WHERE asel.execution_status = 'success')::numeric / COUNT(*) * 100 as actual_success_rate,
  ROUND(AVG(asel.execution_time_ms::numeric), 2) as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY asel.execution_time_ms) as p95_latency_ms
FROM agent_sql_execution_log asel
LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
WHERE asel.task_id IS NOT NULL
GROUP BY asel.task_id, task_category, classification_success_rate
ORDER BY avg_latency_ms DESC;

-- Query 10: Search Index Classification Coverage
-- Shows what portion of tasks in execution logs have classifications
SELECT
  CASE
    WHEN tsi.task_id IS NOT NULL THEN 'classified'
    ELSE 'unclassified'
  END as classification_status,
  COUNT(DISTINCT asel.task_id) as unique_tasks,
  COUNT(*) as total_executions,
  ROUND(AVG(asel.execution_time_ms::numeric), 2) as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY asel.execution_time_ms) as p95_latency_ms
FROM agent_sql_execution_log asel
LEFT JOIN tasks_search_index tsi ON asel.task_id = tsi.task_id
GROUP BY classification_status
ORDER BY total_executions DESC;
