/**
 * agent_exec_sql_todos_export.ts
 * 
 * Export todos table complete schema and row sample via agent_exec_sql()
 * 
 * This function demonstrates how to use agent_exec_sql() to:
 * 1. Retrieve complete table schema information
 * 2. Fetch sample rows with LIMIT 10
 * 3. Export data in both JSON and SQL formats
 */

import { createClient } from '@supabase/supabase-js'

// Define TypeScript interfaces for the todos table
interface TodoColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface TodoRow {
  id: string
  title: string
  status: string
  priority: string
  assigned_agent: string | null
  updated_at: string
  created_at: string
  description: string
  metadata: Record<string, unknown>
  comments: unknown[]
  retry_count: number | null
  is_boss: boolean | null
  deadline: string | null
}

interface TodosExportResult {
  success: boolean
  schema: {
    table_name: string
    columns: TodoColumn[]
    total_columns: number
    primary_key: string
  }
  sample_rows: TodoRow[]
  sample_count: number
  total_rows_estimate: number
  export_timestamp: string
  export_query: string
}

/**
 * Export todos table schema and sample rows
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key (service role for full access)
 * @param limit - Number of rows to fetch (default: 10)
 * @returns Promise<TodosExportResult>
 */
export async function agent_exec_sql_export_todos(
  supabaseUrl: string,
  supabaseKey: string,
  limit: number = 10
): Promise<TodosExportResult> {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Step 1: Get complete schema information
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      'query_information_schema',
      {
        table_name: 'todos'
      }
    )

    if (schemaError) {
      // Fallback: Manual schema retrieval from information_schema
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'todos')
        .eq('table_schema', 'public')

      if (columnError) {
        throw new Error(`Failed to retrieve schema: ${columnError.message}`)
      }

      // Step 2: Get sample rows
      const { data: rows, error: rowError } = await supabase
        .from('todos')
        .select('*')
        .limit(limit)

      if (rowError) {
        throw new Error(`Failed to retrieve sample rows: ${rowError.message}`)
      }

      // Step 3: Get total row count
      const { count, error: countError } = await supabase
        .from('todos')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.warn(`Failed to get row count: ${countError.message}`)
      }

      // Construct result
      const result: TodosExportResult = {
        success: true,
        schema: {
          table_name: 'todos',
          columns: columns as TodoColumn[],
          total_columns: columns?.length || 0,
          primary_key: 'id'
        },
        sample_rows: (rows as TodoRow[]) || [],
        sample_count: rows?.length || 0,
        total_rows_estimate: count || 0,
        export_timestamp: new Date().toISOString(),
        export_query: `SELECT * FROM todos LIMIT ${limit}`
      }

      return result
    }

    // If schemaData was successful, use it
    const { data: rows, error: rowError } = await supabase
      .from('todos')
      .select('*')
      .limit(limit)

    if (rowError) {
      throw new Error(`Failed to retrieve sample rows: ${rowError.message}`)
    }

    const { count, error: countError } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.warn(`Failed to get row count: ${countError.message}`)
    }

    const result: TodosExportResult = {
      success: true,
      schema: {
        table_name: 'todos',
        columns: schemaData as TodoColumn[],
        total_columns: schemaData?.length || 0,
        primary_key: 'id'
      },
      sample_rows: (rows as TodoRow[]) || [],
      sample_count: rows?.length || 0,
      total_rows_estimate: count || 0,
      export_timestamp: new Date().toISOString(),
      export_query: `SELECT * FROM todos LIMIT ${limit}`
    }

    return result
  } catch (error) {
    throw new Error(
      `agent_exec_sql_export_todos failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Export todos table data to CSV format
 * 
 * @param rows - Array of todo rows
 * @returns CSV string
 */
export function exportTodosAsCSV(rows: TodoRow[]): string {
  if (rows.length === 0) {
    return 'No data to export'
  }

  // Extract headers from first row
  const headers = Object.keys(rows[0])
  const csvHeader = headers.join(',')

  // Convert rows to CSV
  const csvRows = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header as keyof TodoRow]
        // Escape quotes and wrap in quotes if needed
        if (value === null || value === undefined) {
          return ''
        }
        const stringValue = String(value)
        return `"${stringValue.replace(/"/g, '""')}"`
      })
      .join(',')
  )

  return [csvHeader, ...csvRows].join('\n')
}

/**
 * Export todos table data to JSON format
 * 
 * @param result - Export result from agent_exec_sql_export_todos
 * @returns JSON string
 */
export function exportTodosAsJSON(result: TodosExportResult): string {
  return JSON.stringify(result, null, 2)
}

/**
 * Export todos schema as SQL CREATE TABLE statement
 * 
 * @param result - Export result from agent_exec_sql_export_todos
 * @returns SQL CREATE TABLE statement
 */
export function exportTodosSchemaAsSQL(result: TodosExportResult): string {
  const columns = result.schema.columns
    .map((col) => {
      const notNull = col.is_nullable === 'NO' ? ' NOT NULL' : ''
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      return `  ${col.column_name} ${col.data_type}${notNull}${defaultVal}`
    })
    .join(',\n')

  return `CREATE TABLE IF NOT EXISTS public.todos (
${columns},
  PRIMARY KEY (${result.schema.primary_key})
);`
}

// Main execution example
async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || ''
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  try {
    console.log('Exporting todos table schema and sample rows...')

    // Execute export
    const exportResult = await agent_exec_sql_export_todos(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      10
    )

    console.log('\n✅ Export successful!')
    console.log(`Schema columns: ${exportResult.schema.total_columns}`)
    console.log(`Sample rows: ${exportResult.sample_count}`)
    console.log(`Total rows (estimate): ${exportResult.total_rows_estimate}`)

    // Output formats
    console.log('\n--- JSON Export ---')
    console.log(exportTodosAsJSON(exportResult))

    console.log('\n--- SQL Schema ---')
    console.log(exportTodosSchemaAsSQL(exportResult))

    console.log('\n--- CSV Export ---')
    console.log(exportTodosAsCSV(exportResult.sample_rows))
  } catch (error) {
    console.error('Export failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export default agent_exec_sql_export_todos
