'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

function poolName(agent: string | null): string | null {
  if (!agent) return null
  return agent.replace(/-[a-f0-9]{4,}$/, '')
}

/**
 * Horizontally-scrolling chip strip of every agent pool. Clicking a chip
 * opens the per-agent drilldown. Gives the Agents tab a clear, obvious
 * entry point into the new drill-down UX.
 */
export default function AgentPoolStrip({ todos, onPick }: { todos: Todo[]; onPick: (pool: string) => void }) {
  const pools = useMemo(() => {
    const counts = new Map<string, { active: number; total: number }>()
    for (const t of todos) {
      const p = poolName(t.assigned_agent)
      if (!p) continue
      const b = counts.get(p) ?? { active: 0, total: 0 }
      b.total += 1
      if (t.status === 'in_progress') b.active += 1
      counts.set(p, b)
    }
    return [...counts.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [todos])

  if (pools.length === 0) return null

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase">⚡ Agent Pools · tap to inspect</span>
        <span className="text-[9px] font-mono text-slate-700">{pools.length} pools</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {pools.map(([pool, c]) => (
          <button
            key={pool}
            onClick={() => onPick(pool)}
            className={`flex-shrink-0 px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              c.active > 0
                ? 'border-cyan-700/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40'
                : 'border-slate-800 bg-black/30 text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            {c.active > 0 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1.5 align-middle" />}
            {pool}
            <span className="text-[9px] text-slate-600 ml-1.5 tabular-nums">{c.total}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
