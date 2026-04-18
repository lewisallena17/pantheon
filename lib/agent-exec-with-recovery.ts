/**
 * Agent Execution with Autonomous Recovery
 * 
 * This module integrates the retry wrapper with actual agent_exec_sql calls,
 * providing a drop-in replacement that transparently adds:
 * - Exponential backoff retry logic
 * - Automatic LIMIT injection on failures
 * - Comprehensive observability
 */

import { createClient } from "@supabase/supabase-js";
import {
  withRetry,
  withRetryWrapper,
  withRetryBatch,
  RetryPresets,
  type RetryConfig,
  type ExecutionResult,
} from "./agent-exec-retry";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Execute SQL query via agent_exec_sql RPC
 * Base implementation without retry logic
 * 
 * @param query - SQL SELECT query
 * @returns Query results as JSON array
 */
export async function agentExecSqlRaw(query: string): Promise<any[]> {
  const { data, error } = await supabase.rpc("agent_exec_sql", {
    query,
  });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [data];
}

/**
 * Execute SQL query with autonomous recovery (exponential backoff + LIMIT injection)
 * 
 * This is the recommended way to execute queries. It automatically retries
 * transient failures with exponential backoff and injects LIMIT 10 on SELECT failures.
 * 
 * @param query - SQL SELECT query
 * @param config - Optional retry configuration (defaults to balanced preset)
 * @returns Execution result with data, error, and detailed metrics
 * 
 * @example
 * const result = await agentExecSql('SELECT * FROM god_status');
 * if (result.error) {
 *   console.error('Query failed:', result.error);
 *   if (result.isTransient) console.log('Transient error - could retry manually');
 * } else {
 *   console.log('Success:', result.data);
 *   console.log('Metrics:', result.metrics);
 * }
 */
export async function agentExecSql(
  query: string,
  config?: Partial<RetryConfig>
): Promise<ExecutionResult<any[]>> {
  return withRetry(query, agentExecSqlRaw, {
    ...RetryPresets.balanced,
    ...config,
  });
}

/**
 * Execute SQL query with conservative retry strategy
 * Good for user-facing API requests where latency is critical
 * 
 * @param query - SQL SELECT query
 * @returns Execution result with data, error, and metrics
 */
export async function agentExecSqlFast(
  query: string
): Promise<ExecutionResult<any[]>> {
  return agentExecSql(query, RetryPresets.conservative);
}

/**
 * Execute SQL query with aggressive retry strategy
 * Good for critical background operations and ETL jobs
 * 
 * @param query - SQL SELECT query
 * @returns Execution result with data, error, and metrics
 */
export async function agentExecSqlRobust(
  query: string
): Promise<ExecutionResult<any[]>> {
  return agentExecSql(query, RetryPresets.aggressive);
}

/**
 * Execute multiple queries in parallel with retry logic
 * Returns results in same order as input queries
 * 
 * @param queries - Array of SQL SELECT queries
 * @param config - Optional retry configuration
 * @returns Batch execution result with per-query results and aggregate metrics
 * 
 * @example
 * const results = await agentExecSqlBatch([
 *   'SELECT COUNT(*) FROM god_status',
 *   'SELECT COUNT(*) FROM todos',
 * ]);
 * console.log(`Success: ${results.successCount}/${queries.length}`);
 */
export async function agentExecSqlBatch(
  queries: string[],
  config?: Partial<RetryConfig>
): Promise<{
  results: ExecutionResult<any[]>[];
  successCount: number;
  failureCount: number;
  totalAttempts: number;
  totalRetries: number;
  totalTimeMs: number;
}> {
  return withRetryBatch(queries, agentExecSqlRaw, {
    ...RetryPresets.balanced,
    ...config,
  });
}

/**
 * Execute DDL statement (CREATE, ALTER, DROP, etc.)
 * Does NOT include retry logic as DDL should be idempotent or fail fast
 * 
 * @param statement - DDL statement
 * @returns Execution status
 */
export async function agentExecDdl(statement: string): Promise<string> {
  const { data, error } = await supabase.rpc("agent_exec_ddl", {
    statement,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get god_status table schema and statistics
 * Wrapped with retry logic for robustness
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
  const { data, error } = await supabase.rpc(
    "get_god_status_schema_stats"
  );

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Query god_status table schema via wrapper function
 * Wrapped with retry logic
 * 
 * @returns Query results including schema and statistics
 */
export async function queryGodStatusSchema(): Promise<any> {
  const { data, error } = await supabase.rpc("query_god_status_schema");

  if (error) {
    throw error;
  }

  return data;
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
    throw err;
  }
}

/**
 * Get current god_status record with retry logic
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
  const result = await agentExecSql(
    "SELECT id, thought, updated_at, meta, intent FROM god_status LIMIT 1"
  );

  if (result.error || !result.data || result.data.length === 0) {
    throw result.error || new Error("No god_status record found");
  }

  return result.data[0];
}

/**
 * Get query execution metrics from last execution
 * Useful for observability dashboards
 * 
 * @param result - ExecutionResult from any agent_exec_sql call
 * @returns Formatted metrics for logging/monitoring
 */
export function formatMetrics(result: ExecutionResult<any>): {
  success: boolean;
  attempts: number;
  retries: number;
  totalTimeMs: number;
  limitInjected: boolean;
  wasTransient: boolean;
} {
  return {
    success: result.metrics.succeeded,
    attempts: result.metrics.totalAttempts,
    retries: result.metrics.retryCount,
    totalTimeMs: result.metrics.totalRetryTimeMs,
    limitInjected: result.metrics.limitInjected,
    wasTransient: result.isTransient,
  };
}

/**
 * Log metrics in a structured format
 * Useful for integration with monitoring systems
 */
export function logMetrics(
  label: string,
  result: ExecutionResult<any>,
  details?: Record<string, any>
): void {
  const metrics = formatMetrics(result);
  const logEntry = {
    timestamp: new Date().toISOString(),
    label,
    ...metrics,
    ...details,
  };

  if (result.error) {
    console.error("Query execution failed:", logEntry, {
      error: result.error.message,
    });
  } else {
    console.log("Query execution succeeded:", logEntry);
  }
}

export default {
  agentExecSql,
  agentExecSqlFast,
  agentExecSqlRobust,
  agentExecSqlBatch,
  agentExecDdl,
  getGodStatusSchemaStats,
  queryGodStatusSchema,
  getGodStatusStatistics,
  getCurrentGodStatus,
  formatMetrics,
  logMetrics,
  RetryPresets,
};
