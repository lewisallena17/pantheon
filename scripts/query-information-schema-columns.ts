#!/usr/bin/env node

/**
 * query-information-schema-columns.ts
 * 
 * Query information_schema.columns for the todos table
 * This demonstrates how to use agent_exec_sql to query system catalog tables
 */

import { createClient } from '@supabase/supabase-js'

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  ordinal_position: number
}

interface QueryResult {
  success: boolean
  query: string
  status: 'success' | 'error'
  columns: ColumnInfo[]
  timestamp: string
  error?: string
  executionTimeMs?: number
}

/**
 * Query information_schema.columns for todos table using agent_exec_sql RPC
 */
async function queryTodosSchema(
  supabaseUrl: string,
  supabaseKey: string
): Promise<QueryResult> {
  const startTime = Date.now()
  const supabase = createClient(supabaseUrl, supabaseKey)

  const query = `
    SELECT 
      column_name, 
      data_type, 
      is_nullable, 
      column_default,
      ordinal_position
    FROM information_schema.columns 
    WHERE table_name = 'todos' 
    ORDER BY ordinal_position
  `

  const result: QueryResult = {
    success: false,
    query: query.trim(),
    status: 'error',
    columns: [],
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('📋 Querying information_schema.columns for todos table...\n')

    // Call agent_exec_sql RPC function with just the query parameter
    const { data, error } = await supabase.rpc('agent_exec_sql', {
      query: query.trim(),
    })

    if (error) {
      result.error = `RPC Error: ${error.message}`
      result.status = 'error'
      console.error('❌ Query execution failed:', result.error)
      return result
    }

    if (!data) {
      result.error = 'No data returned from RPC call'
      result.status = 'error'
      console.error('❌ No data returned')
      return result
    }

    // Parse the response - agent_exec_sql returns jsonb array
    let columnsArray: any[] = []

    if (Array.isArray(data) && data.length > 0) {
      // Check if the response is wrapped in the RPC format
      if (data[0] && typeof data[0] === 'object' && 'agent_exec_sql' in data[0]) {
        // Format: [{ agent_exec_sql: [...] }]
        columnsArray = Array.isArray(data[0].agent_exec_sql)
          ? data[0].agent_exec_sql
          : []
      } else if (Array.isArray(data[0])) {
        // Format: [[...]]
        columnsArray = data[0]
      } else {
        // Format: [{ column_name, data_type, ... }, ...]
        columnsArray = data
      }
    }

    if (!columnsArray || columnsArray.length === 0) {
      result.error = 'No columns returned from information_schema.columns'
      result.status = 'error'
      console.error('❌ Empty result set')
      return result
    }

    // Parse the columns
    const columns: ColumnInfo[] = columnsArray.map((item: any) => ({
      column_name: item.column_name || 'unknown',
      data_type: item.data_type || 'unknown',
      is_nullable: item.is_nullable || 'NO',
      column_default: item.column_default || null,
      ordinal_position: Number(item.ordinal_position) || 0,
    }))

    result.success = true
    result.status = 'success'
    result.columns = columns
    result.executionTimeMs = Date.now() - startTime

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    result.error = `Exception: ${errorMessage}`
    result.status = 'error'
    console.error('❌ Unexpected error:', result.error)
    return result
  }
}

/**
 * Format and display the results
 */
function displayResults(result: QueryResult): void {
  if (result.status === 'error') {
    console.error('\n❌ QUERY FAILED')
    console.error(`Error: ${result.error}`)
    return
  }

  console.log('\n✅ QUERY SUCCESSFUL\n')
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║         Information Schema - Todos Table Columns                   ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝\n')

  // Display as formatted table
  console.log('No. │ Column Name                 │ Data Type           │ Nullable │ Default')
  console.log('────┼─────────────────────────────┼─────────────────────┼──────────┼─────────────────')

  result.columns.forEach((col) => {
    const no = String(col.ordinal_position).padStart(2)
    const colName = (col.column_name || '').padEnd(27)
    const dataType = (col.data_type || '').padEnd(19)
    const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO'
    const defaultVal = col.column_default || '-'
    
    console.log(
      ` ${no} │ ${colName} │ ${dataType} │ ${nullable.padEnd(8)} │ ${defaultVal}`
    )
  })

  console.log('\n📊 Summary:')
  console.log(`   Total columns: ${result.columns.length}`)
  console.log(`   Nullable columns: ${result.columns.filter(c => c.is_nullable === 'YES').length}`)
  console.log(`   Columns with defaults: ${result.columns.filter(c => c.column_default !== null).length}`)

  console.log(`\n⏱️  Execution time: ${result.executionTimeMs}ms`)
  console.log(`📅 Timestamp: ${result.timestamp}`)
  console.log(`\n✨ Query executed via agent_exec_sql RPC\n`)
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🚀 Task: Query information_schema.columns for todos table\n')

  const result = await queryTodosSchema(supabaseUrl, supabaseKey)
  displayResults(result)

  if (!result.success) {
    process.exit(1)
  }

  process.exit(0)
}

// Execute
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
