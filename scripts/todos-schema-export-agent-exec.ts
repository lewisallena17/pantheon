/**
 * todos-schema-export-agent-exec.ts
 * 
 * Export todos table complete schema with sample rows via agent_exec_sql()
 * 
 * This demonstrates proper usage of the agent_exec_sql() function exposed by Supabase
 * to retrieve schema metadata and sample data from the todos table.
 * 
 * Usage:
 *   npx ts-node scripts/todos-schema-export-agent-exec.ts
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Interface representing a column from information_schema
 */
interface SchemaColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position?: number;
}

/**
 * Interface representing a todo row
 */
interface TodoRow {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigned_agent: string | null;
  updated_at: string;
  created_at: string;
  description: string;
  metadata: Record<string, any>;
  comments: any[];
  retry_count: number | null;
  is_boss: boolean | null;
  deadline: string | null;
}

/**
 * Interface for the complete export result
 */
interface TodosSchemaExport {
  success: boolean;
  timestamp: string;
  schema: {
    table_name: string;
    columns: SchemaColumn[];
    total_columns: number;
    primary_key: string;
    row_count: number;
  };
  sample_data: {
    rows: TodoRow[];
    limit: number;
    actual_count: number;
  };
  queries_used: {
    schema_query: string;
    sample_rows_query: string;
    row_count_query: string;
  };
}

/**
 * Execute a query via agent_exec_sql RPC and parse the result
 * 
 * @param supabase - Supabase client instance
 * @param query - SQL SELECT query to execute
 * @returns Parsed result array
 */
async function executeViaAgentExecSql(
  supabase: any,
  query: string
): Promise<any[]> {
  console.log(`  Executing: ${query.substring(0, 80)}...`);

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    query,
  });

  if (error) {
    throw new Error(
      `agent_exec_sql failed: ${error.message} (details: ${JSON.stringify(error)})`
    );
  }

  // agent_exec_sql returns results nested in an array
  // The actual query result is typically in data[0]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No data returned from query: ${query}`);
  }

  // Extract the actual result array from the RPC response
  const result = data[0];
  if (!Array.isArray(result)) {
    console.warn(
      `WARNING: Result is not an array. Raw structure:`,
      JSON.stringify(result).substring(0, 200)
    );
    return Array.isArray(result) ? result : [result];
  }

  return result;
}

/**
 * Export todos table schema and sample rows via agent_exec_sql
 * 
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Service role key for full access
 * @param sampleLimit - Number of sample rows to fetch (default: 10)
 * @returns Promise<TodosSchemaExport>
 */
async function exportTodosSchemaViaAgentExecSql(
  supabaseUrl: string,
  supabaseKey: string,
  sampleLimit: number = 10
): Promise<TodosSchemaExport> {
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(
    "\n📋 Exporting todos table schema via agent_exec_sql()...\n"
  );

  try {
    // Query 1: Get schema information from information_schema
    console.log("Step 1: Retrieving schema columns from information_schema...");
    const schemaQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default, 
        ordinal_position
      FROM information_schema.columns 
      WHERE table_name = 'todos' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const schemaColumns = (await executeViaAgentExecSql(
      supabase,
      schemaQuery
    )) as SchemaColumn[];

    if (!schemaColumns || schemaColumns.length === 0) {
      throw new Error("No schema columns returned from information_schema");
    }

    console.log(`  ✓ Retrieved ${schemaColumns.length} columns\n`);

    // Query 2: Get sample rows
    console.log(`Step 2: Retrieving sample rows (LIMIT ${sampleLimit})...`);
    const sampleRowsQuery = `SELECT * FROM todos LIMIT ${sampleLimit}`;

    const sampleRows = (await executeViaAgentExecSql(
      supabase,
      sampleRowsQuery
    )) as TodoRow[];

    console.log(`  ✓ Retrieved ${sampleRows.length} sample rows\n`);

    // Query 3: Get total row count
    console.log("Step 3: Retrieving total row count...");
    const rowCountQuery = `SELECT COUNT(*) as total_rows FROM todos`;

    const rowCountResult = (await executeViaAgentExecSql(
      supabase,
      rowCountQuery
    )) as Array<{ total_rows: number }>;

    const totalRows = rowCountResult[0]?.total_rows || 0;
    console.log(`  ✓ Total rows in table: ${totalRows}\n`);

    // Construct the export result
    const exportResult: TodosSchemaExport = {
      success: true,
      timestamp: new Date().toISOString(),
      schema: {
        table_name: "todos",
        columns: schemaColumns,
        total_columns: schemaColumns.length,
        primary_key: "id",
        row_count: totalRows,
      },
      sample_data: {
        rows: sampleRows,
        limit: sampleLimit,
        actual_count: sampleRows.length,
      },
      queries_used: {
        schema_query: schemaQuery.trim(),
        sample_rows_query: sampleRowsQuery,
        row_count_query: rowCountQuery,
      },
    };

    return exportResult;
  } catch (error) {
    throw new Error(
      `Export failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Format and display the export result
 */
function displayExportResult(result: TodosSchemaExport): void {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("                   TODOS TABLE EXPORT SUMMARY");
  console.log("═══════════════════════════════════════════════════════════\n");

  // Schema Summary
  console.log("📊 SCHEMA INFORMATION:");
  console.log(`   Table:      ${result.schema.table_name}`);
  console.log(`   Columns:    ${result.schema.total_columns}`);
  console.log(`   Primary Key: ${result.schema.primary_key}`);
  console.log(`   Total Rows: ${result.schema.row_count}\n`);

  // Column Details
  console.log("📌 COLUMNS:");
  console.log("   ┌─ Column Name        ┬─ Type              ┬─ Nullable ┬─ Default");
  console.log("   ├─────────────────────┼────────────────────┼───────────┼─────────");

  result.schema.columns.forEach((col) => {
    const nullable = col.is_nullable === "YES" ? "YES" : "NO ";
    const defaultVal = col.column_default ? col.column_default.substring(0, 20) : "NULL";
    console.log(
      `   │ ${col.column_name.padEnd(19)} │ ${col.data_type.padEnd(18)} │ ${nullable}     │ ${defaultVal}`
    );
  });
  console.log("   └─────────────────────┴────────────────────┴───────────┴─────────\n");

  // Sample Data
  console.log("📄 SAMPLE DATA:");
  console.log(`   Retrieved: ${result.sample_data.actual_count} rows (limit: ${result.sample_data.limit})`);

  if (result.sample_data.rows.length > 0) {
    console.log("\n   Sample rows (first 3 if available):");
    result.sample_data.rows.slice(0, 3).forEach((row, idx) => {
      console.log(
        `   [${idx + 1}] ID: ${row.id} | Title: ${row.title.substring(0, 50)}...`
      );
      console.log(
        `       Status: ${row.status} | Priority: ${row.priority} | Agent: ${row.assigned_agent || "Unassigned"}`
      );
    });
  }

  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════");
}

/**
 * Export result to JSON file
 */
async function saveExportToFile(
  result: TodosSchemaExport,
  filePath: string
): Promise<void> {
  // Dynamic import to handle Node.js fs module
  const fs = await import("fs/promises");
  const path = await import("path");

  const outputPath = path.resolve(filePath);
  const content = JSON.stringify(result, null, 2);

  await fs.writeFile(outputPath, content, "utf-8");
  console.log(`✅ Export saved to: ${outputPath}`);
}

/**
 * Generate SQL CREATE TABLE statement from schema
 */
function generateCreateTableStatement(result: TodosSchemaExport): string {
  const columns = result.schema.columns
    .map((col) => {
      const notNull = col.is_nullable === "NO" ? " NOT NULL" : "";
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
      return `  ${col.column_name} ${col.data_type}${notNull}${defaultVal}`;
    })
    .join(",\n");

  return `-- Generated from todos table schema export via agent_exec_sql
-- Timestamp: ${result.timestamp}

CREATE TABLE IF NOT EXISTS public.todos (
${columns},
  PRIMARY KEY (${result.schema.primary_key})
);`;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "❌ Error: Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  try {
    // Execute the export
    const exportResult = await exportTodosSchemaViaAgentExecSql(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      10 // Sample limit
    );

    // Display results
    displayExportResult(exportResult);

    // Save to file
    const outputFile = "scripts/todos-schema-export-result.json";
    await saveExportToFile(exportResult, outputFile);

    // Generate and display CREATE TABLE statement
    const createTableStatement = generateCreateTableStatement(exportResult);
    console.log("\n📝 GENERATED CREATE TABLE STATEMENT:\n");
    console.log(createTableStatement);

    console.log(
      "\n✅ Export completed successfully via agent_exec_sql()!\n"
    );
  } catch (error) {
    console.error(
      "\n❌ Export failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export {
  exportTodosSchemaViaAgentExecSql,
  executeViaAgentExecSql,
  TodosSchemaExport,
  SchemaColumn,
  TodoRow,
};
