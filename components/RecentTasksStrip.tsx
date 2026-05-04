'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

/**
 * RecentTasksStrip — Velocity Strip
 * ─────────────────────────────────────────────────────────────────────────────
 * Three panels in one compact row:
 *
 *  LEFT  — Throughput gauge: tasks completed per hour (last 6 h window) with
 *           a colour-coded rate indicator and trend arrow vs the prior 6 h.
 *
 *  CENTRE — Completion sparkline: 12 hourly buckets (last 12 h) rendered as a
 *            mini bar chart so the operator can see *when* work is landing.
 *            A flat line at the right end is the immediate "system gone quiet"
 *            signal without having to expand the DONE column.
 *
 *  RIGHT  — Clickable recent-task chips (last 8, sorted by updated_at) that
 *            open the TaskTraceDrawer. Status dot colour gives instant health.
 *
 * Shows nothing when there are no tasks (clean zero-state).
 */

// ── helpers ────────────────────────────────────────────────────────────────

function relTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s`
  if (s < 3600)  return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}

/** Build an array of `n` hourly bucket counts going back from *now*. */
function buildHourlyBuckets(completedTimes: number[], buckets: number): number[] {
  const now   = Date.now()
  const out   = new Array<number>(buckets).fill(0)
  for (const ts of completedTimes) {
    const hoursAgo = (now - ts) / 3_600_000
    if (hoursAgo < 0 || hoursAgo >= buckets) continue
    const idx = buckets - 1 - Math.floor(hoursAgo)    // most recent bucket = last index
    out[idx]++
  }
  return out
}

// ── SparkBar ──────────────────────────────────────────────────────────────

function SparkBar({ buckets, peak }: { buckets: number[]; peak: number }) {
  const BAR_W = 6
  const GAP   = 1
  const H     = 28
  const now   = Date.now()

  return (
    <svg
      width={buckets.length * (BAR_W + GAP) - GAP}
      height={H + 12}
      aria-label="Hourly completion rate (last 12 h)"
    >
      {buckets.map((v, i) => {
        const barH  = peak > 0 ? Math.max(2, Math.round((v / peak) * H)) : 2
        const x     = i * (BAR_W + GAP)
        const y     = H - barH

        // Age of this bucket's midpoint in hours from now
        const ageH  = buckets.length - 1 - i
        const isRecent = ageH <= 1

        // Colour: cyan for the most recent two buckets, slate otherwise
        const fill = v === 0
          ? 'rgba(100,116,139,0.15)'
          : isRecent
            ? 'rgba(34,211,238,0.7)'
            : 'rgba(100,116,139,0.45)'

        // Label under last bar
        const showLabel = i === buckets.length - 1

        return (
          <g key={i}>
            <rect
              x={x} y={y} width={BAR_W} height={barH}
              rx={1} fill={fill}
            >
              <title>{`${ageH === 0 ? 'This hour' : `${ageH}h ago`}: ${v} task${v !== 1 ? 's' : ''}`}</title>
            </rect>
            {showLabel && (
              <text
                x={x + BAR_W / 2} y={H + 10}
                textAnchor="middle"
                fontSize={7}
                fontFamily="ui-monospace,monospace"
                fill="rgba(100,116,139,0.6)"
              >now</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── VelocityGauge ─────────────────────────────────────────────────────────

function VelocityGauge({
  rateCurrent,
  ratePrior,
}: {
  rateCurrent: number
  ratePrior:   number
}) {
  const trend =
    ratePrior === 0 && rateCurrent === 0 ? 'flat' :
    ratePrior === 0                       ? 'up'   :
    rateCurrent > ratePrior * 1.15        ? 'up'   :
    rateCurrent < ratePrior * 0.85        ? 'down' :
                                            'flat'

  const trendIcon  = trend === 'up' ? '▲' : trend === 'down' ? '▼' : '─'
  const trendColor =
    trend === 'up'   ? 'text-emerald-400' :
    trend === 'down' ? 'text-red-400'     :
                       'text-slate-500'

  const rateColor =
    rateCurrent >= 3   ? 'text-emerald-300' :
    rateCurrent >= 0.5 ? 'text-cyan-300'    :
    rateCurrent > 0    ? 'text-amber-300'   :
                         'text-slate-600'

  const rateLabel =
    rateCurrent === 0    ? '0/hr' :
    rateCurrent >= 1     ? `${rateCurrent.toFixed(1)}/hr` :
                           `${(rateCurrent * 60).toFixed(0)}/min`

  return (
    <div className="flex flex-col items-center justify-center gap-0.5 min-w-[52px]">
      <span className="text-[9px] font-mono text-slate-600 tracking-wider uppercase select-none">
        velocity
      </span>
      <span className={`text-lg font-mono font-bold tabular-nums leading-none ${rateColor}`}>
        {rateCurrent >= 1
          ? rateCurrent.toFixed(1)
          : rateCurrent > 0
            ? `${(rateCurrent * 60).toFixed(0)}`
            : '—'}
      </span>
      {rateCurrent > 0 && (
        <span className={`text-[9px] font-mono ${rateColor} opacity-70`}>
          {rateCurrent >= 1 ? 'per hr' : 'per min'}
        </span>
      )}
      <span className={`text-[9px] font-mono tabular-nums ${trendColor}`} title={`Prior 6 h: ${ratePrior.toFixed(1)}/hr`}>
        {trendIcon} {trend !== 'flat' ? `${Math.abs(Math.round(((rateCurrent - ratePrior) / Math.max(ratePrior, 0.01)) * 100))}%` : 'steady'}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function RecentTasksStrip({
  todos,
  onPick,
}: {
  todos:  Todo[]
  onPick: (t: Todo) => void
}) {
  // ── Velocity metrics ────────────────────────────────────────────────────
  const { rateCurrent, ratePrior, buckets, peak } = useMemo(() => {
    const completedTimes = todos
      .filter(t => t.status === 'completed' && t.updated_at)
      .map(t => new Date(t.updated_at).getTime())

    const now    = Date.now()
    const win    = 6 * 3_600_000   // 6 h in ms

    const current6h = completedTimes.filter(ts => now - ts <= win).length
    const prior6h   = completedTimes.filter(ts => {
      const age = now - ts
      return age > win && age <= 2 * win
    }).length

    const rateCurrent = current6h / 6          // tasks/hr
    const ratePrior   = prior6h   / 6

    const raw  = buildHourlyBuckets(completedTimes, 12)
    const peak = Math.max(...raw, 1)

    return { rateCurrent, ratePrior, buckets: raw, peak }
  }, [todos])

  // ── Recent task chips ────────────────────────────────────────────────────
  const recent = useMemo(
    () => [...todos]
      .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
      .slice(0, 8),
    [todos],
  )

  if (todos.length === 0) return null

  // Completion summary numbers
  const completed = todos.filter(t => t.status === 'completed').length
  const total     = todos.length
  const pct       = Math.round((completed / total) * 100)

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/50 bg-black/60">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase select-none">
          ◆ Velocity &amp; Recent
        </span>
        <span className="text-[10px] font-mono text-slate-600 tabular-nums">
          <span className="text-slate-400">{completed}</span>
          <span className="text-slate-700">/{total}</span>
          <span className="ml-1 text-slate-700">({pct}%)</span>
        </span>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex items-stretch gap-0 divide-x divide-slate-800/50">

        {/* LEFT: velocity gauge */}
        <div className="flex items-center justify-center px-3 py-2 flex-shrink-0">
          <VelocityGauge rateCurrent={rateCurrent} ratePrior={ratePrior} />
        </div>

        {/* CENTRE: hourly sparkline */}
        <div className="flex flex-col items-start justify-center px-3 py-2 gap-1 flex-shrink-0">
          <span className="text-[8px] font-mono text-slate-700 tracking-widest uppercase select-none">
            completions · last 12 h
          </span>
          <SparkBar buckets={buckets} peak={peak} />
          <div className="flex items-center justify-between w-full">
            <span className="text-[8px] font-mono text-slate-800">12h ago</span>
            <span className="text-[8px] font-mono text-slate-800">now</span>
          </div>
        </div>

        {/* RIGHT: recent task chips */}
        <div className="flex-1 min-w-0 px-2 py-2">
          <div className="flex flex-wrap gap-1 items-start content-start max-h-[68px] overflow-y-auto">
            {recent.map(t => {
              const dot =
                t.status === 'completed'   ? 'bg-emerald-500' :
                t.status === 'failed'      ? 'bg-red-500'     :
                t.status === 'in_progress' ? 'bg-cyan-400 animate-pulse' :
                t.status === 'blocked'     ? 'bg-amber-500'   :
                                             'bg-slate-600'

              return (
                <button
                  key={t.id}
                  onClick={() => onPick(t)}
                  title={`${t.title} · ${t.status} · ${relTime(t.updated_at)} ago`}
                  className="flex-shrink-0 max-w-[190px] px-2 py-0.5 rounded border border-slate-800/60 bg-black/30 hover:bg-slate-900/60 hover:border-slate-700/70 text-[10px] font-mono text-slate-400 hover:text-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
                  <span className="truncate">{t.title}</span>
                  <span className="flex-shrink-0 text-[8px] text-slate-700 tabular-nums ml-auto pl-1">
                    {relTime(t.updated_at)}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="text-[8px] font-mono text-slate-800 mt-1">tap chip → trace</div>
        </div>

      </div>
    </div>
  )
}
