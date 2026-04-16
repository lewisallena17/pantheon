'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, TrendingDown, X } from 'lucide-react'

interface AnomalyAlert {
  id: string
  event_id: string
  completion_rate: number
  rolling_mean: number
  rolling_stdev: number
  z_score: number
  reason: string
  detected_at: string
  window_minutes: number
  dismissed: boolean
}

export default function ThroughputAnomalyMonitor() {
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const supabase = supabaseRef.current

    // Set up real-time listener for pg_notify anomalies
    const channel = supabase
      .channel('throughput_anomalies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_throughput_events',
          filter: 'anomaly_detected=eq.true'
        },
        (payload: any) => {
          const newAnomaly: AnomalyAlert = {
            id: crypto.randomUUID(),
            event_id: payload.new.id,
            completion_rate: payload.new.completion_rate || 0,
            rolling_mean: payload.new.rolling_mean || 0,
            rolling_stdev: payload.new.rolling_stdev || 0,
            z_score: payload.new.z_score || 0,
            reason: payload.new.anomaly_reason || 'Throughput anomaly detected',
            detected_at: payload.new.detected_at,
            window_minutes: payload.new.window_minutes,
            dismissed: false
          }
          
          setAnomalies(prev => [newAnomaly, ...prev].slice(0, 10))
          
          // Play notification sound if available
          playNotificationSound()
        }
      )
      .subscribe((status: string) => {
        console.log('Anomaly monitor subscription status:', status)
        setIsMonitoring(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio notification unavailable')
    }
  }

  const dismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.map(a => 
      a.id === id ? { ...a, dismissed: true } : a
    ))
  }

  const clearAll = () => {
    setAnomalies([])
  }

  const activeAnomalies = anomalies.filter(a => !a.dismissed)

  if (!isMonitoring) {
    return (
      <div className="text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded">
        Connecting to anomaly monitor...
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activeAnomalies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-800">
                {activeAnomalies.length} Throughput Anomal{activeAnomalies.length === 1 ? 'y' : 'ies'}
              </span>
            </div>
            {activeAnomalies.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss All
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeAnomalies.map(anomaly => (
              <div
                key={anomaly.id}
                className="bg-white border border-red-100 rounded p-3 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {anomaly.reason}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Rate:</span> {anomaly.completion_rate.toFixed(1)}
                    </div>
                    <div>
                      <span className="font-medium">Mean:</span> {anomaly.rolling_mean.toFixed(1)}
                    </div>
                    <div>
                      <span className="font-medium">Z-Score:</span> {anomaly.z_score.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Window:</span> {anomaly.window_minutes}m
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(anomaly.detected_at).toLocaleTimeString()}
                  </div>
                </div>

                <button
                  onClick={() => dismissAnomaly(anomaly.id)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
