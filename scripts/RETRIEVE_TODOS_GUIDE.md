# Retrieve Todos Table Structure and Sample Rows via agent_exec_sql()

This guide explains how to retrieve the todos table structure and sample rows using the `agent_exec_sql()` Supabase RPC function.

## Overview

The `agent_exec_sql()` function is a Supabase RPC that allows authorized agents to execute SQL queries safely. This implementation demonstrates how to:

1. Retrieve table schema from `information_schema.columns`
2. Get row counts
3. Fetch sample rows with specific column selections
4. Generate statistics and distribution reports
5. Export structured data as JSON

## Files

### 1. `retrieve-todos-structure.mjs`
JavaScript/ES6 version that can be run with Node.js directly.

**Usage:**
```bash
node scripts/retrieve-todos-structure.mjs
```

**Requirements:**
- Node.js 16+
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. `retrieve-todos-structure.ts`
TypeScript version with full type safety and interfaces.

**Usage:**
```bash
tsx scripts/retrieve-todos-structure.ts
# or
npx ts-node scripts/retrieve-todos-structure.ts
```

**Requirements:**
- Node.js 16+
- TypeScript installed
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## How agent_exec_sql() Works

### What is agent_exec_sql()?

`agent_exec_sql()` is a Supabase RPC (Remote Procedure Call) function that:
- Takes a SQL query string as input (`sql_query` parameter)
- Executes the query on the Supabase PostgreSQL database
- Returns results as JSON rows
- Enforces Row Level Security (RLS) policies
- Is rate-limited to prevent abuse

### Usage Pattern

```typescript
const { data, error } = await supabase.rpc("agent_exec_sql", {
  sql_query: `SELECT * FROM todos LIMIT 5`,
});

if (error) {
  console.error("Query failed:", error.message);
} else {
  console.log("Results:", data);
}
```

## Todos Table Structure

The `todos` table has the following columns:

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | Unique identifier |
| title | text | NO | - | Task title |
| status | text | NO | 'pending' | Task status (pending, in_progress, completed, failed) |
| priority | text | NO | 'medium' | Task priority (low, medium, high, critical) |
| assigned_agent | text | YES | NULL | Agent handling the task |
| description | text | YES | '' | Detailed task description |
| retry_count | integer | YES | 0 | Number of retry attempts |
| is_boss | boolean | YES | false | Flag for boss-assigned tasks |
| deadline | timestamp | YES | NULL | Task deadline |
| metadata | jsonb | YES | '{}' | Custom metadata |
| comments | jsonb | YES | '[]' | Array of comments |
| created_at | timestamp | NO | now() | Creation timestamp |
| updated_at | timestamp | NO | now() | Last update timestamp |

## Example Queries via agent_exec_sql()

### 1. Get Table Schema

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position
```

**Result:** List of all columns with their data types and constraints

### 2. Get Row Count

```sql
SELECT COUNT(*) as row_count FROM todos
```

**Result:** Single row with total count

### 3. Get Sample Rows

```sql
SELECT 
  id,
  title,
  status,
  priority,
  assigned_agent,
  created_at,
  updated_at
FROM todos
LIMIT 5
```

**Result:** First 5 rows with selected columns

### 4. Get Status Distribution

```sql
SELECT 
  status,
  COUNT(*) as count
FROM todos
GROUP BY status
ORDER BY status
```

**Result:** Count of todos by status

### 5. Get Agent Workload

```sql
SELECT 
  assigned_agent,
  COUNT(*) as task_count,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
FROM todos
WHERE assigned_agent IS NOT NULL
GROUP BY assigned_agent
ORDER BY task_count DESC
```

**Result:** Task distribution by agent

## Output Format

The scripts generate output in the following sections:

### 1. Table Structure
```
Column Name          | Data Type             | Nullable
─────────────────────────────────────────────────────
id                   | uuid                  | NOT NULL
title                | text                  | NOT NULL
status               | text                  | NOT NULL
...
```

### 2. Row Count
```
✅ Total rows in todos table: 42
```

### 3. Sample Rows
```json
{
  "id": "804100fb-3c6c-40e3-b562-daac6d777ced",
  "title": "Dismiss resolved anomalies from connection_quality_events using dismiss_resolved_anomalies_batch()",
  "status": "failed",
  "priority": "high",
  "assigned_agent": "ruflo-high-804100",
  "created_at": "2026-04-13T22:59:08.537494+00:00",
  "updated_at": "2026-04-13T23:04:13.66725+00:00"
}
```

### 4. Statistics
```
Status       | Priority  | Count | Assigned
──────────────────────────────────────────
completed    | critical  | 2     | 1
completed    | high      | 8     | 7
in_progress  | critical  | 1     | 1
...
```

### 5. Agent Distribution
```
Agent                          | Tasks | Complete | Progress | Failed | Pending
──────────────────────────────────────────────────────────────────────────────
ruflo-high-804100              | 3     | 1        | 0        | 2      | 0
ruflo-medium-6be772            | 2     | 2        | 0        | 0      | 0
...
```

### 6. Structured JSON Report
```json
{
  "timestamp": "2026-04-13T23:45:00.000Z",
  "table": "todos",
  "summary": {
    "totalRows": 42,
    "columnsCount": 13,
    "retrievedAt": "2026-04-13T23:45:00.000Z"
  },
  "schema": [
    {
      "name": "id",
      "type": "uuid",
      "nullable": false,
      "default": "gen_random_uuid()",
      "position": 1
    }
  ],
  "sampleRows": [...]
}
```

## Error Handling

The scripts handle several error scenarios:

1. **Missing Environment Variables**
   ```
   ❌ Missing Supabase environment variables
      NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required
   ```

2. **Query Execution Error**
   ```
   ❌ Error retrieving schema: [error message]
   ```

3. **No Data Found**
   ```
   ❌ No schema columns found for todos table
   ```

4. **Rate Limiting**
   ```
   ❌ Error retrieving schema: This request was aborted due to rate limiting...
   ```

## Rate Limiting Considerations

The `agent_exec_sql()` function is subject to Supabase rate limiting. If you receive a 429 error:

1. Wait a few seconds before retrying
2. Implement exponential backoff for production use
3. Consider batching queries to reduce request frequency
4. Use the `/scripts/agent-update.ts` pattern for monitoring retry logic

## Integration with Applications

### Next.js Server Component Example

```typescript
// app/dashboard/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: todos, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: `SELECT * FROM todos LIMIT 10`,
  });

  if (error) {
    return <div>Error loading todos: {error.message}</div>;
  }

  return (
    <div>
      <h1>Todos ({todos?.length || 0})</h1>
      <ul>
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### React Hook Example

```typescript
// hooks/useTodos.ts
import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export function useTodos() {
  const supabase = useSupabaseClient();
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase.rpc("agent_exec_sql", {
        sql_query: `SELECT * FROM todos WHERE status = 'pending' LIMIT 20`,
      });

      if (!error) {
        setTodos(data || []);
      }
      setLoading(false);
    };

    fetchTodos();
  }, [supabase]);

  return { todos, loading };
}
```

## Troubleshooting

### Issue: "agent_exec_sql is not a function"
**Solution:** Ensure the function exists in your Supabase database. Check with:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'agent_exec_sql'
```

### Issue: "function does not exist"
**Solution:** The function may not be deployed. Contact your DBA or deploy the function:
```sql
CREATE OR REPLACE FUNCTION agent_exec_sql(sql_query text)
RETURNS TABLE AS $$ ... $$ LANGUAGE sql;
```

### Issue: Empty results from valid query
**Solution:** Check Row Level Security (RLS) policies. The current user may not have read access to the table.

### Issue: Rate limit errors (429)
**Solution:** Implement retry logic with exponential backoff:
```typescript
async function queryWithRetry(query: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await supabase.rpc("agent_exec_sql", {
      sql_query: query,
    });
    
    if (!error) return data;
    
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    } else {
      throw error;
    }
  }
}
```

## Performance Tips

1. **Use LIMIT for large tables**: Always add LIMIT when fetching sample data
2. **Select specific columns**: Don't use SELECT * if you only need a few columns
3. **Filter early**: Use WHERE clauses to reduce rows before aggregation
4. **Batch queries**: Combine multiple related queries when possible
5. **Use indexes**: Ensure queried columns have appropriate indexes

## References

- [Supabase RPC Documentation](https://supabase.com/docs/reference/javascript/rpc)
- [PostgreSQL Information Schema](https://www.postgresql.org/docs/current/information-schema.html)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## Support

For issues or questions:
1. Check the error message and troubleshooting section
2. Verify environment variables are set correctly
3. Test the SQL query directly in Supabase SQL editor
4. Check rate limiting status and retry later if needed
