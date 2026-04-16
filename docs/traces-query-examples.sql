-- Traces Table Query Examples
-- Using agent_exec_sql() for safe SQL execution
-- 
-- This file contains practical examples of querying the traces table
-- through the agent_exec_sql() RPC function.

-- ============================================================================
-- 1. BASIC QUERIES - Simple SELECT with LIMIT
-- ============================================================================

-- 1.1: Retrieve last 10 trace records
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 10'
);

-- 1.2: Retrieve last 5 trace records with all columns
SELECT * FROM agent_exec_sql(
  'SELECT * FROM traces 
   ORDER BY created_at DESC 
   LIMIT 5'
);

-- 1.3: Count total traces
SELECT * FROM agent_exec_sql(
  'SELECT COUNT(*) as total_traces FROM traces'
);

-- 1.4: Count traces per tool
SELECT * FROM agent_exec_sql(
  'SELECT tool_name, COUNT(*) as count FROM traces GROUP BY tool_name ORDER BY count DESC'
);

-- ============================================================================
-- 2. FILTERING QUERIES
-- ============================================================================

-- 2.1: Get only error traces
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, created_at, is_error 
   FROM traces 
   WHERE is_error = true 
   ORDER BY created_at DESC 
   LIMIT 20'
);

-- 2.2: Get successful traces only
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE is_error = false 
   ORDER BY created_at DESC 
   LIMIT 20'
);

-- 2.3: Get traces from a specific tool
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, duration_ms, created_at 
   FROM traces 
   WHERE tool_name = ''run_sql'' 
   ORDER BY created_at DESC 
   LIMIT 20'
);

-- 2.4: Get traces from a specific agent
SELECT * FROM agent_exec_sql(
  'SELECT id, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   WHERE agent_name = ''ruflo-high-1d6331'' 
   ORDER BY created_at DESC 
   LIMIT 20'
);

-- 2.5: Get traces with duration greater than 100ms
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE duration_ms > 100 
   ORDER BY duration_ms DESC 
   LIMIT 15'
);

-- ============================================================================
-- 3. TIME-BASED QUERIES
-- ============================================================================

-- 3.1: Get traces from last 1 hour
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE created_at > NOW() - INTERVAL ''1 hour'' 
   ORDER BY created_at DESC 
   LIMIT 50'
);

-- 3.2: Get traces from last 24 hours
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   WHERE created_at > NOW() - INTERVAL ''24 hours'' 
   ORDER BY created_at DESC 
   LIMIT 100'
);

-- 3.3: Get traces from last 7 days
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE created_at > NOW() - INTERVAL ''7 days'' 
   ORDER BY created_at DESC 
   LIMIT 200'
);

-- ============================================================================
-- 4. AGGREGATION & STATISTICS
-- ============================================================================

-- 4.1: Tool execution statistics (count and average duration)
SELECT * FROM agent_exec_sql(
  'SELECT tool_name, 
           COUNT(*) as count,
           AVG(duration_ms) as avg_duration_ms,
           MIN(duration_ms) as min_duration_ms,
           MAX(duration_ms) as max_duration_ms
   FROM traces 
   WHERE duration_ms IS NOT NULL
   GROUP BY tool_name 
   ORDER BY count DESC'
);

-- 4.2: Agent execution statistics
SELECT * FROM agent_exec_sql(
  'SELECT agent_name, 
           COUNT(*) as execution_count,
           COUNT(CASE WHEN is_error = true THEN 1 END) as error_count,
           AVG(duration_ms) as avg_duration_ms
   FROM traces 
   WHERE agent_name IS NOT NULL
   GROUP BY agent_name 
   ORDER BY execution_count DESC'
);

-- 4.3: Tool error rates
SELECT * FROM agent_exec_sql(
  'SELECT tool_name,
           COUNT(*) as total,
           COUNT(CASE WHEN is_error = true THEN 1 END) as errors,
           ROUND(100.0 * COUNT(CASE WHEN is_error = true THEN 1 END) / COUNT(*), 2) as error_rate_percent
   FROM traces 
   GROUP BY tool_name 
   ORDER BY error_rate_percent DESC'
);

-- 4.4: Tool performance metrics (top slowest tools)
SELECT * FROM agent_exec_sql(
  'SELECT tool_name,
           COUNT(*) as executions,
           ROUND(AVG(duration_ms), 2) as avg_duration_ms,
           MAX(duration_ms) as max_duration_ms
   FROM traces 
   WHERE duration_ms IS NOT NULL
   GROUP BY tool_name 
   ORDER BY avg_duration_ms DESC 
   LIMIT 10'
);

-- ============================================================================
-- 5. COMBINED FILTERS
-- ============================================================================

-- 5.1: Errors from specific agent in last hour
SELECT * FROM agent_exec_sql(
  'SELECT id, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE agent_name = ''ruflo-high-1d6331'' 
   AND is_error = true 
   AND created_at > NOW() - INTERVAL ''1 hour'' 
   ORDER BY created_at DESC 
   LIMIT 20'
);

-- 5.2: Slow sql executions (>100ms)
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE tool_name = ''run_sql'' 
   AND duration_ms > 100 
   ORDER BY duration_ms DESC 
   LIMIT 20'
);

-- 5.3: Recent errors by any tool
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, created_at 
   FROM traces 
   WHERE is_error = true 
   AND created_at > NOW() - INTERVAL ''1 hour'' 
   ORDER BY created_at DESC 
   LIMIT 50'
);

-- ============================================================================
-- 6. PAGINATION EXAMPLES
-- ============================================================================

-- 6.1: Page 1 (records 1-20)
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 20 OFFSET 0'
);

-- 6.2: Page 2 (records 21-40)
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 20 OFFSET 20'
);

-- 6.3: Page 3 (records 41-60)
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 20 OFFSET 40'
);

-- ============================================================================
-- 7. DATA EXPLORATION
-- ============================================================================

-- 7.1: Get distinct tool names
SELECT * FROM agent_exec_sql(
  'SELECT DISTINCT tool_name FROM traces ORDER BY tool_name'
);

-- 7.2: Get distinct agent names
SELECT * FROM agent_exec_sql(
  'SELECT DISTINCT agent_name FROM traces WHERE agent_name IS NOT NULL ORDER BY agent_name'
);

-- 7.3: Latest 10 executions per tool
SELECT * FROM agent_exec_sql(
  'SELECT tool_name, COUNT(*) as count, MAX(created_at) as latest_execution 
   FROM traces 
   GROUP BY tool_name 
   ORDER BY latest_execution DESC'
);

-- ============================================================================
-- 8. PERFORMANCE ANALYSIS
-- ============================================================================

-- 8.1: Slowest individual executions
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE duration_ms IS NOT NULL 
   ORDER BY duration_ms DESC 
   LIMIT 20'
);

-- 8.2: Fastest executions
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE duration_ms IS NOT NULL 
   ORDER BY duration_ms ASC 
   LIMIT 20'
);

-- 8.3: Tool performance ranking
SELECT * FROM agent_exec_sql(
  'SELECT tool_name,
           COUNT(*) as total_executions,
           AVG(duration_ms)::NUMERIC(10,2) as avg_duration_ms,
           MAX(duration_ms) as max_duration_ms,
           PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms
   FROM traces 
   WHERE duration_ms IS NOT NULL
   GROUP BY tool_name 
   ORDER BY avg_duration_ms DESC'
);

-- ============================================================================
-- 9. TASK-SPECIFIC QUERIES
-- ============================================================================

-- 9.1: Get all traces for a specific task
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   WHERE task_id = ''550e8400-e29b-41d4-a716-446655440000'' 
   ORDER BY created_at DESC'
);

-- 9.2: Get tasks with most traces
SELECT * FROM agent_exec_sql(
  'SELECT task_id, COUNT(*) as trace_count, MAX(created_at) as latest 
   FROM traces 
   WHERE task_id IS NOT NULL
   GROUP BY task_id 
   ORDER BY trace_count DESC 
   LIMIT 20'
);

-- ============================================================================
-- 10. EXPORT EXAMPLES (for reporting)
-- ============================================================================

-- 10.1: Export today's traces summary
SELECT * FROM agent_exec_sql(
  'SELECT DATE(created_at) as date,
           tool_name,
           COUNT(*) as executions,
           COUNT(CASE WHEN is_error = true THEN 1 END) as errors,
           AVG(duration_ms)::NUMERIC(10,2) as avg_duration_ms
   FROM traces 
   WHERE created_at >= CURRENT_DATE
   GROUP BY DATE(created_at), tool_name
   ORDER BY date DESC, executions DESC'
);

-- 10.2: Export hourly trace summary
SELECT * FROM agent_exec_sql(
  'SELECT DATE_TRUNC(''hour'', created_at) as hour,
           COUNT(*) as total_traces,
           COUNT(CASE WHEN is_error = true THEN 1 END) as errors,
           AVG(duration_ms)::NUMERIC(10,2) as avg_duration_ms
   FROM traces 
   WHERE created_at > NOW() - INTERVAL ''7 days''
   GROUP BY DATE_TRUNC(''hour'', created_at)
   ORDER BY hour DESC'
);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- - agent_exec_sql() returns results as JSONB in the format:
--   { "agent_exec_sql": [...] }
-- 
-- - Always use LIMIT to constrain result sets
-- - Use OFFSET for pagination (LIMIT 20 OFFSET 40)
-- - WHERE clauses filter before aggregation
-- - ORDER BY affects result order only (doesn't affect limits)
-- - String literals must use single quotes and be escaped ('' for ')
-- - Date/time intervals: '1 hour', '24 hours', '7 days', '1 day'
-- - Duration_ms is nullable for some operations
-- - is_error defaults to false if not specified
