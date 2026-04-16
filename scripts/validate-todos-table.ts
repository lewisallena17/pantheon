/**
 * Validate todos table content and row structure
 * Uses agent_exec_sql() to retrieve and validate todos table data
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Define the expected todos row structure/schema
 */
interface TodoRow {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  assigned_agent: string | null;
  updated_at: string;
  created_at: string;
  description: string;
  metadata: Record<string, any>;
  comments: any[];
  retry_count: number;
  is_boss: boolean;
  deadline: string | null;
}

/**
 * Validate row structure against expected interface
 */
function validateRowStructure(row: any, rowIndex: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields exist and have correct types
  const requiredFields: [string, string][] = [
    ["id", "string"],
    ["title", "string"],
    ["status", "string"],
    ["priority", "string"],
    ["updated_at", "string"],
    ["created_at", "string"],
  ];

  for (const [field, expectedType] of requiredFields) {
    if (!(field in row)) {
      errors.push(`Row ${rowIndex}: Missing required field '${field}'`);
    } else if (typeof row[field] !== expectedType) {
      errors.push(
        `Row ${rowIndex}: Field '${field}' has type '${typeof row[field]}', expected '${expectedType}'`
      );
    }
  }

  // Check optional fields with specific types
  const optionalFields: [string, string | string[]][] = [
    ["assigned_agent", ["string", "object"]],
    ["description", "string"],
    ["retry_count", "number"],
    ["is_boss", "boolean"],
    ["deadline", ["string", "object"]],
  ];

  for (const [field, expectedTypes] of optionalFields) {
    if (field in row && row[field] !== null && row[field] !== undefined) {
      const types = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
      if (!types.includes(typeof row[field])) {
        errors.push(
          `Row ${rowIndex}: Field '${field}' has type '${typeof row[field]}', expected one of '${types.join(", ")}'`
        );
      }
    }
  }

  // Validate status field values
  const validStatuses = ["pending", "in_progress", "completed", "failed"];
  if (row.status && !validStatuses.includes(row.status)) {
    errors.push(
      `Row ${rowIndex}: Invalid status '${row.status}', must be one of: ${validStatuses.join(", ")}`
    );
  }

  // Validate priority field values
  const validPriorities = ["low", "medium", "high", "critical"];
  if (row.priority && !validPriorities.includes(row.priority)) {
    errors.push(
      `Row ${rowIndex}: Invalid priority '${row.priority}', must be one of: ${validPriorities.join(", ")}`
    );
  }

  // Check JSONB fields
  if ("metadata" in row && row.metadata !== null && typeof row.metadata !== "object") {
    errors.push(
      `Row ${rowIndex}: Field 'metadata' should be a JSON object, got ${typeof row.metadata}`
    );
  }

  if ("comments" in row && row.comments !== null && !Array.isArray(row.comments)) {
    errors.push(
      `Row ${rowIndex}: Field 'comments' should be a JSON array, got ${typeof row.comments}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main validation function
 */
async function validateTodosTable() {
  console.log("🔍 Starting todos table validation...\n");

  try {
    // Step 1: Retrieve table schema
    console.log("📋 Step 1: Retrieving table schema...");
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      "agent_exec_sql",
      {
        sql_query: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = 'todos'
          ORDER BY ordinal_position
        `,
      }
    );

    if (schemaError) {
      console.error("❌ Error retrieving schema:", schemaError);
    } else {
      console.log(`✅ Schema retrieved: ${schemaData.length} columns found`);
      console.log(
        "Columns:",
        schemaData.map((col: any) => `${col.column_name} (${col.data_type})`).join(", ")
      );
    }

    // Step 2: Retrieve all rows from todos table
    console.log("\n📋 Step 2: Retrieving todos table content...");
    const { data: todosData, error: todosError } = await supabase.rpc("agent_exec_sql", {
      sql_query: "SELECT * FROM todos",
    });

    if (todosError) {
      console.error("❌ Error retrieving todos:", todosError);
      return;
    }

    const rowCount = todosData.length;
    console.log(`✅ Retrieved ${rowCount} rows from todos table`);

    // Step 3: Validate row structure for each row
    console.log("\n📋 Step 3: Validating row structure...");
    const validationResults = todosData.map((row: any, index: number) =>
      validateRowStructure(row, index)
    );

    const validRows = validationResults.filter((result) => result.valid).length;
    const invalidRows = validationResults.filter((result) => !result.valid).length;

    console.log(`✅ Validation Results: ${validRows} valid, ${invalidRows} invalid`);

    if (invalidRows > 0) {
      console.log("\n⚠️  Validation Errors Found:");
      validationResults.forEach((result, index) => {
        if (!result.valid) {
          console.log(`\n  Row ${index}:`);
          result.errors.forEach((error) => console.log(`    - ${error}`));
        }
      });
    }

    // Step 4: Generate summary report
    console.log("\n📊 Summary Report:");
    console.log(`- Total rows: ${rowCount}`);
    console.log(`- Valid rows: ${validRows}`);
    console.log(`- Invalid rows: ${invalidRows}`);
    console.log(`- Validation success rate: ${((validRows / rowCount) * 100).toFixed(2)}%`);

    // Step 5: Sample row analysis
    if (rowCount > 0) {
      console.log("\n📝 Sample Row (First Row):");
      const sampleRow = todosData[0];
      console.log(JSON.stringify(sampleRow, null, 2));
    }

    // Step 6: Field statistics
    console.log("\n📈 Field Statistics:");
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    todosData.forEach((row: any) => {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
      priorityCounts[row.priority] = (priorityCounts[row.priority] || 0) + 1;
    });

    console.log("Status distribution:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`);
    });

    console.log("Priority distribution:");
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`  - ${priority}: ${count}`);
    });

    console.log("\n✨ Validation complete!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run validation
validateTodosTable();
