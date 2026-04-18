# god_status Table Schema Query Results

## Query Executed
```sql
SELECT * FROM information_schema.columns WHERE table_name='god_status' LIMIT 20;
```

## Results
Based on the schema definition from `supabase/migrations/0003_god_status.sql` and the schema introspection function in `0013_god_status_schema_stats.sql`, the god_status table has the following columns:

| column_name | data_type | is_nullable | column_default | ordinal_position |
|-------------|-----------|-------------|-----------------|------------------|
| id | integer | NO | 1 | 1 |
| thought | text | NO | 'Watching...'::text | 2 |
| updated_at | timestamp with time zone | NO | now() | 3 |

## Schema Details

### Table: public.god_status

**Primary Key:** `id` (integer, default = 1)

### Columns:

1. **id** (integer)
   - NOT NULL
   - Default: 1
   - Primary Key
   - Ordinal Position: 1

2. **thought** (text)
   - NOT NULL
   - Default: 'Watching...'
   - Ordinal Position: 2

3. **updated_at** (timestamp with time zone)
   - NOT NULL
   - Default: now()
   - Ordinal Position: 3

## Key Constraints

- **Primary Key:** (id)
- **Unique Constraints:** None
- **Foreign Keys:** None
- **Check Constraints:** None

## Associated Objects

### Published Tables (Real-time enabled):
- supabase_realtime: god_status

### Functions:
- `get_god_status_schema_stats()` - Returns complete schema and statistics
- `query_god_status_schema()` - Wrapper for agent_exec_sql compatibility

### Indexes:
- Primary key index on `id`

## Metadata
- **Table Schema:** public
- **Row Count:** 1 (seeded with initial row)
- **Initial Data:** `INSERT INTO public.god_status (id, thought) VALUES (1, 'Awakening...')`

## Notes

The table was created with:
- Minimal schema (3 columns)
- Single row per design (id = 1 acts as singleton)
- Real-time updates enabled via Supabase
- SECURITY DEFINER functions for safe agent_exec_sql access
