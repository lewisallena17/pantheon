'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

interface GodStatus {
  thought?: string
  updated_at?: string
  meta?: { mood?: string; cycles?: number; successRate?: number }
  intent?: { cycle?: number; cyclesActive?: number }
}

interface CostSnapshot {
  todaySpend?: number
  burnPerHour?: number
  creditStatus?: string
  estimatedBalance?: number | null
}

/**
 * "What happened while I was away" — a single-glance summary at the top of
 * the Overview tab answering: did agents work, did anything break, is the
 * system healthy, how much did I spend? Data is aggregated from existing
 * APIs — no new backend work.
 */
export default function LastDayDigest({ todos }: Props) {
  const [cost, setCost]       = useState<CostSnapshot | null>(null)
  const [god, setGod]         = useState<GodStatus | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [costRes, godRes] = await Promise.all([
          fetch('/api/cost',   { cache: 'no-store' }),
          fetch('/api/god-status', { cache: 'no-store' }).catch(() => null),
        ])
        if (costRes?.ok) setCost(await costRes.json())
        if (godRes?.ok)  setGod(await godRes.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const cutoff = now - 24 * 3600_000
    let doneIn24 = 0, failedIn24 = 0, vetoedIn24 = 0, bossesIn24 = 0
    const topCompleted: { title: string; at: string }[] = []
    const topFailed:    { title: string }[]             = []

    for (const t of todos) {
      const when = new Date(t.updated_at ?? t.created_at ?? 0).getTime()
      if (!Number.isFinite(when) || when < cutoff) continue
      if (t.status === 'completed') {
        doneIn24++
        if (t.is_boss) bossesIn24++
        if (topCompleted.length < 3) topCompleted.push({ title: t.title, at: t.updated_at })
      } else if (t.status === 'failed') {
        failedIn24++
        if (topFailed.length < 2) topFailed.push({ title: t.title })
      } else if (t.status === 'vetoed') {
        vetoedIn24++
      }
    }

    return { doneIn24, failedIn24, vetoedIn24, bossesIn24, topCompleted, topFailed }
  }, [todos])

  // Headline verdict — one-sentence summary
  const headline = (() => {
    if (stats.doneIn24 === 0 && stats.failedIn24 === 0) {
      if (cost?.creditStatus === 'exhausted') return 'Agents paused — credits exhausted.'
      return 'Quiet window. Agents idle.'
    }
    const successRate = stats.doneIn24 / Math.max(1, stats.doneIn24 + stats.failedIn24)
    if (stats.bossesIn24 > 0)       return `${stats.bossesIn24} boss${stats.bossesIn24 === 1 ? '' : 'es'} slain. System productive.`
    if (successRate >= 0.9)         return `Excellent day — ${Math.round(successRate * 100)}% success rate.`
    if (successRate >= 0.7)         return `Solid day. ${stats.doneIn24} tasks done, ${stats.failedIn24} failed.`
    if (stats.failedIn24 >= 3)      return `Turbulent — ${stats.failedIn24} failures. Worth investigating.`
    return `${stats.doneIn24} done, ${stats.failedIn24} failed.`
  })()

  const mood = god?.meta?.mood ?? 'UNKNOWN'
  const moodColor =
    mood === 'OMNIPOTENT' ? 'text-yellow-300'  :
    mood === 'VIGILANT'   ? 'text-emerald-300' :
    mood === 'TROUBLED'   ? 'text-orange-400'  :
    mood === 'SUFFERING'  ? 'text-red-400'     :
                            'text-slate-400'

  return (
    <div className="rounded border border-cyan-900/40 bg-gradient-to-br from-cyan-950/20 to-slate-950/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/30">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-500 uppercase">◈ Last 24 Hours</span>
        <span className="text-[10px] font-mono text-slate-600 tabular-nums">
          {new Date(Date.now() - 24 * 3600_000).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })} → now
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 py-3 border-b border-slate-800/40">
        <div className="text-sm font-mono text-cyan-200 leading-snug">{headline}</div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-slate-800/30 border-b border-slate-800/40">
        <Stat label="DONE"     value={stats.doneIn24}   color="text-emerald-300" />
        <Stat label="FAILED"   value={stats.failedIn24} color={stats.failedIn24 > 2 ? 'text-red-400' : 'text-slate-400'} />
        <Stat label="VETOED"   value={stats.vetoedIn24} color="text-slate-400" />
        <Stat label="BOSSES"   value={stats.bossesIn24} color="text-amber-300" />
        <Stat
          label="COST"
          value={cost?.todaySpend !== undefined ? `$${cost.todaySpend.toFixed(2)}` : '—'}
          color={cost?.creditStatus === 'exhausted' ? 'text-red-400' : 'text-cyan-300'}
        />
      </div>

      {/* Detail rows — last wins / last losses / God state */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/30">
        <div className="px-4 py-2.5">
          <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase mb-1">Recent wins</div>
          {stats.topCompleted.length > 0 ? (
            stats.topCompleted.map((t, i) => (
              <div key={i} className="text-[11px] font-mono text-emerald-300/90 truncate leading-snug">✓ {t.title}</div>
            ))
          ) : (
            <div className="text-[11px] font-mono text-slate-600 italic">none</div>
          )}
        </div>

        <div className="px-4 py-2.5">
          <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase mb-1">Recent fails</div>
          {stats.topFailed.length > 0 ? (
            stats.topFailed.map((t, i) => (
              <div key={i} className="text-[11px] font-mono text-red-400/80 truncate leading-snug">✕ {t.title}</div>
            ))
          ) : (
            <div className="text-[11px] font-mono text-slate-600 italic">none</div>
          )}
        </div>

        <div className="px-4 py-2.5">
          <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase mb-1">God state</div>
          <div className={`text-sm font-mono font-bold ${moodColor}`}>{mood}</div>
          {god?.meta?.cycles !== undefined && (
            <div className="text-[10px] font-mono text-slate-600 mt-0.5">
              cycle {god.meta.cycles}
              {god.intent?.cyclesActive !== undefined && <span> · goal age {god.intent.cyclesActive}c</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="px-3 py-2">
      <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase">{label}</div>
      <div className={`text-lg font-black font-mono tabular-nums ${color}`}>{value}</div>
    </div>
  )
}
