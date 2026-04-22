'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'
import { FACTIONS, FACTION_STYLES, factionForPool } from '@/lib/factions'

interface Props { todos: Todo[] }

const XP_COMPLETED = 10
const XP_BOSS      = 50
const XP_FAIL      = -5

export default function HouseCup({ todos }: Props) {
  const standings = useMemo(() => {
    // Weekly window — tasks closed in last 7 days
    const cutoff = Date.now() - 7 * 24 * 3600_000
    const totals: Record<string, { xp: number; completed: number; failed: number; bosses: number }> = {}
    for (const f of FACTIONS) totals[f.id] = { xp: 0, completed: 0, failed: 0, bosses: 0 }

    for (const t of todos) {
      if (!t.assigned_agent) continue
      const when = new Date(t.updated_at ?? t.created_at ?? 0).getTime()
      if (when < cutoff) continue
      const f = factionForPool(t.assigned_agent)
      if (!f) continue
      const bucket = totals[f.id]
      if (t.status === 'completed') {
        bucket.completed += 1
        bucket.xp += t.is_boss ? XP_BOSS : XP_COMPLETED
        if (t.is_boss) bucket.bosses += 1
      } else if (t.status === 'failed') {
        bucket.failed += 1
        bucket.xp += XP_FAIL
      }
    }

    return FACTIONS
      .map(f => ({ faction: f, ...totals[f.id] }))
      .sort((a, b) => b.xp - a.xp)
  }, [todos])

  const maxXp = Math.max(1, ...standings.map(s => s.xp))
  const totalActivity = standings.reduce((s, x) => s + x.completed + x.failed, 0)

  return (
    <div className="rounded border border-yellow-900/40 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-900/40 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-yellow-600 uppercase">🏆 House Cup · 7-Day</span>
          {standings[0] && standings[0].xp > 0 && (
            <span className={`text-[10px] font-mono ${FACTION_STYLES[standings[0].faction.id].text} animate-pulse`}>
              {standings[0].faction.icon} {standings[0].faction.name} leading
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-600">{totalActivity} closed tasks</span>
      </div>

      <div className="divide-y divide-slate-800/40">
        {standings.map((s, rank) => {
          const style = FACTION_STYLES[s.faction.id]
          const pct = maxXp > 0 ? Math.max(0, (s.xp / maxXp) * 100) : 0
          const medal = ['🥇', '🥈', '🥉'][rank] ?? '  '
          return (
            <div key={s.faction.id} className={`px-4 py-3 ${style.bg}`}>
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-base w-6 text-center">{medal}</span>
                <span className={`text-lg`}>{s.faction.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-bold font-mono ${style.text}`}>{s.faction.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 italic">{s.faction.motto}</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black tabular-nums font-mono ${style.text}`}>{s.xp}</div>
                  <div className="text-[9px] font-mono text-slate-600 tracking-wider">XP</div>
                </div>
              </div>

              {/* XP bar */}
              <div className="h-1.5 bg-slate-900 rounded overflow-hidden ml-9">
                <div className={`h-full ${style.fill} transition-all duration-700 rounded`} style={{ width: `${pct}%` }} />
              </div>

              <div className="flex gap-3 mt-1.5 ml-9 text-[10px] font-mono text-slate-500">
                <span>✓ {s.completed} won</span>
                {s.bosses > 0 && <span className="text-amber-400">★ {s.bosses} boss{s.bosses === 1 ? '' : 'es'}</span>}
                {s.failed > 0 && <span className="text-red-500">✕ {s.failed} lost</span>}
                <span className="text-slate-700 ml-auto">pools: {s.faction.pools.join(', ')}</span>
              </div>
            </div>
          )
        })}
      </div>

      {totalActivity === 0 && (
        <div className="px-4 py-4 text-[11px] font-mono text-slate-600 text-center italic">
          No activity this week yet. First task to complete claims first blood.
        </div>
      )}
    </div>
  )
}
