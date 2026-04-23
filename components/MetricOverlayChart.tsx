'use client'

import { useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'
import PanelShell from './PanelShell'

type Metric = 'completed' | 'failed' | 'successRate' | 'activeCount' | 'cost'

const METRIC_COLORS: Record<Metric, string> = {
  completed:   '#34d399',  // emerald
  failed:      '#f87171',  // red
  successRate: '#60a5fa',  // blue
  activeCount: '#22d3ee',  // cyan
  cost:        '#fbbf24',  // amber
}
const METRIC_LABELS: Record<Metric, string> = {
  completed:   'Completed',
  failed:      'Failed',
  successRate: 'Success %',
  activeCount: 'Active',
  cost:        'Cost $',
}

interface Props {
  todos: Todo[]
  /** Sessions from /api/cost so we can plot cost per day. */
  costSessions?: Array<{ at: string; cost: number }>
}

/**
 * Borrowed from NASA Open MCT: pick any two metrics, overlay them on one
 * chart to spot correlations. Daily buckets over the last 14 days, each
 * series normalised to its own max so they share axes visually.
 */
export default function MetricOverlayChart({ todos, costSessions = [] }: Props) {
  const [metricA, setMetricA] = useState<Metric>('completed')
  const [metricB, setMetricB] = useState<Metric>('cost')

  const series = useMemo(() => buildSeries(todos, costSessions), [todos, costSessions])

  return (
    <PanelShell
      title="Metric Overlay"
      icon="≋"
      tone="emerald"
      collapsible
      id="metric-overlay"
      defaultOpen={false}
      chipRight={<span className="text-[9px] font-mono text-slate-600">14d daily</span>}
    >
      <div className="px-3 py-2">
        <div className="flex gap-2 mb-3">
          <MetricPicker value={metricA} onChange={setMetricA} excluding={metricB} accent="A" />
          <span className="text-slate-700 text-xs self-center">vs</span>
          <MetricPicker value={metricB} onChange={setMetricB} excluding={metricA} accent="B" />
        </div>
        <Chart series={series} metricA={metricA} metricB={metricB} />
        <div className="mt-2 flex gap-4 text-[10px] font-mono">
          <Legend color={METRIC_COLORS[metricA]} label={METRIC_LABELS[metricA]} />
          <Legend color={METRIC_COLORS[metricB]} label={METRIC_LABELS[metricB]} />
        </div>
      </div>
    </PanelShell>
  )
}

function MetricPicker({ value, onChange, excluding, accent }: { value: Metric; onChange: (m: Metric) => void; excluding: Metric; accent: 'A' | 'B' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Metric)}
      className="flex-1 bg-black/60 text-[11px] font-mono text-slate-300 border border-slate-800 rounded px-2 py-1"
      aria-label={`Metric ${accent}`}
    >
      {(Object.keys(METRIC_LABELS) as Metric[]).filter(m => m !== excluding).map(m => (
        <option key={m} value={m}>{METRIC_LABELS[m]}</option>
      ))}
    </select>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-slate-500">
      <span className="inline-block w-3 h-0.5" style={{ background: color }} />
      {label}
    </span>
  )
}

interface DayBucket {
  key: string
  date: Date
  completed: number
  failed: number
  activeCount: number
  cost: number
}

function buildSeries(todos: Todo[], costSessions: Array<{ at: string; cost: number }>): DayBucket[] {
  const out: DayBucket[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000)
    out.push({ key: d.toISOString().slice(0, 10), date: d, completed: 0, failed: 0, activeCount: 0, cost: 0 })
  }
  const byKey = new Map(out.map(b => [b.key, b]))

  for (const t of todos) {
    const k = t.updated_at?.slice(0, 10)
    if (!k) continue
    const b = byKey.get(k)
    if (!b) continue
    if (t.status === 'completed')   b.completed   += 1
    if (t.status === 'failed')      b.failed      += 1
    if (t.status === 'in_progress') b.activeCount += 1
  }
  for (const s of costSessions) {
    const k = s.at?.slice(0, 10)
    const b = byKey.get(k)
    if (b) b.cost += s.cost ?? 0
  }
  return out
}

function Chart({ series, metricA, metricB }: { series: DayBucket[]; metricA: Metric; metricB: Metric }) {
  const W = 560, H = 140, pad = 16

  const valA = (d: DayBucket) => metricValue(d, metricA, series)
  const valB = (d: DayBucket) => metricValue(d, metricB, series)

  const maxA = Math.max(1, ...series.map(valA))
  const maxB = Math.max(1, ...series.map(valB))

  const pointsA = series.map((d, i) => {
    const x = pad + (i / (series.length - 1 || 1)) * (W - pad * 2)
    const y = H - pad - (valA(d) / maxA) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const pointsB = series.map((d, i) => {
    const x = pad + (i / (series.length - 1 || 1)) * (W - pad * 2)
    const y = H - pad - (valB(d) / maxB) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${metricA} vs ${metricB} over 14 days`}>
      <rect x="0" y="0" width={W} height={H} fill="transparent" />
      {[0.25, 0.5, 0.75].map(t => (
        <line key={t} x1={pad} x2={W - pad} y1={pad + t * (H - pad * 2)} y2={pad + t * (H - pad * 2)} stroke="#1e293b" strokeDasharray="2 3" />
      ))}
      <polyline fill="none" stroke={METRIC_COLORS[metricA]} strokeWidth="1.5" points={pointsA} />
      <polyline fill="none" stroke={METRIC_COLORS[metricB]} strokeWidth="1.5" strokeDasharray="3 2" points={pointsB} />
      {series.map((d, i) => (
        <text
          key={d.key}
          x={pad + (i / (series.length - 1 || 1)) * (W - pad * 2)}
          y={H - 2}
          fontSize="7"
          fill="#475569"
          fontFamily="monospace"
          textAnchor="middle"
        >
          {d.date.getDate()}
        </text>
      ))}
    </svg>
  )
}

function metricValue(d: DayBucket, m: Metric, all: DayBucket[]): number {
  switch (m) {
    case 'completed':   return d.completed
    case 'failed':      return d.failed
    case 'activeCount': return d.activeCount
    case 'cost':        return d.cost
    case 'successRate': {
      const rated = d.completed + d.failed
      return rated > 0 ? (d.completed / rated) * 100 : 0
    }
  }
  void all
}
