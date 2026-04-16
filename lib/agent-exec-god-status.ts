/**
 * Agent Execution Functions for god_status Table
 * Provides direct database query interface for autonomous agents
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Execute SQL query via agent_exec_sql()
 * Returns query results as JSON array
 *
 * @param query - SQL SELECT query
 * @returns JSON array of query results
 */
export async function agentExecSql(query: string): Promise<any[]> {
  try {
    const { data, error } = await supabase.rpc("agent_exec_sql", {
      query,
    });

    if (error) {
      console.error("agent_exec_sql error:", error);
      throw error;
    }

    // agent_exec_sql returns results as JSONB
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.error("Failed to execute SQL via agent_exec_sql:", err);
    throw err;
  }
}

/**
 * Get god_status table schema and statistics
 * Returns complete schema information, row count, indexes, and sample data
 *
 * @returns Schema statistics object
 */
export async function getGodStatusSchemaStats(): Promise<{
  table_name: string;
  row_count: number;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
  sample_data: any[];
  storage_size: string;
  indexes: Array<{
    index_name: string;
    index_definition: string;
  }>;
  schema_info: {
    total_relation_size_bytes: number;
  };
}> {
  try {
    const { data, error } = await supabase.rpc(
      "get_god_status_schema_stats"
    );

    if (error) {
      console.error("get_god_status_schema_stats error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to get god_status schema stats:", err);
    throw err;
  }
}

/**
 * Query god_status table directly
 * Returns schema stats via wrapper function
 *
 * @returns Query results including schema and statistics
 */
export async function queryGodStatusSchema(): Promise<any> {
  try {
    const { data, error } = await supabase.rpc("query_god_status_schema");

    if (error) {
      console.error("query_god_status_schema error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to query god_status schema:", err);
    throw err;
  }
}

/**
 * Get god_status table statistics summary
 * Returns row count and basic metadata
 *
 * @returns Statistics summary
 */
export async function getGodStatusStatistics(): Promise<{
  row_count: number;
  table_name: string;
  columns: number;
  indexes: number;
  storage_size: string;
}> {
  try {
    const stats = await getGodStatusSchemaStats();

    return {
      row_count: stats.row_count,
      table_name: stats.table_name,
      columns: stats.columns.length,
      indexes: stats.indexes.length,
      storage_size: stats.storage_size,
    };
  } catch (err) {
    console.error("Failed to get god_status statistics:", err);
    throw err;
  }
}

/**
 * Get current god_status record
 * Returns the single god_status row with all columns
 *
 * @returns Current god_status record
 */
export async function getCurrentGodStatus(): Promise<{
  id: number;
  thought: string;
  updated_at: string;
  meta: Record<string, any> | null;
  intent: Record<string, any> | null;
}> {
  try {
    const results = await agentExecSql(
      "SELECT id, thought, updated_at, meta, intent FROM god_status"
    );
    return results[0] || null;
  } catch (err) {
    console.error("Failed to get current god_status:", err);
    throw err;
  }
}

/**
 * Execute arbitrary DDL statement via agent_exec_ddl()
 * Only for database schema changes, use with caution
 *
 * @param statement - DDL statement (CREATE, ALTER, DROP, etc.)
 * @returns Execution status
 */
export async function agentExecDdl(statement: string): Promise<string> {
  try {
    const { data, error } = await supabase.rpc("agent_exec_ddl", {
      statement,
    });

    if (error) {
      console.error("agent_exec_ddl error:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Failed to execute DDL via agent_exec_ddl:", err);
    throw err;
  }
}

export default {
  agentExecSql,
  getGodStatusSchemaStats,
  queryGodStatusSchema,
  getGodStatusStatistics,
  getCurrentGodStatus,
  agentExecDdl,
};
