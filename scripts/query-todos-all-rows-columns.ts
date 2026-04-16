/**
 * query-todos-all-rows-columns.ts
 * 
 * Query todos table for all rows and columns via agent_exec_sql RPC function.
 * This script demonstrates how to fetch the complete todos table dataset.
 * 
 * Usage: npx ts-node scripts/query-todos-all-rows-columns.ts
 * 
 * Executes:
 * SELECT * FROM todos
 * 
 * Returns all rows and all columns in JSON format.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

interface TodosQueryResult {
  metadata: {
    timestamp: string
    execution_method: string
    query: string
    status: string
  }
  data: {
    row_count: number
    rows: Record<string, unknown>[]
  }
  execution_time_ms?: number
}

/**
 * Query todos table for all rows and columns via agent_exec_sql
 */
async function queryTodosAllRowsColumns(
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>[]> {
  console.log('📊 Querying todos table for all rows and columns via agent_exec_sql()...')

  const startTime = performance.now()
  const query = `SELECT * FROM todos`

  try {
    const { data, error } = await supabase.rpc('agent_exec_sql', { query })

    if (error) {
      throw new Error(`Query failed: ${error.message}`)
    }

    if (!data) {
      console.warn('⚠️  No data returned from query')
      return []
    }

    const endTime = performance.now()
    const executionTime = endTime - startTime

    // The RPC returns data in nested array format: [[{...}, {...}]]
    // Extract the first element which contains the actual rows
    const rows = Array.isArray(data) && data.length > 0 ? data[0] : data

    if (!Array.isArray(rows)) {
      console.warn('⚠️  Unexpected response format')
      return []
    }

    console.log(`✅ Query completed in ${executionTime.toFixed(2)}ms`)
    console.log(`📈 Retrieved ${rows.length} rows`)

    return rows
  } catch (error) {
    console.error(`❌ Query failed: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

/**
 * Get row count for validation
 */
async function getTodosCount(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const countQuery = `SELECT COUNT(*) as row_count FROM todos`

  const { data, error } = await supabase.rpc('agent_exec_sql', { query: countQuery })

  if (error) {
    console.warn(`⚠️  Count query warning: ${error.message}`)
    return 0
  }

  if (!data || data.length === 0) {
    return 0
  }

  // Extract count from nested response: [[{row_count: N}]]
  const result = Array.isArray(data) && data.length > 0 ? data[0] : data
  const countResult = Array.isArray(result) && result.length > 0 ? result[0] : result

  return countResult?.row_count || 0
}

/**
 * Display query results in console
 */
function displayResults(result: TodosQueryResult): void {
  console.log('\n' + '='.repeat(80))
  console.log('TODOS TABLE QUERY RESULTS')
  console.log('='.repeat(80))

  console.log('\n📋 Metadata:')
  console.log(`  • Timestamp: ${result.metadata.timestamp}`)
  console.log(`  • Method: ${result.metadata.execution_method}`)
  console.log(`  • Query: ${result.metadata.query}`)
  console.log(`  • Status: ${result.metadata.status}`)
  if (result.execution_time_ms) {
    console.log(`  • Execution Time: ${result.execution_time_ms.toFixed(2)}ms`)
  }

  console.log(`\n📊 Data Summary:`)
  console.log(`  • Total Rows: ${result.data.row_count}`)

  if (result.data.rows.length === 0) {
    console.log('\n⚠️  No rows found in todos table')
    return
  }

  // Display column headers
  const columns = Object.keys(result.data.rows[0])
  console.log(`  • Columns (${columns.length}): ${columns.join(', ')}`)

  // Display sample rows
  console.log('\n📋 Sample Rows (showing first 5):')
  result.data.rows.slice(0, 5).forEach((row, idx) => {
    console.log(`\n  Row ${idx + 1}:`)
    Object.entries(row).forEach(([key, value]) => {
      let displayValue: string
      if (value === null) {
        displayValue = 'NULL'
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value)
      } else {
        displayValue = String(value).substring(0, 100)
      }
      console.log(`    • ${key}: ${displayValue}`)
    })
  })

  if (result.data.rows.length > 5) {
    console.log(`\n  ... and ${result.data.rows.length - 5} more rows`)
  }

  console.log('\n' + '='.repeat(80))
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('\n🚀 Starting todos table query via agent_exec_sql()...\n')

    // Execute queries
    const [rows, rowCount] = await Promise.all([
      queryTodosAllRowsColumns(supabase),
      getTodosCount(supabase)
    ])

    // Construct result
    const result: TodosQueryResult = {
      metadata: {
        timestamp: new Date().toISOString(),
        execution_method: 'agent_exec_sql RPC',
        query: 'SELECT * FROM todos',
        status: 'success'
      },
      data: {
        row_count: rows.length,
        rows
      },
      execution_time_ms: undefined
    }

    // Display results
    displayResults(result)

    // Save to JSON file
    const outputPath = path.join(
      __dirname,
      'query-todos-all-rows-columns.json'
    )
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
    console.log(`\n💾 Full query results saved to: ${outputPath}`)

    console.log(`\n✨ Query complete! Retrieved ${rows.length} rows from todos table.\n`)
  } catch (error) {
    console.error('\n❌ Query failed:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { queryTodosAllRowsColumns, getTodosCount }
