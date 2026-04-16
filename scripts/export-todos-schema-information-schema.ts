#!/usr/bin/env node

/**
 * Export todos table schema via agent_exec_sql() using information_schema
 * 
 * This script demonstrates exporting complete table schema information from
 * PostgreSQL's information_schema using the agent_exec_sql() RPC function.
 * 
 * Key features:
 * - No row filters or aggregations
 * - Pure information_schema introspection
 * - JSON result format suitable for programmatic processing
 * - Comprehensive error handling
 * 
 * Usage: npx ts-node scripts/export-todos-schema-information-schema.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Type definitions for schema metadata
interface ColumnDefinition {
  column_name: string
  ordinal_position: number
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
  datetime_precision: number | null
}

interface TableSchemaExport {
  table_catalog: string
  table_schema: string
  table_name: string
  table_type: string
  is_insertable_into: string
  columns: ColumnDefinition[]
  export_timestamp: string
  query_used: string
  total_columns: number
}

/**
 * Export todos table schema via agent_exec_sql
 * Query: information_schema.columns and information_schema.tables
 * No row filters, no aggregations - pure schema introspection
 */
async function exportTodosSchemaViaInformationSchema(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })

  try {
    console.log('\n' + '═'.repeat(80))
    console.log('📊 EXPORTING TODOS TABLE SCHEMA VIA INFORMATION_SCHEMA')
    console.log('═'.repeat(80) + '\n')

    // ===== QUERY 1: Table Metadata from information_schema.tables =====
    console.log('[1/2] Querying table metadata from information_schema.tables...')
    
    const tableMetadataQuery = `
      SELECT 
        table_catalog,
        table_schema,
        table_name,
        table_type,
        is_insertable_into
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'todos'
    `

    const { data: tableMetadata, error: tableMetadataError } = await supabase.rpc(
      'agent_exec_sql',
      { query: tableMetadataQuery }
    )

    if (tableMetadataError) {
      throw new Error(`Table metadata query failed: ${tableMetadataError.message}`)
    }

    const tableInfo = (tableMetadata as any)?.[0]
    if (!tableInfo) {
      throw new Error('Table metadata query returned no results')
    }

    console.log('✅ Table metadata retrieved:')
    console.log(`   Catalog: ${tableInfo.table_catalog}`)
    console.log(`   Schema: ${tableInfo.table_schema}`)
    console.log(`   Table: ${tableInfo.table_name}`)
    console.log(`   Type: ${tableInfo.table_type}`)
    console.log(`   Insertable: ${tableInfo.is_insertable_into}\n`)

    // ===== QUERY 2: Column Definitions from information_schema.columns =====
    console.log('[2/2] Querying column definitions from information_schema.columns...')
    
    const columnSchemaQuery = `
      SELECT 
        column_name,
        ordinal_position,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        datetime_precision
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'todos'
      ORDER BY ordinal_position
    `

    const { data: columnSchema, error: columnSchemaError } = await supabase.rpc(
      'agent_exec_sql',
      { query: columnSchemaQuery }
    )

    if (columnSchemaError) {
      throw new Error(`Column schema query failed: ${columnSchemaError.message}`)
    }

    const columns = (columnSchema as ColumnDefinition[]) || []
    if (columns.length === 0) {
      throw new Error('Column schema query returned no results')
    }

    console.log(`✅ Column definitions retrieved: ${columns.length} columns\n`)

    // Display column details
    console.log('─'.repeat(80))
    console.log('COLUMN DEFINITIONS')
    console.log('─'.repeat(80))
    columns.forEach((col, index) => {
      console.log(`\n${index + 1}. ${col.column_name.toUpperCase()}`)
      console.log(`   Ordinal Position: ${col.ordinal_position}`)
      console.log(`   Data Type: ${col.data_type}`)
      console.log(`   Nullable: ${col.is_nullable}`)
      console.log(`   Default: ${col.column_default || '(none)'}`)
      if (col.character_maximum_length) {
        console.log(`   Max Length: ${col.character_maximum_length}`)
      }
      if (col.numeric_precision) {
        console.log(`   Numeric Precision: ${col.numeric_precision}`)
      }
      if (col.numeric_scale) {
        console.log(`   Numeric Scale: ${col.numeric_scale}`)
      }
    })

    // ===== Build Export Result =====
    const exportResult: TableSchemaExport = {
      table_catalog: tableInfo.table_catalog,
      table_schema: tableInfo.table_schema,
      table_name: tableInfo.table_name,
      table_type: tableInfo.table_type,
      is_insertable_into: tableInfo.is_insertable_into,
      columns,
      export_timestamp: new Date().toISOString(),
      query_used: 'information_schema.columns & information_schema.tables (no filters, no aggregations)',
      total_columns: columns.length,
    }

    // ===== Export to JSON file =====
    const exportDir = path.join(process.cwd(), 'scripts')
    const exportFile = path.join(exportDir, 'todos-schema-export.json')

    fs.writeFileSync(exportFile, JSON.stringify(exportResult, null, 2))
    console.log(`\n✅ Export saved to: ${exportFile}`)

    // ===== Export to Markdown file =====
    const markdownFile = path.join(exportDir, 'todos-schema-export.md')
    const markdownContent = generateMarkdownReport(exportResult)
    fs.writeFileSync(markdownFile, markdownContent)
    console.log(`✅ Markdown report saved to: ${markdownFile}`)

    // ===== Summary =====
    console.log('\n' + '═'.repeat(80))
    console.log('✅ EXPORT COMPLETED SUCCESSFULLY')
    console.log('═'.repeat(80))
    console.log(`Table: ${exportResult.table_name}`)
    console.log(`Columns: ${exportResult.total_columns}`)
    console.log(`Exported: ${exportResult.export_timestamp}`)
    console.log('')

  } catch (error) {
    console.error(
      '❌ Export failed:',
      error instanceof Error ? error.message : String(error)
    )
    process.exit(1)
  }
}

/**
 * Generate a Markdown report from the schema export
 */
function generateMarkdownReport(exportResult: TableSchemaExport): string {
  let md = `# Todos Table Schema Export\n\n`

  md += `**Export Timestamp**: ${exportResult.export_timestamp}\n\n`
  md += `**Data Source**: PostgreSQL \`information_schema\` (no filters, no aggregations)\n\n`

  // Table Info Section
  md += `## Table Information\n\n`
  md += `| Property | Value |\n`
  md += `|----------|-------|\n`
  md += `| Catalog | ${exportResult.table_catalog} |\n`
  md += `| Schema | ${exportResult.table_schema} |\n`
  md += `| Table Name | ${exportResult.table_name} |\n`
  md += `| Table Type | ${exportResult.table_type} |\n`
  md += `| Insertable | ${exportResult.is_insertable_into} |\n`
  md += `| Total Columns | ${exportResult.total_columns} |\n\n`

  // Column Schema Section
  md += `## Column Definitions (${exportResult.total_columns})\n\n`
  md += `| # | Column Name | Data Type | Nullable | Default | Character Max | Numeric Precision |\n`
  md += `|---|-------------|-----------|----------|---------|---------------|-------------------|\n`

  exportResult.columns.forEach((col, index) => {
    const charMax = col.character_maximum_length || '—'
    const numPrecision = col.numeric_precision || '—'
    md += `| ${index + 1} | \`${col.column_name}\` | ${col.data_type} | ${col.is_nullable} | ${col.column_default || 'NULL'} | ${charMax} | ${numPrecision} |\n`
  })

  md += `\n## Detailed Column Information\n\n`

  exportResult.columns.forEach((col, index) => {
    md += `### ${index + 1}. ${col.column_name}\n\n`
    md += `- **Ordinal Position**: ${col.ordinal_position}\n`
    md += `- **Data Type**: ${col.data_type}\n`
    md += `- **Nullable**: ${col.is_nullable}\n`
    md += `- **Default**: ${col.column_default || '(none)'}\n`

    if (col.character_maximum_length) {
      md += `- **Character Max Length**: ${col.character_maximum_length}\n`
    }

    if (col.numeric_precision) {
      md += `- **Numeric Precision**: ${col.numeric_precision}\n`
    }

    if (col.numeric_scale) {
      md += `- **Numeric Scale**: ${col.numeric_scale}\n`
    }

    if (col.datetime_precision) {
      md += `- **DateTime Precision**: ${col.datetime_precision}\n`
    }

    md += `\n`
  })

  // Queries Used Section
  md += `## Queries Used\n\n`

  md += `### Table Metadata Query\n\n`
  md += `\`\`\`sql\n`
  md += `SELECT \n`
  md += `  table_catalog,\n`
  md += `  table_schema,\n`
  md += `  table_name,\n`
  md += `  table_type,\n`
  md += `  is_insertable_into\n`
  md += `FROM information_schema.tables\n`
  md += `WHERE table_schema = 'public'\n`
  md += `  AND table_name = '${exportResult.table_name}'\n`
  md += `\`\`\`\n\n`

  md += `### Column Schema Query\n\n`
  md += `\`\`\`sql\n`
  md += `SELECT \n`
  md += `  column_name,\n`
  md += `  ordinal_position,\n`
  md += `  data_type,\n`
  md += `  is_nullable,\n`
  md += `  column_default,\n`
  md += `  character_maximum_length,\n`
  md += `  numeric_precision,\n`
  md += `  numeric_scale,\n`
  md += `  datetime_precision\n`
  md += `FROM information_schema.columns\n`
  md += `WHERE table_schema = 'public'\n`
  md += `  AND table_name = '${exportResult.table_name}'\n`
  md += `ORDER BY ordinal_position\n`
  md += `\`\`\`\n\n`

  // Notes Section
  md += `## Notes\n\n`
  md += `- Data source: PostgreSQL \`information_schema\` standard catalog\n`
  md += `- No row-level filters applied (schema metadata only)\n`
  md += `- No aggregations used (direct column metadata queries)\n`
  md += `- Query execution: Via Supabase RPC function \`agent_exec_sql()\`\n`
  md += `- Timestamp: ${exportResult.export_timestamp}\n`

  return md
}

// Main execution
exportTodosSchemaViaInformationSchema()
