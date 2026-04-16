/**
 * export_todos_via_agent_exec_sql.ts
 * 
 * Export todos table schema and sample data using agent_exec_sql() RPC function.
 * This demonstrates proper usage of agent_exec_sql for database introspection.
 * 
 * Usage: npx ts-node scripts/export_todos_via_agent_exec_sql.ts
 * 
 * Executes:
 * 1. Schema query: Column names, types, defaults, nullability
 * 2. Sample data: First 10 rows for inspection
 * 3. Statistics: Row count, table size, indexes
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface TodosExportData {
  metadata: {
    timestamp: string
    execution_method: string
    database: string
  }
  schema: {
    table_name: string
    columns: Array<{
      column_name: string
      data_type: string
      is_nullable: boolean
      column_default: string | null
      ordinal_position: number
    }>
    total_columns: number
    primary_key: string
  }
  statistics: {
    total_rows: number
    table_size_bytes: number | null
  }
  sample_rows: Record<string, unknown>[]
  sample_limit: number
  queries_executed: {
    schema_query: string
    sample_query: string
    count_query: string
  }
}

/**
 * Export todos table schema via agent_exec_sql RPC
 */
async function exportTodosSchema(
  supabase: ReturnType<typeof createClient>
): Promise<TodosExportData['schema']> {
  console.log('📋 Fetching todos table schema via agent_exec_sql()...')

  const schemaQuery = `
    SELECT 
      column_name, 
      data_type, 
      is_nullable, 
      column_default,
      ordinal_position
    FROM information_schema.columns 
    WHERE table_name = 'todos' 
      AND table_schema = 'public'
    ORDER BY ordinal_position
  `

  const { data: schemaData, error: schemaError } = await supabase.rpc(
    'agent_exec_sql',
    { query: schemaQuery }
  )

  if (schemaError) {
    throw new Error(`Schema query failed: ${schemaError.message}`)
  }

  if (!schemaData || schemaData.length === 0) {
    throw new Error('No schema data returned')
  }

  // Extract the result from the RPC response
  const columns = schemaData[0] || []

  return {
    table_name: 'todos',
    columns: columns.map((col: any) => ({
      column_name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable === 'YES',
      column_default: col.column_default,
      ordinal_position: col.ordinal_position
    })),
    total_columns: columns.length,
    primary_key: 'id'
  }
}

/**
 * Export sample todos rows via agent_exec_sql RPC
 */
async function exportSampleRows(
  supabase: ReturnType<typeof createClient>,
  limit: number = 10
): Promise<Record<string, unknown>[]> {
  console.log(`📊 Fetching ${limit} sample rows via agent_exec_sql()...`)

  const sampleQuery = `SELECT * FROM todos LIMIT ${limit}`

  const { data: sampleData, error: sampleError } = await supabase.rpc(
    'agent_exec_sql',
    { query: sampleQuery }
  )

  if (sampleError) {
    throw new Error(`Sample query failed: ${sampleError.message}`)
  }

  if (!sampleData || sampleData.length === 0) {
    return []
  }

  // Extract rows from RPC response
  return sampleData[0] || []
}

/**
 * Get row count for todos table
 */
async function getTodosCount(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  console.log('🔢 Fetching todos row count via agent_exec_sql()...')

  const countQuery = `SELECT COUNT(*) as row_count FROM todos`

  const { data: countData, error: countError } = await supabase.rpc(
    'agent_exec_sql',
    { query: countQuery }
  )

  if (countError) {
    console.warn(`Count query warning: ${countError.message}`)
    return 0
  }

  if (!countData || countData.length === 0) {
    return 0
  }

  const result = countData[0]?.[0]
  return result?.row_count || 0
}

/**
 * Get table size estimate
 */
async function getTableSize(
  supabase: ReturnType<typeof createClient>
): Promise<number | null> {
  console.log('💾 Fetching table size via agent_exec_sql()...')

  const sizeQuery = `
    SELECT 
      pg_total_relation_size('public.todos'::regclass) as total_bytes
  `

  const { data: sizeData, error: sizeError } = await supabase.rpc(
    'agent_exec_sql',
    { query: sizeQuery }
  )

  if (sizeError) {
    console.warn(`Size query warning: ${sizeError.message}`)
    return null
  }

  if (!sizeData || sizeData.length === 0) {
    return null
  }

  const result = sizeData[0]?.[0]
  return result?.total_bytes || null
}

/**
 * Main export function
 */
async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('\n🚀 Starting todos table export via agent_exec_sql()...\n')

    // Execute all queries
    const [schema, sampleRows, rowCount, tableSize] = await Promise.all([
      exportTodosSchema(supabase),
      exportSampleRows(supabase, 10),
      getTodosCount(supabase),
      getTableSize(supabase)
    ])

    // Construct export data
    const exportData: TodosExportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        execution_method: 'agent_exec_sql RPC',
        database: 'Supabase PostgreSQL'
      },
      schema,
      statistics: {
        total_rows: rowCount,
        table_size_bytes: tableSize
      },
      sample_rows: sampleRows,
      sample_limit: 10,
      queries_executed: {
        schema_query: `SELECT column_name, data_type, is_nullable, column_default, ordinal_position FROM information_schema.columns WHERE table_name = 'todos'`,
        sample_query: `SELECT * FROM todos LIMIT 10`,
        count_query: `SELECT COUNT(*) as row_count FROM todos`
      }
    }

    // Output summary
    console.log('\n✅ Export completed successfully!\n')
    console.log(`📊 Summary:`)
    console.log(`  • Table: ${schema.table_name}`)
    console.log(`  • Columns: ${schema.total_columns}`)
    console.log(`  • Total rows: ${rowCount}`)
    console.log(`  • Sample rows exported: ${sampleRows.length}`)
    if (tableSize) {
      console.log(`  • Table size: ${(tableSize / 1024).toFixed(2)} KB`)
    }

    // Display schema columns
    console.log(`\n📋 Column Definitions:`)
    schema.columns.forEach((col, idx) => {
      const nullable = col.is_nullable ? '(nullable)' : '(NOT NULL)'
      const defaultStr = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      console.log(`  ${idx + 1}. ${col.column_name}: ${col.data_type} ${nullable}${defaultStr}`)
    })

    // Display sample rows
    if (sampleRows.length > 0) {
      console.log(`\n📋 Sample Rows (${sampleRows.length} of ${rowCount}):`)
      sampleRows.slice(0, 3).forEach((row, idx) => {
        console.log(`\n  Row ${idx + 1}:`)
        Object.entries(row).forEach(([key, value]) => {
          const valueStr =
            typeof value === 'object'
              ? JSON.stringify(value)
              : String(value).substring(0, 50)
          console.log(`    ${key}: ${valueStr}`)
        })
      })
      if (sampleRows.length > 3) {
        console.log(`\n  ... and ${sampleRows.length - 3} more rows`)
      }
    }

    // Save to JSON file
    const outputPath = path.join(
      __dirname,
      'export_todos_via_agent_exec_sql.json'
    )
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))
    console.log(`\n💾 Full export saved to: ${outputPath}`)

    // Save to markdown file
    const mdOutputPath = path.join(
      __dirname,
      'TODOS_EXPORT_VIA_AGENT_EXEC_SQL.md'
    )
    const mdContent = generateMarkdownReport(exportData)
    fs.writeFileSync(mdOutputPath, mdContent)
    console.log(`📄 Markdown report saved to: ${mdOutputPath}`)

    console.log('\n✨ Export complete!\n')
  } catch (error) {
    console.error('\n❌ Export failed:', error)
    process.exit(1)
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(data: TodosExportData): string {
  let md = `# Todos Table Export via agent_exec_sql()

**Export Date:** ${data.metadata.timestamp}  
**Method:** ${data.metadata.execution_method}  
**Database:** ${data.metadata.database}

## Table Summary

| Property | Value |
|----------|-------|
| Table Name | \`${data.schema.table_name}\` |
| Primary Key | \`${data.schema.primary_key}\` |
| Total Columns | ${data.schema.total_columns} |
| Total Rows | ${data.statistics.total_rows} |
| Table Size | ${data.statistics.table_size_bytes ? `${(data.statistics.table_size_bytes / 1024).toFixed(2)} KB` : 'N/A'} |

## Schema Definition

\`\`\`sql
CREATE TABLE public.${data.schema.table_name} (
`

  data.schema.columns.forEach((col, idx) => {
    const nullable = col.is_nullable ? '' : ' NOT NULL'
    const defaultStr = col.column_default ? ` DEFAULT ${col.column_default}` : ''
    const isPrimary = col.column_name === data.schema.primary_key ? ' PRIMARY KEY' : ''
    const comma = idx < data.schema.columns.length - 1 ? ',' : ''
    md += `  ${col.column_name} ${col.data_type}${nullable}${defaultStr}${isPrimary}${comma}\n`
  })

  md += `);
\`\`\`

## Column Details

| # | Column | Type | Nullable | Default |
|---|--------|------|----------|---------|
`

  data.schema.columns.forEach((col) => {
    const nullable = col.is_nullable ? 'YES' : 'NO'
    const defaultVal = col.column_default || '—'
    md += `| ${col.ordinal_position} | \`${col.column_name}\` | \`${col.data_type}\` | ${nullable} | ${defaultVal} |\n`
  })

  md += `\n## Sample Data\n\n\`\`\`json\n${JSON.stringify(data.sample_rows.slice(0, 5), null, 2)}\n\`\`\`\n\n`
  md += `**Showing ${Math.min(5, data.sample_rows.length)} of ${data.sample_rows.length} sample rows (total ${data.statistics.total_rows} rows in table)**\n\n`

  md += `## Queries Executed\n\n### Schema Query\n\`\`\`sql\n${data.queries_executed.schema_query}\n\`\`\`\n\n`
  md += `### Sample Data Query\n\`\`\`sql\n${data.queries_executed.sample_query}\n\`\`\`\n\n`
  md += `### Count Query\n\`\`\`sql\n${data.queries_executed.count_query}\n\`\`\`\n`

  return md
}

// Execute
main().catch(console.error)
