-- Export: Todos Table Complete Schema and Sample Rows
-- Generated: 2026-04-13
-- Purpose: Export todos table structure and sample data (LIMIT 10)

-- ============================================================================
-- TODOS TABLE SCHEMA
-- ============================================================================

-- Table: public.todos
-- Description: Task management table for the dashboard
-- Columns: 13 total

CREATE TABLE IF NOT EXISTS public.todos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  assigned_agent text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text DEFAULT ''::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  comments jsonb DEFAULT '[]'::jsonb,
  retry_count integer DEFAULT 0,
  is_boss boolean DEFAULT false,
  deadline timestamp with time zone
);

-- ============================================================================
-- SCHEMA DETAILS
-- ============================================================================

-- Column: id
--   Data Type: uuid
--   Nullable: NO
--   Default: gen_random_uuid()
--   Description: Unique identifier for each todo

-- Column: title
--   Data Type: text
--   Nullable: NO
--   Default: (none)
--   Description: Title or subject of the todo task

-- Column: status
--   Data Type: text
--   Nullable: NO
--   Default: 'pending'::text
--   Description: Current status of the task (pending, in_progress, completed, failed, etc.)

-- Column: priority
--   Data Type: text
--   Nullable: NO
--   Default: 'medium'::text
--   Description: Priority level (low, medium, high, critical)

-- Column: assigned_agent
--   Data Type: text
--   Nullable: YES
--   Default: (none)
--   Description: Name/ID of the agent assigned to this task

-- Column: updated_at
--   Data Type: timestamp with time zone
--   Nullable: NO
--   Default: now()
--   Description: Timestamp of last update

-- Column: created_at
--   Data Type: timestamp with time zone
--   Nullable: NO
--   Default: now()
--   Description: Timestamp of creation

-- Column: description
--   Data Type: text
--   Nullable: YES
--   Default: ''::text
--   Description: Detailed description of the task

-- Column: metadata
--   Data Type: jsonb
--   Nullable: YES
--   Default: '{}'::jsonb
--   Description: Additional metadata stored as JSON

-- Column: comments
--   Data Type: jsonb
--   Nullable: YES
--   Default: '[]'::jsonb
--   Description: Array of comments stored as JSON

-- Column: retry_count
--   Data Type: integer
--   Nullable: YES
--   Default: 0
--   Description: Number of retry attempts

-- Column: is_boss
--   Data Type: boolean
--   Nullable: YES
--   Default: false
--   Description: Whether this task requires boss/admin approval

-- Column: deadline
--   Data Type: timestamp with time zone
--   Nullable: YES
--   Default: (none)
--   Description: Task deadline timestamp

-- ============================================================================
-- SAMPLE DATA (LIMIT 10)
-- ============================================================================

-- Total rows in todos table (as of export): Query with COUNT(*) to see current count
-- Sample query used: SELECT * FROM todos LIMIT 10

-- Row 1:
-- {
--   "id": "804100fb-3c6c-40e3-b562-daac6d777ced",
--   "title": "Dismiss resolved anomalies from connection_quality_events using dismiss_resolved_anomalies_batch()",
--   "status": "failed",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "high",
--   "created_at": "2026-04-13T22:59:08.537494+00:00",
--   "updated_at": "2026-04-13T23:04:13.66725+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-high-804100"
-- }

-- Row 2:
-- {
--   "id": "6be7726d-fed3-4261-bd0f-f89242f7e96c",
--   "title": "Introduce a Next.js parallel route slot (@modal) for task detail overlays so navigating to a task preserves and streams the dashboard layout without a full page remount",
--   "status": "completed",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "medium",
--   "created_at": "2026-04-13T21:00:57.269945+00:00",
--   "updated_at": "2026-04-13T21:01:19.699525+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-medium-6be772"
-- }

-- Row 3:
-- {
--   "id": "f26f275d-9d83-4d51-ad5a-bdd601074646",
--   "title": "Implement a Supabase database function get_agent_workload() that returns per-agent task counts grouped by status and priority, enabling a live workload-balancing heatmap in the dashboard",
--   "status": "completed",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "high",
--   "created_at": "2026-04-13T21:00:57.160634+00:00",
--   "updated_at": "2026-04-13T21:01:19.843008+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-high-f26f27"
-- }

-- Row 4:
-- {
--   "id": "3de5d98f-8592-4cac-b058-387034bae842",
--   "title": "Send follow-up emails",
--   "status": "in_progress",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "medium",
--   "created_at": "2026-04-12T21:35:48.069187+00:00",
--   "updated_at": "2026-04-12T22:09:10.530412+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": null
-- }

-- Row 5:
-- {
--   "id": "97af8f70-36f2-4ab2-9ef0-c5e295d93cee",
--   "title": "Generate weekly digest",
--   "status": "in_progress",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "low",
--   "created_at": "2026-04-12T21:35:48.069187+00:00",
--   "updated_at": "2026-04-12T22:09:13.648292+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": null
-- }

-- Row 6:
-- {
--   "id": "746f8bd0-3146-4cfa-a281-465ed2cf235e",
--   "title": "Create RLS policies for agent write access to assigned tasks",
--   "status": "completed",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "high",
--   "created_at": "2026-04-13T21:00:58.990684+00:00",
--   "updated_at": "2026-04-13T21:01:26.105172+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-high-746f8b"
-- }

-- Row 7:
-- {
--   "id": "9af3d129-72dc-49c5-9133-c3d0ec4f9d83",
--   "title": "Add Row Level Security (RLS) policies on the tasks table to scope agent reads/writes to only their assigned tasks, with a service-role bypass for the orchestrator",
--   "status": "in_progress",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "critical",
--   "created_at": "2026-04-13T21:00:57.107519+00:00",
--   "updated_at": "2026-04-13T21:00:58.880985+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-orchestrator"
-- }

-- Row 8:
-- {
--   "id": "d3084d65-a135-4f0e-8234-e376f0fbe9c2",
--   "title": "Implement service-role bypass for orchestrator",
--   "status": "completed",
--   "is_boss": false,
--   "comments": [],
--   "deadline": null,
--   "metadata": {},
--   "priority": "high",
--   "created_at": "2026-04-13T21:00:59.044096+00:00",
--   "updated_at": "2026-04-13T21:01:26.386133+00:00",
--   "description": "",
--   "retry_count": 0,
--   "assigned_agent": "ruflo-high-d3084d"
-- }

-- ============================================================================
-- TABLE STATISTICS
-- ============================================================================

-- To get table statistics, run:
-- SELECT 
--   COUNT(*) as total_rows,
--   COUNT(DISTINCT status) as status_types,
--   COUNT(DISTINCT priority) as priority_types,
--   COUNT(DISTINCT assigned_agent) as assigned_agents
-- FROM todos;
