/**
 * query-todos-grouped-by-status.ts
 * 
 * Query all todos grouped by status and log the counts using agent_exec_sql
 * 
 * This script:
 * 1. Queries the todos table grouped by status
 * 2. Logs the status distribution
 * 3. Records the query execution in agent_sql_execution_log
 */

import { createClient } from '@supabase/supabase-js'

interface TodoStatusCount {
  status: string
  count: number
}

interface QueryResult {
  success: boolean
  query: string
  execution_status: 'success' | 'error'
  results: TodoStatusCount[]
  total_todos: number
  timestamp: string
  error?: string
}

/**
 * Query todos grouped by status using agent_exec_sql RPC
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key (service role for full access)
 * @returns Promise<QueryResult>
 */
export async function queryTodosByStatus(
  supabaseUrl: string,
  supabaseKey: string
): Promise<QueryResult> {
  const startTime = Date.now()
  const supabase = createClient(supabaseUrl, supabaseKey)

  const query = `
    SELECT 
      status,
      COUNT(*) as count 
    FROM todos 
    GROUP BY status 
    ORDER BY count DESC, status ASC
  `

  const result: QueryResult = {
    success: false,
    query,
    execution_status: 'error',
    results: [],
    total_todos: 0,
    timestamp: new Date().toISOString(),
  }

  try {
    console.log('Executing query:', query)

    // Call agent_exec_sql RPC function
    const { data, error } = await supabase.rpc('agent_exec_sql', {
      query,
    })

    if (error) {
      result.error = `RPC Error: ${error.message}`
      result.execution_status = 'error'
      console.error('❌ Query execution failed:', result.error)
      return result
    }

    if (!data || data.length === 0) {
      result.error = 'No data returned from query'
      result.execution_status = 'error'
      console.error('❌ No data returned')
      return result
    }

    // Extract results from nested response structure
    // agent_exec_sql returns data in format: [{ agent_exec_sql: [...] }]
    const resultsArray = Array.isArray(data[0]?.agent_exec_sql)
      ? data[0].agent_exec_sql
      : data

    const statusCounts: TodoStatusCount[] = resultsArray.map(
      (item: any) => ({
        status: item.status || 'unknown',
        count: Number(item.count) || 0,
      })
    )

    // Calculate total todos
    const totalTodos = statusCounts.reduce((sum, item) => sum + item.count, 0)

    result.success = true
    result.execution_status = 'success'
    result.results = statusCounts
    result.total_todos = totalTodos

    // Log results
    console.log('\n✅ Query executed successfully!\n')
    console.log('=== Todos Grouped by Status ===')
    statusCounts.forEach((item) => {
      const percentage = ((item.count / totalTodos) * 100).toFixed(1)
      console.log(`  ${item.status.padEnd(15)} : ${String(item.count).padStart(3)} (${percentage.padStart(5)}%)`)
    })
    console.log(`  ${'─'.repeat(40)}`)
    console.log(`  ${'Total'.padEnd(15)} : ${String(totalTodos).padStart(3)}`)
    console.log()

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    result.error = `Exception: ${errorMessage}`
    result.execution_status = 'error'
    console.error('❌ Unexpected error:', result.error)
    return result
  } finally {
    const executionTime = Date.now() - startTime

    // Log execution to database
    await logExecutionResult(supabase, query, result, executionTime)
  }
}

/**
 * Log the query execution to agent_sql_execution_log table
 * 
 * @param supabase - Supabase client
 * @param query - SQL query that was executed
 * @param result - Query result
 * @param executionTime - Time taken to execute (ms)
 */
async function logExecutionResult(
  supabase: any,
  query: string,
  result: QueryResult,
  executionTime: number
): Promise<void> {
  try {
    const logEntry = {
      query: query.trim(),
      execution_status: result.execution_status,
      result_summary: result.success
        ? `Successfully retrieved ${result.total_todos} todos in ${result.results.length} status groups`
        : result.error,
      rows_affected: result.total_todos,
      execution_time_ms: executionTime,
      error_code: result.success ? null : 'QUERY_FAILED',
      error_message: result.error || null,
      error_context: result.success
        ? { status_groups: result.results.length }
        : { query_error: result.error },
      agent_name: 'task-dashboard-agent',
      tool_name: 'agent_exec_sql',
      input_params: { grouping: 'status', ordering: 'count DESC' },
    }

    const { error: logError } = await supabase
      .from('agent_sql_execution_log')
      .insert([logEntry])

    if (logError) {
      console.warn('⚠️ Failed to log execution result:', logError.message)
    } else {
      console.log('📝 Execution logged to agent_sql_execution_log')
    }
  } catch (error) {
    console.warn('⚠️ Error during logging:', error)
  }
}

/**
 * Main execution function
 */
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    process.exit(1)
  }

  console.log('🔍 Querying todos grouped by status using agent_exec_sql...\n')

  try {
    const result = await queryTodosByStatus(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (result.success) {
      console.log('Result Summary:')
      console.log(`  - Status groups: ${result.results.length}`)
      console.log(`  - Total todos: ${result.total_todos}`)
      console.log(`  - Execution time: ${result.timestamp}`)
      process.exit(0)
    } else {
      console.error('Failed to query todos')
      process.exit(1)
    }
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { queryTodosByStatus, QueryResult, TodoStatusCount }
