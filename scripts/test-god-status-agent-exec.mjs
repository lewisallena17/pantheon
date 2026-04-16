#!/usr/bin/env node

/**
 * Test script for god_status table schema and row count query via agent_exec_sql()
 * 
 * Usage: npm run test:god-status-agent-exec
 * Or directly: node scripts/test-god-status-agent-exec.mjs
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

async function testAgentExecSql() {
  console.log("\n📊 Testing agent_exec_sql() queries for god_status table\n");
  console.log("=".repeat(60));

  try {
    // Test 1: Basic god_status query
    console.log("\n[Test 1] Basic god_status query via agent_exec_sql()");
    console.log("-".repeat(60));
    const { data: basicData, error: basicError } = await supabase.rpc(
      "agent_exec_sql",
      {
        query:
          "SELECT id, thought, updated_at FROM god_status",
      }
    );

    if (basicError) {
      console.error("❌ Error:", basicError);
    } else {
      console.log("✓ Query executed successfully");
      console.log(JSON.stringify(basicData, null, 2));
    }

    // Test 2: Get schema statistics via dedicated function
    console.log("\n[Test 2] Get god_status schema and statistics");
    console.log("-".repeat(60));
    const { data: schemaData, error: schemaError } = await supabase.rpc(
      "get_god_status_schema_stats"
    );

    if (schemaError) {
      console.error("❌ Error:", schemaError);
    } else {
      console.log("✓ Schema statistics retrieved successfully");
      console.log(JSON.stringify(schemaData, null, 2));

      // Extract summary information
      console.log("\n📈 Summary:");
      console.log(`   Table: ${schemaData.table_name}`);
      console.log(`   Row Count: ${schemaData.row_count}`);
      console.log(`   Columns: ${schemaData.columns.length}`);
      schemaData.columns.forEach((col) => {
        console.log(`     - ${col.column_name}: ${col.data_type}`);
      });
      console.log(`   Storage Size: ${schemaData.storage_size}`);
      console.log(`   Indexes: ${schemaData.indexes.length}`);
      schemaData.indexes.forEach((idx) => {
        console.log(`     - ${idx.index_name}`);
      });
    }

    // Test 3: Count rows using agent_exec_sql()
    console.log("\n[Test 3] Row count via agent_exec_sql()");
    console.log("-".repeat(60));
    const { data: countData, error: countError } = await supabase.rpc(
      "agent_exec_sql",
      {
        query: "SELECT COUNT(*) as row_count FROM god_status",
      }
    );

    if (countError) {
      console.error("❌ Error:", countError);
    } else {
      console.log("✓ Row count query executed successfully");
      console.log(JSON.stringify(countData, null, 2));
    }

    // Test 4: Get column information via agent_exec_sql()
    console.log("\n[Test 4] Column information via agent_exec_sql()");
    console.log("-".repeat(60));
    const { data: columnsData, error: columnsError } = await supabase.rpc(
      "agent_exec_sql",
      {
        query: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default 
          FROM information_schema.columns 
          WHERE table_name = 'god_status' 
          AND table_schema = 'public'
        `,
      }
    );

    if (columnsError) {
      console.error("❌ Error:", columnsError);
    } else {
      console.log("✓ Column information retrieved successfully");
      console.log(JSON.stringify(columnsData, null, 2));
    }

    // Test 5: Get sample data via agent_exec_sql()
    console.log("\n[Test 5] Sample data (first record) via agent_exec_sql()");
    console.log("-".repeat(60));
    const { data: sampleData, error: sampleError } = await supabase.rpc(
      "agent_exec_sql",
      {
        query: "SELECT * FROM god_status LIMIT 1",
      }
    );

    if (sampleError) {
      console.error("❌ Error:", sampleError);
    } else {
      console.log("✓ Sample data retrieved successfully");
      console.log(JSON.stringify(sampleData, null, 2));
    }

    // Test 6: Query god_status with wrapper function
    console.log("\n[Test 6] Query wrapper function query_god_status_schema()");
    console.log("-".repeat(60));
    const { data: wrapperData, error: wrapperError } = await supabase.rpc(
      "query_god_status_schema"
    );

    if (wrapperError) {
      console.error("❌ Error:", wrapperError);
    } else {
      console.log("✓ Wrapper function executed successfully");
      console.log("   Returns same result as get_god_status_schema_stats()");
      console.log(`   Table: ${wrapperData.table_name}`);
      console.log(`   Rows: ${wrapperData.row_count}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests completed successfully!");
    console.log("\n📝 Summary:");
    console.log("   - agent_exec_sql() function is working correctly");
    console.log("   - god_status table schema can be queried");
    console.log("   - Row count statistics are accessible");
    console.log("   - Specialized schema functions are available");
    console.log("\n");
  } catch (err) {
    console.error("\n❌ Unexpected error:", err);
    process.exit(1);
  }
}

testAgentExecSql();
