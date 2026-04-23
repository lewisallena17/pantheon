'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'
import PanelShell from './PanelShell'

interface Goal { title?: string; status?: string; dueDate?: string; deadline?: string }

/**
 * 14-day forward calendar: plots roadmap goals (with dueDate) + todos
 * with deadlines against the next two weeks. Makes "what's coming up"
 * glanceable rather than buried inside JSON.
 */
export default function ForwardCalendar({ todos }: { todos: Todo[] }) {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/wisdom', { cache: 'no-store' })
        if (r.ok) {
          const j = await r.json() as { roadmap?: { goals?: Goal[] } }
          setGoals(j.roadmap?.goals ?? [])
        }
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const days = useMemo(() => {
    const out: Array<{ date: Date; key: string; events: Array<{ kind: 'goal' | 'deadline'; title: string; status?: string }> }> = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getTime() + i * 86_400_000)
      out.push({ date: d, key: d.toISOString().slice(0, 10), events: [] })
    }
    const byKey = new Map(out.map(d => [d.key, d]))

    for (const g of goals) {
      const iso = g.dueDate ?? g.deadline
      if (!iso) continue
      const k = iso.slice(0, 10)
      byKey.get(k)?.events.push({ kind: 'goal', title: g.title ?? 'goal', status: g.status })
    }
    for (const t of todos) {
      if (!t.deadline) continue
      const k = t.deadline.slice(0, 10)
      byKey.get(k)?.events.push({ kind: 'deadline', title: t.title, status: t.status })
    }
    return out
  }, [goals, todos])

  const hasAny = days.some(d => d.events.length > 0)

  return (
    <PanelShell
      title="Next 14 Days"
      icon="▢"
      tone="amber"
      collapsible
      id="forward-calendar"
      defaultOpen={hasAny}
      chipRight={<span className="text-[10px] font-mono text-slate-600">{days.reduce((s, d) => s + d.events.length, 0)} events</span>}
    >
      <div className="px-3 py-2 grid grid-cols-7 gap-1">
        {days.map(d => {
          const isToday = d.key === new Date().toISOString().slice(0, 10)
          return (
            <div
              key={d.key}
              className={`text-[10px] font-mono border rounded p-1.5 min-h-[54px] ${
                isToday ? 'border-cyan-800/60 bg-cyan-950/20' : 'border-slate-800/50 bg-black/30'
              }`}
              title={d.date.toDateString()}
            >
              <div className={`text-[9px] tracking-widest ${isToday ? 'text-cyan-400' : 'text-slate-600'}`}>
                {d.date.toLocaleDateString([], { weekday: 'short' })}
              </div>
              <div className={`${isToday ? 'text-cyan-300' : 'text-slate-400'}`}>
                {d.date.getDate()}
              </div>
              <div className="mt-1 space-y-0.5">
                {d.events.slice(0, 2).map((e, i) => (
                  <div
                    key={i}
                    className={`text-[8px] truncate ${e.kind === 'goal' ? 'text-amber-400' : 'text-slate-500'}`}
                    title={e.title}
                  >
                    {e.kind === 'goal' ? '◆' : '·'} {e.title.slice(0, 14)}
                  </div>
                ))}
                {d.events.length > 2 && (
                  <div className="text-[8px] text-slate-700">+{d.events.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {!hasAny && (
        <div className="px-3 pb-2 text-[10px] font-mono text-slate-700 text-center">
          No scheduled goals or deadlines in the next 14 days.
        </div>
      )}
    </PanelShell>
  )
}
