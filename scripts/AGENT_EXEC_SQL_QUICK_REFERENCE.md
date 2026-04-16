# agent_exec_sql() Quick Reference Guide

## Overview

`agent_exec_sql()` is a PostgreSQL function that executes SQL SELECT queries and returns results as JSON. It's integrated with Supabase and exposed via RPC for both client and server-side use.

---

## Basic Usage

### Server-Side (Direct SQL)

```sql
SELECT * FROM agent_exec_sql('SELECT COUNT(*) as row_count FROM god_status')
```

**Returns**:
```json
[
  {
    "agent_exec_sql": [
      {
        "row_count": 1
      }
    ]
  }
]
```

### Client-Side (JavaScript/TypeScript with Supabase)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(URL, KEY);

const { data, error } = await supabase.rpc("agent_exec_sql", {
  query: "SELECT COUNT(*) as row_count FROM god_status",
});

if (error) {
  console.error("Query failed:", error);
} else {
  console.log("Row count:", data[0][0].row_count);
}
```

---

## Common Queries

### 1. Count Rows in a Table

```sql
SELECT COUNT(*) as row_count FROM god_status
```

### 2. Get Column Schema

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'god_status' 
  AND table_schema = 'public'
ORDER BY ordinal_position
```

### 3. Retrieve Table Statistics

```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename = 'god_status'
```

### 4. Get All Columns and First Row

```sql
SELECT * FROM god_status LIMIT 1
```

### 5. List All Indexes on a Table

```sql
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'god_status'
  AND schemaname = 'public'
```

### 6. Check JSONB Column Keys

```sql
SELECT 
  jsonb_object_keys(meta) as meta_keys
FROM god_status
LIMIT 1
```

### 7. Query JSONB Data

```sql
SELECT 
  id,
  thought,
  meta->'mood' as mood,
  meta->'confidence' as confidence,
  intent->'cycle' as cycle,
  intent->'reasoning' as reasoning
FROM god_status
```

---

## Return Format

All queries executed via `agent_exec_sql()` return JSON arrays of objects:

```json
[
  {
    "column1": value1,
    "column2": value2,
    "column3": value3
  },
  {
    "column1": value1,
    "column2": value2,
    "column3": value3
  }
]
```

### Data Type Mapping

| PostgreSQL Type | JSON Type | Example |
|-----------------|-----------|---------|
| integer | number | 42 |
| bigint | number | 9223372036854775807 |
| text | string | "hello" |
| varchar | string | "world" |
| boolean | boolean | true |
| timestamp | string (ISO 8601) | "2026-04-13T23:20:07.935+00:00" |
| jsonb | object/array | {"key": "value"} |
| numeric | number/string | 123.45 |
| uuid | string | "550e8400-e29b-41d4-a716-446655440000" |

---

## God Status Table Quick Facts

| Property | Value |
|----------|-------|
| Table Name | `god_status` |
| Row Count | 1 |
| Columns | 5 |
| Primary Key | `id` (integer) |
| Storage Size | 72 kB |
| Last Updated | Dynamic (via trigger) |

### Columns

1. **id** - integer (PRIMARY KEY)
   - Default: 1
   - Usage: Single-row sentinel table

2. **thought** - text
   - Default: 'Watching...'
   - Usage: Current status/thought of the system

3. **updated_at** - timestamp with time zone
   - Default: now()
   - Updated automatically on change
   - Usage: Track when status was last updated

4. **meta** - jsonb (NULLABLE)
   - Structure: System metadata (mood, confidence, cycles, etc.)
   - Usage: Store current system state metrics

5. **intent** - jsonb (NULLABLE)
   - Structure: Current intent, goals, and decreed tasks
   - Usage: Store system's intended next actions

---

## Related Functions

### `get_god_status_schema_stats()`

Returns comprehensive schema information in a single call:

```sql
SELECT * FROM get_god_status_schema_stats()
```

**Returns**:
```json
{
  "table_name": "god_status",
  "row_count": 1,
  "storage_size": "72 kB",
  "columns": [...],
  "indexes": [...],
  "sample_data": [...],
  "schema_info": {...}
}
```

### `query_god_status_schema()`

Wrapper function - equivalent to `get_god_status_schema_stats()`:

```sql
SELECT * FROM query_god_status_schema()
```

---

## Error Handling

### Common Errors and Solutions

#### Error: "Permission denied"
```
Issue: User doesn't have SELECT permission on table
Solution: Use service role key instead of user token
```

#### Error: "Function not found"
```
Issue: agent_exec_sql() not present in database
Solution: Check if migrations have been run:
  SELECT * FROM pg_proc WHERE proname = 'agent_exec_sql'
```

#### Error: "Syntax error in query"
```
Issue: Malformed SQL in the query parameter
Solution: Test query directly in SQL editor first:
  psql -U postgres -d your_db -c "SELECT COUNT(*) FROM god_status"
```

#### Error: "Rate limited"
```
Issue: Too many requests to Supabase in short time
Solution: Add delay between requests or batch queries
```

---

## Performance Tips

1. **Use LIMIT for large result sets**: Avoid fetching entire tables
   ```sql
   SELECT * FROM god_status LIMIT 100
   ```

2. **Filter early**: Use WHERE clauses to reduce data transfer
   ```sql
   SELECT * FROM god_status WHERE id = 1
   ```

3. **Select only needed columns**: Avoid `SELECT *`
   ```sql
   SELECT id, thought, updated_at FROM god_status
   ```

4. **Index frequently queried columns**: Already done for primary key

5. **Use information_schema for metadata**: Faster than running DESCRIBE

---

## Testing

Run the comprehensive test suite:

```bash
node scripts/test-god-status-agent-exec.mjs
```

This tests:
- ✅ Basic god_status queries
- ✅ Schema statistics function
- ✅ Row counting
- ✅ Column information
- ✅ Sample data retrieval
- ✅ Wrapper functions

---

## Integration Examples

### Node.js/Express

```javascript
app.get('/api/god-status', async (req, res) => {
  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: 'SELECT COUNT(*) as row_count FROM god_status'
  });
  
  if (error) return res.status(500).json({ error });
  res.json(data);
});
```

### React Component

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function GodStatusCount() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    async function fetchCount() {
      const { data } = await supabase.rpc('agent_exec_sql', {
        query: 'SELECT COUNT(*) as row_count FROM god_status'
      });
      setCount(data[0][0].row_count);
    }
    
    fetchCount();
  }, []);
  
  return <div>God Status Rows: {count}</div>;
}
```

### Next.js API Route

```typescript
// pages/api/god-status-count.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: 'SELECT COUNT(*) as row_count FROM god_status'
  });
  
  if (error) return res.status(500).json({ error });
  res.json({ count: data[0][0].row_count });
}
```

---

## Documentation Files

- **Full Report**: `scripts/GOD_STATUS_SCHEMA_REPORT.md`
- **Test Script**: `scripts/test-god-status-agent-exec.mjs`
- **This Guide**: `scripts/AGENT_EXEC_SQL_QUICK_REFERENCE.md`

---

## Summary

`agent_exec_sql()` provides a flexible, JSON-based interface for executing SQL queries via Supabase RPC. Combined with the god_status table's metadata and the specialized wrapper functions, it enables robust programmatic access to system state and schema information.

**Key Benefits**:
- ✅ Simple SELECT query execution
- ✅ JSON return format (easy to parse)
- ✅ Works with information_schema for metadata
- ✅ Integrated with Supabase authentication
- ✅ Available via RPC for client and server code
- ✅ Comprehensive error handling
- ✅ Suitable for autonomous agent systems
