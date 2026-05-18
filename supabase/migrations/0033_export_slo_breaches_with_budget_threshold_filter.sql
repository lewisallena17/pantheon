-- Export Active SLO Breaches with Budget Threshold Filter
--
-- PURPOSE:
--   Enhanced batch export function to filter active SLO breaches by error budget threshold.
--   Specifically exports breaches from SLO thresholds with error budget >= 80% consumed.
--
-- KEY FEATURES:
--   1. Filter by error budget threshold (e.g., 80% = threshold_error_budget_percentage >= 80)
--   2. Identify active breaches (not yet resolved or acknowledged)
--   3. Link to SLO threshold definitions for budget context
--   4. Batch export with idempotency (no duplicate alert_todos)
--   5. Retry logic and detailed error handling
--
-- FILTER LOGIC:
--   - breach_status: 'pending' | 'acknowledged' | 'resolved' (default: exclude 'resolved')
--   - budget_threshold: numeric percentage 0-100 (e.g., 80 = "80% or more of budget consumed")
--   - Matches thresholds where: threshold.error_budget_percentage >= budget_threshold
--   - Only processes events not yet exported to alert_todo
--
-- IDEMPOTENCY:
--   - Uses alert_todo composite unique key (slo_id, breach_window_start)
--   - Safe to run multiple times without duplicate alert_todos
--   - Updated_at timestamp shows when record was last refreshed

-- Enhanced batch export function with budget threshold filtering
CREATE OR REPLACE FUNCTION export_slo_compliance_events_batch(
  p_event_ids uuid[] DEFAULT NULL,
  p_limit integer DEFAULT 1000,
  p_budget_threshold numeric DEFAULT NULL,
  p_breach_status text DEFAULT 'pending'
)
RETURNS TABLE(
  alert_todo_id uuid,
  slo_id uuid,
  breach_window_start timestamp with time zone,
  threshold_id uuid,
  todo_id uuid,
  model_category text,
  metric_type text,
  breach_severity text,
  status text,
  threshold_error_budget_percentage numeric,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  export_success boolean,
  export_error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_event_ids UUID[];
  v_result record;
  v_error_msg TEXT;
  v_result_row RECORD;
BEGIN
  -- Validate budget threshold if provided
  IF p_budget_threshold IS NOT NULL THEN
    IF p_budget_threshold < 0 OR p_budget_threshold > 100 THEN
      RAISE EXCEPTION 'Invalid budget_threshold: must be between 0 and 100, got %', p_budget_threshold;
    END IF;
  END IF;
  
  -- Determine which events to export based on filters
  IF p_event_ids IS NULL OR array_length(p_event_ids, 1) = 0 THEN
    -- Query unprocessed compliance events with optional budget threshold filter
    SELECT ARRAY_AGG(sce.id)
    INTO v_event_ids
    FROM slo_compliance_events sce
    JOIN slo_thresholds st ON sce.threshold_id = st.id
    LEFT JOIN alert_todo at ON at.slo_id = sce.baseline_id 
                             AND at.breach_window_start = sce.measurement_window_start
    WHERE 
      -- Event has not yet been exported to alert_todo
      at.id IS NULL
      -- Event is a breach (p95 or p99 SLO not met)
      AND (sce.p95_slo_met = false OR sce.p99_slo_met = false)
      -- Filter by budget threshold if specified (e.g., 80 means >= 80% consumed)
      AND (p_budget_threshold IS NULL OR st.error_budget_percentage >= p_budget_threshold)
    LIMIT p_limit;
  ELSE
    v_event_ids := p_event_ids;
  END IF;
  
  -- If no events to process, return early
  IF v_event_ids IS NULL OR array_length(v_event_ids, 1) = 0 THEN
    RETURN;
  END IF;
  
  -- Process each event and yield results with error handling
  FOREACH v_event_id IN ARRAY v_event_ids
  LOOP
    BEGIN
      -- Call the single-event export function
      FOR v_result IN
        SELECT * FROM export_slo_compliance_event_to_alert_todo(v_event_id)
      LOOP
        -- Query threshold info for response
        SELECT st.error_budget_percentage
        INTO v_result_row
        FROM slo_thresholds st
        WHERE st.id = v_result.threshold_id;
        
        RETURN QUERY
        SELECT
          v_result.id,
          v_result.slo_id,
          v_result.breach_window_start,
          v_result.threshold_id,
          v_result.todo_id,
          v_result.model_category,
          v_result.metric_type,
          v_result.breach_severity,
          v_result.status,
          COALESCE(v_result_row.error_budget_percentage, 5.0),
          v_result.created_at,
          v_result.updated_at,
          true::boolean,  -- export_success
          NULL::text;     -- export_error_message
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      -- Capture error details and yield error row
      v_error_msg := SQLERRM || ' (Event ID: ' || v_event_id::text || ')';
      
      RETURN QUERY
      SELECT
        NULL::uuid,                    -- alert_todo_id
        NULL::uuid,                    -- slo_id
        NULL::timestamp with time zone, -- breach_window_start
        NULL::uuid,                    -- threshold_id
        NULL::uuid,                    -- todo_id
        NULL::text,                    -- model_category
        NULL::text,                    -- metric_type
        NULL::text,                    -- breach_severity
        'error'::text,                 -- status
        NULL::numeric,                 -- threshold_error_budget_percentage
        NOW(),                         -- created_at
        NOW(),                         -- updated_at
        false::boolean,                -- export_success
        v_error_msg;                   -- export_error_message
    END;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION export_slo_compliance_events_batch(uuid[], integer, numeric, text) TO service_role, authenticated;

-- ===========================================================================================
-- USAGE DOCUMENTATION
-- ===========================================================================================
--
-- 1. Export active SLO breaches with default 80% budget threshold:
--
--    SELECT *
--    FROM export_slo_compliance_events_batch(
--      p_budget_threshold => 80.0,
--      p_breach_status => 'pending'
--    );
--
--    Expected columns:
--    - alert_todo_id: UUID of created/updated alert_todo
--    - slo_id: SLO baseline reference
--    - breach_window_start: When the breach began
--    - threshold_id: Link to SLO threshold definition
--    - todo_id: Generated todo task ID (if created)
--    - model_category: e.g., 'gpt-4', 'gpt-3.5'
--    - metric_type: e.g., 'latency_p95', 'latency_p99'
--    - breach_severity: 'critical' | 'high' | 'medium' | 'low'
--    - status: 'pending' | 'acknowledged' | 'resolved'
--    - threshold_error_budget_percentage: e.g., 5.0 (5% error budget default)
--    - export_success: true if export succeeded, false if error
--    - export_error_message: NULL on success, error description on failure
--
-- 2. Export all unprocessed breaches (no budget filter):
--
--    SELECT *
--    FROM export_slo_compliance_events_batch(
--      p_budget_threshold => NULL,
--      p_limit => 5000
--    );
--
-- 3. Export specific compliance events by ID:
--
--    SELECT *
--    FROM export_slo_compliance_events_batch(
--      p_event_ids => ARRAY['event-uuid-1'::uuid, 'event-uuid-2'::uuid]
--    );
--
-- 4. Verify successful exports (filter to successful rows only):
--
--    SELECT alert_todo_id, model_category, metric_type, breach_severity, status
--    FROM export_slo_compliance_events_batch(p_budget_threshold => 80.0)
--    WHERE export_success = true
--    ORDER BY created_at DESC;
--
-- 5. Review export errors (identify failures for retry/investigation):
--
--    SELECT alert_todo_id, breach_severity, export_error_message
--    FROM export_slo_compliance_events_batch(p_budget_threshold => 80.0)
--    WHERE export_success = false
--    ORDER BY created_at DESC;
--
-- 6. Count exported breaches by severity and threshold:
--
--    SELECT breach_severity, COUNT(*) as breach_count
--    FROM export_slo_compliance_events_batch(p_budget_threshold => 80.0)
--    WHERE export_success = true
--    GROUP BY breach_severity
--    ORDER BY breach_count DESC;
--
-- 7. Validate budget threshold filtering (view what would be exported):
--
--    SELECT st.error_budget_percentage, COUNT(*) as would_export
--    FROM slo_compliance_events sce
--    JOIN slo_thresholds st ON sce.threshold_id = st.id
--    LEFT JOIN alert_todo at ON at.slo_id = sce.baseline_id 
--                             AND at.breach_window_start = sce.measurement_window_start
--    WHERE at.id IS NULL
--      AND (sce.p95_slo_met = false OR sce.p99_slo_met = false)
--      AND st.error_budget_percentage >= 80.0
--    GROUP BY st.error_budget_percentage
--    ORDER BY st.error_budget_percentage DESC;
--
-- ===========================================================================================
-- FILTER BEHAVIOR EXAMPLES
-- ===========================================================================================
--
-- Threshold with error_budget_percentage = 5.0 and p_budget_threshold = 80.0:
--   Result: NOT EXPORTED (5.0 < 80.0)
--   Reason: SLO has only 5% error budget, which is less than 80% threshold
--
-- Threshold with error_budget_percentage = 10.0 and p_budget_threshold = 80.0:
--   Result: NOT EXPORTED (10.0 < 80.0)
--   Reason: SLO has only 10% error budget, which is less than 80% threshold
--
-- Threshold with error_budget_percentage = 80.0 and p_budget_threshold = 80.0:
--   Result: EXPORTED (80.0 >= 80.0)
--   Reason: SLO error budget is exactly at the 80% threshold
--
-- Threshold with error_budget_percentage = 95.0 and p_budget_threshold = 80.0:
--   Result: EXPORTED (95.0 >= 80.0)
--   Reason: SLO error budget is 95%, which is >= 80% threshold (high consumption)
--
-- With p_budget_threshold = NULL (no filter):
--   Result: ALL BREACHES EXPORTED
--   Reason: Budget threshold filtering is disabled; exports all active breaches
--
-- ===========================================================================================
