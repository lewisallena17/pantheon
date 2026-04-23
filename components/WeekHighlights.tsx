'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'
import PanelShell from './PanelShell'
import { useFreshness } from '@/lib/useFreshness'

interface Props {
  todos: Todo[]
  costByAgent?: Record<string, number>
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function poolName(agent: string | null): string | null {
  if (!agent) return null
  return agent.replace(/-[a-f0-9]{4,}$/, '')
}

/**
 * X-Analytics-style "top post this week" — auto-curated highlights
 * derived from the last 7 days of todos + cost data. No bullets; one
 * line per card. Designed to reward a glance, not a deep read.
 */
export default function WeekHighlights({ todos, costByAgent = {} }: Props) {
  const highlights = useMemo(() => {
    const cutoff = Date.now() - SEVEN_DAYS
    const recent = todos.filter(t => new Date(t.updated_at).getTime() >= cutoff)

    const byPool = new Map<string, { completed: number; failed: number; total: number }>()
    for (const t of recent) {
      const p = poolName(t.assigned_agent)
      if (!p) continue
      const b = byPool.get(p) ?? { completed: 0, failed: 0, total: 0 }
      b.total += 1
      if (t.status === 'completed') b.completed += 1
      if (t.status === 'failed')    b.failed    += 1
      byPool.set(p, b)
    }

    const withRate = [...byPool.entries()].map(([pool, s]) => {
      const rated = s.completed + s.failed
      return { pool, ...s, rate: rated > 0 ? s.completed / rated : 0 }
    })

    const mvp       = withRate.filter(a => a.completed >= 3).sort((a, b) => b.rate - a.rate || b.completed - a.completed)[0]
    const workhorse = withRate.sort((a, b) => b.completed - a.completed)[0]
    const struggler = withRate.filter(a => a.failed >= 2).sort((a, b) => b.failed - a.failed)[0]
    const spender   = Object.entries(costByAgent).sort((a, b) => b[1] - a[1])[0]

    const completedThisWeek = recent.filter(t => t.status === 'completed').length
    const failedThisWeek    = recent.filter(t => t.status === 'failed').length
    const newThisWeek       = todos.filter(t => new Date(t.created_at).getTime() >= cutoff).length

    const categories = new Map<string, number>()
    for (const t of recent) {
      if (t.status !== 'completed') continue
      categories.set(t.task_category, (categories.get(t.task_category) ?? 0) + 1)
    }
    const topCategory = [...categories.entries()].sort((a, b) => b[1] - a[1])[0]

    return { mvp, workhorse, struggler, spender, completedThisWeek, failedThisWeek, newThisWeek, topCategory }
  }, [todos, costByAgent])

  const signature = `${highlights.completedThisWeek}:${highlights.failedThisWeek}:${highlights.mvp?.pool ?? ''}`
  const { isNew, markSeen } = useFreshness('week-highlights', signature)

  return (
    <PanelShell
      title="This Week"
      icon="★"
      tone="cyan"
      isNew={isNew}
      collapsible
      id="week-highlights"
      defaultOpen={true}
    >
      <div onClick={markSeen} className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono">
        <Stat label="shipped"    value={`${highlights.completedThisWeek}`} tone="emerald" />
        <Stat label="failed"     value={`${highlights.failedThisWeek}`}    tone={highlights.failedThisWeek > 5 ? 'red' : 'slate'} />
        <Stat label="new tasks"  value={`${highlights.newThisWeek}`}       tone="slate" />
        {highlights.topCategory && (
          <Stat label="busiest area" value={`${highlights.topCategory[0]} (${highlights.topCategory[1]})`} tone="cyan" />
        )}
        {highlights.mvp && (
          <Stat label="mvp agent"  value={`${highlights.mvp.pool} · ${Math.round(highlights.mvp.rate * 100)}%`} tone="emerald" wide />
        )}
        {highlights.workhorse && highlights.workhorse.pool !== highlights.mvp?.pool && (
          <Stat label="workhorse"  value={`${highlights.workhorse.pool} · ${highlights.workhorse.completed} done`} tone="cyan" wide />
        )}
        {highlights.struggler && (
          <Stat label="struggling" value={`${highlights.struggler.pool} · ${highlights.struggler.failed} fails`} tone="amber" wide />
        )}
        {highlights.spender && (
          <Stat label="biggest spend" value={`${highlights.spender[0]} · $${highlights.spender[1].toFixed(3)}`} tone="slate" wide />
        )}
      </div>
    </PanelShell>
  )
}

function Stat({ label, value, tone, wide }: { label: string; value: string; tone: 'emerald' | 'cyan' | 'amber' | 'red' | 'slate'; wide?: boolean }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    cyan:    'text-cyan-400',
    amber:   'text-amber-400',
    red:     'text-red-400',
    slate:   'text-slate-300',
  }
  return (
    <div className={`flex items-baseline justify-between gap-2 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="text-slate-600 tracking-wider">{label}</span>
      <span className={`${colorMap[tone]} truncate text-right`}>{value}</span>
    </div>
  )
}
