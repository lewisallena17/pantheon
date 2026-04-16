#!/usr/bin/env node

/**
 * execute-todos-status-count.ts
 * 
 * Execute concrete SELECT query on todos table:
 * SELECT status, COUNT(*) as count FROM todos GROUP BY status
 * 
 * This script directly calls agent_exec_sql via Supabase RPC
 * and logs the results.
 */

import { createClient } from '@supabase/supabase-js'

interface StatusCount {
  status: string
  count: number
}

interface ExecutionResult {
  success: boolean
  query: string
  status: 'success' | 'error'
  results: StatusCount[]
  totalCount: number
  timestamp: string
  error?: string
  executionTimeMs?: number
}

/**
 * Execute the todos status count query using agent_exec_sql RPC
 */
async function executeTodosStatusCount(
  supabaseUrl: string,
  supabaseKey: string
): Promise<ExecutionResult> {
  const startTime = Date.now()
  const supabase = createClient(supabaseUrl, supabaseKey)

  const query = `SELECT status, COUNT(*) as count FROM todos GROUP BY status ORDER BY count DESC, status ASC`

  const result: ExecutionResult = {
    success: false,
    query,
    status: 'error',
    results: [],
    totalCount: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('📋 Executing query via agent_exec_sql RPC...')
    console.log(`Query: ${query}\n`)

    // Call agent_exec_sql RPC function with just the query parameter
    const { data, error } = await supabase.rpc('agent_exec_sql', {
      query,
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

    console.log('📦 Raw response structure:', JSON.stringify(data, null, 2))

    // Extract results from the response
    // agent_exec_sql returns data as an array with the query results
    let resultsArray: any[] = []

    if (Array.isArray(data) && data.length > 0) {
      // Check if the response is wrapped in the RPC format
      if (data[0] && typeof data[0] === 'object' && 'agent_exec_sql' in data[0]) {
        // Format: [{ agent_exec_sql: [...] }]
        resultsArray = Array.isArray(data[0].agent_exec_sql)
          ? data[0].agent_exec_sql
          : []
      } else if (Array.isArray(data[0])) {
        // Format: [[...]]
        resultsArray = data[0]
      } else {
        // Format: [{ status, count }, ...]
        resultsArray = data
      }
    }

    if (!resultsArray || resultsArray.length === 0) {
      result.error = 'No status rows returned from query'
      result.status = 'error'
      console.error('❌ Empty result set')
      return result
    }

    // Parse the results
    const statusCounts: StatusCount[] = resultsArray.map((item: any) => ({
      status: item.status || 'unknown',
      count: Number(item.count) || 0,
    }))

    // Calculate total
    const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0)

    result.success = true
    result.status = 'success'
    result.results = statusCounts
    result.totalCount = totalCount
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
function displayResults(result: ExecutionResult): void {
  if (result.status === 'error') {
    console.error('\n❌ EXECUTION FAILED')
    console.error(`Error: ${result.error}`)
    return
  }

  console.log('\n✅ EXECUTION SUCCESSFUL\n')
  console.log('╔════════════════════════════════════════╗')
  console.log('║     Todos Grouped by Status            ║')
  console.log('╚════════════════════════════════════════╝\n')

  const maxStatusLength = Math.max(...result.results.map(r => r.status.length))

  result.results.forEach((item) => {
    const percentage = ((item.count / result.totalCount) * 100).toFixed(1)
    const statusPadded = item.status.padEnd(maxStatusLength)
    const countPadded = String(item.count).padStart(4)
    console.log(
      `  ${statusPadded}  │  Count: ${countPadded}  │  ${percentage.padStart(5)}%`
    )
  })

  console.log(
    `  ${'-'.repeat(maxStatusLength)}  ├──────────────────┤`
  )
  const totalPadded = String(result.totalCount).padStart(4)
  console.log(
    `  ${'TOTAL'.padEnd(maxStatusLength)}  │  Count: ${totalPadded}  │  100.0%`
  )

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

  console.log('🚀 Task: Execute concrete SELECT on todos table\n')

  const result = await executeTodosStatusCount(supabaseUrl, supabaseKey)
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
