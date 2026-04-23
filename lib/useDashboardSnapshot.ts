'use client'

import { useEffect, useRef, useState } from 'react'

export interface DashboardSnapshot {
  at:       string
  latency:  number
  god: null | {
    thought:    string | null
    updated_at: string | null
    mood:       string | null
    cycle:      number | null
  }
  cost: {
    total:            number
    todaySpend:       number
    recentCallsCount: number
  }
  roadmap: {
    cycles:          number
    activeGoals:     number
    activeGoalTitle: string | null
    lessonCount:     number
  }
  verifications: {
    total:  number
    passed: number
    failed: number
    byKind: Record<string, { passed: number; failed: number }>
  }
}

/**
 * Single-fetch primer for the dashboard. Components can read from this
 * instead of each firing their own poll. Refetches every `intervalMs`
 * (default 30s) — realtime deltas via Supabase are what drive per-panel
 * freshness between ticks.
 */
export function useDashboardSnapshot(intervalMs = 30_000) {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const mountedRef              = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    async function fetchOnce() {
      try {
        const res = await fetch('/api/dashboard-snapshot', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as DashboardSnapshot
        if (!cancelled && mountedRef.current) {
          setSnapshot(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled && mountedRef.current) {
          setError(e instanceof Error ? e.message : 'fetch failed')
        }
      } finally {
        if (!cancelled && mountedRef.current) setLoading(false)
      }
    }

    fetchOnce()
    const id = setInterval(fetchOnce, intervalMs)

    return () => {
      cancelled = true
      mountedRef.current = false
      clearInterval(id)
    }
  }, [intervalMs])

  return { snapshot, loading, error }
}
