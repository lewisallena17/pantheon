-- ============================================================================
-- TASK CONFIDENCE ANALYSIS: Cross-Reference todos vs god_status
-- ============================================================================
-- Purpose: Query todos LIMIT 10 and cross-reference against god_status 
--          success rates to classify current inventory by category confidence,
--          then surface the highest-confidence task for execution.
--
-- Output: Ranked task list with confidence scores and single recommendation
-- ============================================================================

-- ============================================================================
-- PART 1: FULL INVENTORY ANALYSIS (ALL TODOS LIMIT 10, RANKED BY CONFIDENCE)
-- ============================================================================

WITH todos_limited AS (
  -- Get the 10 most recent todos with status scoring
  SELECT 
    id,
    title,
    status,
    priority,
    task_category,
    updated_at,
    CASE 
      WHEN status = 'completed' THEN 4
      WHEN status = 'in_progress' THEN 3
      WHEN status = 'pending' THEN 2
      WHEN status = 'blocked' THEN 1
      WHEN status = 'failed' THEN 0
      ELSE 1
    END as status_score
  FROM public.todos
  ORDER BY updated_at DESC
  LIMIT 10
),
category_stats AS (
  -- Extract category success rates from god_status.meta.categoryStats
  -- We union all 5 categories for complete coverage
  SELECT 
    'db'::text as category,
    COALESCE((god_status.meta -> 'categoryStats' -> 'db' ->> 'succeeded')::int, 0) as succeeded,
    COALESCE((god_status.meta -> 'categoryStats' -> 'db' ->> 'failed')::int, 0) as failed
  FROM public.god_status
  UNION ALL
  SELECT 
    'ui'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'ui' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'ui' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'infra'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'infra' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'infra' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'other'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'other' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'other' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'analysis'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'analysis' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'analysis' ->> 'failed')::int, 0)
  FROM public.god_status
),
category_confidence AS (
  -- Calculate success rate (confidence) per category
  -- For untested categories (0 total attempts), assign 0.5 (neutral)
  SELECT 
    category,
    succeeded,
    failed,
    succeeded + failed as total,
    CASE 
      WHEN succeeded + failed = 0 THEN 0.5  -- neutral confidence for untested
      ELSE ROUND((100.0 * succeeded / (succeeded + failed))::numeric, 2)
    END as success_rate_pct
  FROM category_stats
)
-- Final result: todos with category confidence scores
SELECT 
  ROW_NUMBER() OVER (ORDER BY cc.success_rate_pct DESC, tl.status_score DESC) as rank,
  tl.id,
  tl.title,
  tl.status,
  tl.priority,
  tl.task_category,
  cc.success_rate_pct as category_confidence_pct,
  cc.succeeded as category_success_count,
  cc.failed as category_failure_count,
  cc.total as category_total_attempts,
  CASE 
    WHEN cc.success_rate_pct >= 90 THEN 'HIGH'
    WHEN cc.success_rate_pct >= 70 THEN 'MEDIUM'
    WHEN cc.success_rate_pct >= 50 THEN 'LOW'
    ELSE 'CRITICAL'
  END as confidence_level,
  tl.updated_at
FROM todos_limited tl
LEFT JOIN category_confidence cc ON tl.task_category = cc.category
ORDER BY rank ASC;

-- ============================================================================
-- PART 2: HIGHEST-CONFIDENCE TASK RECOMMENDATION
-- ============================================================================
-- Extract the single highest-confidence, executable task from the inventory
-- This is the primary recommendation for immediate execution

WITH todos_limited AS (
  SELECT 
    id,
    title,
    status,
    priority,
    task_category,
    updated_at,
    CASE 
      WHEN status = 'completed' THEN 4
      WHEN status = 'in_progress' THEN 3
      WHEN status = 'pending' THEN 2
      WHEN status = 'blocked' THEN 1
      WHEN status = 'failed' THEN 0
      ELSE 1
    END as status_score
  FROM public.todos
  ORDER BY updated_at DESC
  LIMIT 10
),
category_stats AS (
  SELECT 
    'db'::text as category,
    COALESCE((god_status.meta -> 'categoryStats' -> 'db' ->> 'succeeded')::int, 0) as succeeded,
    COALESCE((god_status.meta -> 'categoryStats' -> 'db' ->> 'failed')::int, 0) as failed
  FROM public.god_status
  UNION ALL
  SELECT 
    'ui'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'ui' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'ui' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'infra'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'infra' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'infra' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'other'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'other' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'other' ->> 'failed')::int, 0)
  FROM public.god_status
  UNION ALL
  SELECT 
    'analysis'::text,
    COALESCE((god_status.meta -> 'categoryStats' -> 'analysis' ->> 'succeeded')::int, 0),
    COALESCE((god_status.meta -> 'categoryStats' -> 'analysis' ->> 'failed')::int, 0)
  FROM public.god_status
),
category_confidence AS (
  SELECT 
    category,
    succeeded,
    failed,
    succeeded + failed as total,
    CASE 
      WHEN succeeded + failed = 0 THEN 0.5
      ELSE ROUND((100.0 * succeeded / (succeeded + failed))::numeric, 2)
    END as success_rate_pct
  FROM category_stats
),
ranked_todos AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY cc.success_rate_pct DESC, tl.status_score DESC) as rank,
    tl.id,
    tl.title,
    tl.status,
    tl.priority,
    tl.task_category,
    cc.success_rate_pct as category_confidence_pct,
    cc.succeeded as category_success_count,
    cc.total as category_total_attempts,
    CASE 
      WHEN cc.success_rate_pct >= 90 THEN 'HIGH'
      WHEN cc.success_rate_pct >= 70 THEN 'MEDIUM'
      WHEN cc.success_rate_pct >= 50 THEN 'LOW'
      ELSE 'CRITICAL'
    END as confidence_level,
    tl.updated_at
  FROM todos_limited tl
  LEFT JOIN category_confidence cc ON tl.task_category = cc.category
)
-- Get the HIGHEST-CONFIDENCE task (ready for execution)
SELECT 
  rank,
  id,
  title,
  status,
  priority,
  task_category,
  category_confidence_pct,
  category_success_count,
  category_total_attempts,
  confidence_level,
  updated_at,
  'READY FOR EXECUTION' as recommendation,
  'Highest confidence task from current inventory (LIMIT 10)' as notes
FROM ranked_todos
WHERE rank = 1;

-- ============================================================================
-- PART 3: CATEGORY SUCCESS RATE SUMMARY
-- ============================================================================
-- Show aggregated success metrics per category from god_status

SELECT 
  COALESCE(
    (god_status.meta -> 'categoryStats' ->> 'db'),
    '{}'
  )::jsonb as db_stats,
  COALESCE(
    (god_status.meta -> 'categoryStats' ->> 'ui'),
    '{}'
  )::jsonb as ui_stats,
  COALESCE(
    (god_status.meta -> 'categoryStats' ->> 'infra'),
    '{}'
  )::jsonb as infra_stats,
  COALESCE(
    (god_status.meta -> 'categoryStats' ->> 'other'),
    '{}'
  )::jsonb as other_stats,
  COALESCE(
    (god_status.meta -> 'categoryStats' ->> 'analysis'),
    '{}'
  )::jsonb as analysis_stats,
  god_status.updated_at,
  god_status.meta -> 'mood' as current_mood,
  god_status.meta -> 'confidence' as current_confidence
FROM public.god_status
LIMIT 1;

-- ============================================================================
-- PART 4: DATA FRESHNESS CHECK
-- ============================================================================
-- Verify that data is recent and analysis is based on current state

WITH data_timestamps AS (
  SELECT 
    'god_status' as table_name,
    MAX(updated_at) as last_updated
  FROM public.god_status
  UNION ALL
  SELECT 
    'todos' as table_name,
    MAX(updated_at) as last_updated
  FROM public.todos
)
SELECT 
  table_name,
  last_updated,
  EXTRACT(EPOCH FROM (NOW() - last_updated))::int as seconds_ago,
  CASE 
    WHEN EXTRACT(EPOCH FROM (NOW() - last_updated)) < 300 THEN 'FRESH (< 5 min)'
    WHEN EXTRACT(EPOCH FROM (NOW() - last_updated)) < 3600 THEN 'RECENT (< 1 hr)'
    ELSE 'STALE (> 1 hr)'
  END as freshness_status
FROM data_timestamps
ORDER BY table_name;
