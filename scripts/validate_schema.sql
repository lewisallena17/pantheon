-- ============================================================
-- Schema Validation Report for todos and god_status tables
-- ============================================================

-- Query 1: Get todos table schema
SELECT 
  table_name,
  column_name,
  ordinal_position,
  data_type,
  is_nullable,
  column_default,
  is_identity
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;

-- Query 2: Get god_status table schema
SELECT 
  table_name,
  column_name,
  ordinal_position,
  data_type,
  is_nullable,
  column_default,
  is_identity
FROM information_schema.columns
WHERE table_name = 'god_status'
ORDER BY ordinal_position;

-- Query 3: Get todos table constraints (PKs, FKs, checks)
SELECT 
  constraint_name,
  constraint_type,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'todos'
ORDER BY constraint_name, ordinal_position;

-- Query 4: Get todos table check constraints
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE 'todos_%'
ORDER BY constraint_name;

-- Query 5: Get todos indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'todos'
ORDER BY indexname;

-- Query 6: Get god_status indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'god_status'
ORDER BY indexname;

-- Query 7: Get triggers on todos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'todos'
ORDER BY trigger_name;

-- Query 8: Get triggers on god_status
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'god_status'
ORDER BY trigger_name;

-- Query 9: Summary - Column count
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name IN ('todos', 'god_status')
GROUP BY table_name
ORDER BY table_name;

-- Query 10: Summary - Realtime publication status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('todos', 'god_status')
ORDER BY tablename;
