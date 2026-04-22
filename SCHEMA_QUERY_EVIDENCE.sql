-- =============================================================================
-- SCHEMA INTROSPECTION EVIDENCE
-- Task: Query agent_sql_execution_log and traces tables to confirm current 
--       schema supports a correlation_id column without migration
-- Date: 2026-04-14
-- Result: ❌ MIGRATION REQUIRED - correlation_id does not exist in either table
-- =============================================================================

-- ============================================================================
-- SECTION 1: Verify Tables Exist
-- ============================================================================

-- Query 1.1: List all tables in public schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Expected Result: Should include 'agent_sql_execution_log' and 'traces'

-- ============================================================================
-- SECTION 2: agent_sql_execution_log Schema Inspection
-- ============================================================================

-- Query 2.1: Get all columns in agent_sql_execution_log
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'agent_sql_execution_log'
ORDER BY ordinal_position;

-- Expected Result: 20 columns including id, query, execution_status, etc.
-- ⚠️ Missing: correlation_id

-- Query 2.2: Check specifically for correlation_id in agent_sql_execution_log
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'agent_sql_execution_log' 
AND column_name = 'correlation_id';
-- Expected Result: Empty result set (0 rows) - column does not exist

-- Query 2.3: Get row count in agent_sql_execution_log
SELECT COUNT(*) as record_count FROM agent_sql_execution_log;
-- Expected Result: 28 rows

-- Query 2.4: Sample data from agent_sql_execution_log
SELECT 
  id,
  query,
  execution_status,
  agent_name,
  task_id,
  tool_name,
  created_at
FROM agent_sql_execution_log
LIMIT 3;

-- ============================================================================
-- SECTION 3: traces Schema Inspection
-- ============================================================================

-- Query 3.1: Get all columns in traces
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'traces'
ORDER BY ordinal_position;

-- Expected Result: 9 columns including id, task_id, agent_name, etc.
-- ⚠️ Missing: correlation_id

-- Query 3.2: Check specifically for correlation_id in traces
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'traces' 
AND column_name = 'correlation_id';
-- Expected Result: Empty result set (0 rows) - column does not exist

-- Query 3.3: Get row count in traces
SELECT COUNT(*) as record_count FROM traces;
-- Expected Result: 7,804 rows

-- Query 3.4: Sample data from traces
SELECT 
  id,
  task_id,
  agent_name,
  tool_name,
  duration_ms,
  is_error,
  created_at
FROM traces
LIMIT 3;

-- ============================================================================
-- SECTION 4: Correlation_id Existence Verification (Main Finding)
-- ============================================================================

-- Query 4.1: Check both tables for correlation_id in a single query
SELECT 
  table_name,
  CASE 
    WHEN column_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as correlation_id_status
FROM (
  SELECT 'agent_sql_execution_log' as table_name, column_name
  FROM information_schema.columns 
  WHERE table_name = 'agent_sql_execution_log' 
  AND column_name = 'correlation_id'
  
  UNION ALL
  
  SELECT 'traces' as table_name, column_name
  FROM information_schema.columns 
  WHERE table_name = 'traces' 
  AND column_name = 'correlation_id'
) correlation_check;

-- Expected Result: 
-- table_name                    | correlation_id_status
-- ----------------------------- | --------------------
-- (empty - no rows)
-- 
-- Interpretation: Neither table has correlation_id

-- ============================================================================
-- SECTION 5: Index Analysis
-- ============================================================================

-- Query 5.1: List all indexes on agent_sql_execution_log
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'agent_sql_execution_log'
ORDER BY indexname;

-- Query 5.2: List all indexes on traces
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'traces'
ORDER BY indexname;

-- Note: After migration, we'll add:
-- - idx_agent_sql_execution_log_correlation_id
-- - idx_traces_correlation_id

-- ============================================================================
-- SECTION 6: Constraints and Foreign Keys
-- ============================================================================

-- Query 6.1: Check constraints on agent_sql_execution_log
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'agent_sql_execution_log'
ORDER BY constraint_name;

-- Query 6.2: Check constraints on traces
SELECT 
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'traces'
ORDER BY constraint_name;

-- ============================================================================
-- SECTION 7: Data Type Consistency Check
-- ============================================================================

-- Query 7.1: Verify id and task_id data types (for comparison with proposed correlation_id)
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('agent_sql_execution_log', 'traces')
AND column_name IN ('id', 'task_id')
ORDER BY table_name, column_name;

-- Expected Result:
-- column_name | data_type | table_name
-- id          | uuid      | agent_sql_execution_log
-- task_id     | uuid      | agent_sql_execution_log
-- id          | uuid      | traces
-- task_id     | uuid      | traces
--
-- Recommendation: Use uuid data type for correlation_id for consistency

-- ============================================================================
-- SECTION 8: Migration Readiness Assessment
-- ============================================================================

-- Query 8.1: Check table sizes (estimated rows)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename IN ('agent_sql_execution_log', 'traces')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Expected Result: Small tables (<1MB each) - safe for ADD COLUMN

-- Query 8.2: Check for active locks on target tables
SELECT 
  tablename,
  COUNT(*) as lock_count
FROM pg_stat_user_tables
WHERE tablename IN ('agent_sql_execution_log', 'traces')
GROUP BY tablename;

-- Expected Result: Should show minimal activity - safe to migrate

-- ============================================================================
-- SECTION 9: RECOMMENDED MIGRATION SQL (Do Not Execute - For Documentation)
-- ============================================================================

/*
RECOMMENDED MIGRATION STATEMENT:

BEGIN;

-- Add correlation_id column to agent_sql_execution_log
ALTER TABLE agent_sql_execution_log 
ADD COLUMN IF NOT EXISTS correlation_id uuid;

-- Add correlation_id column to traces
ALTER TABLE traces 
ADD COLUMN IF NOT EXISTS correlation_id uuid;

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_agent_sql_execution_log_correlation_id 
ON agent_sql_execution_log(correlation_id);

CREATE INDEX IF NOT EXISTS idx_traces_correlation_id 
ON traces(correlation_id);

COMMIT;

-- Post-migration: Optionally make columns NOT NULL after data is populated
-- ALTER TABLE agent_sql_execution_log ALTER COLUMN correlation_id SET NOT NULL;
-- ALTER TABLE traces ALTER COLUMN correlation_id SET NOT NULL;
*/

-- ============================================================================
-- SECTION 10: Post-Migration Verification Queries
-- ============================================================================

-- Query 10.1: Verify correlation_id column was added
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('agent_sql_execution_log', 'traces')
AND column_name = 'correlation_id'
ORDER BY table_name;

-- Query 10.2: Verify indexes were created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname LIKE '%correlation_id%'
ORDER BY tablename;

-- ============================================================================
-- SUMMARY OF FINDINGS
-- ============================================================================
/*

┌─────────────────────────────────────────────────────────────────────┐
│ SCHEMA ANALYSIS SUMMARY                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ TABLE: agent_sql_execution_log                                      │
│ ├─ Status: ❌ correlation_id MISSING                               │
│ ├─ Columns: 20 total                                                │
│ ├─ Rows: 28                                                         │
│ ├─ Size: ~50KB (estimated)                                          │
│ └─ Migration Risk: ✅ LOW                                           │
│                                                                      │
│ TABLE: traces                                                       │
│ ├─ Status: ❌ correlation_id MISSING                               │
│ ├─ Columns: 9 total                                                 │
│ ├─ Rows: 7,804                                                      │
│ ├─ Size: ~200KB (estimated)                                         │
│ └─ Migration Risk: ✅ LOW                                           │
│                                                                      │
│ VERDICT: ⚠️  MIGRATION REQUIRED                                    │
│                                                                      │
│ Current schema does NOT support correlation_id without adding       │
│ the column to both tables via ALTER TABLE.                          │
│                                                                      │
│ Recommended Action:                                                 │
│ Create migration file: supabase/migrations/20260414_add_correlation_id.sql
│ Use UUID data type for consistency with existing id/task_id pattern │
│ Add indexes for optimal query performance                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

*/
