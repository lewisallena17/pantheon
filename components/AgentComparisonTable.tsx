'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

interface AgentStats {
  pool: string
  completed: number
  failed: number
  active: number
  total: number
  successRate: number
  costUsd: number
  lastTask: string | null
  lastAt: string | null
}

function normalisePool(agentName: string | null): string | null {
  if (!agentName) return null
  return agentName.replace(/-[a-f0-9]{6}$/, '')
}

function SuccessBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-900 rounded overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-700 ${
            rate >= 70 ? 'bg-emerald-500' :
            rate >= 40 ? 'bg-yellow-600' : 'bg-red-700'
          }`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className={`text-xs font-mono tabular-nums ${
        rate >= 70 ? 'text-emerald-400' :
        rate >= 40 ? 'text-yellow-500' : 'text-red-400'
      }`}>
        {rate}%
      </span>
    </div>
  )
}

export default function AgentComparisonTable({ todos }: Props) {
  const [costByAgent, setCostByAgent] = useState<Record<string, number>>({})
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    fetch('/api/cost')
      .then(r => r.json())
      .then(d => setCostByAgent(d.byAgent ?? {}))
      .catch(() => {})
    const t = setInterval(() => {
      fetch('/api/cost').then(r => r.json()).then(d => setCostByAgent(d.byAgent ?? {})).catch(() => {})
    }, 30_000)
    return () => clearInterval(t)
  }, [])

  const agents: AgentStats[] = useMemo(() => {
    const poolMap = new Map<string, AgentStats>()

    for (const todo of todos) {
      const pool = normalisePool(todo.assigned_agent)
      if (!pool) continue

      if (!poolMap.has(pool)) {
        poolMap.set(pool, {
          pool,
          completed: 0, failed: 0, active: 0, total: 0,
          successRate: 0, costUsd: 0,
          lastTask: null, lastAt: null,
        })
      }

      const s = poolMap.get(pool)!
      s.total++
      if (todo.status === 'completed') s.completed++
      if (todo.status === 'failed')    s.failed++
      if (todo.status === 'in_progress') s.active++

      if (!s.lastAt || todo.updated_at > s.lastAt) {
        s.lastAt   = todo.updated_at
        s.lastTask = todo.title
      }
    }

    return Array.from(poolMap.values()).map(s => ({
      ...s,
      successRate: Math.round(s.completed / Math.max(s.completed + s.failed, 1) * 100),
      costUsd: costByAgent[s.pool] ?? 0,
    })).sort((a, b) => b.total - a.total)
  }, [todos, costByAgent])

  if (agents.length === 0) return null

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60 hover:bg-black/80 transition-colors"
      >
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Agent Performance</span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-700">{agents.length} pools</span>
          <span className="text-xs font-mono text-slate-700">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="text-left px-4 py-2 text-slate-600 tracking-widest font-normal">AGENT</th>
                <th className="text-left px-3 py-2 text-slate-600 tracking-widest font-normal">SUCCESS</th>
                <th className="text-right px-3 py-2 text-slate-600 tracking-widest font-normal">DONE</th>
                <th className="text-right px-3 py-2 text-slate-600 tracking-widest font-normal">FAIL</th>
                <th className="text-right px-3 py-2 text-slate-600 tracking-widest font-normal">ACTIVE</th>
                <th className="text-right px-3 py-2 text-slate-600 tracking-widest font-normal">COST</th>
                <th className="text-left px-3 py-2 text-slate-600 tracking-widest font-normal hidden lg:table-cell">LAST TASK</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr
                  key={a.pool}
                  className="border-b border-slate-800/30 hover:bg-slate-900/20 transition-colors"
                >
                  {/* Pool name */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {a.active > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
                      )}
                      <span className={`font-semibold ${a.active > 0 ? 'text-cyan-300' : 'text-purple-400'}`}>
                        {a.pool}
                      </span>
                    </div>
                  </td>

                  {/* Success rate bar */}
                  <td className="px-3 py-2.5">
                    <SuccessBar rate={a.successRate} />
                  </td>

                  {/* Completed */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-emerald-600">{a.completed}</span>
                  </td>

                  {/* Failed */}
                  <td className="px-3 py-2.5 text-right">
                    <span className={a.failed > 0 ? 'text-red-600' : 'text-slate-700'}>{a.failed}</span>
                  </td>

                  {/* Active */}
                  <td className="px-3 py-2.5 text-right">
                    <span className={a.active > 0 ? 'text-cyan-400 font-bold' : 'text-slate-700'}>
                      {a.active > 0 ? a.active : '—'}
                    </span>
                  </td>

                  {/* Cost */}
                  <td className="px-3 py-2.5 text-right">
                    <span className={a.costUsd > 0 ? 'text-green-600' : 'text-slate-700'}>
                      {a.costUsd > 0 ? `$${a.costUsd.toFixed(4)}` : '—'}
                    </span>
                  </td>

                  {/* Last task */}
                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    <div>
                      <span className="text-slate-600 truncate block max-w-xs">{a.lastTask?.slice(0, 60) ?? '—'}</span>
                      {a.lastAt && (
                        <span className="text-slate-700 text-[10px]">
                          {new Date(a.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
