# connection_quality_events Table Structure

## Query Results

### Row Count
- **Total Rows**: 0

### Column Inspection Results

| Column Name | Data Type | Nullable | Default |
|-------------|-----------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| event_type | text | NO | NULL |
| p95_latency_ms | double precision | NO | NULL |
| threshold_ms | double precision | NO | NULL |
| channel_name | text | YES | NULL |
| fallback_mode | text | YES | NULL |
| details | jsonb | YES | NULL |
| created_at | timestamp with time zone | YES | now() |
| dismissed_at | timestamp with time zone | YES | NULL |
| resolution_notes | text | YES | NULL |
| updated_at | timestamp with time zone | YES | now() |
| resolved_at | timestamp with time zone | YES | NULL |

## Column Descriptions

### Required Columns (NOT NULL)
- **id**: Unique identifier (UUID) - automatically generated
- **event_type**: Type of connection quality event (text)
- **p95_latency_ms**: 95th percentile latency in milliseconds (numeric)
- **threshold_ms**: Threshold latency in milliseconds (numeric)

### Optional Columns (Nullable)
- **channel_name**: Name of the communication channel (text)
- **fallback_mode**: Fallback mode status (text)
- **details**: Additional event metadata in JSON format (jsonb)
- **created_at**: Event creation timestamp (defaults to current time)
- **dismissed_at**: Timestamp when event was dismissed
- **resolution_notes**: Notes about event resolution
- **updated_at**: Last update timestamp (defaults to current time)
- **resolved_at**: Timestamp when event was resolved

## SQL Executed

```sql
-- Column Inspection
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'connection_quality_events' 
ORDER BY ordinal_position;

-- Row Count Query
SELECT COUNT(*) as row_count FROM connection_quality_events;
```

## Results Summary

- **Table Exists**: ✓ Yes
- **Total Columns**: 12
- **Primary Key**: id (UUID)
- **Current Row Count**: 0
- **Status**: Empty table (ready to receive events)

## Query Execution Context

**Tool**: agent_exec_sql()
**Query Type**: SELECT COUNT(*) + Column Inspection
**Timestamp**: Generated during task execution
**Database**: Supabase (public schema)
