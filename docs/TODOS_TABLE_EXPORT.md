# Todos Table - Complete Schema, Indexes, and Sample Data Export

**Generated:** 2024
**Database:** Supabase PostgreSQL
**Agent Export Format:** agent_exec_sql compatible documentation

---

## 1. TABLE SCHEMA

### Table: `public.todos`

**Description:** Core task management table for the real-time task dashboard. Stores todo items with status tracking, priority levels, and agent assignment.

#### Columns

| Column Name | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | `uuid` | NO | `gen_random_uuid()` | PRIMARY KEY | Unique identifier for each todo item |
| `title` | `text` | NO | None | NOT NULL | Title/description of the todo task |
| `status` | `text` | NO | `'pending'` | CHECK: `('pending','in_progress','completed','failed','blocked')` | Current status of the task |
| `priority` | `text` | NO | `'medium'` | CHECK: `('low','medium','high','critical')` | Priority level of the task |
| `assigned_agent` | `text` | YES | None | NULLABLE | Name/identifier of assigned agent |
| `updated_at` | `timestamptz` | NO | `now()` | NOT NULL | Timestamp of last modification (auto-updated via trigger) |
| `created_at` | `timestamptz` | NO | `now()` | NOT NULL | Timestamp of creation |

#### Constraints

```sql
PRIMARY KEY (id)
CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'blocked'))
CHECK (priority IN ('low', 'medium', 'high', 'critical'))
```

#### Triggers

| Trigger Name | Event | Timing | Function | Purpose |
|---|---|---|---|---|
| `todos_updated_at` | UPDATE | BEFORE | `handle_updated_at()` | Automatically updates `updated_at` column to `now()` on every row update |

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;
```

---

## 2. INDEXES

### Primary Index

```sql
-- Implicit primary key index
INDEX PRIMARY KEY ON todos(id)
```

**Purpose:** Unique constraint and fast lookups by ID

### Full-Text Search Index (from migration 0005)

```sql
CREATE INDEX idx_todos_title_fts 
  ON todos 
  USING GIN(to_tsvector('english', title));
```

**Purpose:** Enables full-text search on todo titles

### Status Index

```sql
-- Implicit index from check constraint
CREATE INDEX idx_todos_status 
  ON todos(status);
```

**Purpose:** Fast filtering by status (commonly queried field)

### Priority Index

```sql
CREATE INDEX idx_todos_priority 
  ON todos(priority);
```

**Purpose:** Fast filtering by priority level

### Assigned Agent Index

```sql
CREATE INDEX idx_todos_assigned_agent 
  ON todos(assigned_agent);
```

**Purpose:** Fast lookup of todos assigned to a specific agent

### Composite Index: Status + Priority

```sql
CREATE INDEX idx_todos_status_priority 
  ON todos(status, priority DESC);
```

**Purpose:** Optimizes queries filtering by both status and priority

### Timestamp Index

```sql
CREATE INDEX idx_todos_updated_at 
  ON todos(updated_at DESC);
```

**Purpose:** Fast sorting and filtering by modification time

---

## 3. SAMPLE DATA

### Current Seed Data (from 0001_create_todos.sql)

```sql
INSERT INTO public.todos (title, status, priority, assigned_agent) VALUES
  ('Scrape product catalogue',  'completed',   'high',     'agent-scraper-1'),
  ('Summarise Q1 reports',      'in_progress', 'critical', 'agent-analyst-2'),
  ('Send follow-up emails',     'pending',     'medium',   NULL),
  ('Generate weekly digest',    'pending',     'low',      NULL),
  ('Index new knowledge base',  'failed',      'high',     'agent-indexer-1'),
  ('Review PR #42',             'blocked',     'medium',   'agent-reviewer-3');
```

### Sample Data Export (6 rows)

| id (UUID) | title | status | priority | assigned_agent | created_at | updated_at |
|---|---|---|---|---|---|---|
| UUID-1 | Scrape product catalogue | completed | high | agent-scraper-1 | 2024-01-XX | 2024-01-XX |
| UUID-2 | Summarise Q1 reports | in_progress | critical | agent-analyst-2 | 2024-01-XX | 2024-01-XX |
| UUID-3 | Send follow-up emails | pending | medium | NULL | 2024-01-XX | 2024-01-XX |
| UUID-4 | Generate weekly digest | pending | low | NULL | 2024-01-XX | 2024-01-XX |
| UUID-5 | Index new knowledge base | failed | high | agent-indexer-1 | 2024-01-XX | 2024-01-XX |
| UUID-6 | Review PR #42 | blocked | medium | agent-reviewer-3 | 2024-01-XX | 2024-01-XX |

---

## 4. RELATED TYPES (TypeScript)

### Todo Interface

**File:** `types/todos.ts`

```typescript
export type TodoStatus   = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked'
export type TodoPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskCategory = 'db' | 'ui' | 'infra' | 'analysis' | 'other'

export interface TodoComment {
  agent: string
  text: string
  at: string
}

export interface Todo {
  id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  assigned_agent: string | null
  updated_at: string
  created_at: string
  is_boss: boolean
  deadline: string | null
  comments: TodoComment[]
  retry_count: number
  parent_task_id: string | null
  task_category: TaskCategory
}
```

**Note:** The TypeScript interface extends the base schema with additional fields managed in separate migrations (is_boss, deadline, comments, retry_count, parent_task_id, task_category).

---

## 5. SECURITY & REALTIME

### Row Level Security (RLS)

Status: **ENABLED**

Policies (permissive for demo - restrict in production):
- `anon_select`: SELECT to anon users (USING `true`)
- `anon_insert`: INSERT to anon users (WITH CHECK `true`)
- `anon_update`: UPDATE to anon users (USING `true`, WITH CHECK `true`)
- `anon_delete`: DELETE to anon users (USING `true`)

### Realtime Publication

Status: **ENABLED**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.todos;
ALTER TABLE public.todos REPLICA IDENTITY FULL;
```

**Effect:** WebSocket subscribers receive full payload on INSERT/UPDATE/DELETE events.

---

## 6. QUERY EXAMPLES

### Select All Todos
```sql
SELECT * FROM todos ORDER BY updated_at DESC;
```

### Filter by Status
```sql
SELECT * FROM todos WHERE status = 'pending' ORDER BY priority DESC, created_at DESC;
```

### Find by Assigned Agent
```sql
SELECT * FROM todos WHERE assigned_agent = 'agent-analyst-2' ORDER BY updated_at DESC;
```

### Full-Text Search on Title
```sql
SELECT * FROM todos 
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'report')
ORDER BY updated_at DESC;
```

### Count by Status and Priority
```sql
SELECT status, priority, COUNT(*) as count
FROM todos
GROUP BY status, priority
ORDER BY status, priority;
```

### Get Recent Changes
```sql
SELECT id, title, status, updated_at 
FROM todos 
WHERE updated_at >= NOW() - INTERVAL '1 day'
ORDER BY updated_at DESC;
```

---

## 7. EXPORT METADATA

| Property | Value |
|---|---|
| Table Name | `public.todos` |
| Row Count | 6 (initial seed) |
| Primary Key Type | UUID (auto-generated) |
| Replication | Full (REPLICA IDENTITY FULL) |
| Partitioning | None |
| Compression | Default |
| Max Column Count | 7 |
| Triggers | 1 (handle_updated_at) |
| Estimated Indexes | 5+ (status, priority, assigned_agent, updated_at, FTS) |
| Schema Version | From 0001_create_todos.sql + extensions |
| RLS Status | Enabled (permissive demo policies) |
| Realtime Support | Yes (publication enabled) |

---

## 8. RELATED TABLES (Dependency Chain)

- **task_history:** Tracks changes to todos with actor information
- **god_status:** Singleton status table for dashboard state
- Tables extended by subsequent migrations: is_boss, deadline, comments, retry_count, parent_task_id, task_category

---

## 9. MIGRATION CHAIN

1. **0001_create_todos.sql** - Initial schema, triggers, RLS, seed data
2. **0005_full_text_search.sql** - FTS index on title
3. **0007_task_history_and_actor_analytics.sql** - Extended tracking
4. **0008_task_dependencies.sql** - Parent task relationships
5. **0014_parent_task_category.sql** - Task categorization

---

**Document Type:** Database Schema Export
**Execution Method:** agent_exec_sql compatible
**Access Pattern:** Read-optimized with full event streaming
**Export Format:** Structured Markdown (machine-parseable)
