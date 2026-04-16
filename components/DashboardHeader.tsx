'use client'

import { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface DashboardHeaderProps {
  isLoading?: boolean
  /** Live todo counts passed from parent so header reflects real-time system state */
  stats?: { total: number; completed: number; failed: number; active: number }
}

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{time}</span>
}

/** Compact pill that changes colour based on system-wide fail rate */
function HealthPill({ stats }: { stats: NonNullable<DashboardHeaderProps['stats']> }) {
  const closed   = stats.completed + stats.failed
  const failRate = closed > 0 ? Math.round((stats.failed / closed) * 100) : null

  const { label, color, dot, bg } =
    failRate === null       ? { label: 'NOMINAL',  color: 'text-slate-500',   dot: 'bg-slate-600',   bg: 'border-slate-700/40 bg-slate-900/30' } :
    failRate >= 60          ? { label: 'CRITICAL', color: 'text-red-300',     dot: 'bg-red-500',     bg: 'border-red-700/60  bg-red-950/40'    } :
    failRate >= 30          ? { label: 'DEGRADED', color: 'text-orange-300',  dot: 'bg-orange-500',  bg: 'border-orange-700/60 bg-orange-950/40' } :
                              { label: 'HEALTHY',  color: 'text-emerald-400', dot: 'bg-emerald-500', bg: 'border-emerald-800/50 bg-emerald-950/20' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider ${color} ${bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${failRate !== null && failRate >= 60 ? 'animate-pulse' : ''}`} />
      {label}
      {failRate !== null && (
        <span className="opacity-60 ml-0.5">{failRate}% FAIL</span>
      )}
    </span>
  )
}

/**
 * Four-tile live stats grid — replaces the old tiny right-side mono-text block.
 * Each tile has a clear label, a large coloured number, and a subtle fill bar
 * showing proportion relative to total. The FAILED tile pulses red when the
 * fail count is high so the operator cannot miss it.
 */
function StatsTiles({ stats }: { stats: NonNullable<DashboardHeaderProps['stats']> }) {
  const closed   = stats.completed + stats.failed
  const failRate = closed > 0 ? Math.round((stats.failed / closed) * 100) : 0
  const doneRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const failPct  = stats.total > 0 ? Math.round((stats.failed    / stats.total) * 100) : 0
  const activePct= stats.total > 0 ? Math.round((stats.active    / stats.total) * 100) : 0

  const isCritical = failRate >= 60 && closed >= 5

  const tiles: {
    key: string
    label: string
    value: number
    pct: number
    bar: string          // bar fill colour class
    num: string          // number colour class
    border: string       // card border colour class
    bg: string           // card bg colour class
    pulse?: boolean
    suffix?: string
  }[] = [
    {
      key: 'total',
      label: 'TOTAL',
      value: stats.total,
      pct: 100,
      bar:    'bg-slate-600',
      num:    'text-slate-200',
      border: 'border-slate-700/40',
      bg:     'bg-slate-900/30',
    },
    {
      key: 'active',
      label: 'RUNNING',
      value: stats.active,
      pct: activePct,
      bar:    'bg-cyan-500',
      num:    'text-cyan-300',
      border: stats.active > 0 ? 'border-cyan-700/50' : 'border-slate-700/30',
      bg:     stats.active > 0 ? 'bg-cyan-950/20'     : 'bg-black/20',
      pulse:  stats.active > 0,
    },
    {
      key: 'done',
      label: 'DONE',
      value: stats.completed,
      pct: doneRate,
      bar:    'bg-emerald-600',
      num:    'text-emerald-300',
      border: 'border-emerald-900/40',
      bg:     'bg-emerald-950/10',
      suffix: doneRate > 0 ? `${doneRate}%` : undefined,
    },
    {
      key: 'failed',
      label: 'FAILED',
      value: stats.failed,
      pct: failPct,
      bar:    'bg-red-600',
      num:    isCritical ? 'text-red-300' : 'text-red-500',
      border: isCritical ? 'border-red-600/70' : 'border-red-900/40',
      bg:     isCritical ? 'bg-red-950/30'     : 'bg-red-950/10',
      pulse:  isCritical,
      suffix: failRate > 0 ? `${failRate}% of closed` : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {tiles.map(t => (
        <div
          key={t.key}
          className={`relative rounded border px-3 py-2 overflow-hidden ${t.border} ${t.bg} transition-colors duration-500`}
          style={
            t.key === 'failed' && isCritical
              ? { boxShadow: '0 0 18px rgba(255,51,102,0.20)' }
              : undefined
          }
        >
          {/* Progress fill bar at the bottom of the card */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800/60">
            <div
              className={`h-full ${t.bar} transition-all duration-700 rounded-full`}
              style={{ width: `${t.pct}%` }}
            />
          </div>

          {/* Label */}
          <div className="text-[9px] font-mono tracking-[0.2em] text-slate-600 uppercase mb-0.5 flex items-center gap-1">
            {t.key === 'active' && t.pulse && (
              <span className="h-1 w-1 rounded-full bg-cyan-500 animate-pulse" />
            )}
            {t.key === 'failed' && t.pulse && (
              <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
            )}
            {t.label}
          </div>

          {/* Big number */}
          <div className={`text-2xl font-black tabular-nums leading-none ${t.num} font-mono`}>
            {t.value}
          </div>

          {/* Optional percentage suffix */}
          {t.suffix && (
            <div className={`text-[9px] font-mono mt-0.5 ${
              t.key === 'failed' ? 'text-red-600' : 'text-slate-600'
            } truncate`}>
              {t.suffix}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function DashboardHeader({ isLoading: initialLoading = false, stats }: DashboardHeaderProps) {
  const [isLoading, setIsLoading] = useState(initialLoading)

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setIsLoading(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const uptimeSince = '2025.04.12'

  return (
    <>
      {/* ── Main header row ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pt-4 gap-6">

        {/* Left: branding */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="text-xs text-cyan-500 tracking-[0.3em] uppercase">
              ◈ Neural Task Network v2.4.1
            </div>
            {isLoading && <LoadingSpinner size="sm" />}
            {stats && <HealthPill stats={stats} />}
          </div>

          <h1
            className="text-3xl font-black tracking-widest uppercase text-cyan-400 glow-text"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            TASK//MATRIX
          </h1>

          <div className="text-xs text-slate-500 mt-1 tracking-widest">
            AGENT OPERATIONS MONITOR — REALTIME SYNC ACTIVE
          </div>

          {/* Clock sits under the title on the left — always visible */}
          <div className="mt-2 text-xs font-mono text-slate-600">
            LOCAL&nbsp;
            <span className="text-cyan-600 tabular-nums">
              <LiveClock />
            </span>
            <span className="text-slate-700 ml-3">SINCE {uptimeSince}</span>
          </div>
        </div>

        {/* Right: four-tile stat grid — the primary at-a-glance panel */}
        <div className="flex-1 min-w-0 max-w-sm ml-auto">
          {stats ? (
            <StatsTiles stats={stats} />
          ) : (
            <div className="text-right text-xs text-slate-600 space-y-1 font-mono mt-1">
              <div>PROTOCOL <span className="text-cyan-600">WS//LIVE</span></div>
              {isLoading && <LoadingSpinner size="sm" />}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <span className="text-cyan-600/50 text-xs tracking-widest">◈◈◈</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>
    </>
  )
}
