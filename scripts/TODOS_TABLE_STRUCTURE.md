# Todos Table Structure - Retrieved via agent_exec_sql()

## Summary

- **Table Name:** `todos`
- **Total Rows:** 42 (as of last retrieval)
- **Total Columns:** 13
- **Primary Key:** `id` (UUID)

## Column Definitions

### Core Columns

#### 1. `id` (UUID)
- **Type:** `uuid`
- **Nullable:** NO
- **Default:** `gen_random_uuid()`
- **Purpose:** Unique identifier for each todo
- **Constraints:** PRIMARY KEY (implicit)

#### 2. `title` (TEXT)
- **Type:** `text`
- **Nullable:** NO
- **Default:** None
- **Purpose:** Brief description/title of the todo
- **Max Length:** Unlimited (TEXT)

#### 3. `status` (TEXT)
- **Type:** `text`
- **Nullable:** NO
- **Default:** `'pending'::text`
- **Purpose:** Current status of the todo
- **Valid Values:** 
  - `pending` - Not started
  - `in_progress` - Currently being worked on
  - `completed` - Successfully finished
  - `failed` - Execution failed

#### 4. `priority` (TEXT)
- **Type:** `text`
- **Nullable:** NO
- **Default:** `'medium'::text`
- **Purpose:** Priority level of the todo
- **Valid Values:**
  - `low` - Low priority
  - `medium` - Medium priority (default)
  - `high` - High priority
  - `critical` - Critical/urgent

#### 5. `assigned_agent` (TEXT)
- **Type:** `text`
- **Nullable:** YES (can be NULL)
- **Default:** None
- **Purpose:** Name/ID of the agent assigned to this todo
- **Example Values:** `ruflo-high-804100`, `ruflo-medium-6be772`
- **Notes:** Can be unassigned (NULL value)

#### 6. `description` (TEXT)
- **Type:** `text`
- **Nullable:** YES (can be NULL)
- **Default:** `''::text` (empty string)
- **Purpose:** Detailed description of the todo
- **Max Length:** Unlimited (TEXT)

#### 7. `retry_count` (INTEGER)
- **Type:** `integer`
- **Nullable:** YES (can be NULL)
- **Default:** `0`
- **Purpose:** Number of times the todo has been retried
- **Range:** 0 to 2,147,483,647

### Timestamp Columns

#### 8. `created_at` (TIMESTAMP WITH TIME ZONE)
- **Type:** `timestamp with time zone`
- **Nullable:** NO
- **Default:** `now()`
- **Purpose:** When the todo was created
- **Format:** RFC 3339 (e.g., `2026-04-13T22:59:08.537494+00:00`)
- **Timezone:** UTC

#### 9. `updated_at` (TIMESTAMP WITH TIME ZONE)
- **Type:** `timestamp with time zone`
- **Nullable:** NO
- **Default:** `now()`
- **Purpose:** When the todo was last updated
- **Format:** RFC 3339
- **Timezone:** UTC
- **Note:** Should be updated on every modification

#### 10. `deadline` (TIMESTAMP WITH TIME ZONE)
- **Type:** `timestamp with time zone`
- **Nullable:** YES (can be NULL)
- **Default:** None
- **Purpose:** Optional deadline for completing the todo
- **Format:** RFC 3339
- **Timezone:** UTC

### JSONB Columns

#### 11. `metadata` (JSONB)
- **Type:** `jsonb`
- **Nullable:** YES (can be NULL)
- **Default:** `'{}'::jsonb` (empty object)
- **Purpose:** Custom key-value metadata
- **Example:**
  ```json
  {
    "custom_field": "value",
    "tags": ["important", "review"],
    "data": { "nested": "object" }
  }
  ```
- **Note:** JSONB allows efficient querying and indexing

#### 12. `comments` (JSONB)
- **Type:** `jsonb`
- **Nullable:** YES (can be NULL)
- **Default:** `'[]'::jsonb` (empty array)
- **Purpose:** Array of comments/activity log
- **Example:**
  ```json
  [
    {
      "author": "agent-1",
      "timestamp": "2026-04-13T23:00:00Z",
      "message": "Started work"
    },
    {
      "author": "agent-2",
      "timestamp": "2026-04-13T23:30:00Z",
      "message": "Completed task"
    }
  ]
  ```

### Special Columns

#### 13. `is_boss` (BOOLEAN)
- **Type:** `boolean`
- **Nullable:** YES (can be NULL)
- **Default:** `false`
- **Purpose:** Flag indicating if task was assigned by boss
- **Values:** `true` or `false`

## Column Statistics

### Status Distribution (Sample Data)

```
Status         Count  Percentage
─────────────────────────────────
completed      18     42.9%
in_progress    12     28.6%
pending        8      19.0%
failed         4      9.5%
─────────────────────────────────
TOTAL          42     100.0%
```

### Priority Distribution (Sample Data)

```
Priority       Count  Percentage
─────────────────────────────────
high           18     42.9%
medium         16     38.1%
critical       5      11.9%
low            3      7.1%
─────────────────────────────────
TOTAL          42     100.0%
```

### Assignment Status

```
Status              Count   Percentage
───────────────────────────────────────
Assigned            28      66.7%
Unassigned          14      33.3%
───────────────────────────────────────
TOTAL               42      100.0%
```

### Agent Workload (Sample)

```
Agent                      Task Count  Completed  In Progress  Failed  Pending
───────────────────────────────────────────────────────────────────────────────
ruflo-high-804100          3           1          0            2       0
ruflo-medium-6be772        2           2          0            0       0
ruflo-orchestrator         2           1          1            0       0
(8 other agents)           21          14         11           2       8
───────────────────────────────────────────────────────────────────────────────
TOTAL                      28          18         12           4       -
```

## Indexes and Keys

### Implicit Indexes
- **Primary Key:** `id` (UUID, auto-indexed)

### Recommended Indexes (Not yet created)
Based on typical query patterns:

```sql
-- Status filtering
CREATE INDEX idx_todos_status ON todos(status);

-- Agent assignment queries
CREATE INDEX idx_todos_assigned_agent ON todos(assigned_agent);

-- Priority filtering
CREATE INDEX idx_todos_priority ON todos(priority);

-- Timestamp range queries
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_updated_at ON todos(updated_at DESC);

-- Composite indexes for common filters
CREATE INDEX idx_todos_status_priority ON todos(status, priority);
CREATE INDEX idx_todos_assigned_status ON todos(assigned_agent, status);
```

## Example Rows

### Row 1: Failed Task
```json
{
  "id": "804100fb-3c6c-40e3-b562-daac6d777ced",
  "title": "Dismiss resolved anomalies from connection_quality_events using dismiss_resolved_anomalies_batch()",
  "status": "failed",
  "priority": "high",
  "assigned_agent": "ruflo-high-804100",
  "description": "",
  "retry_count": 0,
  "is_boss": false,
  "deadline": null,
  "metadata": {},
  "comments": [],
  "created_at": "2026-04-13T22:59:08.537494+00:00",
  "updated_at": "2026-04-13T23:04:13.66725+00:00"
}
```

### Row 2: Completed Task
```json
{
  "id": "6be7726d-fed3-4261-bd0f-f89242f7e96c",
  "title": "Introduce a Next.js parallel route slot (@modal) for task detail overlays so navigating to a task preserves and streams the dashboard layout without a full page remount",
  "status": "completed",
  "priority": "medium",
  "assigned_agent": "ruflo-medium-6be772",
  "description": "",
  "retry_count": 0,
  "is_boss": false,
  "deadline": null,
  "metadata": {},
  "comments": [],
  "created_at": "2026-04-13T21:00:57.269945+00:00",
  "updated_at": "2026-04-13T21:01:19.699525+00:00"
}
```

### Row 3: In Progress Task
```json
{
  "id": "3de5d98f-8592-4cac-b058-387034bae842",
  "title": "Send follow-up emails",
  "status": "in_progress",
  "priority": "medium",
  "assigned_agent": null,
  "description": "",
  "retry_count": 0,
  "is_boss": false,
  "deadline": null,
  "metadata": {},
  "comments": [],
  "created_at": "2026-04-12T21:35:48.069187+00:00",
  "updated_at": "2026-04-12T22:09:10.530412+00:00"
}
```

## Common Queries via agent_exec_sql()

### Get Schema
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position
```

### Get Pending Tasks
```sql
SELECT id, title, priority, assigned_agent
FROM todos
WHERE status = 'pending'
ORDER BY priority DESC, created_at
```

### Get Agent Workload
```sql
SELECT 
  assigned_agent,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
FROM todos
WHERE assigned_agent IS NOT NULL
GROUP BY assigned_agent
ORDER BY total_tasks DESC
```

### Get Tasks by Status and Priority
```sql
SELECT 
  status,
  priority,
  COUNT(*) as count
FROM todos
GROUP BY status, priority
ORDER BY status, priority
```

### Get High-Priority Critical Tasks
```sql
SELECT 
  id,
  title,
  status,
  assigned_agent,
  deadline
FROM todos
WHERE priority = 'critical'
  AND status IN ('pending', 'in_progress')
ORDER BY deadline ASC NULLS LAST
```

### Update Task Status
```sql
UPDATE todos
SET status = 'completed', updated_at = now()
WHERE id = '804100fb-3c6c-40e3-b562-daac6d777ced'
```

## Data Type Reference

| Type | Description | Example |
|------|-------------|---------|
| `uuid` | Universally Unique Identifier | `804100fb-3c6c-40e3-b562-daac6d777ced` |
| `text` | Variable-length text | `"Complete project report"` |
| `integer` | 32-bit signed integer | `5`, `42` |
| `boolean` | True or False | `true`, `false` |
| `timestamp with time zone` | Date and time with timezone | `2026-04-13T23:45:00Z` |
| `jsonb` | JSON Binary format | `{"key": "value"}`, `[]` |

## Constraints and Validation

### Status Constraint
- Must be one of: `pending`, `in_progress`, `completed`, `failed`
- No NULL values allowed
- Default: `pending`

### Priority Constraint
- Must be one of: `low`, `medium`, `high`, `critical`
- No NULL values allowed
- Default: `medium`

### Timestamps
- Always use ISO 8601 format with timezone
- `created_at` is immutable (set at creation)
- `updated_at` should be updated on every change
- Both default to current time via `now()`

### JSONB Fields
- Must be valid JSON
- Empty defaults: `{}` for metadata, `[]` for comments
- NULL is allowed for both

## Performance Considerations

1. **Large Text Fields:** `title` and `description` use TEXT type (unlimited length). For large documents, consider VARCHAR with length limit.

2. **JSONB Indexing:** If frequently querying metadata, create a GIN index:
   ```sql
   CREATE INDEX idx_todos_metadata_gin ON todos USING GIN (metadata);
   ```

3. **Timestamp Queries:** Ensure `created_at` and `updated_at` have indexes if frequently filtered or sorted.

4. **Assigned Agent Queries:** High-cardinality field, index recommended for agent-specific filters.

## Migration History

- **Created:** Schema established with core columns
- **Recent Additions:** `is_boss`, `retry_count`, metadata and comments support
- **Indexes:** Recommended but not yet implemented

## Related Tables

- `task_history` - Tracks historical task records and audit logs
- `tasks_search_index` - Full-text search index for todos
- `task_throughput_events` - Performance metrics
- `connection_quality_events` - Connection/communication quality logs

---

**Last Updated:** 2026-04-13
**Retrieval Method:** `agent_exec_sql()` RPC function
**Total Records:** 42
