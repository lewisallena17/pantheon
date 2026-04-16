#!/usr/bin/env node

/**
 * Export god_status table schema via agent_exec_sql() using information_schema
 * 
 * Node.js/ESM version of the schema export using PostgreSQL's information_schema
 * catalog tables via agent_exec_sql() RPC function.
 * 
 * Features:
 * - Queries information_schema.tables for table metadata
 * - Queries information_schema.columns for column definitions
 * - No row filters or aggregations (pure schema introspection)
 * - Exports results to JSON and Markdown formats
 * - Comprehensive error handling and logging
 * 
 * Usage:
 *   node scripts/export-god-status-schema-via-information-schema.mjs
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role API key
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Export god_status table schema using information_schema via agent_exec_sql
 */
async function exportGodStatusSchemaViaInformationSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  try {
    console.log('\n' + '═'.repeat(80))
    console.log('📊 EXPORTING GOD_STATUS TABLE SCHEMA VIA INFORMATION_SCHEMA')
    console.log('═'.repeat(80) + '\n')

    // QUERY 1: Table Metadata
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
        AND table_name = 'god_status'
    `

    const { data: tableMetadataData, error: tableMetadataError } = await supabase.rpc(
      'agent_exec_sql',
      { query: tableMetadataQuery }
    )

    if (tableMetadataError) {
      throw new Error(`Table metadata query failed: ${tableMetadataError.message}`)
    }

    const tableInfo = tableMetadataData?.[0]
    if (!tableInfo) {
      throw new Error('Table metadata query returned no results')
    }

    console.log('✅ Table metadata retrieved:')
    console.log(`   Catalog: ${tableInfo.table_catalog}`)
    console.log(`   Schema: ${tableInfo.table_schema}`)
    console.log(`   Table: ${tableInfo.table_name}`)
    console.log(`   Type: ${tableInfo.table_type}`)
    console.log(`   Insertable: ${tableInfo.is_insertable_into}\n`)

    // QUERY 2: Column Definitions
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
        datetime_precision,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'god_status'
      ORDER BY ordinal_position
    `

    const { data: columnSchemaData, error: columnSchemaError } = await supabase.rpc(
      'agent_exec_sql',
      { query: columnSchemaQuery }
    )

    if (columnSchemaError) {
      throw new Error(`Column schema query failed: ${columnSchemaError.message}`)
    }

    const columns = columnSchemaData || []
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
      console.log(`   User-Defined Type: ${col.udt_name}`)
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
      if (col.datetime_precision) {
        console.log(`   DateTime Precision: ${col.datetime_precision}`)
      }
    })

    // Build export result
    const exportResult = {
      table_catalog: tableInfo.table_catalog,
      table_schema: tableInfo.table_schema,
      table_name: tableInfo.table_name,
      table_type: tableInfo.table_type,
      is_insertable_into: tableInfo.is_insertable_into,
      columns,
      export_timestamp: new Date().toISOString(),
      query_type: 'information_schema introspection (no filters, no aggregations)',
      total_columns: columns.length,
    }

    // Export to JSON
    const exportFile = path.join(__dirname, 'god-status-information-schema-export.json')
    fs.writeFileSync(exportFile, JSON.stringify(exportResult, null, 2))
    console.log(`\n✅ JSON export saved to: ${exportFile}`)

    // Export to Markdown
    const markdownFile = path.join(__dirname, 'god-status-information-schema-export.md')
    const markdownContent = generateMarkdownReport(exportResult)
    fs.writeFileSync(markdownFile, markdownContent)
    console.log(`✅ Markdown export saved to: ${markdownFile}`)

    // Summary
    console.log('\n' + '═'.repeat(80))
    console.log('✅ EXPORT COMPLETED SUCCESSFULLY')
    console.log('═'.repeat(80))
    console.log(`Table: ${exportResult.table_name}`)
    console.log(`Schema: ${exportResult.table_schema}`)
    console.log(`Columns: ${exportResult.total_columns}`)
    console.log(`Exported: ${exportResult.export_timestamp}`)
    console.log(`Query Type: ${exportResult.query_type}`)
    console.log('')

    return exportResult
  } catch (error) {
    console.error(
      '❌ Export failed:',
      error instanceof Error ? error.message : String(error)
    )
    process.exit(1)
  }
}

/**
 * Generate Markdown report from schema export
 */
function generateMarkdownReport(exportResult) {
  let md = `# God Status Table Schema Export\n\n`

  md += `**Export Timestamp**: ${exportResult.export_timestamp}\n`
  md += `**Export Method**: PostgreSQL \`information_schema\` via agent_exec_sql()\n`
  md += `**Query Type**: Direct schema introspection (no filters, no aggregations)\n\n`

  // Table Info
  md += `## Table Information\n\n`
  md += `| Property | Value |\n`
  md += `|----------|-------|\n`
  md += `| Catalog | \`${exportResult.table_catalog}\` |\n`
  md += `| Schema | \`${exportResult.table_schema}\` |\n`
  md += `| Table Name | \`${exportResult.table_name}\` |\n`
  md += `| Table Type | ${exportResult.table_type} |\n`
  md += `| Insertable | ${exportResult.is_insertable_into} |\n`
  md += `| Total Columns | ${exportResult.total_columns} |\n\n`

  // Column Details
  md += `## Column Definitions (${exportResult.total_columns})\n\n`
  md += `| Ord | Column Name | Data Type | UDT | Nullable | Default | Max Len | Precision |\n`
  md += `|-----|-------------|-----------|-----|----------|---------|---------|----------|\n`

  exportResult.columns.forEach((col) => {
    const nullable = col.is_nullable === 'YES' ? '✓' : ''
    const defaultVal = col.column_default || '—'
    const charMax = col.character_maximum_length || '—'
    const numPrec = col.numeric_precision || '—'

    md += `| ${col.ordinal_position} | \`${col.column_name}\` | ${col.data_type} | \`${col.udt_name}\` | ${nullable} | ${defaultVal} | ${charMax} | ${numPrec} |\n`
  })

  md += `\n## Detailed Column Information\n\n`

  exportResult.columns.forEach((col, idx) => {
    md += `### ${idx + 1}. \`${col.column_name}\`\n\n`
    md += `- **Ordinal Position**: ${col.ordinal_position}\n`
    md += `- **Data Type**: \`${col.data_type}\`\n`
    md += `- **User-Defined Type**: \`${col.udt_name}\`\n`
    md += `- **Nullable**: ${col.is_nullable}\n`
    md += `- **Default Value**: ${col.column_default || '(none)'}\n`

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

  // Query Information
  md += `## Queries Used\n\n`
  md += `### Query 1: Table Metadata\n\n`
  md += `\`\`\`sql\n`
  md += `SELECT \n`
  md += `  table_catalog,\n`
  md += `  table_schema,\n`
  md += `  table_name,\n`
  md += `  table_type,\n`
  md += `  is_insertable_into\n`
  md += `FROM information_schema.tables\n`
  md += `WHERE table_schema = 'public'\n`
  md += `  AND table_name = 'god_status'\n`
  md += `\`\`\`\n\n`

  md += `### Query 2: Column Definitions\n\n`
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
  md += `  datetime_precision,\n`
  md += `  udt_name\n`
  md += `FROM information_schema.columns\n`
  md += `WHERE table_schema = 'public'\n`
  md += `  AND table_name = 'god_status'\n`
  md += `ORDER BY ordinal_position\n`
  md += `\`\`\`\n\n`

  // Execution Details
  md += `## Execution Details\n\n`
  md += `- **RPC Function**: \`agent_exec_sql()\`\n`
  md += `- **Data Source**: PostgreSQL \`information_schema\` catalog views\n`
  md += `- **Query Filters**: Only table_schema='public' and table_name='god_status'\n`
  md += `- **Row Filters**: None\n`
  md += `- **Aggregations**: None\n`
  md += `- **Result Format**: JSON array\n`
  md += `- **Authentication**: Supabase service role\n\n`

  // Notes
  md += `## Technical Notes\n\n`
  md += `This export uses PostgreSQL's \`information_schema\` to retrieve complete and accurate table schema information.\n\n`
  md += `**Key Characteristics:**\n`
  md += `- No filtering on actual table data\n`
  md += `- Pure metadata introspection\n`
  md += `- Portable across PostgreSQL versions\n`
  md += `- Suitable for schema documentation and comparison\n`
  md += `- Can be used to generate DDL statements\n\n`

  return md
}

// Execute the export
exportGodStatusSchemaViaInformationSchema().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
