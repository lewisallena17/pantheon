#!/usr/bin/env node

/**
 * execute-todos-category-wins.ts
 * 
 * Execute aggregate query on todos table:
 * SELECT category, COUNT(*) as total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as wins 
 * FROM todos GROUP BY category ORDER BY wins DESC
 * 
 * This script directly calls agent_exec_sql via Supabase RPC
 * and logs the results with win rate analytics.
 */

import { createClient } from '@supabase/supabase-js'

interface CategoryWins {
  category: string
  total: number
  wins: number
  winRate: number
}

interface ExecutionResult {
  success: boolean
  query: string
  status: 'success' | 'error'
  results: CategoryWins[]
  totalTasks: number
  totalWins: number
  overallWinRate: number
  timestamp: string
  error?: string
  executionTimeMs?: number
}

/**
 * Execute the todos category wins query using agent_exec_sql RPC
 */
async function executeTodosCategoryWins(
  supabaseUrl: string,
  supabaseKey: string
): Promise<ExecutionResult> {
  const startTime = Date.now()
  const supabase = createClient(supabaseUrl, supabaseKey)

  const query = `SELECT category, COUNT(*) as total, SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) as wins FROM todos GROUP BY category ORDER BY wins DESC`

  const result: ExecutionResult = {
    success: false,
    query,
    status: 'error',
    results: [],
    totalTasks: 0,
    totalWins: 0,
    overallWinRate: 0,
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
        // Format: [{ category, total, wins }, ...]
        resultsArray = data
      }
    }

    if (!resultsArray || resultsArray.length === 0) {
      result.error = 'No category rows returned from query'
      result.status = 'error'
      console.error('❌ Empty result set')
      return result
    }

    // Parse the results
    const categoryWins: CategoryWins[] = resultsArray.map((item: any) => {
      const total = Number(item.total) || 0
      const wins = Number(item.wins) || 0
      const winRate = total > 0 ? (wins / total) * 100 : 0

      return {
        category: item.category || 'unknown',
        total,
        wins,
        winRate,
      }
    })

    // Calculate totals
    const totalTasks = categoryWins.reduce((sum, item) => sum + item.total, 0)
    const totalWins = categoryWins.reduce((sum, item) => sum + item.wins, 0)
    const overallWinRate = totalTasks > 0 ? (totalWins / totalTasks) * 100 : 0

    result.success = true
    result.status = 'success'
    result.results = categoryWins
    result.totalTasks = totalTasks
    result.totalWins = totalWins
    result.overallWinRate = overallWinRate
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
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║     Todos Grouped by Category with Win Rates              ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  const maxCategoryLength = Math.max(
    ...result.results.map(r => r.category.length),
    'CATEGORY'.length
  )

  // Header
  console.log(
    `  ${'CATEGORY'.padEnd(maxCategoryLength)}  │  Total  │  Wins  │  Win Rate`
  )
  console.log(
    `  ${'-'.repeat(maxCategoryLength)}  ├────────┼────────┤────────────`
  )

  // Data rows
  result.results.forEach((item) => {
    const categoryPadded = item.category.padEnd(maxCategoryLength)
    const totalPadded = String(item.total).padStart(5)
    const winsPadded = String(item.wins).padStart(5)
    const winRatePadded = item.winRate.toFixed(1).padStart(6)
    console.log(
      `  ${categoryPadded}  │${totalPadded}  │${winsPadded}  │  ${winRatePadded}%`
    )
  })

  // Footer
  console.log(
    `  ${'-'.repeat(maxCategoryLength)}  ├────────┼────────┤────────────`
  )
  const totalTasksPadded = String(result.totalTasks).padStart(5)
  const totalWinsPadded = String(result.totalWins).padStart(5)
  const overallRatePadded = result.overallWinRate.toFixed(1).padStart(6)
  console.log(
    `  ${'TOTAL'.padEnd(maxCategoryLength)}  │${totalTasksPadded}  │${totalWinsPadded}  │  ${overallRatePadded}%`
  )

  console.log(`\n📊 Summary:`)
  console.log(`   Total Tasks: ${result.totalTasks}`)
  console.log(`   Total Wins (done): ${result.totalWins}`)
  console.log(`   Overall Win Rate: ${result.overallWinRate.toFixed(2)}%`)
  console.log(`   Categories: ${result.results.length}`)

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

  console.log('🚀 Task: Execute category wins analysis on todos table\n')

  const result = await executeTodosCategoryWins(supabaseUrl, supabaseKey)
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
