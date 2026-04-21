'use client'

import { useEffect, useState } from 'react'
import RadialGauge from './RadialGauge'

interface CostLog {
  total: number
  byAgent: Record<string, number>
  sessions: { at: string; agent: string; cost: number; inputTokens: number; outputTokens: number }[]
}

const DAILY_LIMIT = 2.00  // matches server default — update if you change DAILY_COST_LIMIT_USD

function fmt(n: number) {
  if (n < 0.001) return `<$0.001`
  return `$${n.toFixed(4)}`
}

function getTodaySpend(sessions: CostLog['sessions']) {
  const today = new Date().toISOString().slice(0, 10)
  return sessions.filter(s => s.at?.startsWith(today)).reduce((sum, s) => sum + (s.cost ?? 0), 0)
}

export default function CostTracker() {
  const [data, setData] = useState<CostLog | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/cost')
        if (res.ok) setData(await res.json())
      } catch {}
    }
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  if (!data) return null

  const agents        = Object.entries(data.byAgent ?? {}).sort((a, b) => b[1] - a[1])
  const recentSessions = (data.sessions ?? []).slice(-5).reverse()
  const todaySpend    = getTodaySpend(data.sessions ?? [])
  const limitPct      = Math.min((todaySpend / DAILY_LIMIT) * 100, 100)
  const isWarning     = limitPct >= 75
  const isAtLimit     = limitPct >= 100

  return (
    <div className={`rounded border bg-black/40 overflow-hidden transition-colors ${
      isAtLimit  ? 'border-red-800/60' :
      isWarning  ? 'border-yellow-800/40' :
      'border-slate-800/60'
    }`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60 hover:bg-black/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ API Cost</span>
          {isAtLimit && <span className="text-[10px] font-mono text-red-500 animate-pulse">⛔ LIMIT HIT</span>}
          {isWarning && !isAtLimit && <span className="text-[10px] font-mono text-yellow-600">⚠ {Math.round(limitPct)}% of daily limit</span>}
        </div>
        <div className="flex items-center gap-3">
          {/* Today's spend progress */}
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 bg-slate-900 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all ${
                  isAtLimit ? 'bg-red-600' : isWarning ? 'bg-yellow-600' : 'bg-green-700'
                }`}
                style={{ width: `${limitPct}%` }}
              />
            </div>
            <span className={`text-xs font-mono tabular-nums ${
              isAtLimit ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-600'
            }`}>
              {fmt(todaySpend)}<span className="text-slate-700">/{fmt(DAILY_LIMIT)}</span>
            </span>
          </div>
          <span className="text-xs font-mono text-slate-700">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-3">

          {/* Daily budget — radial HUD gauge + numeric breakdown */}
          <div className="flex items-center gap-4">
            <RadialGauge
              pct={limitPct}
              size={96}
              label={fmt(todaySpend)}
              sublabel="TODAY"
              color={isAtLimit ? 'red' : isWarning ? 'amber' : 'emerald'}
              thickness={8}
            />
            <div className="flex-1 text-xs font-mono space-y-1">
              <div className="text-slate-500">
                <span className="text-slate-400">daily limit:</span> {fmt(DAILY_LIMIT)}
              </div>
              <div className="text-slate-500">
                <span className="text-slate-400">all-time:</span> {fmt(data.total ?? 0)}
              </div>
              <div className={isAtLimit ? 'text-red-400' : 'text-emerald-400'}>
                {isAtLimit ? 'PAUSED until tomorrow' : `${fmt(DAILY_LIMIT - todaySpend)} remaining`}
              </div>
            </div>
          </div>

          {/* Per-agent breakdown */}
          {agents.length > 0 && (
            <div>
              <div className="text-xs font-mono text-slate-600 tracking-widest mb-1.5">BY AGENT (all-time)</div>
              <div className="space-y-1">
                {agents.map(([agent, cost]) => {
                  const pct = data.total > 0 ? (cost / data.total) * 100 : 0
                  return (
                    <div key={agent} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-500/80 w-36 truncate">{agent}</span>
                      <div className="flex-1 h-1 bg-slate-900 rounded overflow-hidden">
                        <div className="h-full bg-green-700/60 rounded" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono text-green-600 w-20 text-right">{fmt(cost)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent calls */}
          {recentSessions.length > 0 && (
            <div>
              <div className="text-xs font-mono text-slate-600 tracking-widest mb-1.5">RECENT CALLS</div>
              <div className="space-y-0.5">
                {recentSessions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-700">{new Date(s.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-purple-500/70 truncate max-w-28">{s.agent}</span>
                    <span className="text-slate-600 ml-auto">{(s.inputTokens + s.outputTokens).toLocaleString()} tok</span>
                    <span className="text-green-600 w-16 text-right">{fmt(s.cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] font-mono text-slate-700 text-center">
            Change limit: set DAILY_COST_LIMIT_USD in .env.local
          </p>
        </div>
      )}
    </div>
  )
}
