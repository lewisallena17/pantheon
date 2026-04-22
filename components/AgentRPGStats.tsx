'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/types/todos'
import { factionForPool, FACTION_STYLES } from '@/lib/factions'

interface Props { todos: Todo[] }

const XP_PER_TASK = 10
const XP_BOSS     = 50
const XP_PER_LEVEL = 100

interface FloatingXP {
  id:    string
  pool:  string
  amount: number
  at:    number
  boss?: boolean
}

interface PoolStats {
  pool:      string
  level:     number
  xpCurrent: number   // 0–99 within current level
  xpTotal:   number
  hp:        number   // 0–100 based on recent success
  completed: number
  failed:    number
  bosses:    number
}

export default function AgentRPGStats({ todos }: Props) {
  const [floaters, setFloaters] = useState<FloatingXP[]>([])
  const seenTaskIds = useRef<Set<string>>(new Set())

  // Seed seen-set on mount so we don't replay history
  useEffect(() => {
    for (const t of todos) if (t.status === 'completed') seenTaskIds.current.add(t.id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to realtime so we can pop XP when tasks complete
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('rpg-task-xp')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'todos' }, (payload) => {
        const newRow = payload.new as Todo
        if (newRow.status !== 'completed') return
        if (seenTaskIds.current.has(newRow.id)) return
        seenTaskIds.current.add(newRow.id)
        const pool = (newRow.assigned_agent ?? '').replace(/-[a-z0-9]{4,}$/, '')
        if (!pool) return
        const floater: FloatingXP = {
          id:     `${newRow.id}-${Date.now()}`,
          pool,
          amount: newRow.is_boss ? XP_BOSS : XP_PER_TASK,
          boss:   newRow.is_boss,
          at:     Date.now(),
        }
        setFloaters(prev => [...prev.slice(-5), floater])
        setTimeout(() => {
          setFloaters(prev => prev.filter(f => f.id !== floater.id))
        }, 2500)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const stats = useMemo<PoolStats[]>(() => {
    const acc: Record<string, PoolStats> = {}
    for (const t of todos) {
      if (!t.assigned_agent) continue
      const pool = t.assigned_agent.replace(/-[a-z0-9]{4,}$/, '')
      if (!acc[pool]) acc[pool] = { pool, level: 1, xpCurrent: 0, xpTotal: 0, hp: 100, completed: 0, failed: 0, bosses: 0 }
      const b = acc[pool]
      if (t.status === 'completed') {
        b.completed += 1
        b.xpTotal   += t.is_boss ? XP_BOSS : XP_PER_TASK
        if (t.is_boss) b.bosses += 1
      } else if (t.status === 'failed') {
        b.failed += 1
      }
    }
    for (const b of Object.values(acc)) {
      b.level     = Math.floor(b.xpTotal / XP_PER_LEVEL) + 1
      b.xpCurrent = b.xpTotal % XP_PER_LEVEL
      // HP reflects recent reliability
      const total = b.completed + b.failed
      b.hp = total === 0 ? 100 : Math.max(0, Math.round((b.completed / total) * 100))
    }
    return Object.values(acc)
      .filter(s => s.completed + s.failed > 0)
      .sort((a, b) => b.xpTotal - a.xpTotal)
  }, [todos])

  if (!stats.length) return null

  return (
    <div className="relative rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">⚔️ Agent RPG Stats</span>
        <span className="text-[10px] font-mono text-slate-600">
          {stats.reduce((n, s) => n + s.level, 0)} total levels · {stats.reduce((n, s) => n + s.bosses, 0)} bosses slain
        </span>
      </div>

      <div className="divide-y divide-slate-800/30">
        {stats.map(s => {
          const f     = factionForPool(s.pool)
          const style = f ? FACTION_STYLES[f.id] : { text: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-900/30', fill: 'bg-slate-500' }
          const hpColor =
            s.hp >= 85 ? 'bg-emerald-600' :
            s.hp >= 60 ? 'bg-amber-500'   :
            s.hp >= 30 ? 'bg-orange-500'  :
                         'bg-red-600'
          return (
            <div key={s.pool} className="px-4 py-2 flex items-center gap-3">
              {/* Level badge */}
              <div className={`flex-shrink-0 w-10 h-10 rounded border-2 ${style.border} ${style.bg} flex flex-col items-center justify-center`}>
                <div className="text-[8px] font-mono text-slate-500 leading-none">LV</div>
                <div className={`text-sm font-black tabular-nums leading-none ${style.text}`} style={{ fontFamily: 'Orbitron, monospace' }}>{s.level}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[11px] font-mono font-bold ${style.text} truncate`}>
                    {f?.icon ?? '◈'} {s.pool}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {s.completed}✓ · {s.failed}✗ {s.bosses > 0 && <span className="text-amber-400">· {s.bosses}🗡</span>}
                  </span>
                </div>

                {/* XP bar */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-mono text-slate-600 w-6">XP</span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className={`h-full ${style.fill} transition-all duration-700 rounded`} style={{ width: `${s.xpCurrent}%` }} />
                  </div>
                  <span className="text-[9px] font-mono tabular-nums text-slate-500 w-12 text-right">{s.xpCurrent}/100</span>
                </div>

                {/* HP bar */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono text-slate-600 w-6">HP</span>
                  <div className="flex-1 h-1.5 bg-slate-900 rounded overflow-hidden">
                    <div className={`h-full ${hpColor} transition-all duration-700 rounded`} style={{ width: `${s.hp}%` }} />
                  </div>
                  <span className="text-[9px] font-mono tabular-nums text-slate-500 w-12 text-right">{s.hp}/100</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating XP notifications — bottom-right of the card */}
      <div className="pointer-events-none absolute bottom-1 right-2 flex flex-col-reverse gap-1 items-end">
        {floaters.map((f, i) => (
          <div
            key={f.id}
            className={`text-sm font-black font-mono tabular-nums px-2 py-0.5 rounded ${
              f.boss
                ? 'text-amber-300 bg-amber-950/80 border border-amber-600/60 animate-pulse'
                : 'text-emerald-300 bg-emerald-950/80 border border-emerald-800/60'
            }`}
            style={{
              animation: 'xp-float 2.5s ease-out forwards',
              animationDelay: `${i * 80}ms`,
              fontFamily: 'Orbitron, monospace',
            }}
          >
            +{f.amount} XP{f.boss ? ' ★ BOSS' : ''}
          </div>
        ))}
      </div>
    </div>
  )
}
