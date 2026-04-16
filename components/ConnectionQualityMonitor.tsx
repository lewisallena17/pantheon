'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Configuration for the connection quality monitor
 */
export interface ConnectionQualityConfig {
  /** Threshold in ms for p95 latency before triggering degradation warnings */
  p95ThresholdMs: number
  /** Window size in ms for rolling p95 calculation (default 60s) */
  windowSizeMs: number
  /** Interval between heartbeat pings in ms */
  pingIntervalMs: number
  /** Timeout for ping response in ms */
  pingTimeoutMs: number
  /** Enable SSE fallback when p95 exceeds threshold */
  enableSseFallback: boolean
  /** Enable logging of degradation events to database */
  enableEventLogging: boolean
}

interface LatencyMeasurement {
  timestamp: number
  latencyMs: number
  success: boolean
}

interface SignalStrength {
  level: 'excellent' | 'good' | 'fair' | 'poor'
  p95Latency: number
  percentileBucket: number
}

/**
 * ConnectionQualityMonitor - WebSocket-aware connection quality monitor
 * 
 * Measures Supabase Realtime round-trip latency via periodic ping broadcasts
 * on a dedicated heartbeat channel. Computes rolling p95 latency over a 60-second
 * window and automatically triggers SSE fallback mode when p95 exceeds threshold.
 */
export default function ConnectionQualityMonitor({
  config = defaultConfig,
  onSignalChange,
  onFallbackTriggered,
}: {
  config?: Partial<ConnectionQualityConfig>
  onSignalChange?: (signal: SignalStrength) => void
  onFallbackTriggered?: (reason: string) => void
}) {
  const configRef = useRef({ ...defaultConfig, ...config })
  const latenciesRef = useRef<LatencyMeasurement[]>([])
  const [signal, setSignal] = useState<SignalStrength>({
    level: 'excellent',
    p95Latency: 0,
    percentileBucket: 0,
  })
  const [isConnected, setIsConnected] = useState(true)
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingPingsRef = useRef<Map<number, { sentAt: number; timeoutId: ReturnType<typeof setTimeout> }>>(new Map())
  const channelRef = useRef<any>(null)
  const supabaseRef = useRef<any>(null)
  const fallbackModeRef = useRef<'websocket' | 'sse' | null>(null)

  /**
   * Calculate p95 from latency measurements
   */
  const calculateP95 = useCallback(() => {
    const validMeasurements = latenciesRef.current
      .filter(m => m.success && Date.now() - m.timestamp < configRef.current.windowSizeMs)
      .map(m => m.latencyMs)
      .sort((a, b) => a - b)

    if (validMeasurements.length === 0) return 0

    const p95Index = Math.ceil(validMeasurements.length * 0.95) - 1
    return validMeasurements[Math.max(0, p95Index)]
  }, [])

  /**
   * Determine signal strength based on p95 latency
   */
  const getSignalStrength = useCallback((p95Latency: number): SignalStrength => {
    let level: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent'
    let percentileBucket = 100

    if (p95Latency < 50) {
      level = 'excellent'
      percentileBucket = 100
    } else if (p95Latency < 100) {
      level = 'good'
      percentileBucket = 75
    } else if (p95Latency < 200) {
      level = 'fair'
      percentileBucket = 50
    } else {
      level = 'poor'
      percentileBucket = 25
    }

    return { level, p95Latency, percentileBucket }
  }, [])

  /**
   * Log connection degradation event to database
   */
  const logDegradationEvent = useCallback(
    async (
      eventType: 'degradation_detected' | 'recovery' | 'fallback_triggered' | 'fallback_restored',
      p95Latency: number,
      details?: Record<string, any>
    ) => {
      if (!configRef.current.enableEventLogging) return

      try {
        const supabase = createClient()
        await supabase.from('connection_quality_events').insert({
          event_type: eventType,
          p95_latency_ms: p95Latency,
          threshold_ms: configRef.current.p95ThresholdMs,
          channel_name: 'heartbeat',
          fallback_mode: fallbackModeRef.current,
          details: details || {},
        })
      } catch (err) {
        console.error('Failed to log connection degradation event:', err)
      }
    },
    []
  )

  /**
   * Handle ping response - measure round-trip latency
   */
  const handlePingResponse = useCallback(
    (pingId: number, receivedAt: number) => {
      const pending = pendingPingsRef.current.get(pingId)
      if (!pending) return

      const latencyMs = receivedAt - pending.sentAt
      clearTimeout(pending.timeoutId)
      pendingPingsRef.current.delete(pingId)

      const measurement: LatencyMeasurement = {
        timestamp: receivedAt,
        latencyMs,
        success: true,
      }
      latenciesRef.current.push(measurement)

      // Keep only measurements within window
      const windowStart = Date.now() - configRef.current.windowSizeMs
      latenciesRef.current = latenciesRef.current.filter(m => m.timestamp >= windowStart)

      // Update signal strength
      const p95 = calculateP95()
      const newSignal = getSignalStrength(p95)
      setSignal(newSignal)
      onSignalChange?.(newSignal)

      // Check for degradation
      const wasPoor = signal.level === 'poor'
      const isPoor = newSignal.level === 'poor'

      if (!wasPoor && isPoor) {
        logDegradationEvent('degradation_detected', p95, {
          previousLevel: signal.level,
          newLevel: newSignal.level,
          measurementCount: latenciesRef.current.length,
        })
      } else if (wasPoor && !isPoor) {
        logDegradationEvent('recovery', p95, {
          previousLevel: signal.level,
          newLevel: newSignal.level,
        })
      }

      // Trigger SSE fallback if needed
      if (configRef.current.enableSseFallback && p95 > configRef.current.p95ThresholdMs) {
        if (fallbackModeRef.current !== 'sse') {
          fallbackModeRef.current = 'sse'
          logDegradationEvent('fallback_triggered', p95, {
            reason: 'p95_exceeded_threshold',
            p95,
            threshold: configRef.current.p95ThresholdMs,
          })
          onFallbackTriggered?.(
            `p95 latency ${p95.toFixed(0)}ms exceeded threshold ${configRef.current.p95ThresholdMs}ms`
          )
        }
      } else if (fallbackModeRef.current === 'sse' && p95 < configRef.current.p95ThresholdMs * 0.8) {
        fallbackModeRef.current = 'websocket'
        logDegradationEvent('fallback_restored', p95, {
          reason: 'latency_recovered',
          p95,
          threshold: configRef.current.p95ThresholdMs,
        })
      }
    },
    [signal, calculateP95, getSignalStrength, onSignalChange, onFallbackTriggered, logDegradationEvent]
  )

  /**
   * Send a ping and track response
   */
  const sendPing = useCallback(async () => {
    if (!channelRef.current || !isConnected) return

    const pingId = Date.now()
    const sentAt = pingId

    const timeoutId = setTimeout(() => {
      pendingPingsRef.current.delete(pingId)

      const measurement: LatencyMeasurement = {
        timestamp: Date.now(),
        latencyMs: configRef.current.pingTimeoutMs,
        success: false,
      }
      latenciesRef.current.push(measurement)

      // Keep only measurements within window
      const windowStart = Date.now() - configRef.current.windowSizeMs
      latenciesRef.current = latenciesRef.current.filter(m => m.timestamp >= windowStart)

      // Update signal on timeout
      const p95 = calculateP95()
      const newSignal = getSignalStrength(p95)
      setSignal(newSignal)
      onSignalChange?.(newSignal)
    }, configRef.current.pingTimeoutMs)

    pendingPingsRef.current.set(pingId, { sentAt, timeoutId })

    try {
      channelRef.current.send({
        type: 'broadcast',
        event: 'heartbeat:ping',
        payload: { pingId, sentAt },
      })
    } catch (err) {
      clearTimeout(timeoutId)
      pendingPingsRef.current.delete(pingId)
      console.error('Failed to send ping:', err)
      setIsConnected(false)
    }
  }, [isConnected, calculateP95, getSignalStrength, onSignalChange])

  /**
   * Initialize heartbeat channel and start ping cycle
   */
  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase

    const heartbeatChannel = supabase.channel('heartbeat', {
      config: {
        broadcast: { ack: false },
      },
    })

    // Listen for pong responses from other clients (for testing) or own pongs
    heartbeatChannel.on('broadcast', { event: 'heartbeat:pong' }, (payload) => {
      const { data } = payload
      if (data?.pingId && typeof data.pingId === 'number') {
        handlePingResponse(data.pingId, Date.now())
      }
    })

    // Also listen for pings and respond with pongs to support multi-client testing
    heartbeatChannel.on('broadcast', { event: 'heartbeat:ping' }, (payload) => {
      const { data } = payload
      if (data?.pingId && typeof data.pingId === 'number') {
        try {
          heartbeatChannel.send({
            type: 'broadcast',
            event: 'heartbeat:pong',
            payload: { pingId: data.pingId },
          })
        } catch (err) {
          // Silently fail on pong send
        }
      }
    })

    heartbeatChannel
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          // Start pinging once connected
          if (pingTimerRef.current) clearInterval(pingTimerRef.current)
          pingTimerRef.current = setInterval(sendPing, configRef.current.pingIntervalMs)
        } else if (status === 'CLOSED') {
          if (pingTimerRef.current) clearInterval(pingTimerRef.current)
        }
      })

    channelRef.current = heartbeatChannel

    // Cleanup
    return () => {
      if (pingTimerRef.current) clearInterval(pingTimerRef.current)
      pendingPingsRef.current.forEach(({ timeoutId }) => clearTimeout(timeoutId))
      pendingPingsRef.current.clear()
      heartbeatChannel.unsubscribe()
    }
  }, [sendPing, handlePingResponse])

  return null // This is a monitoring component with no visual output
}

/**
 * Default configuration
 */
export const defaultConfig: ConnectionQualityConfig = {
  p95ThresholdMs: 150,
  windowSizeMs: 60000, // 60 seconds
  pingIntervalMs: 5000, // 5 seconds
  pingTimeoutMs: 10000, // 10 seconds
  enableSseFallback: true,
  enableEventLogging: true,
}
