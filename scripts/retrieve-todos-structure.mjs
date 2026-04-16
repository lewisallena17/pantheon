#!/usr/bin/env node
/**
 * Retrieve todos table structure and sample rows via agent_exec_sql()
 * This script demonstrates how to use agent_exec_sql() RPC to query table schema and data
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("   NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Main function to retrieve todos table structure and sample rows
 */
async function retrieveTodosStructure() {
  console.log("🔍 Retrieving todos table structure and sample rows via agent_exec_sql()...\n");

  try {
    // Step 1: Get table schema using agent_exec_sql()
    console.log("📋 Step 1: Retrieving table schema from information_schema...");
    const { data: schemaData, error: schemaError } = await supabase.rpc("agent_exec_sql", {
      sql_query: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_name = 'todos'
        ORDER BY ordinal_position
      `,
    });

    if (schemaError) {
      console.error("❌ Error retrieving schema:", schemaError.message);
      process.exit(1);
    }

    if (!schemaData || schemaData.length === 0) {
      console.error("❌ No schema columns found for todos table");
      process.exit(1);
    }

    console.log(`✅ Retrieved schema: ${schemaData.length} columns\n`);
    console.log("📊 Table Structure:");
    console.log("─".repeat(100));
    schemaData.forEach((col) => {
      const nullable = col.is_nullable === "YES" ? "nullable" : "NOT NULL";
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
      console.log(
        `  ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(25)} | ${nullable.padEnd(10)}${defaultVal}`
      );
    });
    console.log("─".repeat(100));
    console.log("");

    // Step 2: Get row count
    console.log("📋 Step 2: Retrieving row count...");
    const { data: countData, error: countError } = await supabase.rpc("agent_exec_sql", {
      sql_query: "SELECT COUNT(*) as row_count FROM todos",
    });

    if (countError) {
      console.error("❌ Error retrieving row count:", countError.message);
      process.exit(1);
    }

    const totalRows = countData?.[0]?.row_count || 0;
    console.log(`✅ Total rows in todos table: ${totalRows}\n`);

    if (totalRows === 0) {
      console.log("⚠️  No rows found in todos table");
      return;
    }

    // Step 3: Get sample rows (limit 5)
    console.log("📋 Step 3: Retrieving sample rows (first 5)...");
    const { data: sampleData, error: sampleError } = await supabase.rpc("agent_exec_sql", {
      sql_query: `
        SELECT 
          id,
          title,
          status,
          priority,
          assigned_agent,
          description,
          retry_count,
          is_boss,
          deadline,
          metadata,
          comments,
          created_at,
          updated_at
        FROM todos
        LIMIT 5
      `,
    });

    if (sampleError) {
      console.error("❌ Error retrieving sample data:", sampleError.message);
      process.exit(1);
    }

    if (sampleData && sampleData.length > 0) {
      console.log(`✅ Retrieved ${sampleData.length} sample rows\n`);

      console.log("📝 Sample Rows:");
      console.log("═".repeat(100));
      sampleData.forEach((row, index) => {
        console.log(`\nRow ${index + 1}:`);
        console.log(JSON.stringify(row, null, 2));
      });
      console.log("═".repeat(100));
    }

    // Step 4: Get statistics
    console.log("\n📊 Step 4: Retrieving table statistics...");
    const { data: statsData, error: statsError } = await supabase.rpc("agent_exec_sql", {
      sql_query: `
        SELECT 
          status,
          priority,
          COUNT(*) as count,
          COUNT(CASE WHEN assigned_agent IS NOT NULL THEN 1 END) as assigned_count
        FROM todos
        GROUP BY status, priority
        ORDER BY status, priority
      `,
    });

    if (statsError) {
      console.error("❌ Error retrieving statistics:", statsError.message);
    } else if (statsData && statsData.length > 0) {
      console.log("✅ Status and Priority Distribution:\n");
      console.log("Status       | Priority  | Count | Assigned");
      console.log("─".repeat(50));
      statsData.forEach((stat) => {
        console.log(
          `${stat.status.padEnd(12)} | ${stat.priority.padEnd(9)} | ${String(stat.count).padEnd(5)} | ${stat.assigned_count}`
        );
      });
    }

    // Step 5: Get agent assignment summary
    console.log("\n📊 Step 5: Retrieving agent assignment summary...");
    const { data: agentData, error: agentError } = await supabase.rpc("agent_exec_sql", {
      sql_query: `
        SELECT 
          assigned_agent,
          COUNT(*) as task_count,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM todos
        WHERE assigned_agent IS NOT NULL
        GROUP BY assigned_agent
        ORDER BY task_count DESC
      `,
    });

    if (agentError) {
      console.error("❌ Error retrieving agent data:", agentError.message);
    } else if (agentData && agentData.length > 0) {
      console.log("✅ Agent Task Distribution:\n");
      console.log(
        "Agent".padEnd(30) + " | Tasks | Complete | Progress | Failed | Pending"
      );
      console.log("─".repeat(85));
      agentData.forEach((agent) => {
        console.log(
          `${(agent.assigned_agent || "unassigned").padEnd(30)} | ${String(agent.task_count).padEnd(5)} | ${String(agent.completed).padEnd(8)} | ${String(agent.in_progress).padEnd(8)} | ${String(agent.failed).padEnd(6)} | ${agent.pending}`
        );
      });
    } else {
      console.log("✅ No agents assigned to tasks");
    }

    // Step 6: Generate export-friendly JSON
    console.log("\n📋 Step 6: Generating complete structured report...");
    const reportData = {
      timestamp: new Date().toISOString(),
      table: "todos",
      summary: {
        totalRows,
        columnsCount: schemaData.length,
        retrievedAt: new Date().toISOString(),
      },
      schema: schemaData.map((col) => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === "YES",
        default: col.column_default,
        position: col.ordinal_position,
      })),
      sampleRows: sampleData || [],
    };

    console.log("✅ Report generated successfully\n");
    console.log("📦 Complete Report (JSON):");
    console.log(JSON.stringify(reportData, null, 2));

    console.log("\n✨ Task complete! todos table structure and sample rows retrieved via agent_exec_sql()");
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the retrieval
retrieveTodosStructure();
