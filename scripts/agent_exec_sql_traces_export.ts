/**
 * agent_exec_sql_traces_export.ts
 * 
 * Export traces table complete schema and row sample via agent_exec_sql()
 * 
 * This function demonstrates how to use agent_exec_sql() to:
 * 1. Retrieve complete table schema information
 * 2. Fetch sample rows with LIMIT 10
 * 3. Export data in both JSON and SQL formats
 * 4. Provide system visibility into agent tool execution traces
 */

import { createClient } from '@supabase/supabase-js'

// Define TypeScript interfaces for the traces table
interface TraceColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface TraceRow {
  id: string
  task_id: string | null
  agent_name: string | null
  tool_name: string
  input_summary: string | null
  result_summary: string | null
  duration_ms: number | null
  is_error: boolean | null
  created_at: string | null
}

interface TracesExportResult {
  success: boolean
  schema: {
    table_name: string
    columns: TraceColumn[]
    total_columns: number
    primary_key: string
  }
  sample_rows: TraceRow[]
  sample_count: number
  total_rows_estimate: number
  export_timestamp: string
  export_query: string
}

/**
 * Export traces table schema and sample rows
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase API key (service role for full access)
 * @param limit - Number of rows to fetch (default: 10)
 * @returns Promise<TracesExportResult>
 */
export async function agent_exec_sql_export_traces(
  supabaseUrl: string,
  supabaseKey: string,
  limit: number = 10
): Promise<TracesExportResult> {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Step 1: Get complete schema information via information_schema
    const { data: columns, error: columnError } = await supabase
      .rpc('agent_exec_sql', {
        query: `SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default 
        FROM information_schema.columns 
        WHERE table_name = 'traces' 
          AND table_schema = 'public'
        ORDER BY ordinal_position`
      })

    if (columnError) {
      throw new Error(`Failed to retrieve schema via agent_exec_sql: ${columnError.message}`)
    }

    // Step 2: Get sample rows via agent_exec_sql
    const { data: rows, error: rowError } = await supabase
      .rpc('agent_exec_sql', {
        query: `SELECT * FROM traces LIMIT ${limit}`
      })

    if (rowError) {
      throw new Error(`Failed to retrieve sample rows via agent_exec_sql: ${rowError.message}`)
    }

    // Step 3: Get total row count via agent_exec_sql
    const { data: countResult, error: countError } = await supabase
      .rpc('agent_exec_sql', {
        query: 'SELECT COUNT(*) as row_count FROM traces'
      })

    let totalRowCount = 0
    if (!countError && countResult && countResult.length > 0) {
      totalRowCount = (countResult[0] as Record<string, number>)?.row_count || 0
    }

    // Construct result
    const result: TracesExportResult = {
      success: true,
      schema: {
        table_name: 'traces',
        columns: (columns && columns.length > 0 ? columns[0] : []) as unknown as TraceColumn[],
        total_columns: columns && columns.length > 0 ? Object.keys(columns[0] as Record<string, unknown>).length : 0,
        primary_key: 'id'
      },
      sample_rows: (rows && rows.length > 0 ? rows[0] : []) as unknown as TraceRow[],
      sample_count: rows && rows.length > 0 && Array.isArray(rows[0]) ? (rows[0] as unknown[]).length : 0,
      total_rows_estimate: totalRowCount,
      export_timestamp: new Date().toISOString(),
      export_query: `SELECT * FROM traces LIMIT ${limit}`
    }

    return result
  } catch (error) {
    throw new Error(
      `agent_exec_sql_export_traces failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Export traces table data to CSV format
 * 
 * @param rows - Array of trace rows
 * @returns CSV string
 */
export function exportTracesAsCSV(rows: TraceRow[]): string {
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
        const value = row[header as keyof TraceRow]
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
 * Export traces table data to JSON format
 * 
 * @param result - Export result from agent_exec_sql_export_traces
 * @returns JSON string
 */
export function exportTracesAsJSON(result: TracesExportResult): string {
  return JSON.stringify(result, null, 2)
}

/**
 * Export traces schema as SQL CREATE TABLE statement
 * 
 * @param result - Export result from agent_exec_sql_export_traces
 * @returns SQL CREATE TABLE statement
 */
export function exportTracesSchemaAsSQL(result: TracesExportResult): string {
  const columns = result.schema.columns
    .map((col) => {
      const notNull = col.is_nullable === 'NO' ? ' NOT NULL' : ''
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : ''
      return `  ${col.column_name} ${col.data_type}${notNull}${defaultVal}`
    })
    .join(',\n')

  return `CREATE TABLE IF NOT EXISTS public.traces (
${columns},
  PRIMARY KEY (${result.schema.primary_key})
);`
}

/**
 * Format trace execution summary for human readability
 * 
 * @param rows - Array of trace rows
 * @returns Formatted string with execution statistics
 */
export function formatTracesExecutionSummary(rows: TraceRow[]): string {
  if (rows.length === 0) {
    return 'No traces to summarize'
  }

  const totalDuration = rows.reduce((sum, row) => sum + (row.duration_ms || 0), 0)
  const errorCount = rows.filter((row) => row.is_error).length
  const successCount = rows.length - errorCount
  const toolsUsed = new Set(rows.map((row) => row.tool_name))
  const agentsInvolved = new Set(rows.filter((row) => row.agent_name).map((row) => row.agent_name))

  return `
╔═══════════════════════════════════════════════════════════════╗
║                    TRACES EXECUTION SUMMARY                   ║
╠═══════════════════════════════════════════════════════════════╣
║ Total Traces Sampled:     ${String(rows.length).padEnd(40)} ║
║ Successful Executions:    ${String(successCount).padEnd(40)} ║
║ Failed Executions:        ${String(errorCount).padEnd(40)} ║
║ Total Duration (ms):      ${String(totalDuration).padEnd(40)} ║
║ Avg Duration per Trace:   ${String((totalDuration / rows.length).toFixed(2)).padEnd(40)} ║
║ Unique Tools Used:        ${String(toolsUsed.size).padEnd(40)} ║
║ Unique Agents Involved:   ${String(agentsInvolved.size).padEnd(40)} ║
╠═══════════════════════════════════════════════════════════════╣
║ Tools:                                                        ║
${Array.from(toolsUsed)
  .slice(0, 10)
  .map((tool) => `║   - ${tool.padEnd(57)} ║`)
  .join('\n')}
${toolsUsed.size > 10 ? `║   ... and ${toolsUsed.size - 10} more                           ║` : ''}
╠═══════════════════════════════════════════════════════════════╣
║ Agents:                                                       ║
${Array.from(agentsInvolved)
  .slice(0, 10)
  .map((agent) => `║   - ${agent?.padEnd(57) || 'unknown'.padEnd(57)} ║`)
  .join('\n')}
${agentsInvolved.size > 10 ? `║   ... and ${agentsInvolved.size - 10} more                           ║` : ''}
╚═══════════════════════════════════════════════════════════════╝
`
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
    console.log('🔍 Retrieving traces table schema and sample rows via agent_exec_sql()...\n')

    // Execute export
    const exportResult = await agent_exec_sql_export_traces(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY,
      10
    )

    console.log('✅ Export successful!')
    console.log(`   Schema columns: ${exportResult.schema.total_columns}`)
    console.log(`   Sample rows: ${exportResult.sample_count}`)
    console.log(`   Total rows (estimate): ${exportResult.total_rows_estimate}`)

    // Output execution summary
    console.log(formatTracesExecutionSummary(exportResult.sample_rows))

    // Output formats
    console.log('\n--- SCHEMA (SQL) ---')
    console.log(exportTracesSchemaAsSQL(exportResult))

    console.log('\n--- SAMPLE DATA (JSON) ---')
    console.log(JSON.stringify(exportResult.sample_rows, null, 2))

    console.log('\n--- CSV EXPORT ---')
    console.log(exportTracesAsCSV(exportResult.sample_rows))

    // Save to file
    const fs = await import('fs')
    const path = await import('path')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputDir = path.join(process.cwd(), 'scripts', 'agent-memory')
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const jsonFile = path.join(outputDir, `traces_export_${timestamp}.json`)
    fs.writeFileSync(jsonFile, exportTracesAsJSON(exportResult))
    console.log(`\n💾 JSON export saved to: ${jsonFile}`)

  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export default agent_exec_sql_export_traces
