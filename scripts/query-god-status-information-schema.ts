#!/usr/bin/env node

/**
 * Query god_status table schema via agent_exec_sql information_schema
 * 
 * This script queries the god_status table schema using PostgreSQL's
 * information_schema catalog tables via the agent_exec_sql() RPC function.
 * 
 * Features:
 * - No row-level aggregation or filtering
 * - Direct schema introspection via information_schema
 * - Uses agent_exec_sql() RPC for safe execution
 * - Exports results to console and JSON file
 * 
 * Usage:
 *   npx ts-node scripts/query-god-status-information-schema.ts
 *   npm run query:god-status-schema-info
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

/**
 * Type definitions
 */
interface ColumnInfo {
  column_name: string;
  ordinal_position: number;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
  numeric_precision: number | null;
  numeric_scale: number | null;
  datetime_precision: number | null;
  udt_name: string;
}

interface TableInfo {
  table_catalog: string;
  table_schema: string;
  table_name: string;
  table_type: string;
  is_insertable_into: string;
}

interface SchemaExportResult {
  table_info: TableInfo;
  columns: ColumnInfo[];
  column_count: number;
  export_timestamp: string;
  query_method: string;
}

/**
 * Query table metadata from information_schema.tables
 */
async function queryTableMetadata(): Promise<TableInfo> {
  console.log("[1/2] Querying table metadata from information_schema.tables...");

  const tableQuery = `
    SELECT 
      table_catalog,
      table_schema,
      table_name,
      table_type,
      is_insertable_into
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'god_status'
  `;

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    query: tableQuery,
  });

  if (error) {
    throw new Error(
      `Table metadata query failed: ${error.message || JSON.stringify(error)}`
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(
      `Table metadata query returned no results. Response: ${JSON.stringify(data)}`
    );
  }

  const tableInfo = data[0] as TableInfo;
  console.log("✅ Table metadata retrieved");
  console.log(`   Catalog: ${tableInfo.table_catalog}`);
  console.log(`   Schema: ${tableInfo.table_schema}`);
  console.log(`   Table: ${tableInfo.table_name}`);
  console.log(`   Type: ${tableInfo.table_type}`);
  console.log(`   Insertable: ${tableInfo.is_insertable_into}\n`);

  return tableInfo;
}

/**
 * Query column definitions from information_schema.columns
 * No filtering or aggregation - returns all columns as-is
 */
async function queryColumnMetadata(): Promise<ColumnInfo[]> {
  console.log("[2/2] Querying column definitions from information_schema.columns...");

  const columnQuery = `
    SELECT 
      column_name,
      ordinal_position,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision,
      numeric_scale,
      datetime_precision,
      udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'god_status'
    ORDER BY ordinal_position
  `;

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    query: columnQuery,
  });

  if (error) {
    throw new Error(
      `Column metadata query failed: ${error.message || JSON.stringify(error)}`
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(
      `Column metadata query returned no results. Response: ${JSON.stringify(data)}`
    );
  }

  const columns = data as ColumnInfo[];
  console.log("✅ Column metadata retrieved");
  console.log(`   Total Columns: ${columns.length}\n`);

  return columns;
}

/**
 * Display column information in a formatted table
 */
function displayColumnsTable(columns: ColumnInfo[]): void {
  console.log("═".repeat(100));
  console.log("COLUMN DEFINITIONS");
  console.log("═".repeat(100));
  console.log("");

  columns.forEach((col, index) => {
    console.log(`${index + 1}. ${col.column_name.toUpperCase()}`);
    console.log(`   Ordinal Position:       ${col.ordinal_position}`);
    console.log(`   Data Type:              ${col.data_type}`);
    console.log(`   UDT Name:               ${col.udt_name}`);
    console.log(`   Nullable:               ${col.is_nullable}`);
    console.log(`   Default Value:          ${col.column_default || "(none)"}`);

    if (col.character_maximum_length !== null) {
      console.log(`   Max Character Length:   ${col.character_maximum_length}`);
    }
    if (col.numeric_precision !== null) {
      console.log(`   Numeric Precision:      ${col.numeric_precision}`);
    }
    if (col.numeric_scale !== null) {
      console.log(`   Numeric Scale:          ${col.numeric_scale}`);
    }
    if (col.datetime_precision !== null) {
      console.log(`   DateTime Precision:     ${col.datetime_precision}`);
    }
    console.log("");
  });
}

/**
 * Generate Markdown documentation
 */
function generateMarkdownReport(result: SchemaExportResult): string {
  let md = `# God Status Table Schema - Information Schema Export\n\n`;

  md += `**Export Timestamp**: ${result.export_timestamp}\n`;
  md += `**Query Method**: PostgreSQL \`information_schema\` via \`agent_exec_sql()\`\n`;
  md += `**Query Type**: Direct schema introspection (no aggregation, no filtering)\n\n`;

  // Table Information
  md += `## Table Metadata\n\n`;
  md += `| Property | Value |\n`;
  md += `|----------|-------|\n`;
  md += `| Catalog | \`${result.table_info.table_catalog}\` |\n`;
  md += `| Schema | \`${result.table_info.table_schema}\` |\n`;
  md += `| Table Name | \`${result.table_info.table_name}\` |\n`;
  md += `| Table Type | ${result.table_info.table_type} |\n`;
  md += `| Insertable | ${result.table_info.is_insertable_into} |\n`;
  md += `| Total Columns | ${result.column_count} |\n\n`;

  // Column Details - Table Format
  md += `## Column Definitions\n\n`;
  md += `| Ord | Name | Data Type | UDT | Nullable | Default | Max Len | Precision | Scale |\n`;
  md += `|-----|------|-----------|-----|----------|---------|---------|-----------|-------|\n`;

  result.columns.forEach((col) => {
    const nullable = col.is_nullable === "YES" ? "✓" : "✗";
    const defaultVal = col.column_default ? `\`${col.column_default}\`` : "—";
    const maxLen = col.character_maximum_length || "—";
    const precision = col.numeric_precision || "—";
    const scale = col.numeric_scale || "—";

    md += `| ${col.ordinal_position} | \`${col.column_name}\` | \`${col.data_type}\` | \`${col.udt_name}\` | ${nullable} | ${defaultVal} | ${maxLen} | ${precision} | ${scale} |\n`;
  });

  md += `\n`;

  // Column Details - List Format
  md += `## Column Details\n\n`;
  result.columns.forEach((col) => {
    md += `### ${col.column_name}\n\n`;
    md += `- **Ordinal Position**: ${col.ordinal_position}\n`;
    md += `- **Data Type**: \`${col.data_type}\`\n`;
    md += `- **UDT Name**: \`${col.udt_name}\`\n`;
    md += `- **Nullable**: ${col.is_nullable}\n`;
    md += `- **Default Value**: ${col.column_default ? `\`${col.column_default}\`` : "None"}\n`;

    if (col.character_maximum_length !== null) {
      md += `- **Max Character Length**: ${col.character_maximum_length}\n`;
    }
    if (col.numeric_precision !== null) {
      md += `- **Numeric Precision**: ${col.numeric_precision}\n`;
    }
    if (col.numeric_scale !== null) {
      md += `- **Numeric Scale**: ${col.numeric_scale}\n`;
    }
    if (col.datetime_precision !== null) {
      md += `- **DateTime Precision**: ${col.datetime_precision}\n`;
    }

    md += `\n`;
  });

  return md;
}

/**
 * Main function - Execute schema queries and export results
 */
async function main(): Promise<void> {
  try {
    console.log("\n" + "═".repeat(100));
    console.log(
      "🔍 QUERY GOD_STATUS TABLE SCHEMA VIA INFORMATION_SCHEMA (agent_exec_sql)"
    );
    console.log("═".repeat(100) + "\n");

    // Query table and column metadata
    const [tableInfo, columns] = await Promise.all([
      queryTableMetadata(),
      queryColumnMetadata(),
    ]);

    // Create export result
    const exportResult: SchemaExportResult = {
      table_info: tableInfo,
      columns,
      column_count: columns.length,
      export_timestamp: new Date().toISOString(),
      query_method:
        "information_schema introspection via agent_exec_sql (no filtering, no aggregation)",
    };

    // Display results
    displayColumnsTable(columns);

    // Export to JSON
    const jsonFile = path.join(__dirname, "god-status-schema-information-schema.json");
    fs.writeFileSync(jsonFile, JSON.stringify(exportResult, null, 2));
    console.log(`✅ JSON export saved to: ${jsonFile}`);

    // Export to Markdown
    const mdFile = path.join(__dirname, "god-status-schema-information-schema.md");
    const markdownContent = generateMarkdownReport(exportResult);
    fs.writeFileSync(mdFile, markdownContent);
    console.log(`✅ Markdown export saved to: ${mdFile}`);

    // Summary
    console.log("\n" + "═".repeat(100));
    console.log("✅ SCHEMA QUERY COMPLETED SUCCESSFULLY");
    console.log("═".repeat(100));
    console.log(`Table:             ${exportResult.table_info.table_name}`);
    console.log(`Schema:            ${exportResult.table_info.table_schema}`);
    console.log(`Columns:           ${exportResult.column_count}`);
    console.log(`Exported:          ${exportResult.export_timestamp}`);
    console.log(`Query Method:      ${exportResult.query_method}`);
    console.log("");
  } catch (error) {
    console.error(
      "❌ Schema query failed:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Full error:",
      error instanceof Error ? error : JSON.stringify(error)
    );
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
