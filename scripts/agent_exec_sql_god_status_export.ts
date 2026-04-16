/**
 * agent_exec_sql_god_status_export.ts
 * 
 * Export god_status table complete schema and current state via agent_exec_sql()
 * 
 * This script demonstrates how to use agent_exec_sql() to:
 * 1. Retrieve complete table schema information from information_schema
 * 2. Fetch the current state of the god_status table (SELECT *)
 * 3. Export data in JSON and SQL formats
 * 4. Verify table structure and constraints
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Interface for god_status table columns
 */
interface GodStatusColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

/**
 * Interface for god_status table row data
 */
interface GodStatusRow {
  id: number
  thought: string
  updated_at: string
  meta?: Record<string, unknown> | null
  intent?: Record<string, unknown> | null
}

/**
 * Interface for table index information
 */
interface TableIndex {
  index_name: string
  column_name: string
  is_unique: boolean
}

/**
 * Complete export result structure
 */
interface GodStatusExportResult {
  success: boolean
  table_info: {
    table_name: string
    total_rows: number
    storage_size_bytes: number
  }
  schema: {
    columns: GodStatusColumn[]
    total_columns: number
    indexes: TableIndex[]
  }
  current_state: GodStatusRow[]
  export_timestamp: string
  queries_executed: {
    schema_query: string
    data_query: string
  }
}

/**
 * Export god_status table schema and current state via agent_exec_sql()
 * 
 * Uses Supabase RPC to execute SELECT queries safely and return results as JSON.
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key (service role for full access)
 * @returns Promise<GodStatusExportResult>
 */
export async function agent_exec_sql_export_god_status(
  supabaseUrl: string,
  supabaseKey: string
): Promise<GodStatusExportResult> {
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    console.log('📡 Executing agent_exec_sql() queries for god_status table...\n')

    // ===== QUERY 1: Table Row Count =====
    console.log('[1/4] Fetching table row count...')
    const rowCountQuery = 'SELECT COUNT(*) as row_count FROM god_status'
    const { data: rowCountData, error: rowCountError } = await supabase.rpc(
      'agent_exec_sql',
      { query: rowCountQuery }
    )

    if (rowCountError) {
      throw new Error(`Row count query failed: ${rowCountError.message}`)
    }

    const totalRows = (rowCountData as any)?.[0]?.row_count || 0
    console.log(`✓ Row count: ${totalRows}`)

    // ===== QUERY 2: Table Storage Size =====
    console.log('[2/4] Fetching table storage information...')
    const storageSizeQuery = `
      SELECT 
        pg_total_relation_size('god_status'::regclass) as total_size
    `
    const { data: storageSizeData, error: storageSizeError } = await supabase.rpc(
      'agent_exec_sql',
      { query: storageSizeQuery }
    )

    if (storageSizeError) {
      console.warn(`Storage size query warning: ${storageSizeError.message}`)
    }

    const storageSize = (storageSizeData as any)?.[0]?.total_size || 0
    console.log(`✓ Storage size: ${(storageSize / 1024).toFixed(2)} KB`)

    // ===== QUERY 3: Column Schema Information =====
    console.log('[3/4] Fetching column schema from information_schema...')
    const schemaQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'god_status'
      ORDER BY ordinal_position
    `
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      'agent_exec_sql',
      { query: schemaQuery }
    )

    if (schemaError) {
      throw new Error(`Schema query failed: ${schemaError.message}`)
    }

    const columns = (schemaData as GodStatusColumn[]) || []
    console.log(`✓ Schema retrieved: ${columns.length} columns`)
    columns.forEach((col) => {
      console.log(`  - ${col.column_name} (${col.data_type})`)
    })

    // ===== QUERY 4: Index Information =====
    console.log('[4/4] Fetching index information...')
    const indexQuery = `
      SELECT 
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique
      FROM pg_index ix
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = 'god_status'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY i.relname, a.attnum
    `
    const { data: indexData, error: indexError } = await supabase.rpc(
      'agent_exec_sql',
      { query: indexQuery }
    )

    if (indexError) {
      console.warn(`Index query warning: ${indexError.message}`)
    }

    const indexes = (indexData as TableIndex[]) || []
    console.log(`✓ Indexes retrieved: ${indexes.length} indexes`)
    indexes.forEach((idx) => {
      console.log(`  - ${idx.index_name} on ${idx.column_name}`)
    })

    // ===== QUERY 5: Current Table State (SELECT *) =====
    console.log('[5/5] Fetching current table state...')
    const dataQuery = 'SELECT * FROM god_status'
    const { data: godStatusData, error: dataError } = await supabase.rpc(
      'agent_exec_sql',
      { query: dataQuery }
    )

    if (dataError) {
      throw new Error(`Data query failed: ${dataError.message}`)
    }

    const currentState = (godStatusData as GodStatusRow[]) || []
    console.log(`✓ Current state retrieved: ${currentState.length} row(s)`)

    // ===== Build Export Result =====
    const result: GodStatusExportResult = {
      success: true,
      table_info: {
        table_name: 'god_status',
        total_rows: totalRows,
        storage_size_bytes: storageSize,
      },
      schema: {
        columns,
        total_columns: columns.length,
        indexes,
      },
      current_state: currentState,
      export_timestamp: new Date().toISOString(),
      queries_executed: {
        schema_query: schemaQuery.trim(),
        data_query: dataQuery.trim(),
      },
    }

    return result
  } catch (error) {
    throw new Error(
      `agent_exec_sql_export_god_status failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Format export result as readable markdown
 * 
 * @param result - Export result from agent_exec_sql_export_god_status
 * @returns Markdown string
 */
export function exportGodStatusAsMarkdown(result: GodStatusExportResult): string {
  let md = `# God Status Table Export\n\n`
  md += `**Export Timestamp**: ${result.export_timestamp}\n\n`

  // Table Info Section
  md += `## Table Information\n\n`
  md += `| Property | Value |\n`
  md += `|----------|-------|\n`
  md += `| Table Name | ${result.table_info.table_name} |\n`
  md += `| Total Rows | ${result.table_info.total_rows} |\n`
  md += `| Storage Size | ${(result.table_info.storage_size_bytes / 1024).toFixed(2)} KB |\n\n`

  // Schema Section
  md += `## Schema (${result.schema.total_columns} columns)\n\n`
  md += `| Column Name | Data Type | Nullable | Default |\n`
  md += `|-------------|-----------|----------|----------|\n`
  result.schema.columns.forEach((col) => {
    const nullable = col.is_nullable === 'YES' ? 'Yes' : 'No'
    const defaultVal = col.column_default || '-'
    md += `| ${col.column_name} | ${col.data_type} | ${nullable} | ${defaultVal} |\n`
  })
  md += `\n`

  // Indexes Section
  if (result.schema.indexes.length > 0) {
    md += `## Indexes (${result.schema.indexes.length})\n\n`
    result.schema.indexes.forEach((idx) => {
      md += `- **${idx.index_name}**: ${idx.column_name} (Unique: ${idx.is_unique})\n`
    })
    md += `\n`
  }

  // Current State Section
  md += `## Current State (${result.current_state.length} row(s))\n\n`
  if (result.current_state.length === 0) {
    md += `*Table is empty*\n\n`
  } else {
    result.current_state.forEach((row, idx) => {
      md += `### Row ${idx + 1}\n\n`
      md += `\`\`\`json\n`
      md += JSON.stringify(row, null, 2)
      md += `\n\`\`\`\n\n`
    })
  }

  return md
}

/**
 * Export god_status schema as SQL CREATE TABLE statement
 * 
 * @param result - Export result from agent_exec_sql_export_god_status
 * @returns SQL CREATE TABLE statement
 */
export function exportGodStatusSchemaAsSQL(result: GodStatusExportResult): string {
  const columns = result.schema.columns
    .map((col) => {
      const notNull = col.is_nullable === 'NO' ? ' NOT NULL' : ''
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      return `  ${col.column_name} ${col.data_type}${notNull}${defaultVal}`
    })
    .join(',\n')

  // Find primary key from schema
  const pkColumn = result.schema.columns.find(
    (col) => col.column_name === 'id'
  )
  const pkConstraint = pkColumn ? ',\n  PRIMARY KEY (id)' : ''

  return `CREATE TABLE IF NOT EXISTS public.god_status (
${columns}${pkConstraint}
);

-- Indexes
${
  result.schema.indexes
    .map((idx) => `CREATE INDEX IF NOT EXISTS ${idx.index_name} ON god_status(${idx.column_name});`)
    .join('\n')
    .split('\n')
    .filter((line) => line.trim())
    .join('\n')
}
`
}

/**
 * Export god_status as JSON
 * 
 * @param result - Export result from agent_exec_sql_export_god_status
 * @returns JSON string
 */
export function exportGodStatusAsJSON(result: GodStatusExportResult): string {
  return JSON.stringify(result, null, 2)
}

// ===== MAIN EXECUTION =====
async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗')
    process.exit(1)
  }

  try {
    console.log('🚀 Exporting god_status table schema and current state...\n')

    // Execute export via agent_exec_sql
    const exportResult = await agent_exec_sql_export_god_status(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY
    )

    console.log('\n✅ Export completed successfully!\n')
    console.log('='.repeat(60))

    // Output Summary
    console.log('\n📊 SUMMARY\n')
    console.log(`Table: ${exportResult.table_info.table_name}`)
    console.log(`Rows: ${exportResult.table_info.total_rows}`)
    console.log(`Columns: ${exportResult.schema.total_columns}`)
    console.log(`Storage: ${(exportResult.table_info.storage_size_bytes / 1024).toFixed(2)} KB`)
    console.log(`Indexes: ${exportResult.schema.indexes.length}`)

    // Output formats
    console.log('\n' + '='.repeat(60))
    console.log('\n📋 MARKDOWN EXPORT\n')
    console.log(exportGodStatusAsMarkdown(exportResult))

    console.log('='.repeat(60))
    console.log('\n💾 SQL SCHEMA\n')
    console.log(exportGodStatusSchemaAsSQL(exportResult))

    console.log('='.repeat(60))
    console.log('\n📦 JSON EXPORT\n')
    console.log(exportGodStatusAsJSON(exportResult))

    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n❌ Export failed:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export default agent_exec_sql_export_god_status
