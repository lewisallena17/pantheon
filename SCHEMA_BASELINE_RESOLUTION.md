# Schema Baseline Query - Resolution Document

## Task
Query information_schema.tables and information_schema.columns for `todos` and `god_status` tables to establish schema baseline.

## Blocker: Ambiguous Function Signatures
The agent tools are blocked by ambiguous PostgreSQL function overloads in the Supabase database.

### Current Error
```
Could not choose the best candidate function between:
  - public.agent_exec_sql(query => text)
  - public.agent_exec_sql(query => text, p_agent_name => text, p_task_id => uuid, p_log_execution => boolean)
  - public.agent_exec_sql(query => text, p_agent_name => text, p_task_id => uuid, p_max_rows => integer)
```

### Root Cause
Multiple function overloads exist for `agent_exec_sql` and `agent_exec_ddl` making it ambiguous which one to call.

## Solution
The migration file `supabase/migrations/0015_fix_agent_exec_sql_ambiguity.sql` contains the fix, but it needs to be applied manually via **Supabase SQL Editor** because the agent tools themselves are blocked.

### Manual Fix Steps

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `supabase/migrations/0015_fix_agent_exec_sql_ambiguity.sql`
3. Execute the script

### What the Fix Does
- Drops all overloaded versions of `agent_exec_sql` and `agent_exec_ddl`
- Recreates them with single, unambiguous signatures:
  - `agent_exec_sql(query text) → jsonb`
  - `agent_exec_ddl(statement text) → text`

## After Manual Fix
Once applied manually, these queries will work:

### Query 1: Table Schema
```sql
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('todos', 'god_status')
ORDER BY table_name;
```

### Query 2: Column Schema (todos)
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'todos'
ORDER BY ordinal_position;
```

### Query 3: Column Schema (god_status)
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'god_status'
ORDER BY ordinal_position;
```

## Current Status
- ✅ Migration file created: `supabase/migrations/0015_fix_agent_exec_sql_ambiguity.sql`
- ✅ SQL queries prepared (above)
- ⏳ Awaiting manual execution in Supabase SQL Editor
- ⏳ Once fixed, agent can auto-verify with `list_tables`, `describe_table`, and `run_sql`
