'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

interface ConnectionQualityEvent {
  id: string;
  event_type: string;
  p95_latency_ms: number;
  threshold_ms: number;
  channel_name?: string;
  created_at: string;
  resolved_at?: string;
  dismissed_at?: string;
  resolution_notes?: string;
  updated_at: string;
}

interface DismissResult {
  success: boolean;
  message: string;
  dismissed_at: string;
  event_id: string;
}

interface BatchDismissResult {
  total_resolved: number;
  total_dismissed: number;
  message: string;
}

export default function ResolvedAnomaliesList() {
  const [anomalies, setAnomalies] = useState<ConnectionQualityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState<string | null>(null);
  const [batchDismissing, setBatchDismissing] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Fetch resolved anomalies
  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('connection_quality_events')
        .select('*')
        .not('resolved_at', 'is', null)
        .is('dismissed_at', null)
        .order('resolved_at', { ascending: false });

      if (error) throw error;
      setAnomalies(data || []);
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Failed to fetch anomalies: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Dismiss a single anomaly
  const dismissAnomaly = async (eventId: string) => {
    try {
      setDismissing(eventId);
      const { data, error } = await supabase.rpc('dismiss_anomaly', {
        p_event_id: eventId,
        p_resolution_notes: 'Dismissed from UI',
      });

      if (error) throw error;

      const result = (data as DismissResult[])?.[0];
      if (result?.success) {
        setMessage({
          type: 'success',
          text: `Anomaly dismissed successfully at ${format(new Date(result.dismissed_at), 'PPpp')}`,
        });
        // Remove from list
        setAnomalies(anomalies.filter((a) => a.id !== eventId));
      } else {
        setMessage({
          type: 'error',
          text: result?.message || 'Failed to dismiss anomaly',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Error dismissing anomaly: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setDismissing(null);
    }
  };

  // Batch dismiss all resolved anomalies
  const batchDismissAnomalies = async () => {
    try {
      setBatchDismissing(true);
      const { data, error } = await supabase.rpc(
        'dismiss_resolved_anomalies_batch'
      );

      if (error) throw error;

      const result = (data as BatchDismissResult[])?.[0];
      setMessage({
        type: 'success',
        text: `${result.message}. Total dismissed: ${result.total_dismissed}`,
      });

      // Refresh the list
      await fetchAnomalies();
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Error in batch dismiss: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    } finally {
      setBatchDismissing(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('connection_quality:resolved_anomalies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connection_quality_events',
          filter: 'resolved_at=is.not.null&dismissed_at=is.null',
        },
        () => {
          fetchAnomalies();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2">Loading anomalies...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Resolved Anomalies</h1>

        {message && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {anomalies.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            ✅ No resolved anomalies to dismiss
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {anomalies.length} resolved anomalies pending dismissal
              </span>
              <button
                onClick={batchDismissAnomalies}
                disabled={batchDismissing}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {batchDismissing ? 'Dismissing...' : 'Dismiss All'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-3 text-left">Event Type</th>
                    <th className="border p-3 text-left">Latency</th>
                    <th className="border p-3 text-left">Channel</th>
                    <th className="border p-3 text-left">Created</th>
                    <th className="border p-3 text-left">Resolved</th>
                    <th className="border p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="hover:bg-gray-50">
                      <td className="border p-3">
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {anomaly.event_type}
                        </span>
                      </td>
                      <td className="border p-3">
                        {anomaly.p95_latency_ms.toFixed(2)}ms /
                        {anomaly.threshold_ms.toFixed(2)}ms
                      </td>
                      <td className="border p-3">{anomaly.channel_name || '-'}</td>
                      <td className="border p-3 text-sm">
                        {format(new Date(anomaly.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="border p-3 text-sm">
                        {anomaly.resolved_at
                          ? format(new Date(anomaly.resolved_at), 'MMM dd, HH:mm')
                          : '-'}
                      </td>
                      <td className="border p-3 text-center">
                        <button
                          onClick={() => dismissAnomaly(anomaly.id)}
                          disabled={dismissing === anomaly.id}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {dismissing === anomaly.id ? '...' : 'Dismiss'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
