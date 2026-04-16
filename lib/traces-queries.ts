/**
 * Trace Query Helper Functions
 * 
 * This module provides type-safe helper functions for querying the traces table
 * using the agent_exec_sql() database function.
 */

import { createClient } from '@supabase/supabase-js';

// Type definitions for trace records
export interface Trace {
  id: string;
  task_id?: string;
  agent_name?: string;
  tool_name: string;
  input_summary?: string;
  result_summary?: string;
  duration_ms?: number;
  is_error?: boolean;
  created_at?: string;
}

export interface TraceStats {
  tool_name: string;
  count: number;
  avg_duration?: number;
  error_count?: number;
}

export interface AgentStats {
  agent_name: string;
  exec_count: number;
  error_count?: number;
  avg_duration?: number;
}

/**
 * Query recent trace records
 * @param limit Number of records to retrieve (default: 10)
 * @returns Array of recent traces ordered by created_at DESC
 */
export async function getRecentTraces(
  limit: number = 10
): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary, 
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `,
  });

  if (error) throw new Error(`Failed to fetch recent traces: ${error.message}`);
  
  // Extract traces from the nested response structure
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}

/**
 * Count total traces in the system
 * @returns Total number of trace records
 */
export async function getTotalTraceCount(): Promise<number> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: 'SELECT COUNT(*) as total_traces FROM traces',
  });

  if (error) throw new Error(`Failed to count traces: ${error.message}`);
  
  const result = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql?.[0]
    : null;
  
  return result?.total_traces || 0;
}

/**
 * Get tool execution statistics
 * @param limit Maximum number of tools to return (default: 10)
 * @returns Array of tool statistics ordered by execution count DESC
 */
export async function getToolStats(limit: number = 10): Promise<TraceStats[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT tool_name, 
             COUNT(*) as count,
             AVG(duration_ms) as avg_duration,
             COUNT(CASE WHEN is_error = true THEN 1 END) as error_count
      FROM traces 
      GROUP BY tool_name 
      ORDER BY count DESC 
      LIMIT ${limit}
    `,
  });

  if (error) throw new Error(`Failed to fetch tool stats: ${error.message}`);
  
  const stats = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return stats as TraceStats[];
}

/**
 * Get agent execution statistics
 * @param limit Maximum number of agents to return (default: 10)
 * @returns Array of agent statistics ordered by execution count DESC
 */
export async function getAgentStats(limit: number = 10): Promise<AgentStats[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT agent_name,
             COUNT(*) as exec_count,
             COUNT(CASE WHEN is_error = true THEN 1 END) as error_count,
             AVG(duration_ms) as avg_duration
      FROM traces 
      WHERE agent_name IS NOT NULL
      GROUP BY agent_name 
      ORDER BY exec_count DESC 
      LIMIT ${limit}
    `,
  });

  if (error) throw new Error(`Failed to fetch agent stats: ${error.message}`);
  
  const stats = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return stats as AgentStats[];
}

/**
 * Get error traces
 * @param limit Maximum number of error traces to return (default: 20)
 * @returns Array of traces where is_error = true
 */
export async function getErrorTraces(limit: number = 20): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary,
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      WHERE is_error = true 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `,
  });

  if (error) throw new Error(`Failed to fetch error traces: ${error.message}`);
  
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}

/**
 * Get traces by tool name
 * @param toolName Name of the tool to filter by
 * @param limit Maximum number of traces to return (default: 20)
 * @returns Array of traces for the specified tool
 */
export async function getTracesByTool(
  toolName: string,
  limit: number = 20
): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary,
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      WHERE tool_name = '${toolName.replace(/'/g, "''")}'
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `,
  });

  if (error) {
    throw new Error(
      `Failed to fetch traces for tool '${toolName}': ${error.message}`
    );
  }
  
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}

/**
 * Get traces by agent name
 * @param agentName Name of the agent to filter by
 * @param limit Maximum number of traces to return (default: 20)
 * @returns Array of traces for the specified agent
 */
export async function getTracesByAgent(
  agentName: string,
  limit: number = 20
): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary,
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      WHERE agent_name = '${agentName.replace(/'/g, "''")}'
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `,
  });

  if (error) {
    throw new Error(
      `Failed to fetch traces for agent '${agentName}': ${error.message}`
    );
  }
  
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}

/**
 * Get traces within a time range
 * @param hoursAgo Number of hours to look back (default: 1)
 * @param limit Maximum number of traces to return (default: 50)
 * @returns Array of traces from the specified time period
 */
export async function getTracesInTimeRange(
  hoursAgo: number = 1,
  limit: number = 50
): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary,
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      WHERE created_at > NOW() - INTERVAL '${hoursAgo} hour'
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `,
  });

  if (error) {
    throw new Error(
      `Failed to fetch traces from last ${hoursAgo} hours: ${error.message}`
    );
  }
  
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}

/**
 * Get slowest tool executions
 * @param limit Maximum number of traces to return (default: 20)
 * @returns Array of slowest traces ordered by duration_ms DESC
 */
export async function getSlowestTraces(limit: number = 20): Promise<Trace[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.rpc('agent_exec_sql', {
    query: `
      SELECT id, task_id, agent_name, tool_name, input_summary,
             result_summary, duration_ms, is_error, created_at 
      FROM traces 
      WHERE duration_ms IS NOT NULL
      ORDER BY duration_ms DESC 
      LIMIT ${limit}
    `,
  });

  if (error) {
    throw new Error(`Failed to fetch slowest traces: ${error.message}`);
  }
  
  const traces = Array.isArray(data) && data.length > 0 
    ? (data[0] as any).agent_exec_sql || []
    : [];
  
  return traces as Trace[];
}
