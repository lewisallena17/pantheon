/**
 * agent_exec_sql_minimal_projection.mjs
 *
 * Execute minimal projection query via agent_exec_sql (Node.js ES Module)
 * Query: SELECT name, value FROM god_status LIMIT 5
 *
 * This script demonstrates:
 * 1. Column projection (dropping id, selecting only name, value)
 * 2. Using LIMIT to restrict result set
 * 3. Minimal data transfer for performance
 *
 * Usage:
 *   node scripts/agent_exec_sql_minimal_projection.mjs
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Execute minimal projection query via agent_exec_sql
 *
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase API key (service role for full access)
 * @returns {Promise<Object>} QueryResult
 */
async function executeMinimalProjection(supabaseUrl, supabaseKey) {
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });

    console.log(
      "📡 Executing minimal projection query via agent_exec_sql()...\n"
    );

    // Execute the minimal projection query
    const targetQuery = "SELECT name, value FROM god_status LIMIT 5";

    console.log(`[*] Query: ${targetQuery}`);
    console.log(`[*] Projection: name, value (dropping id column)`);
    console.log(`[*] Limit: 5 rows\n`);

    // Call agent_exec_sql via RPC
    const { data, error } = await supabase.rpc("agent_exec_sql", {
      query: targetQuery,
    });

    if (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }

    const resultData = data || [];

    console.log(`✓ Query executed successfully`);
    console.log(`✓ Rows returned: ${resultData.length}\n`);

    // Display results
    if (resultData.length > 0) {
      console.log("📋 Results:\n");
      console.table(resultData);
    } else {
      console.log("(No results returned)");
    }

    // Build result object
    const result = {
      success: true,
      query: targetQuery,
      row_count: resultData.length,
      data: resultData,
      timestamp: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${errorMessage}`);

    const result = {
      success: false,
      query: "SELECT name, value FROM god_status LIMIT 5",
      row_count: 0,
      data: [],
      timestamp: new Date().toISOString(),
    };

    return result;
  }
}

/**
 * Main entry point
 */
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const result = await executeMinimalProjection(supabaseUrl, supabaseKey);

  console.log("\n📊 Result Summary:");
  console.log(`- Success: ${result.success}`);
  console.log(`- Query: ${result.query}`);
  console.log(`- Rows: ${result.row_count}`);
  console.log(`- Timestamp: ${result.timestamp}`);

  process.exit(result.success ? 0 : 1);
}

// Run if executed directly
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});

export { executeMinimalProjection };
