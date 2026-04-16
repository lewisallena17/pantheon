#!/usr/bin/env node

/**
 * Query god_status table schema and row count via agent_exec_sql()
 * 
 * This script demonstrates querying the god_status table using:
 * 1. SELECT COUNT(*) for row count
 * 2. INFORMATION_SCHEMA inspection for detailed schema metadata
 * 3. agent_exec_sql() RPC function for safe SQL execution
 * 
 * Usage: npm run query:god-status-schema
 * Or directly: npx ts-node scripts/query-god-status-schema.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl);
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "set" : "not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions
interface ColumnMetadata {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position?: number;
}

interface TableMetadata {
  table_name: string;
  table_type: string;
  table_schema: string;
  column_count?: number;
}

interface RowCountResult {
  row_count: number;
}

interface SchemaQueryResult {
  table_name: string;
  table_schema: string;
  table_type: string;
  row_count: number;
  columns: ColumnMetadata[];
  indexes?: Array<{ index_name: string; column_name: string }>;
}

/**
 * Query god_status table row count using SELECT COUNT(*)
 */
async function getRowCount(): Promise<number> {
  console.log("📊 Querying row count via agent_exec_sql()...\n");

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: "SELECT COUNT(*) as row_count FROM god_status",
  });

  if (error) {
    console.error("❌ Error querying row count:", error.message);
    throw error;
  }

  const result = (data as RowCountResult[] | null)?.[0];
  if (!result) {
    console.error("❌ No data returned from row count query");
    throw new Error("Row count query returned no results");
  }

  console.log("✅ Row count query successful");
  console.log(`   Row Count: ${result.row_count}\n`);

  return result.row_count;
}

/**
 * Query god_status table schema via INFORMATION_SCHEMA
 */
async function getTableSchema(): Promise<ColumnMetadata[]> {
  console.log("📋 Querying table schema via INFORMATION_SCHEMA...\n");

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_name = 'god_status'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `,
  });

  if (error) {
    console.error("❌ Error querying table schema:", error.message);
    throw error;
  }

  const columns = (data as ColumnMetadata[] | null) || [];
  if (columns.length === 0) {
    console.error("❌ No columns found for god_status table");
    throw new Error("Schema query returned no columns");
  }

  console.log("✅ Schema query successful");
  console.log(`   Columns Found: ${columns.length}\n`);

  return columns;
}

/**
 * Query god_status table metadata from INFORMATION_SCHEMA.TABLES
 */
async function getTableMetadata(): Promise<TableMetadata> {
  console.log("📊 Querying table metadata from INFORMATION_SCHEMA.TABLES...\n");

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: `
      SELECT 
        t.table_name,
        t.table_type,
        t.table_schema,
        (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE t.table_name = 'god_status'
      AND t.table_schema = 'public'
    `,
  });

  if (error) {
    console.error("❌ Error querying table metadata:", error.message);
    throw error;
  }

  const result = (data as any[] | null)?.[0];
  if (!result) {
    console.error("❌ No metadata found for god_status table");
    throw new Error("Table metadata query returned no results");
  }

  console.log("✅ Table metadata query successful");
  console.log(`   Table Type: ${result.table_type}`);
  console.log(`   Schema: ${result.table_schema}`);
  console.log(`   Column Count: ${result.column_count}\n`);

  return result;
}

/**
 * Query god_status table indexes
 */
async function getTableIndexes(): Promise<
  Array<{ index_name: string; column_name: string }>
> {
  console.log("🔍 Querying table indexes...\n");

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: `
      SELECT 
        i.indexname as index_name,
        a.attname as column_name
      FROM pg_indexes i
      LEFT JOIN pg_class c ON c.relname = i.tablename
      LEFT JOIN pg_index idx ON idx.indrelid = c.oid AND idx.indexrelname = i.indexname
      LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(idx.indkey)
      WHERE i.tablename = 'god_status'
      ORDER BY i.indexname, a.attnum
    `,
  });

  if (error) {
    console.warn("⚠️  Warning querying indexes:", error.message);
    return [];
  }

  const indexes = (data as Array<{ index_name: string; column_name: string }> | null) || [];
  console.log(`✅ Indexes query successful`);
  console.log(`   Indexes Found: ${indexes.length}\n`);

  return indexes;
}

/**
 * Get sample data from god_status table
 */
async function getSampleData(): Promise<any[]> {
  console.log("📝 Retrieving sample row from god_status...\n");

  const { data, error } = await supabase.rpc("agent_exec_sql", {
    sql_query: "SELECT * FROM god_status LIMIT 1",
  });

  if (error) {
    console.error("❌ Error retrieving sample data:", error.message);
    throw error;
  }

  const samples = (data as any[] | null) || [];
  console.log("✅ Sample data retrieval successful");
  console.log(`   Rows Retrieved: ${samples.length}\n`);

  return samples;
}

/**
 * Generate a comprehensive schema report
 */
async function generateSchemaReport(): Promise<SchemaQueryResult> {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 GOD_STATUS TABLE SCHEMA AND METADATA REPORT");
  console.log("=".repeat(70) + "\n");

  try {
    // Fetch all data in parallel where possible
    const [rowCount, columns, tableMetadata, indexes, sampleData] = await Promise.all([
      getRowCount(),
      getTableSchema(),
      getTableMetadata(),
      getTableIndexes(),
      getSampleData(),
    ]);

    console.log("═".repeat(70));
    console.log("📊 SCHEMA SUMMARY");
    console.log("═".repeat(70) + "\n");

    console.log(`Table Name:      ${tableMetadata.table_name}`);
    console.log(`Schema:          ${tableMetadata.table_schema}`);
    console.log(`Type:            ${tableMetadata.table_type}`);
    console.log(`Row Count:       ${rowCount}`);
    console.log(`Column Count:    ${columns.length}`);
    console.log(`Index Count:     ${indexes.length}`);
    console.log("");

    console.log("═".repeat(70));
    console.log("📋 COLUMN DEFINITIONS");
    console.log("═".repeat(70) + "\n");

    console.log("Ordinal | Column Name       | Data Type                    | Nullable | Default");
    console.log("─".repeat(95));

    columns.forEach((col) => {
      const ordinal = (col.ordinal_position || "?").toString().padEnd(7);
      const name = col.column_name.padEnd(17);
      const type = col.data_type.padEnd(28);
      const nullable = col.is_nullable.padEnd(8);
      const defaultVal = col.column_default || "—";

      console.log(`${ordinal} | ${name} | ${type} | ${nullable} | ${defaultVal}`);
    });
    console.log("");

    if (indexes.length > 0) {
      console.log("═".repeat(70));
      console.log("🔍 INDEXES");
      console.log("═".repeat(70) + "\n");

      const uniqueIndexes = [...new Set(indexes.map((i) => i.index_name))];
      uniqueIndexes.forEach((indexName) => {
        const indexColumns = indexes
          .filter((i) => i.index_name === indexName)
          .map((i) => i.column_name)
          .filter(Boolean);

        console.log(`${indexName}`);
        if (indexColumns.length > 0) {
          indexColumns.forEach((col) => {
            console.log(`  ├─ ${col}`);
          });
        }
      });
      console.log("");
    }

    console.log("═".repeat(70));
    console.log("📄 SAMPLE DATA");
    console.log("═".repeat(70) + "\n");

    if (sampleData.length > 0) {
      console.log(JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log("(No data available)");
    }
    console.log("");

    console.log("═".repeat(70));
    console.log("✅ QUERY EXECUTION COMPLETE");
    console.log("═".repeat(70) + "\n");

    // Return structured result
    const result: SchemaQueryResult = {
      table_name: tableMetadata.table_name,
      table_schema: tableMetadata.table_schema,
      table_type: tableMetadata.table_type,
      row_count: rowCount,
      columns: columns,
      indexes: indexes,
    };

    return result;
  } catch (err) {
    console.error("\n❌ Failed to generate schema report:", err);
    throw err;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const report = await generateSchemaReport();

    // Write report to file
    const reportPath = "./scripts/god-status-schema-report.json";
    console.log(`📁 Writing report to ${reportPath}...\n`);

    const fs = await import("fs").then((m) => m.promises);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log("✅ Report saved successfully!\n");
  } catch (err) {
    console.error("\n❌ Fatal error:", err);
    process.exit(1);
  }
}

// Execute
main();
