'use client'

import { useEffect, useMemo } from 'react'
import type { Todo } from '@/types/todos'

interface Props {
  pool:        string | null
  todos:       Todo[]
  costByAgent: Record<string, number>
  onClose:     () => void
}

function poolName(agent: string | null): string | null {
  if (!agent) return null
  return agent.replace(/-[a-f0-9]{4,}$/, '')
}

/**
 * Deep dive into a single agent pool. Pulls everything we know:
 * task history, trust trend, cost share, most recent comment trail.
 * Invoked from any agent chip across the dashboard.
 */
export default function AgentDrilldown({ pool, todos, costByAgent, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const stats = useMemo(() => {
    if (!pool) return null
    const own = todos.filter(t => poolName(t.assigned_agent) === pool)
    const completed = own.filter(t => t.status === 'completed').length
    const failed    = own.filter(t => t.status === 'failed').length
    const active    = own.filter(t => t.status === 'in_progress').length
    const rated     = completed + failed
    const rate      = rated > 0 ? completed / rated : 0

    // Last 7 vs prior 7 for trend
    const now     = Date.now()
    const d7      = now - 7  * 86_400_000
    const d14     = now - 14 * 86_400_000
    const last7   = own.filter(t => new Date(t.updated_at).getTime() >= d7)
    const prev7   = own.filter(t => { const x = new Date(t.updated_at).getTime(); return x >= d14 && x < d7 })
    const rateFor = (xs: Todo[]) => {
      const c = xs.filter(t => t.status === 'completed').length
      const f = xs.filter(t => t.status === 'failed').length
      return c + f > 0 ? c / (c + f) : null
    }
    const r7  = rateFor(last7)
    const rP7 = rateFor(prev7)
    const trend = r7 != null && rP7 != null ? Math.round((r7 - rP7) * 100) : null

    const mostRecent = [...own].sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? '')).slice(0, 8)
    const cost = costByAgent[pool] ?? 0

    return { total: own.length, completed, failed, active, rate, trend, mostRecent, cost }
  }, [pool, todos, costByAgent])

  if (!pool || !stats) return null

  const rateColor =
    stats.rate >= 0.75 ? 'text-emerald-400' :
    stats.rate >= 0.5  ? 'text-amber-400'   :
                         'text-red-400'

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <button aria-label="Close drilldown" onClick={onClose} className="flex-1 bg-black/60 backdrop-blur-sm" />
      <aside className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 overflow-y-auto animate-in slide-in-from-right duration-200">
        <header className="sticky top-0 z-10 px-4 py-3 border-b border-slate-800 bg-black/80 backdrop-blur flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase mb-1">⚡ Agent Profile</div>
            <div className="text-lg font-mono text-purple-300">{pool}</div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xl leading-none px-2">×</button>
        </header>

        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="grid grid-cols-3 gap-3 text-center font-mono">
            <Tile label="done"    value={String(stats.completed)} tone="emerald" />
            <Tile label="failed"  value={String(stats.failed)}    tone={stats.failed > 0 ? 'red' : 'slate'} />
            <Tile label="active"  value={String(stats.active)}    tone={stats.active > 0 ? 'cyan' : 'slate'} />
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-600">reliability:</span>
            <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden">
              <div className={`h-full transition-all ${
                stats.rate >= 0.75 ? 'bg-emerald-500' :
                stats.rate >= 0.5  ? 'bg-amber-500'   :
                                     'bg-red-500'
              }`} style={{ width: `${Math.round(stats.rate * 100)}%` }} />
            </div>
            <span className={rateColor}>{Math.round(stats.rate * 100)}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-600">7-day trend:</span>
            {stats.trend === null ? (
              <span className="text-slate-700">— insufficient data</span>
            ) : (
              <span className={stats.trend > 5 ? 'text-emerald-400' : stats.trend < -5 ? 'text-red-400' : 'text-slate-500'}>
                {stats.trend > 0 ? '▲' : stats.trend < 0 ? '▼' : '—'} {stats.trend > 0 ? '+' : ''}{stats.trend}%
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-600">all-time cost:</span>
            <span className="text-green-600">${stats.cost.toFixed(4)}</span>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase mb-2">◇ Recent Activity</div>
          {stats.mostRecent.length === 0 ? (
            <div className="text-[11px] font-mono text-slate-700">No tasks yet.</div>
          ) : (
            <div className="space-y-2">
              {stats.mostRecent.map(t => (
                <div key={t.id} className="text-[11px] font-mono flex items-start gap-2 leading-snug">
                  <StatusDot status={t.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-300 truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-700">
                      {t.status} · {new Date(t.updated_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'red' | 'cyan' | 'slate' }) {
  const cls = {
    emerald: 'text-emerald-400',
    red:     'text-red-400',
    cyan:    'text-cyan-400',
    slate:   'text-slate-500',
  }[tone]
  return (
    <div>
      <div className={`text-xl ${cls}`}>{value}</div>
      <div className="text-[9px] tracking-widest uppercase text-slate-600">{label}</div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'completed'   ? 'bg-emerald-500' :
    status === 'failed'      ? 'bg-red-500'     :
    status === 'in_progress' ? 'bg-cyan-500 animate-pulse' :
    status === 'blocked'     ? 'bg-amber-500'   :
                               'bg-slate-600'
  return <span className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${color}`} />
}
