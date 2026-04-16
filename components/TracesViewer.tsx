'use client';

import { useEffect, useState } from 'react';
import {
  getRecentTraces,
  getErrorTraces,
  getToolStats,
  getAgentStats,
  getTotalTraceCount,
  Trace,
  TraceStats,
  AgentStats,
} from '@/lib/traces-queries';

/**
 * TracesViewer Component
 * 
 * Displays trace records and statistics from the traces table
 * using agent_exec_sql() queries.
 */
export function TracesViewer() {
  const [recentTraces, setRecentTraces] = useState<Trace[]>([]);
  const [errorTraces, setErrorTraces] = useState<Trace[]>([]);
  const [toolStats, setToolStats] = useState<TraceStats[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'errors' | 'tools' | 'agents'>(
    'recent'
  );

  useEffect(() => {
    loadTraceData();
  }, []);

  const loadTraceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recent, errors, tools, agents, total] = await Promise.all([
        getRecentTraces(20),
        getErrorTraces(10),
        getToolStats(10),
        getAgentStats(10),
        getTotalTraceCount(),
      ]);

      setRecentTraces(recent);
      setErrorTraces(errors);
      setToolStats(tools);
      setAgentStats(agents);
      setTotalCount(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trace data');
      console.error('Error loading trace data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return '-';
    return `${ms}ms`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  const getToolColor = (toolName: string): string => {
    const colors: { [key: string]: string } = {
      'run_sql': 'bg-blue-100 text-blue-800',
      'run_ddl': 'bg-purple-100 text-purple-800',
      'write_file': 'bg-green-100 text-green-800',
      'read_file': 'bg-amber-100 text-amber-800',
      'describe_table': 'bg-cyan-100 text-cyan-800',
      'list_tables': 'bg-indigo-100 text-indigo-800',
      'list_directory': 'bg-pink-100 text-pink-800',
      'fetch_url': 'bg-orange-100 text-orange-800',
      'web_search': 'bg-red-100 text-red-800',
    };
    return colors[toolName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trace data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">Error Loading Traces</h3>
        <p className="text-red-800 text-sm">{error}</p>
        <button
          onClick={loadTraceData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm font-semibold">Total Traces</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm font-semibold">Recent Traces (20)</div>
          <div className="text-3xl font-bold text-blue-600 mt-1">{recentTraces.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm font-semibold">Error Traces (10)</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{errorTraces.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-600 text-sm font-semibold">Unique Tools</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{toolStats.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {(['recent', 'errors', 'tools', 'agents'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Recent Traces Tab */}
          {activeTab === 'recent' && (
            <div className="space-y-2">
              {recentTraces.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent traces</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Tool</th>
                        <th className="text-left py-2 px-2">Agent</th>
                        <th className="text-left py-2 px-2">Duration</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTraces.map((trace) => (
                        <tr key={trace.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getToolColor(trace.tool_name)}`}>
                              {trace.tool_name}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-gray-600">{trace.agent_name || '-'}</td>
                          <td className="py-2 px-2">{formatDuration(trace.duration_ms)}</td>
                          <td className="py-2 px-2">
                            {trace.is_error ? (
                              <span className="text-red-600 font-semibold">Error</span>
                            ) : (
                              <span className="text-green-600 font-semibold">Success</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-gray-600 text-xs">
                            {formatDate(trace.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Error Traces Tab */}
          {activeTab === 'errors' && (
            <div className="space-y-2">
              {errorTraces.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No error traces found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-red-50">
                        <th className="text-left py-2 px-2">Tool</th>
                        <th className="text-left py-2 px-2">Agent</th>
                        <th className="text-left py-2 px-2">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorTraces.map((trace) => (
                        <tr key={trace.id} className="border-b hover:bg-red-50">
                          <td className="py-2 px-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getToolColor(trace.tool_name)}`}>
                              {trace.tool_name}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-gray-600">{trace.agent_name || '-'}</td>
                          <td className="py-2 px-2 text-gray-600 text-xs">
                            {formatDate(trace.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tool Stats Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-2">
              {toolStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tool statistics available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Tool</th>
                        <th className="text-left py-2 px-2">Count</th>
                        <th className="text-left py-2 px-2">Avg Duration</th>
                        <th className="text-left py-2 px-2">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toolStats.map((stat) => (
                        <tr key={stat.tool_name} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getToolColor(stat.tool_name)}`}>
                              {stat.tool_name}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-semibold">{stat.count}</td>
                          <td className="py-2 px-2">
                            {stat.avg_duration ? `${Math.round(stat.avg_duration)}ms` : '-'}
                          </td>
                          <td className="py-2 px-2">
                            {stat.error_count && stat.error_count > 0 ? (
                              <span className="text-red-600 font-semibold">{stat.error_count}</span>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Agent Stats Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-2">
              {agentStats.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No agent statistics available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Agent</th>
                        <th className="text-left py-2 px-2">Executions</th>
                        <th className="text-left py-2 px-2">Avg Duration</th>
                        <th className="text-left py-2 px-2">Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentStats.map((stat) => (
                        <tr key={stat.agent_name} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{stat.agent_name}</td>
                          <td className="py-2 px-2 font-semibold">{stat.exec_count}</td>
                          <td className="py-2 px-2">
                            {stat.avg_duration ? `${Math.round(stat.avg_duration)}ms` : '-'}
                          </td>
                          <td className="py-2 px-2">
                            {stat.error_count && stat.error_count > 0 ? (
                              <span className="text-red-600 font-semibold">{stat.error_count}</span>
                            ) : (
                              <span className="text-green-600">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={loadTraceData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
