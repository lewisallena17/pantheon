-- Query god_status table with safe LIMIT via agent_exec_sql
-- This script demonstrates safe querying of the god_status table
-- with explicit LIMIT constraints to prevent resource exhaustion

-- Query 1: Get the current god_status with explicit LIMIT
SELECT * FROM public.agent_exec_sql(
  'SELECT id, thought, updated_at FROM public.god_status LIMIT 100'
) AS result;

-- Query 2: Get row count to verify table exists and has data
SELECT * FROM public.agent_exec_sql(
  'SELECT COUNT(*) as total_rows FROM public.god_status'
) AS result;

-- Query 3: Get latest status with ordering (safe with LIMIT 1)
SELECT * FROM public.agent_exec_sql(
  'SELECT id, thought, updated_at FROM public.god_status ORDER BY updated_at DESC LIMIT 1'
) AS result;
