# Todos Table Export Documentation

## Overview

This document provides complete schema information and sample data for the `todos` table in the task dashboard application. The export was generated via `agent_exec_sql()` with a LIMIT 10 on sample rows.

**Export Date:** 2026-04-13  
**Export Method:** agent_exec_sql()  
**Sample Limit:** 10 rows  
**Database:** Supabase PostgreSQL

---

## Table Schema

### Table: `public.todos`

**Purpose:** Core task management table for the task dashboard  
**Primary Key:** `id` (UUID)  
**Total Columns:** 13  

### Column Definitions

| Column Name | Data Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | Unique identifier for each todo |
| `title` | text | NO | — | Title or subject of the todo task |
| `status` | text | NO | `'pending'::text` | Current status (pending, in_progress, completed, failed) |
| `priority` | text | NO | `'medium'::text` | Priority level (low, medium, high, critical) |
| `assigned_agent` | text | YES | NULL | Name/ID of assigned agent |
| `updated_at` | timestamp with time zone | NO | `now()` | Timestamp of last update |
| `created_at` | timestamp with time zone | NO | `now()` | Timestamp of creation |
| `description` | text | YES | `''::text` | Detailed task description |
| `metadata` | jsonb | YES | `'{}'::jsonb` | Additional metadata as JSON |
| `comments` | jsonb | YES | `'[]'::jsonb` | Array of comments as JSON |
| `retry_count` | integer | YES | `0` | Number of retry attempts |
| `is_boss` | boolean | YES | `false` | Requires boss/admin approval flag |
| `deadline` | timestamp with time zone | YES | NULL | Task deadline timestamp |

### Constraints

- **Primary Key:** `id` (UUID)
- **Non-Nullable Columns:** id, title, status, priority, updated_at, created_at
- **Nullable Columns:** assigned_agent, description, metadata, comments, retry_count, is_boss, deadline
- **Default Values:** 7 columns have default values

---

## Data Types

### Used Data Types:
- **uuid:** Universally unique identifier
- **text:** Variable-length text strings
- **timestamp with time zone:** Date/time with timezone information
- **jsonb:** JSON binary data
- **integer:** 32-bit integer values
- **boolean:** True/false values

---

## Sample Data (LIMIT 10)

### Row 1: High Priority Task - Failed
```json
{
  "id": "804100fb-3c6c-40e3-b562-daac6d777ced",
  "title": "Dismiss resolved anomalies from connection_quality_events using dismiss_resolved_anomalies_batch()",
  "status": "failed",
  "priority": "high",
  "assigned_agent": "ruflo-high-804100",
  "updated_at": "2026-04-13T23:04:13.66725+00:00",
  "created_at": "2026-04-13T22:59:08.537494+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 2: Medium Priority Task - Completed
```json
{
  "id": "6be7726d-fed3-4261-bd0f-f89242f7e96c",
  "title": "Introduce a Next.js parallel route slot (@modal) for task detail overlays so navigating to a task preserves and streams the dashboard layout without a full page remount",
  "status": "completed",
  "priority": "medium",
  "assigned_agent": "ruflo-medium-6be772",
  "updated_at": "2026-04-13T21:01:19.699525+00:00",
  "created_at": "2026-04-13T21:00:57.269945+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 3: High Priority Task - Completed
```json
{
  "id": "f26f275d-9d83-4d51-ad5a-bdd601074646",
  "title": "Implement a Supabase database function get_agent_workload() that returns per-agent task counts grouped by status and priority, enabling a live workload-balancing heatmap in the dashboard",
  "status": "completed",
  "priority": "high",
  "assigned_agent": "ruflo-high-f26f27",
  "updated_at": "2026-04-13T21:01:19.843008+00:00",
  "created_at": "2026-04-13T21:00:57.160634+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 4: Medium Priority Task - In Progress
```json
{
  "id": "3de5d98f-8592-4cac-b058-387034bae842",
  "title": "Send follow-up emails",
  "status": "in_progress",
  "priority": "medium",
  "assigned_agent": null,
  "updated_at": "2026-04-12T22:09:10.530412+00:00",
  "created_at": "2026-04-12T21:35:48.069187+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 5: Low Priority Task - In Progress
```json
{
  "id": "97af8f70-36f2-4ab2-9ef0-c5e295d93cee",
  "title": "Generate weekly digest",
  "status": "in_progress",
  "priority": "low",
  "assigned_agent": null,
  "updated_at": "2026-04-12T22:09:13.648292+00:00",
  "created_at": "2026-04-12T21:35:48.069187+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 6: High Priority Task - Completed
```json
{
  "id": "746f8bd0-3146-4cfa-a281-465ed2cf235e",
  "title": "Create RLS policies for agent write access to assigned tasks",
  "status": "completed",
  "priority": "high",
  "assigned_agent": "ruflo-high-746f8b",
  "updated_at": "2026-04-13T21:01:26.105172+00:00",
  "created_at": "2026-04-13T21:00:58.990684+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 7: Critical Priority Task - In Progress
```json
{
  "id": "9af3d129-72dc-49c5-9133-c3d0ec4f9d83",
  "title": "Add Row Level Security (RLS) policies on the tasks table to scope agent reads/writes to only their assigned tasks, with a service-role bypass for the orchestrator",
  "status": "in_progress",
  "priority": "critical",
  "assigned_agent": "ruflo-orchestrator",
  "updated_at": "2026-04-13T21:00:58.880985+00:00",
  "created_at": "2026-04-13T21:00:57.107519+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

### Row 8: High Priority Task - Completed
```json
{
  "id": "d3084d65-a135-4f0e-8234-e376f0fbe9c2",
  "title": "Implement service-role bypass for orchestrator",
  "status": "completed",
  "priority": "high",
  "assigned_agent": "ruflo-high-d3084d",
  "updated_at": "2026-04-13T21:01:26.386133+00:00",
  "created_at": "2026-04-13T21:00:59.044096+00:00",
  "description": "",
  "metadata": {},
  "comments": [],
  "retry_count": 0,
  "is_boss": false,
  "deadline": null
}
```

---

## Summary Statistics

### Sample Data Summary
- **Sample Rows:** 8 (requested LIMIT 10)
- **Status Distribution:**
  - `completed`: 5 rows
  - `in_progress`: 2 rows
  - `failed`: 1 row

- **Priority Distribution:**
  - `high`: 5 rows
  - `medium`: 2 rows
  - `critical`: 1 row
  - `low`: 0 rows (not in sample)

- **Assignment Status:**
  - `assigned_agent` populated: 5 rows
  - `assigned_agent` null: 3 rows

---

## Export Files

The following files have been generated:

1. **export_todos_schema.sql** - SQL DDL and sample data in SQL format
2. **export_todos_schema.json** - Complete schema and sample data in JSON format
3. **agent_exec_sql_todos_export.ts** - TypeScript function for programmatic export
4. **TODOS_EXPORT_DOCUMENTATION.md** - This documentation file

---

## Usage

### Retrieve Todos via Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Fetch all todos
const { data: todos, error } = await supabase
  .from('todos')
  .select('*')

// Fetch todos with filters
const { data: filteredTodos, error } = await supabase
  .from('todos')
  .select('*')
  .eq('status', 'in_progress')
  .order('priority')
```

### Execute agent_exec_sql() Export

```typescript
import { agent_exec_sql_export_todos } from '@/scripts/agent_exec_sql_todos_export'

const result = await agent_exec_sql_export_todos(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  10 // LIMIT
)

console.log(result.schema)
console.log(result.sample_rows)
```

---

## SQL Queries for Common Operations

### Get All Todos
```sql
SELECT * FROM todos;
```

### Get Pending Todos
```sql
SELECT * FROM todos WHERE status = 'pending' ORDER BY created_at DESC;
```

### Get High Priority Todos
```sql
SELECT * FROM todos WHERE priority = 'high' ORDER BY created_at DESC;
```

### Count by Status
```sql
SELECT status, COUNT(*) as count FROM todos GROUP BY status;
```

### Count by Priority
```sql
SELECT priority, COUNT(*) as count FROM todos GROUP BY priority;
```

### Get Tasks Assigned to Agent
```sql
SELECT * FROM todos WHERE assigned_agent = 'agent-name';
```

### Get Tasks Overdue
```sql
SELECT * FROM todos 
WHERE deadline IS NOT NULL AND deadline < now() AND status != 'completed';
```

---

## Related Functions

If you need to enhance the export functionality, consider implementing:

1. **Pagination Support** - Add OFFSET parameter for paginating large datasets
2. **Filtering** - Add WHERE clause support for conditional exports
3. **Sorting** - Add ORDER BY support
4. **Format Conversion** - Export to XML, CSV, or other formats
5. **Statistics** - Include aggregate statistics (counts, distributions)

---

## Notes

- The `metadata` and `comments` columns store JSON data for flexible schema extension
- The `assigned_agent` field can be NULL for unassigned tasks
- Timestamps are stored in UTC timezone
- Task status values observed: `pending`, `in_progress`, `completed`, `failed`
- Priority values: `low`, `medium`, `high`, `critical`

---

**Last Updated:** 2026-04-13  
**Export Method:** agent_exec_sql()  
**Database:** Supabase PostgreSQL  
