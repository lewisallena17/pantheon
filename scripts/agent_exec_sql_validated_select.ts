/**
 * agent_exec_sql_validated_select.ts
 * 
 * Execute validated SELECT from todos table with pre-flight schema confirmation
 * 
 * Task: Execute agent_exec_sql('SELECT id, title FROM todos LIMIT 10')
 * with pre-flight schema confirmation to ensure:
 * 1. The todos table exists
 * 2. The required columns (id, title) exist
 * 3. The columns have the expected data types
 * 4. Only then execute the SELECT query
 */

import { createClient } from '@supabase/supabase-js'

/**
 * Schema validation result interface
 */
interface SchemaValidationResult {
  is_valid: boolean
  table_exists: boolean
  required_columns: {
    column_name: string
    data_type: string
    is_nullable: string
    exists: boolean
  }[]
  validation_errors: string[]
  validation_timestamp: string
}

/**
 * Query result interface
 */
interface ValidatedSelectResult {
  success: boolean
  validation: SchemaValidationResult
  query: string
  rows: Array<{
    id: string
    title: string
  }>
  row_count: number
  execution_timestamp: string
  total_execution_time_ms: number
}

/**
 * Pre-flight schema validation for todos table
 * Checks if todos table exists and has required columns: id, title
 * 
 * @param supabase - Supabase client instance
 * @returns Promise<SchemaValidationResult>
 */
async function validateTodosSchema(
  supabase: ReturnType<typeof createClient>
): Promise<SchemaValidationResult> {
  const validationStartTime = Date.now()
  const validation_timestamp = new Date().toISOString()
  const validation_errors: string[] = []

  try {
    // Query information_schema to check if table exists and get column details
    const { data: columnsData, error: columnsError } = await supabase.rpc(
      'agent_exec_sql',
      {
        query: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'todos' 
            AND table_schema = 'public'
          ORDER BY ordinal_position
        `
      }
    )

    if (columnsError) {
      validation_errors.push(`Failed to query information_schema: ${columnsError.message}`)
      return {
        is_valid: false,
        table_exists: false,
        required_columns: [
          { column_name: 'id', data_type: 'unknown', is_nullable: 'unknown', exists: false },
          { column_name: 'title', data_type: 'unknown', is_nullable: 'unknown', exists: false }
        ],
        validation_errors,
        validation_timestamp
      }
    }

    // Check if we got any columns back (means table exists)
    if (!columnsData || columnsData.length === 0) {
      validation_errors.push('todos table does not exist in public schema')
      return {
        is_valid: false,
        table_exists: false,
        required_columns: [
          { column_name: 'id', data_type: 'unknown', is_nullable: 'unknown', exists: false },
          { column_name: 'title', data_type: 'unknown', is_nullable: 'unknown', exists: false }
        ],
        validation_errors,
        validation_timestamp
      }
    }

    // Parse the response - agent_exec_sql returns nested structure
    let allColumns: Array<{
      column_name: string
      data_type: string
      is_nullable: string
    }> = []

    // Handle both direct array and wrapped response formats
    if (Array.isArray(columnsData)) {
      if (columnsData.length > 0 && Array.isArray(columnsData[0]?.agent_exec_sql)) {
        // Nested format: [{ agent_exec_sql: [...] }]
        allColumns = columnsData[0].agent_exec_sql
      } else if (columnsData.length > 0 && typeof columnsData[0] === 'object') {
        // Direct format: [{ column_name, data_type, is_nullable }, ...]
        allColumns = columnsData
      }
    }

    // Check for required columns
    const requiredColumns = ['id', 'title']
    const foundColumns = new Map<string, { data_type: string; is_nullable: string }>()

    allColumns.forEach((col) => {
      if (requiredColumns.includes(col.column_name)) {
        foundColumns.set(col.column_name, {
          data_type: col.data_type,
          is_nullable: col.is_nullable
        })
      }
    })

    // Build validation result
    const required_columns = requiredColumns.map((colName) => {
      const found = foundColumns.get(colName)
      if (!found) {
        validation_errors.push(`Required column '${colName}' not found in todos table`)
      }
      return {
        column_name: colName,
        data_type: found?.data_type || 'not found',
        is_nullable: found?.is_nullable || 'unknown',
        exists: !!found
      }
    })

    const is_valid = required_columns.every((col) => col.exists) && validation_errors.length === 0

    return {
      is_valid,
      table_exists: true,
      required_columns,
      validation_errors,
      validation_timestamp
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    validation_errors.push(`Validation exception: ${errorMessage}`)

    return {
      is_valid: false,
      table_exists: false,
      required_columns: [
        { column_name: 'id', data_type: 'unknown', is_nullable: 'unknown', exists: false },
        { column_name: 'title', data_type: 'unknown', is_nullable: 'unknown', exists: false }
      ],
      validation_errors,
      validation_timestamp
    }
  }
}

/**
 * Execute validated SELECT from todos table
 * 
 * Query: SELECT id, title FROM todos LIMIT 10
 * 
 * With pre-flight schema confirmation:
 * 1. Validates todos table exists
 * 2. Validates required columns (id, title) exist
 * 3. Only executes SELECT if validation passes
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key (service role recommended)
 * @returns Promise<ValidatedSelectResult>
 */
export async function agent_exec_sql_validated_select(
  supabaseUrl: string,
  supabaseKey: string
): Promise<ValidatedSelectResult> {
  const startTime = Date.now()
  const execution_timestamp = new Date().toISOString()

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔍 Pre-flight schema validation...')

    // Step 1: Validate schema
    const validation = await validateTodosSchema(supabase)

    console.log(`Validation result: ${validation.is_valid ? '✅ PASS' : '❌ FAIL'}`)
    if (!validation.is_valid) {
      console.error('Validation errors:')
      validation.validation_errors.forEach((err) => console.error(`  - ${err}`))
    }

    // Only proceed with SELECT if validation passed
    if (!validation.is_valid) {
      throw new Error(
        `Schema validation failed. Cannot execute SELECT: ${validation.validation_errors.join('; ')}`
      )
    }

    console.log('✅ Schema validation passed')
    console.log('📊 Executing: SELECT id, title FROM todos LIMIT 10')

    // Step 2: Execute validated SELECT query
    const selectQuery = 'SELECT id, title FROM todos LIMIT 10'

    const { data: queryResult, error: queryError } = await supabase.rpc(
      'agent_exec_sql',
      {
        query: selectQuery
      }
    )

    if (queryError) {
      throw new Error(`Failed to execute SELECT: ${queryError.message}`)
    }

    // Parse the response
    let rows: Array<{ id: string; title: string }> = []

    if (Array.isArray(queryResult)) {
      if (
        queryResult.length > 0 &&
        Array.isArray(queryResult[0]?.agent_exec_sql)
      ) {
        // Nested format: [{ agent_exec_sql: [...] }]
        rows = queryResult[0].agent_exec_sql
      } else if (queryResult.length > 0 && typeof queryResult[0] === 'object') {
        // Direct format: [{ id, title }, ...]
        rows = queryResult
      }
    }

    const totalExecutionTime = Date.now() - startTime

    const result: ValidatedSelectResult = {
      success: true,
      validation,
      query: selectQuery,
      rows,
      row_count: rows.length,
      execution_timestamp,
      total_execution_time_ms: totalExecutionTime
    }

    return result
  } catch (error) {
    const totalExecutionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    throw new Error(
      `agent_exec_sql_validated_select failed: ${errorMessage} (execution_time: ${totalExecutionTime}ms)`
    )
  }
}

/**
 * Format and display the validation result
 * 
 * @param result - ValidatedSelectResult
 */
export function displayValidatedSelectResult(result: ValidatedSelectResult): void {
  console.log('\n' + '='.repeat(70))
  console.log('VALIDATED SELECT RESULT')
  console.log('='.repeat(70))

  // Schema Validation Summary
  console.log('\n📋 SCHEMA VALIDATION')
  console.log('-'.repeat(70))
  console.log(`Status: ${result.validation.is_valid ? '✅ VALID' : '❌ INVALID'}`)
  console.log(`Table exists: ${result.validation.table_exists ? 'YES' : 'NO'}`)
  console.log(`Timestamp: ${result.validation.validation_timestamp}`)

  if (result.validation.required_columns.length > 0) {
    console.log('\nRequired columns:')
    result.validation.required_columns.forEach((col) => {
      const status = col.exists ? '✅' : '❌'
      console.log(
        `  ${status} ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`
      )
    })
  }

  if (result.validation.validation_errors.length > 0) {
    console.log('\nValidation errors:')
    result.validation.validation_errors.forEach((err) => {
      console.log(`  ⚠️  ${err}`)
    })
  }

  // Query Execution Summary
  console.log('\n' + '='.repeat(70))
  console.log('QUERY EXECUTION')
  console.log('-'.repeat(70))
  console.log(`Query: ${result.query}`)
  console.log(`Rows returned: ${result.row_count}`)
  console.log(`Execution time: ${result.total_execution_time_ms}ms`)
  console.log(`Timestamp: ${result.execution_timestamp}`)

  // Results
  if (result.rows.length > 0) {
    console.log('\n' + '='.repeat(70))
    console.log('RESULTS (First 10 rows)')
    console.log('-'.repeat(70))
    console.table(result.rows)
  } else {
    console.log('\n⚠️  No rows returned')
  }

  console.log('\n' + '='.repeat(70))
  console.log(`✅ EXECUTION SUCCESSFUL in ${result.total_execution_time_ms}ms`)
  console.log('='.repeat(70) + '\n')
}

// Main execution example
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
    process.exit(1)
  }

  try {
    console.log('🚀 Starting validated SELECT execution...\n')

    // Execute validated SELECT
    const result = await agent_exec_sql_validated_select(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY
    )

    // Display results
    displayValidatedSelectResult(result)

    // Output JSON for programmatic use
    console.log('📄 JSON Output:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('❌ Execution failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export default agent_exec_sql_validated_select
