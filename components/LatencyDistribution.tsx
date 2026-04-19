'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

function percentile(sorted: number[], p: number) {
  if (!sorted.length) return 0
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)))
  return sorted[idx]
}

function fmtMs(ms: number) {
  if (ms < 1000)      return `${Math.round(ms)}ms`
  if (ms < 60_000)    return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`
  return `${(ms / 3_600_000).toFixed(1)}h`
}

const BUCKET_EDGES_MS = [
  5_000, 15_000, 30_000, 60_000, 120_000, 300_000, 600_000, 1_200_000, 3_600_000, Infinity,
]
const BUCKET_LABELS = [
  '<5s', '5–15s', '15–30s', '30s–1m', '1–2m', '2–5m', '5–10m', '10–20m', '20–60m', '>1h',
]

export default function LatencyDistribution({ todos }: Props) {
  const { stats, buckets, slowest } = useMemo(() => {
    const durations: { id: string; title: string; ms: number; agent: string | null }[] = []
    for (const t of todos) {
      if (t.status !== 'completed') continue
      const start = new Date(t.created_at).getTime()
      const end   = new Date(t.updated_at).getTime()
      if (!Number.isFinite(start) || !Number.isFinite(end)) continue
      const ms = end - start
      if (ms <= 0 || ms > 6 * 3_600_000) continue // drop absurd outliers (>6h — likely stale)
      durations.push({ id: t.id, title: t.title, ms, agent: t.assigned_agent })
    }

    const sortedMs = durations.map(d => d.ms).sort((a, b) => a - b)
    const bucketsArr = new Array(BUCKET_EDGES_MS.length).fill(0)
    for (const ms of sortedMs) {
      for (let i = 0; i < BUCKET_EDGES_MS.length; i++) {
        if (ms < BUCKET_EDGES_MS[i]) { bucketsArr[i]++; break }
      }
    }
    const slowestArr = [...durations].sort((a, b) => b.ms - a.ms).slice(0, 5)

    return {
      stats: {
        count: sortedMs.length,
        p50: percentile(sortedMs, 50),
        p90: percentile(sortedMs, 90),
        p99: percentile(sortedMs, 99),
        avg: sortedMs.length ? sortedMs.reduce((s, x) => s + x, 0) / sortedMs.length : 0,
      },
      buckets: bucketsArr,
      slowest: slowestArr,
    }
  }, [todos])

  if (!stats.count) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◎ Latency</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No completed tasks yet — nothing to measure.
        </div>
      </div>
    )
  }

  const maxBucket = Math.max(...buckets)

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◎ Latency Distribution</span>
        <span className="text-[10px] font-mono text-slate-600">{stats.count} completed tasks</span>
      </div>

      {/* P50/P90/P99 strip */}
      <div className="grid grid-cols-4 divide-x divide-slate-800/40 border-b border-slate-800/40">
        {[
          { label: 'P50',  value: stats.p50, note: 'median',             color: 'text-emerald-300' },
          { label: 'P90',  value: stats.p90, note: '90% finish by',      color: 'text-cyan-300'    },
          { label: 'P99',  value: stats.p99, note: 'tail latency',       color: 'text-amber-300'   },
          { label: 'AVG',  value: stats.avg, note: 'mean',               color: 'text-slate-300'   },
        ].map(s => (
          <div key={s.label} className="px-3 py-2">
            <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase">{s.label} · {s.note}</div>
            <div className={`text-lg font-black font-mono tabular-nums ${s.color}`}>{fmtMs(s.value)}</div>
          </div>
        ))}
      </div>

      {/* Histogram */}
      <div className="p-3 space-y-1">
        {buckets.map((count, i) => {
          const pct = maxBucket > 0 ? (count / maxBucket) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-slate-600 w-16 text-right">{BUCKET_LABELS[i]}</span>
              <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden">
                <div className="h-full bg-purple-700/60 rounded" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-slate-500 tabular-nums w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Slowest offenders */}
      {slowest.length > 0 && (
        <div className="border-t border-slate-800/40 p-3">
          <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase mb-1.5">Slowest</div>
          <div className="space-y-1">
            {slowest.map(t => (
              <div key={t.id} className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-amber-400 tabular-nums w-14 text-right">{fmtMs(t.ms)}</span>
                <span className="text-purple-500/70 truncate w-28">{t.agent ?? '—'}</span>
                <span className="text-slate-400 flex-1 truncate">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
