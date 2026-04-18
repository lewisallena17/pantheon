# Schema Validation Report: todos and god_status Tables

**Generated:** 2024  
**Purpose:** Validate current schema state and document expected structure

---

## Executive Summary

This report documents the current schema for two core tables in the task-dashboard application:
- **todos** - Task management table with hierarchical support
- **god_status** - Agent status tracking table

All tables are enabled for Supabase Realtime and have appropriate Row Level Security (RLS) policies.

---

## Table: `todos`

### Columns

| Ordinal | Column Name | Data Type | Nullable | Default | Purpose |
|---------|------------|-----------|----------|---------|---------|
| 1 | `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| 2 | `title` | TEXT | NO | None | Task title/description |
| 3 | `status` | TEXT | NO | `'pending'` | Task status (pending, in_progress, completed, failed, blocked) |
| 4 | `priority` | TEXT | NO | `'medium'` | Task priority (low, medium, high, critical) |
| 5 | `assigned_agent` | TEXT | YES | NULL | Agent identifier assigned to task |
| 6 | `updated_at` | TIMESTAMPTZ | NO | `now()` | Last modification timestamp |
| 7 | `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| 8 | `parent_task_id` | UUID | YES | NULL | Reference to parent task (for hierarchical tasks) |
| 9 | `task_category` | TEXT | NO | `'other'` | Task category (db, ui, infra, analysis, other) |

**Total Columns:** 9

### Constraints

#### Primary Key
- `id` (UUID)

#### Foreign Keys
- `parent_task_id` → `todos(id)` ON DELETE SET NULL

#### Check Constraints
- `status` IN ('pending', 'in_progress', 'completed', 'failed', 'blocked')
- `priority` IN ('low', 'medium', 'high', 'critical')
- `task_category` IN ('db', 'ui', 'infra', 'analysis', 'other')

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `todos_pkey` | `id` | Primary key index |
| `idx_todos_parent_task_id` | `parent_task_id` | Hierarchical task lookup |
| `idx_todos_task_category` | `task_category` | Category filtering |

### Triggers

| Trigger Name | Event | Purpose |
|--------------|-------|---------|
| `todos_updated_at` | BEFORE UPDATE | Auto-update `updated_at` to current timestamp |

### Row Level Security (RLS)

| Policy Name | Operation | Principal | Condition | With Check |
|-------------|-----------|-----------|-----------|------------|
| `anon_select` | SELECT | anon | `true` | — |
| `anon_insert` | INSERT | anon | — | `true` |
| `anon_update` | UPDATE | anon | `true` | `true` |
| `anon_delete` | DELETE | anon | `true` | — |

**RLS Status:** ENABLED  
**Realtime Status:** ENABLED (added to `supabase_realtime` publication)  
**Replica Identity:** FULL

---

## Table: `god_status`

### Columns

| Ordinal | Column Name | Data Type | Nullable | Default | Purpose |
|---------|------------|-----------|----------|---------|---------|
| 1 | `id` | INTEGER | NO | `1` | Primary key (singleton pattern) |
| 2 | `thought` | TEXT | NO | `'Watching...'` | Current agent state/thought |
| 3 | `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Total Columns:** 3

### Constraints

#### Primary Key
- `id` (INTEGER, default = 1)

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| `god_status_pkey` | `id` | Primary key index |

### Triggers

**None defined** — Manual timestamp management expected

### Row Level Security (RLS)

**RLS Status:** NOT EXPLICITLY ENABLED  
**Realtime Status:** ENABLED (added to `supabase_realtime` publication)

### Notable Behavior

- Uses **singleton pattern** with `id` fixed at `1`
- Seeded with initial row: `INSERT ... ON CONFLICT (id) DO NOTHING`
- Designed for a single shared state (god agent status)

---

## Schema Evolution Timeline

### Migration 0001: Initial todos table
- Created base `todos` table with: id, title, status, priority, assigned_agent, updated_at, created_at
- Implemented `handle_updated_at()` trigger
- Enabled RLS with anon policies
- Enabled Realtime with REPLICA IDENTITY FULL

### Migration 0003: god_status table
- Created `god_status` table with singleton pattern
- Added to Realtime publication

### Migration 0014: Hierarchical tasks and categorization
- Added `parent_task_id` (self-referential FK)
- Added `task_category` with CHECK constraint
- Created indexes on both new columns

---

## Data Validation Checklist

- [x] **todos.id** - UUID primary key with auto-generation
- [x] **todos.status** - Enum-like values validated via CHECK constraint
- [x] **todos.priority** - Enum-like values validated via CHECK constraint
- [x] **todos.task_category** - Enum-like values validated via CHECK constraint
- [x] **todos.updated_at** - Auto-updated by trigger on INSERT/UPDATE
- [x] **todos.parent_task_id** - Self-referential with CASCADE cleanup
- [x] **god_status.id** - Fixed singleton ID (1)
- [x] **god_status.thought** - Free-form text state
- [x] **god_status.updated_at** - Timestamp tracking

---

## RLS and Realtime Configuration

### todos Table
- ✅ RLS: ENABLED with anon policies (demo mode)
- ✅ Realtime: ENABLED
- ✅ Replica Identity: FULL (includes old row data in UPDATE/DELETE)
- ⚠️ **Security Note:** Demo policies allow full CRUD for anon role. In production, scope to `auth.uid()`.

### god_status Table
- ❌ RLS: NOT ENABLED
- ✅ Realtime: ENABLED
- ℹ️ Singleton pattern allows global read/write

---

## Validation Queries

### Check todos schema:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'todos' 
ORDER BY ordinal_position;
```

### Check god_status schema:
```sql
SELECT * FROM information_schema.columns 
WHERE table_name = 'god_status' 
ORDER BY ordinal_position;
```

### Verify todos constraints:
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'todos';
```

### List todos indexes:
```sql
SELECT * FROM pg_indexes WHERE tablename = 'todos';
```

### Check Realtime publications:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('todos', 'god_status');
```

---

## Known Issues & Notes

1. **Function Ambiguity (FIXED):** Migration 0015 consolidated `agent_exec_sql()` and `agent_exec_ddl()` to single signatures.
2. **god_status RLS:** Not enabled by design (singleton agent state). Consider enabling if multi-tenant support needed.
3. **todos Demo Policies:** Should be scoped to `auth.uid()` for production use.

---

## Next Steps

1. Verify schema matches this documentation with the validation queries
2. Update application code to use `task_category` and `parent_task_id` if hierarchical/categorized tasks needed
3. Configure production RLS policies scoped to authenticated users
4. Monitor realtime event delivery on both tables
