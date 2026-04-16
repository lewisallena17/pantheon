'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription';

interface DLQTask {
  dlq_id: string;
  task_id: string;
  task_title: string;
  original_status: string;
  failure_reason: string | null;
  retry_count: number;
  max_retries: number;
  base_backoff_seconds: number;
  next_retry_at: string;
  is_eligible: boolean;
  time_until_retry_seconds: number;
  first_failed_at: string;
  last_failed_at: string;
}

interface DLQStats {
  total_tasks: number;
  eligible_for_retry: number;
  max_retries_exceeded: number;
  average_time_until_retry: number;
}

export default function DLQManagementPanel() {
  const [dlqTasks, setDlqTasks] = useState<DLQTask[]>([]);
  const [stats, setStats] = useState<DLQStats>({
    total_tasks: 0,
    eligible_for_retry: 0,
    max_retries_exceeded: 0,
    average_time_until_retry: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [requeuing, setRequeuing] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch DLQ tasks with retry schedules
  const fetchDLQTasks = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase.rpc(
        'get_dlq_tasks_with_retry_schedule'
      );

      if (fetchError) throw fetchError;

      const tasks = (data || []) as DLQTask[];
      setDlqTasks(tasks);

      // Calculate stats
      const eligible = tasks.filter(t => t.is_eligible).length;
      const maxExceeded = tasks.filter(
        t => t.retry_count >= t.max_retries
      ).length;
      const avgTime =
        tasks.length > 0
          ? tasks.reduce((sum, t) => sum + t.time_until_retry_seconds, 0) /
            tasks.length
          : 0;

      setStats({
        total_tasks: tasks.length,
        eligible_for_retry: eligible,
        max_retries_exceeded: maxExceeded,
        average_time_until_retry: Math.round(avgTime),
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DLQ tasks');
      setLoading(false);
    }
  };

  // Subscribe to realtime updates
  useRealtimeSubscription(
    'tasks_failed_dlq',
    () => {
      fetchDLQTasks();
    }
  );

  // Initial fetch
  useEffect(() => {
    fetchDLQTasks();
  }, []);

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDLQTasks();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle manual requeue
  const handleRequeue = async (taskId: string) => {
    try {
      setRequeuing(prev => new Set([...prev, taskId]));

      const { data, error: requeueError } = await supabase.rpc(
        'requeue_task',
        { p_task_id: taskId }
      );

      if (requeueError) throw requeueError;

      // Show success message
      alert(`✓ ${data[0]?.message || 'Task requeued successfully'}`);

      // Refresh tasks
      await fetchDLQTasks();
    } catch (err) {
      alert(
        `Error: ${err instanceof Error ? err.message : 'Failed to requeue task'}`
      );
    } finally {
      setRequeuing(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Ready';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) return `${minutes}m ${secs}s`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading DLQ tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🚨 Dead Letter Queue (DLQ) Manager
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automatic exponential backoff with jitter retry scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-slate-700 text-slate-300 border border-slate-600'
            }`}
          >
            {autoRefresh ? '🔄 Live' : '⏸️ Paused'}
          </button>
          <button
            onClick={fetchDLQTasks}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Total in DLQ
          </div>
          <div className="text-3xl font-bold text-white mt-2">
            {stats.total_tasks}
          </div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <div className="text-xs text-blue-300 uppercase tracking-wide">
            Eligible Now
          </div>
          <div className="text-3xl font-bold text-blue-300 mt-2">
            {stats.eligible_for_retry}
          </div>
        </div>

        <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
          <div className="text-xs text-orange-300 uppercase tracking-wide">
            Max Retries Hit
          </div>
          <div className="text-3xl font-bold text-orange-300 mt-2">
            {stats.max_retries_exceeded}
          </div>
        </div>

        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
          <div className="text-xs text-purple-300 uppercase tracking-wide">
            Avg Wait Time
          </div>
          <div className="text-3xl font-bold text-purple-300 mt-2">
            {formatTimeRemaining(stats.average_time_until_retry)}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {dlqTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✨</div>
          <div className="text-lg font-semibold text-white">No tasks in DLQ</div>
          <div className="text-sm text-slate-400">
            All tasks are healthy and running smoothly
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {dlqTasks.map(task => (
            <div
              key={task.dlq_id}
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                selectedTask === task.dlq_id
                  ? 'bg-slate-700/80 border-blue-500/60'
                  : 'bg-slate-700/40 border-slate-600 hover:border-slate-500'
              }`}
              onClick={() =>
                setSelectedTask(
                  selectedTask === task.dlq_id ? null : task.dlq_id
                )
              }
            >
              {/* Main row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xl ${
                        task.is_eligible ? '🔵' : '⏳'
                      }`}
                    ></span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {task.task_title || `Task ${task.task_id.slice(0, 8)}`}
                      </div>
                      <div className="text-xs text-slate-400">
                        {task.failure_reason || 'No failure reason recorded'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status badge and countdown */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        task.is_eligible
                          ? 'text-green-400'
                          : task.retry_count >= task.max_retries
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {task.retry_count >= task.max_retries
                        ? '❌ Max retries'
                        : task.is_eligible
                        ? '✅ Ready'
                        : '⏳ Waiting'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {task.retry_count}/{task.max_retries} retries
                    </div>
                  </div>

                  {/* Countdown timer */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-white">
                      {formatTimeRemaining(task.time_until_retry_seconds)}
                    </div>
                    <div className="text-xs text-slate-400">until retry</div>
                  </div>

                  {/* Requeue button */}
                  {task.retry_count < task.max_retries && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleRequeue(task.task_id);
                      }}
                      disabled={requeuing.has(task.task_id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {requeuing.has(task.task_id) ? '...' : 'Retry Now'}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {selectedTask === task.dlq_id && (
                <div className="mt-4 pt-4 border-t border-slate-600 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Task ID</div>
                    <div className="text-white font-mono text-xs">
                      {task.task_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Original Status</div>
                    <div className="text-white capitalize">
                      {task.original_status}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">First Failed</div>
                    <div className="text-white text-xs">
                      {formatDate(task.first_failed_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Last Failed</div>
                    <div className="text-white text-xs">
                      {formatDate(task.last_failed_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Next Retry At</div>
                    <div className="text-white text-xs">
                      {formatDate(task.next_retry_at)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Base Backoff</div>
                    <div className="text-white">
                      {task.base_backoff_seconds}s
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info footer */}
      <div className="text-xs text-slate-500 border-t border-slate-700 pt-4">
        <div>
          ℹ️ Exponential backoff formula: base_backoff × 2^retry_count + jitter
          (0-20%)
        </div>
        <div className="mt-2">
          🤖 pg_cron job automatically requeues eligible tasks every 30
          seconds
        </div>
      </div>
    </div>
  );
}
