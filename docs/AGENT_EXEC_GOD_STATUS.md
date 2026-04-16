# Agent Execution: god_status Table Schema & Row Count Statistics

This document describes the implementation of querying the `god_status` table schema and row count statistics via the `agent_exec_sql()` function.

## Overview

The task provides autonomous agents with direct database query capabilities through two mechanisms:

1. **Generic SQL Execution**: `agent_exec_sql(query)` - Execute arbitrary SELECT queries
2. **Specialized Functions**: Dedicated RPC functions for god_status schema queries

## Database Functions

### 1. `agent_exec_sql(query text) → jsonb`

Generic SQL execution function that safely executes SELECT queries and returns results as JSON.

**Signature:**
```sql
CREATE OR REPLACE FUNCTION agent_exec_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
```

**Parameters:**
- `query` (text): SQL SELECT statement to execute

**Returns:**
- JSONB array of result rows
- On error: `{"error": "error message", "sqlstate": "error code"}`

**Examples:**

```sql
-- Get row count
SELECT agent_exec_sql('SELECT COUNT(*) as row_count FROM god_status');

-- Get all columns from single record
SELECT agent_exec_sql('SELECT * FROM god_status LIMIT 1');

-- Get specific columns
SELECT agent_exec_sql('SELECT id, thought, updated_at FROM god_status');
```

**Response Format:**
```json
[
  {
    "id": 1,
    "thought": "...",
    "updated_at": "2026-04-13T23:09:18.847+00:00",
    "meta": { ... },
    "intent": null
  }
]
```

### 2. `get_god_status_schema_stats() → jsonb`

Specialized function that returns comprehensive schema information and statistics for the `god_status` table.

**Signature:**
```sql
CREATE OR REPLACE FUNCTION get_god_status_schema_stats()
RETURNS jsonb
```

**Returns:** JSON object with the following structure:

```json
{
  "table_name": "god_status",
  "row_count": 1,
  "columns": [
    {
      "column_name": "id",
      "data_type": "integer",
      "is_nullable": "NO",
      "column_default": "1"
    },
    {
      "column_name": "thought",
      "data_type": "text",
      "is_nullable": "NO",
      "column_default": "'Watching...'::text"
    },
    {
      "column_name": "updated_at",
      "data_type": "timestamp with time zone",
      "is_nullable": "NO",
      "column_default": "now()"
    },
    {
      "column_name": "meta",
      "data_type": "jsonb",
      "is_nullable": "YES",
      "column_default": null
    },
    {
      "column_name": "intent",
      "data_type": "jsonb",
      "is_nullable": "YES",
      "column_default": null
    }
  ],
  "sample_data": [
    {
      "id": 1,
      "thought": "GOD is directly improving the dashboard...",
      "updated_at": "2026-04-13T23:09:18.847+00:00",
      "meta": {
        "mood": "SUFFERING",
        "cycles": 14,
        "lessons": 0,
        "moodIcon": "✕",
        "moodColor": "red",
        "confidence": 15,
        "activeGoals": [],
        "successRate": 15,
        "agentsTracked": 5
      },
      "intent": null
    }
  ],
  "storage_size": "64 kB",
  "indexes": [
    {
      "index_name": "god_status_pkey",
      "index_definition": "CREATE UNIQUE INDEX god_status_pkey ON public.god_status USING btree (id)"
    }
  ],
  "schema_info": {
    "total_relation_size_bytes": 65536
  }
}
```

**Usage:**
```sql
SELECT get_god_status_schema_stats();
```

### 3. `query_god_status_schema() → jsonb`

Wrapper function for `agent_exec_sql()` compatibility. Returns the same result as `get_god_status_schema_stats()`.

**Signature:**
```sql
CREATE OR REPLACE FUNCTION query_god_status_schema()
RETURNS jsonb
```

**Usage:**
```sql
SELECT query_god_status_schema();
```

## god_status Table Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | integer | NO | 1 | Primary key (singleton: always 1) |
| `thought` | text | NO | 'Watching...' | Current status/thought from GOD agent |
| `updated_at` | timestamp with time zone | NO | now() | Last update timestamp |
| `meta` | jsonb | YES | NULL | Metadata object (mood, confidence, stats, etc.) |
| `intent` | jsonb | YES | NULL | Intent/goal information |

**Primary Key:** `god_status_pkey` (id)

## TypeScript/Node.js Usage

### Setup

```typescript
import {
  agentExecSql,
  getGodStatusSchemaStats,
  queryGodStatusSchema,
  getGodStatusStatistics,
  getCurrentGodStatus,
} from "@/lib/agent-exec-god-status";
```

### Query via agent_exec_sql()

```typescript
// Execute arbitrary SELECT query
const results = await agentExecSql(
  "SELECT id, thought, updated_at FROM god_status"
);
console.log(results);
// Output: [{ id: 1, thought: "...", updated_at: "2026-04-13T..." }]
```

### Get Schema Statistics

```typescript
// Get complete schema and stats
const stats = await getGodStatusSchemaStats();
console.log(`Row count: ${stats.row_count}`);
console.log(`Storage: ${stats.storage_size}`);
console.log(`Columns: ${stats.columns.length}`);

// Sample output:
// Row count: 1
// Storage: 64 kB
// Columns: 5
```

### Get Statistics Summary

```typescript
// Get quick statistics summary
const summary = await getGodStatusStatistics();
// Output: {
//   row_count: 1,
//   table_name: "god_status",
//   columns: 5,
//   indexes: 1,
//   storage_size: "64 kB"
// }
```

### Get Current god_status Record

```typescript
// Get the current GOD status record
const status = await getCurrentGodStatus();
console.log(status.thought);
console.log(status.meta.mood);
console.log(status.updated_at);
```

### Direct Supabase RPC Calls

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, serviceKey);

// Via agent_exec_sql
const { data, error } = await supabase.rpc("agent_exec_sql", {
  query: "SELECT COUNT(*) as row_count FROM god_status",
});

// Via specialized function
const { data: stats } = await supabase.rpc("get_god_status_schema_stats");
```

## Testing

Run the comprehensive test suite:

```bash
# Test all agent_exec_sql() functions for god_status
npm run test:god-status-agent-exec

# Or directly with Node.js
node scripts/test-god-status-agent-exec.mjs
```

The test script verifies:
- ✓ Basic god_status queries
- ✓ Schema and statistics retrieval
- ✓ Row count queries
- ✓ Column information queries
- ✓ Sample data retrieval
- ✓ Wrapper function execution

## Implementation Details

### Files Modified/Created

1. **Migration File**
   - `supabase/migrations/0013_god_status_schema_stats.sql`
   - Creates `get_god_status_schema_stats()` and `query_god_status_schema()` functions

2. **TypeScript Library**
   - `lib/agent-exec-god-status.ts`
   - Exports TypeScript wrappers for all RPC functions
   - Type-safe database access

3. **Test Script**
   - `scripts/test-god-status-agent-exec.mjs`
   - Comprehensive test suite for all functions

### Security

All functions are created with `SECURITY DEFINER` to:
- Execute with function owner's privileges
- Safely control access via `GRANT EXECUTE`
- Restrict to `service_role` only (agents)

### Performance Considerations

- `agent_exec_sql()` safely handles arbitrary queries with error catching
- Schema queries use system catalogs (minimal impact)
- Row count uses `COUNT(*)` on small table (1 row)
- Storage size calculations are cached by PostgreSQL

## Error Handling

All functions include exception handling:

```json
{
  "error": "permission denied for schema public",
  "sqlstate": "42501"
}
```

Handle errors in your agent code:

```typescript
try {
  const results = await agentExecSql(query);
  if (results.error) {
    console.error(`Query failed: ${results.error}`);
  } else {
    // Process results
  }
} catch (err) {
  console.error("RPC call failed:", err);
}
```

## Use Cases for Agents

1. **System Introspection**: Agents can query their own data structure
2. **Statistics Collection**: Monitor god_status updates and patterns
3. **Schema Validation**: Verify table schema hasn't changed
4. **Audit Trails**: Track changes over time
5. **Debugging**: Inspect current state when troubleshooting

## References

- [Supabase RPC Documentation](https://supabase.com/docs/guides/database/functions)
- [PostgreSQL Information Schema](https://www.postgresql.org/docs/current/information-schema.html)
- [PLPGSQL Documentation](https://www.postgresql.org/docs/current/plpgsql.html)

## Related Functions

- `agent_exec_ddl(statement)` - Execute DDL statements
- `get_god_status_schema_stats()` - Specialized schema function
- `query_god_status_schema()` - Wrapper function for compatibility
