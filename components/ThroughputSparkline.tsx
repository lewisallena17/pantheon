'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

interface ThroughputPoint {
  timestamp: Date
  completionRate: number
  mean: number
  stdev: number
}

interface AnomalyMarker {
  id: string
  timestamp: Date
  zScore: number
  reason: string
  dismissed: boolean
}

const SPARKLINE_WIDTH = 280
const SPARKLINE_HEIGHT = 60
const PADDING = 8

export default function ThroughputSparkline({ windowMinutes = 60 }: { windowMinutes?: number }) {
  const [points, setPoints] = useState<ThroughputPoint[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyMarker[]>([])
  const [loading, setLoading] = useState(true)
  const [maxRate, setMaxRate] = useState(10)

  const supabase = createClient()

  useEffect(() => {
    // Load throughput history
    const loadThroughputData = async () => {
      try {
        const { data, error } = await supabase
          .from('task_throughput_events')
          .select('*')
          .order('detected_at', { ascending: true })
          .limit(30)

        if (error) throw error

        const newPoints: ThroughputPoint[] = (data || []).map(event => ({
          timestamp: new Date(event.detected_at),
          completionRate: event.completion_rate || 0,
          mean: event.rolling_mean || 0,
          stdev: event.rolling_stdev || 0,
        }))

        setPoints(newPoints)

        const max = Math.max(
          10,
          ...newPoints.map(p => p.completionRate + (p.stdev || 5))
        )
        setMaxRate(max)

        // Extract undismissed anomalies
        const newAnomalies = (data || [])
          .filter(e => e.anomaly_detected && !e.dismissed_at)
          .map(e => ({
            id: e.id,
            timestamp: new Date(e.detected_at),
            zScore: e.z_score || 0,
            reason: e.anomaly_reason || 'Unknown anomaly',
            dismissed: false,
          }))

        setAnomalies(newAnomalies)
      } catch (err) {
        console.error('Failed to load throughput data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadThroughputData()

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('throughput_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_throughput_events',
        },
        payload => {
          const event = payload.new
          if (event?.anomaly_detected && !event?.dismissed_at) {
            const newAnomaly: AnomalyMarker = {
              id: event.id,
              timestamp: new Date(event.detected_at),
              zScore: event.z_score || 0,
              reason: event.anomaly_reason || 'Unknown anomaly',
              dismissed: false,
            }
            setAnomalies(prev => [...prev, newAnomaly].slice(-10))
          }
          // Refresh points
          loadThroughputData()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, windowMinutes])

  if (loading) {
    return (
      <div className="h-20 bg-black/40 border border-cyan-500/20 rounded flex items-center justify-center">
        <span className="text-xs text-slate-500">Loading throughput data...</span>
      </div>
    )
  }

  // Scale functions
  const scaleX = (index: number, total: number) => {
    if (total === 0) return PADDING
    return PADDING + (index / Math.max(1, total - 1)) * (SPARKLINE_WIDTH - 2 * PADDING)
  }

  const scaleY = (value: number) => {
    const normalized = value / maxRate
    return SPARKLINE_HEIGHT - PADDING - normalized * (SPARKLINE_HEIGHT - 2 * PADDING)
  }

  // Build sparkline path
  let sparklinePath = ''
  if (points.length > 0) {
    sparklinePath = points
      .map((point, i) => {
        const x = scaleX(i, points.length)
        const y = scaleY(point.completionRate)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }

  // Calculate anomaly positions
  const anomalyPositions = anomalies.map(anomaly => {
    const targetDate = anomaly.timestamp
    const idx = points.findIndex(
      p => Math.abs(p.timestamp.getTime() - targetDate.getTime()) < 60000
    )
    if (idx === -1) return null

    return {
      anomaly,
      x: scaleX(idx, points.length),
    }
  }).filter((x): x is { anomaly: AnomalyMarker; x: number } => x !== null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs font-mono text-slate-400 tracking-widest">
            THROUGHPUT SPARKLINE
          </div>
          <div className="text-xs text-slate-500">
            {windowMinutes}-min rolling window | {points.length} samples
          </div>
        </div>
        {anomalies.length > 0 && (
          <div className="text-xs font-mono text-orange-400">
            {anomalies.length} ANOMALY{anomalies.length !== 1 ? 'IES' : ''}
          </div>
        )}
      </div>

      {/* SVG Sparkline with anomaly bands */}
      <svg
        width={SPARKLINE_WIDTH}
        height={SPARKLINE_HEIGHT}
        className="bg-black/40 border border-cyan-500/20 rounded"
      >
        {/* Background grid */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 15"
              fill="none"
              stroke="rgba(0,212,255,0.05)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT} fill="url(#grid)" />

        {/* Anomaly vertical bands */}
        {anomalyPositions.map(({ anomaly, x }) => (
          <g key={anomaly.id}>
            <rect
              x={x - 3}
              y="0"
              width="6"
              height={SPARKLINE_HEIGHT}
              fill="rgba(255, 107, 0, 0.1)"
              className="hover:fill-orange-500/20 transition-colors"
            />
            <line
              x1={x}
              y1="0"
              x2={x}
              y2={SPARKLINE_HEIGHT}
              stroke="rgba(255, 107, 0, 0.5)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </g>
        ))}

        {/* Main sparkline */}
        {sparklinePath && (
          <path
            d={sparklinePath}
            fill="none"
            stroke="rgba(0, 212, 255, 0.6)"
            strokeWidth="1.5"
          />
        )}

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={scaleX(i, points.length)}
            cy={scaleY(point.completionRate)}
            r="1.5"
            fill="rgba(0, 212, 255, 0.8)"
          />
        ))}

        {/* Anomaly markers */}
        {anomalyPositions.map(({ anomaly, x }) => (
          <circle
            key={`marker-${anomaly.id}`}
            cx={x}
            cy={scaleY(points.find(p => 
              Math.abs(p.timestamp.getTime() - anomaly.timestamp.getTime()) < 60000
            )?.completionRate || 0)}
            r="3"
            fill="none"
            stroke="rgba(255, 107, 0, 0.8)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500/60" />
          <span>Completion Rate</span>
        </div>
        {anomalies.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-orange-500" />
            <span>Anomaly</span>
          </div>
        )}
      </div>
    </div>
  )
}
