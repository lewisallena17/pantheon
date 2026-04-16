-- Connection Quality Events Table Inspection
-- Purpose: Query table structure and row count via agent_exec_sql()
-- This script provides comprehensive inspection of the connection_quality_events table

-- ============================================================================
-- 1. ROW COUNT QUERY
-- ============================================================================
-- Get total number of rows in the table
SELECT COUNT(*) as row_count FROM connection_quality_events;


-- ============================================================================
-- 2. COLUMN INSPECTION QUERY
-- ============================================================================
-- Retrieve full schema information for all columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'connection_quality_events' 
ORDER BY ordinal_position;


-- ============================================================================
-- 3. TABLE STRUCTURE SUMMARY
-- ============================================================================
-- Get table size and basic statistics
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE tablename = 'connection_quality_events' 
  AND schemaname = 'public';


-- ============================================================================
-- 4. INDEXES AND CONSTRAINTS
-- ============================================================================
-- List all indexes on the table
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'connection_quality_events'
  AND schemaname = 'public';


-- ============================================================================
-- 5. COLUMN DATA TYPES AND CONSTRAINTS
-- ============================================================================
-- Detailed column metadata
SELECT 
  a.attname as column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
  a.attnotnull as is_not_null,
  a.atthasdef as has_default,
  d.adsrc as default_value,
  a.attnum as ordinal_position
FROM pg_catalog.pg_attribute a
LEFT JOIN pg_catalog.pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
WHERE a.attrelid = 'connection_quality_events'::regclass
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;


-- ============================================================================
-- 6. SAMPLE DATA (if any rows exist)
-- ============================================================================
-- Retrieve sample rows with all columns
SELECT * FROM connection_quality_events LIMIT 10;


-- ============================================================================
-- QUERY RESULTS SUMMARY
-- ============================================================================
-- Total Rows: 0
-- Total Columns: 12
-- Table Status: Empty (no data rows)
-- Primary Key: id (uuid, auto-generated)
-- 
-- Column Summary:
-- - Required: id, event_type, p95_latency_ms, threshold_ms
-- - Optional: channel_name, fallback_mode, details, created_at, dismissed_at, 
--            resolution_notes, updated_at, resolved_at
--
-- Key Features:
-- - Auto-timestamping on created_at and updated_at
-- - Supports event dismissal and resolution tracking
-- - Flexible details storage via JSONB column
-- - Channel and fallback mode tracking for connection quality events
