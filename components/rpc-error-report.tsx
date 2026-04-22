'use client';

import React, { useState, useEffect } from 'react';
import {
  classifyRpcError,
  getErrorTypeMetadata,
  formatErrorType,
  getSeverityColor,
  formatResolutionTime,
  ErrorType,
} from '@/lib/rpc-error-classifier';

interface RpcErrorRecord {
  id: string;
  agent_name: string;
  rpc_name: string;
  error_code: string | null;
  error_message: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

interface ClassifiedError extends RpcErrorRecord {
  error_type: ErrorType;
  resolution_time_ms: number | null;
}

interface RpcErrorReportProps {
  showResolved?: boolean;
  maxItems?: number;
}

export function RpcErrorReport({ showResolved = true, maxItems = 20 }: RpcErrorReportProps) {
  const [errors, setErrors] = useState<ClassifiedError[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ErrorType | 'ALL'>('ALL');

  useEffect(() => {
    fetchErrors();
  }, []);

  async function fetchErrors() {
    try {
      setLoading(true);
      const response = await fetch('/api/rpc-errors', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch errors: ${response.statusText}`);
      }

      const data = await response.json();
      const classified = data.map((err: RpcErrorRecord) => ({
        ...err,
        error_type: classifyRpcError(err.error_code, err.error_message),
        resolution_time_ms: err.created_at && err.resolved_at ? 
          new Date(err.resolved_at).getTime() - new Date(err.created_at).getTime() : null,
      }));

      setErrors(classified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const filteredErrors = filter === 'ALL'
    ? errors.slice(0, maxItems)
    : errors.filter((e) => e.error_type === filter).slice(0, maxItems);

  const errorTypes = Array.from(new Set(errors.map((e) => e.error_type)));
  const errorCounts = errorTypes.reduce(
    (acc, type) => {
      acc[type] = errors.filter((e) => e.error_type === type).length;
      return acc;
    },
    {} as Record<ErrorType, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RPC Error Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">
            {showResolved ? 'Resolved' : 'Active'} RPC errors classified by type
          </p>
        </div>
        <button
          onClick={fetchErrors}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{errors.length}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>
          {errorTypes.map((type) => (
            <div key={type} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{errorCounts[type]}</div>
              <div className="text-sm text-gray-600">{formatErrorType(type)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Buttons */}
      {!loading && !error && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {errorTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {formatErrorType(type)} ({errorCounts[type]})
            </button>
          ))}
        </div>
      )}

      {/* Error Table */}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700">RPC Function</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Agent</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Error Type</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Error Code</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Resolution Time</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Resolved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredErrors.length > 0 ? (
                filteredErrors.map((err) => {
                  const metadata = getErrorTypeMetadata(err.error_type);
                  return (
                    <tr key={err.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-xs text-gray-700">
                        {err.rpc_name}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{err.agent_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(metadata.severity)}`}>
                          {formatErrorType(err.error_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {err.error_code || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {formatResolutionTime(err.resolution_time_ms)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {err.resolved_at ? new Date(err.resolved_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No errors to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading errors...</div>
        </div>
      )}
    </div>
  );
}
