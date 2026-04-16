# God Status Table Schema Export via Information Schema

**Status**: ✅ Completed  
**Method**: PostgreSQL `information_schema` introspection via `agent_exec_sql()` RPC  
**Query Type**: No row filters, no aggregations — pure schema metadata retrieval

---

## Overview

This guide documents the complete schema export of the `god_status` table using PostgreSQL's standardized `information_schema` catalog views, executed through Supabase's `agent_exec_sql()` RPC function.

### Key Characteristics

- **Data Source**: PostgreSQL `information_schema.tables` and `information_schema.columns`
- **Query Execution**: Via Supabase RPC function `agent_exec_sql()`
- **Filter Scope**: Only `table_schema = 'public'` and `table_name = 'god_status'`
- **Row-Level Data**: None — pure schema introspection
- **Aggregations**: None — direct column metadata queries
- **Result Format**: JSON arrays suitable for programmatic processing

---

## What is information_schema?

`information_schema` is a PostgreSQL standard catalog that provides a consistent, portable interface to database metadata. Unlike system tables (which are implementation-specific), `information_schema` views follow SQL standards and work across database versions.

### Key Views Used

1. **`information_schema.tables`**
   - Contains table/view metadata
   - Properties: `table_catalog`, `table_schema`, `table_name`, `table_type`, `is_insertable_into`
   - Use: Retrieve table-level information

2. **`information_schema.columns`**
   - Contains column definitions for all tables
   - Properties: `column_name`, `ordinal_position`, `data_type`, `is_nullable`, `column_default`, etc.
   - Use: Retrieve detailed column metadata

---

## Queries Executed

### Query 1: Table Metadata

```sql
SELECT 
  table_catalog,
  table_schema,
  table_name,
  table_type,
  is_insertable_into
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'god_status'
```

**Purpose**: Retrieve table-level metadata  
**Returns**: Single row with table properties  
**Example Result**:
```json
{
  "table_catalog": "postgres",
  "table_schema": "public",
  "table_name": "god_status",
  "table_type": "BASE TABLE",
  "is_insertable_into": "YES"
}
```

### Query 2: Column Definitions

```sql
SELECT 
  column_name,
  ordinal_position,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale,
  datetime_precision,
  udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'god_status'
ORDER BY ordinal_position
```

**Purpose**: Retrieve all column definitions with full metadata  
**Returns**: Multiple rows (one per column)  
**Example Result** (first column):
```json
{
  "column_name": "id",
  "ordinal_position": 1,
  "data_type": "integer",
  "is_nullable": "NO",
  "column_default": "1",
  "character_maximum_length": null,
  "numeric_precision": 32,
  "numeric_scale": 0,
  "datetime_precision": null,
  "udt_name": "int4"
}
```

---

## God Status Table Schema (Full Export)

### Table Information

| Property | Value |
|----------|-------|
| Catalog | `postgres` |
| Schema | `public` |
| Table Name | `god_status` |
| Table Type | `BASE TABLE` |
| Insertable | `YES` |
| Total Columns | 5 |

### Column Definitions

| # | Column Name | Data Type | UDT | Nullable | Default | Purpose |
|---|-------------|-----------|-----|----------|---------|---------|
| 1 | `id` | integer | `int4` | NO | `1` | Primary key (singleton table) |
| 2 | `thought` | text | `text` | NO | `'Watching...'::text` | Current system status/thought |
| 3 | `updated_at` | timestamp with time zone | `timestamptz` | NO | `now()` | Auto-updated timestamp |
| 4 | `meta` | jsonb | `jsonb` | YES | NULL | System metadata (mood, confidence, etc.) |
| 5 | `intent` | jsonb | `jsonb` | YES | NULL | Current intent and decreed tasks |

---

## Why Use information_schema?

### Advantages

1. **Portability**: Works across PostgreSQL versions (SQL standard)
2. **Reliability**: Metadata is authoritative and always up-to-date
3. **Completeness**: Provides all schema information in structured format
4. **No Performance Impact**: Reading schema metadata is negligible
5. **No Data Leakage**: Only metadata, not actual row data
6. **Standardization**: Uses SQL-92 standard catalog interface

### Comparison: information_schema vs Other Methods

| Method | Pros | Cons |
|--------|------|------|
| `information_schema` | Standard, portable, complete | Less detailed than system tables |
| System tables (`pg_*`) | Most detailed, implementation-specific | PostgreSQL-only, less stable |
| `DESCRIBE` | Simple, user-friendly | Not SQL standard, limited info |
| `agent_exec_sql()` + system tables | Flexible | Requires knowledge of system tables |

---

## Executing via agent_exec_sql()

### Client-Side (TypeScript/JavaScript)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Execute query via RPC
const { data, error } = await supabase.rpc('agent_exec_sql', {
  query: `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'god_status'
    ORDER BY ordinal_position
  `
})

if (error) {
  console.error('Query failed:', error)
} else {
  console.log('Column schema:', data)
}
```

### Server-Side (Direct SQL)

```sql
SELECT * FROM agent_exec_sql(
  'SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = ''public'' AND table_name = ''god_status''
   ORDER BY ordinal_position'
)
```

### Return Format

Both return JSON array of objects:

```json
[
  {
    "column_name": "id",
    "data_type": "integer",
    "is_nullable": "NO",
    "column_default": "1"
  },
  {
    "column_name": "thought",
    "data_type": "text",
    "is_nullable": "NO",
    "column_default": "'Watching...'::text"
  },
  ...
]
```

---

## Implementation Scripts

### 1. TypeScript Version

**File**: `scripts/export-god-status-schema-information-schema.ts`

**Usage**:
```bash
npx ts-node scripts/export-god-status-schema-information-schema.ts
```

**Features**:
- Full TypeScript type definitions
- Structured error handling
- Exports JSON and Markdown
- Detailed console logging

**Output Files**:
- `scripts/god-status-schema-export.json` - JSON format
- `scripts/god-status-schema-export.md` - Markdown format

### 2. Node.js/ESM Version

**File**: `scripts/export-god-status-schema-via-information-schema.mjs`

**Usage**:
```bash
node scripts/export-god-status-schema-via-information-schema.mjs
```

**Features**:
- Pure JavaScript (no compilation needed)
- ESM module format
- Same functionality as TypeScript version
- Better for CI/CD pipelines

**Output Files**:
- `scripts/god-status-information-schema-export.json` - JSON format
- `scripts/god-status-information-schema-export.md` - Markdown format

---

## Export Output Structure

### JSON Format

```json
{
  "table_catalog": "postgres",
  "table_schema": "public",
  "table_name": "god_status",
  "table_type": "BASE TABLE",
  "is_insertable_into": "YES",
  "columns": [
    {
      "column_name": "id",
      "ordinal_position": 1,
      "data_type": "integer",
      "is_nullable": "NO",
      "column_default": "1",
      "character_maximum_length": null,
      "numeric_precision": 32,
      "numeric_scale": 0,
      "datetime_precision": null,
      "udt_name": "int4"
    },
    ...
  ],
  "export_timestamp": "2026-04-14T12:34:56.789Z",
  "query_type": "information_schema introspection (no filters, no aggregations)",
  "total_columns": 5
}
```

### Markdown Format

Includes:
- Table information summary
- Column definitions table
- Detailed column information
- SQL queries used
- Execution details
- Technical notes

---

## Use Cases

### 1. Schema Documentation
Generate authoritative schema documentation automatically from the database:
```bash
node scripts/export-god-status-schema-via-information-schema.mjs
```
Then commit the JSON/Markdown exports to version control.

### 2. Schema Validation
Compare exported schema against expected definitions:
```typescript
const exported = JSON.parse(fs.readFileSync('god-status-information-schema-export.json'))
const expected = { /* predefined schema */ }
assert.deepEqual(exported.columns, expected.columns)
```

### 3. DDL Generation
Generate CREATE TABLE statements from schema export:
```typescript
function generateDDL(schema) {
  let ddl = `CREATE TABLE ${schema.table_name} (\n`
  ddl += schema.columns.map(col => 
    `  ${col.column_name} ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`
  ).join(',\n')
  ddl += '\n)'
  return ddl
}
```

### 4. Schema Comparison
Compare god_status schema across environments:
```typescript
const dev = await exportSchema('dev_db')
const prod = await exportSchema('prod_db')
const diff = generateDiff(dev, prod)
```

### 5. API Documentation
Auto-generate API docs from schema:
```typescript
function generateApiDocs(schema) {
  return schema.columns.map(col => ({
    name: col.column_name,
    type: col.data_type,
    required: col.is_nullable === 'NO',
    default: col.column_default
  }))
}
```

---

## Technical Details

### Why No Row Filters or Aggregations?

1. **Purity**: Schema metadata is independent of data
2. **Performance**: `information_schema` queries are optimized for metadata-only access
3. **Safety**: No risk of returning sensitive data
4. **Clarity**: Schema introspection doesn't mix with data operations

### Why information_schema Over System Tables?

```sql
-- ❌ System tables approach (PostgreSQL-specific)
SELECT * FROM pg_attribute WHERE attrelid = 'god_status'::regclass

-- ✅ information_schema approach (SQL standard)
SELECT * FROM information_schema.columns WHERE table_name = 'god_status'
```

`information_schema` is cleaner, more portable, and follows SQL standards.

### Filtering Strategy

```sql
-- All filters are structural, not data-based
WHERE table_schema = 'public'     -- Filter by schema (structural)
  AND table_name = 'god_status'   -- Filter by table name (structural)
-- No WHERE clauses on column values or data
```

---

## Related Resources

- **PostgreSQL Docs**: [information_schema](https://www.postgresql.org/docs/current/information-schema.html)
- **SQL Standard**: ISO/IEC 9075-1:2016
- **Quick Reference**: `scripts/AGENT_EXEC_SQL_QUICK_REFERENCE.md`
- **Schema Functions**: `scripts/GOD_STATUS_SCHEMA_REPORT.md`

---

## Summary

The god_status table schema has been successfully exported using:

✅ **Method**: PostgreSQL `information_schema` introspection  
✅ **Tool**: Supabase `agent_exec_sql()` RPC function  
✅ **Approach**: No row filters, no aggregations — pure metadata  
✅ **Format**: JSON and Markdown  
✅ **Portability**: SQL-standard, works across PostgreSQL versions  
✅ **Reliability**: Authoritative, always current with actual schema  

The export can be regenerated at any time using the provided scripts and integrated into documentation, validation, and CI/CD pipelines.
