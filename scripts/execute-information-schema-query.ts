#!/usr/bin/env node

/**
 * Execute raw information_schema.columns query for todos table via agent_exec_sql
 * 
 * This script executes a pure information_schema.columns query to retrieve
 * complete column metadata for the todos table without any filters or aggregations.
 * 
 * Usage: npx ts-node scripts/execute-information-schema-query.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface ColumnMetadata {
  column_name: string
  ordinal_position: number
  data_type: string
  is_nullable: string
  column_default: string | null
  character_maximum_length: number | null
  numeric_precision: number | null
  numeric_scale: number | null
  datetime_precision: number | null
  udt_name: string | null
}

async function executeInformationSchemaQuery(): Promise<void> {
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
    console.log('\n' + '═'.repeat(90))
    console.log('🔍 EXECUTING RAW INFORMATION_SCHEMA.COLUMNS QUERY VIA AGENT_EXEC_SQL')
    console.log('═'.repeat(90) + '\n')

    // The raw information_schema.columns query for todos table
    const informationSchemaQuery = `
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
        AND table_name = 'todos'
      ORDER BY ordinal_position
    `

    console.log('[1/1] Executing information_schema.columns query...\n')
    console.log('Query:')
    console.log('─'.repeat(90))
    console.log(informationSchemaQuery.trim())
    console.log('─'.repeat(90) + '\n')

    // Call agent_exec_sql via RPC (uses simplest overload: query only)
    const { data: columnMetadata, error: queryError } = await supabase.rpc(
      'agent_exec_sql',
      { query: informationSchemaQuery }
    )

    if (queryError) {
      throw new Error(`information_schema query failed: ${queryError.message}`)
    }

    const columns = (columnMetadata as ColumnMetadata[]) || []
    
    if (columns.length === 0) {
      throw new Error('No columns returned from information_schema.columns for todos table')
    }

    console.log(`✅ Query executed successfully. Retrieved ${columns.length} column definitions\n`)

    // Display detailed column metadata
    console.log('═'.repeat(90))
    console.log('📋 COLUMN METADATA FROM INFORMATION_SCHEMA.COLUMNS')
    console.log('═'.repeat(90) + '\n')

    columns.forEach((col, index) => {
      console.log(`\n[${index + 1}] ${col.column_name.toUpperCase()}`)
      console.log('   ' + '─'.repeat(85))
      console.log(`   Ordinal Position:        ${col.ordinal_position}`)
      console.log(`   Data Type:               ${col.data_type}`)
      console.log(`   User-Defined Type:       ${col.udt_name || '(none)'}`)
      console.log(`   Nullable:                ${col.is_nullable}`)
      console.log(`   Default:                 ${col.column_default || '(none)'}`)
      if (col.character_maximum_length !== null) {
        console.log(`   Character Max Length:    ${col.character_maximum_length}`)
      }
      if (col.numeric_precision !== null) {
        console.log(`   Numeric Precision:       ${col.numeric_precision}`)
      }
      if (col.numeric_scale !== null) {
        console.log(`   Numeric Scale:           ${col.numeric_scale}`)
      }
      if (col.datetime_precision !== null) {
        console.log(`   Datetime Precision:      ${col.datetime_precision}`)
      }
    })

    // Export results to JSON
    const exportResult = {
      query_type: 'information_schema.columns',
      table_schema: 'public',
      table_name: 'todos',
      execution_method: 'agent_exec_sql RPC',
      total_columns: columns.length,
      columns: columns,
      execution_timestamp: new Date().toISOString(),
      metadata: {
        description: 'Raw information_schema.columns query for todos table via agent_exec_sql',
        source: 'PostgreSQL information_schema',
        note: 'No filters or aggregations applied - pure schema introspection'
      }
    }

    // Save to JSON file
    const exportDir = path.join(process.cwd(), 'scripts')
    const exportFile = path.join(exportDir, 'todos-information-schema-export.json')
    
    fs.writeFileSync(exportFile, JSON.stringify(exportResult, null, 2))
    console.log(`\n\n✅ Results exported to: ${exportFile}`)

    // Generate summary
    console.log('\n' + '═'.repeat(90))
    console.log('✅ QUERY EXECUTION COMPLETED SUCCESSFULLY')
    console.log('═'.repeat(90))
    console.log(`\nSummary:`)
    console.log(`  Table:        public.todos`)
    console.log(`  Columns:      ${columns.length}`)
    console.log(`  Method:       agent_exec_sql RPC`)
    console.log(`  Timestamp:    ${exportResult.execution_timestamp}`)
    console.log('')

  } catch (error) {
    console.error(
      '\n❌ Execution failed:',
      error instanceof Error ? error.message : String(error)
    )
    console.error('\nDebugging tips:')
    console.error('  - Verify Supabase credentials are set correctly')
    console.error('  - Check that agent_exec_sql function exists in the database')
    console.error('  - Ensure todos table exists in public schema')
    process.exit(1)
  }
}

// Execute the script
executeInformationSchemaQuery()
