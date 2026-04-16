# agent_exec_sql() - Traces Table Query Guide

## Overview

The `agent_exec_sql()` function is a SQL execution wrapper in the Supabase database that allows safe, sandboxed querying of tables. This guide demonstrates how to query the **traces** table to retrieve agent execution records.

## Traces Table Structure

The `traces` table tracks all agent tool executions with the following columns:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Unique trace identifier (auto-generated) |
| `task_id` | uuid | YES | Associated task ID |
| `agent_name` | text | YES | Name/ID of the executing agent |
| `tool_name` | text | NO | Name of the tool executed (e.g., run_sql, write_file) |
| `input_summary` | text | YES | Summary of input parameters |
| `result_summary` | text | YES | Summary of execution result |
| `duration_ms` | integer | YES | Execution duration in milliseconds |
| `is_error` | boolean | YES | Whether execution resulted in error (default: false) |
| `created_at` | timestamp with time zone | YES | Execution timestamp (default: now()) |

## agent_exec_sql() Function

**Signature:**
```sql
agent_exec_sql(query text) RETURNS jsonb
```

**Description:**
- Executes a SELECT query safely within a transaction
- Returns results as a JSONB array of objects
- Returns `[]` (empty array) if no results
- Returns error object `{"error": "...", "sqlstate": "..."}` on failure

## Basic Usage Examples

### 1. Retrieve Recent Trace Records (LIMIT 10)

```sql
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 10'
)
```

**Output:** Returns last 10 trace records ordered by creation time (newest first)

### 2. Count Total Traces

```sql
SELECT * FROM agent_exec_sql(
  'SELECT COUNT(*) as total_traces FROM traces'
)
```

**Output:** 
```json
{
  "agent_exec_sql": [
    {
      "total_traces": 267
    }
  ]
}
```

### 3. List Execution by Agent

```sql
SELECT * FROM agent_exec_sql(
  'SELECT agent_name, COUNT(*) as exec_count 
   FROM traces 
   GROUP BY agent_name 
   LIMIT 5'
)
```

**Output:** Returns agent execution counts (top 5)

### 4. Calculate Average Tool Duration

```sql
SELECT * FROM agent_exec_sql(
  'SELECT tool_name, AVG(duration_ms) as avg_duration 
   FROM traces 
   WHERE duration_ms IS NOT NULL 
   GROUP BY tool_name 
   ORDER BY avg_duration DESC 
   LIMIT 5'
)
```

**Output:** Returns slowest tools by average execution time

### 5. Filter by Error Status

```sql
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, is_error, created_at 
   FROM traces 
   WHERE is_error = true 
   LIMIT 20'
)
```

**Output:** Returns recent error traces

### 6. Filter by Tool Type

```sql
SELECT * FROM agent_exec_sql(
  'SELECT agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE tool_name = ''run_sql'' 
   ORDER BY created_at DESC 
   LIMIT 10'
)
```

**Output:** Returns recent SQL execution traces

### 7. Time-Range Query

```sql
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, created_at 
   FROM traces 
   WHERE created_at > NOW() - INTERVAL ''1 hour'' 
   ORDER BY created_at DESC 
   LIMIT 20'
)
```

**Output:** Returns traces from last hour

## Real Example Results

### Query:
```sql
SELECT * FROM agent_exec_sql(
  'SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
   FROM traces 
   ORDER BY created_at DESC 
   LIMIT 5'
)
```

### Result:
```json
{
  "agent_exec_sql": [
    {
      "id": "e98c9213-5aca-4e58-94bb-05a09ebf79a5",
      "is_error": false,
      "tool_name": "run_sql",
      "agent_name": "ruflo-medium-0801e4",
      "created_at": "2026-04-13T23:28:56.390744+00:00",
      "duration_ms": 58
    },
    {
      "id": "a0652cab-a2d3-48b5-b17f-4f729774374a",
      "is_error": false,
      "tool_name": "write_file",
      "agent_name": "ruflo-high-58bc6c",
      "created_at": "2026-04-13T23:28:54.031689+00:00",
      "duration_ms": 0
    },
    {
      "id": "9d241ce8-58f8-4a95-b2af-2dceb28c78a6",
      "is_error": false,
      "tool_name": "run_sql",
      "agent_name": "ruflo-medium-0801e4",
      "created_at": "2026-04-13T23:28:39.506942+00:00",
      "duration_ms": 74
    }
  ]
}
```

## Performance Notes

- **LIMIT clause:** Always use LIMIT to constrain result sets
- **Indexes:** Queries on `created_at`, `agent_name`, and `tool_name` are optimized
- **JSONB return:** Results are automatically aggregated into JSONB format
- **Error handling:** Malformed queries return error details in JSON

## Integration in Application Code

### TypeScript Example:

```typescript
// Execute a trace query via agent_exec_sql
async function getRecentTraces(limit: number = 10) {
  const { data, error } = await supabase
    .rpc('agent_exec_sql', {
      query: `SELECT id, agent_name, tool_name, duration_ms, is_error, created_at 
              FROM traces 
              ORDER BY created_at DESC 
              LIMIT ${limit}`
    });
  
  if (error) throw error;
  return data;
}

// Get error traces
async function getErrorTraces(limit: number = 20) {
  const { data, error } = await supabase
    .rpc('agent_exec_sql', {
      query: `SELECT id, agent_name, tool_name, error_msg, created_at 
              FROM traces 
              WHERE is_error = true 
              ORDER BY created_at DESC 
              LIMIT ${limit}`
    });
  
  if (error) throw error;
  return data;
}

// Get tool statistics
async function getToolStats() {
  const { data, error } = await supabase
    .rpc('agent_exec_sql', {
      query: `SELECT tool_name, COUNT(*) as count, AVG(duration_ms) as avg_duration 
              FROM traces 
              WHERE duration_ms IS NOT NULL 
              GROUP BY tool_name 
              ORDER BY count DESC`
    });
  
  if (error) throw error;
  return data;
}
```

## Security Notes

- `agent_exec_sql()` uses `SECURITY DEFINER` to execute as a trusted role
- Only SELECT queries are supported
- Queries are wrapped in a transaction with error handling
- No direct database access required from client code
