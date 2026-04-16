'use client'

import { useEffect, useState, useCallback } from 'react'

interface AgentStatus {
  name:        string
  status:      string
  restarts:    number
  uptimeStart: number
  cpu:         number
  memoryMb:    number
}

const LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'god':                { label: 'GOD',          emoji: '👁️', color: 'text-amber-400'  },
  'ruflo-agents':       { label: 'AGENTS',       emoji: '⚡', color: 'text-cyan-400'   },
  'ruflo-orchestrator': { label: 'ORCHESTRATOR', emoji: '🎯', color: 'text-purple-400' },
  'revenue':            { label: 'REVENUE',      emoji: '💰', color: 'text-yellow-400' },
  'promote':            { label: 'PROMOTER',     emoji: '📢', color: 'text-pink-400'   },
}

export default function AgentControlPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [busy,   setBusy]   = useState<string | null>(null)
  const [error,  setError]  = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/agents/control', { cache: 'no-store' })
      if (!r.ok) throw new Error(await r.text())
      const j = await r.json() as { agents: AgentStatus[] }
      setAgents(j.agents)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'fetch failed')
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 4000)
    return () => clearInterval(id)
  }, [refresh])

  async function control(name: string, action: 'stop' | 'start' | 'restart') {
    setBusy(`${name}:${action}`)
    try {
      const r = await fetch('/api/agents/control', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, action }),
      })
      if (!r.ok) throw new Error((await r.json()).error ?? 'failed')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'command failed')
    } finally {
      setBusy(null)
    }
  }

  function uptime(startMs: number): string {
    if (!startMs) return '—'
    const s = Math.floor((Date.now() - startMs) / 1000)
    if (s < 60) return `${s}s`
    if (s < 3600) return `${Math.floor(s / 60)}m`
    if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Agent Controls</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => control('all', 'restart')}
            disabled={busy !== null}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-900/50 text-amber-400 hover:bg-amber-950/30 disabled:opacity-40"
          >
            {busy === 'all:restart' ? '…' : 'RESTART ALL'}
          </button>
          <button
            onClick={() => control('all', 'stop')}
            disabled={busy !== null}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-red-900/50 text-red-400 hover:bg-red-950/30 disabled:opacity-40"
          >
            {busy === 'all:stop' ? '…' : 'STOP ALL'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-1.5 border-b border-red-900/40 bg-red-950/20 text-[10px] font-mono text-red-400">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800/40">
        {Object.keys(LABELS).map(name => {
          const agent = agents.find(a => a.name === name)
          const meta  = LABELS[name]
          const online = agent?.status === 'online'

          return (
            <div key={name} className="bg-black/60 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.emoji}</span>
                  <div>
                    <div className={`text-xs font-mono font-bold ${meta.color}`}>{meta.label}</div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-0.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        online ? 'bg-green-400 animate-pulse' :
                        agent?.status === 'stopped' ? 'bg-slate-600' : 'bg-red-500'
                      }`} />
                      <span className="uppercase">{agent?.status ?? 'unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-[9px] font-mono text-slate-500 space-y-0.5">
                  <div>↑ {uptime(agent?.uptimeStart ?? 0)}</div>
                  <div>↺ {agent?.restarts ?? 0}</div>
                  <div>{agent?.memoryMb ?? 0}MB · {Math.round(agent?.cpu ?? 0)}%</div>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => control(name, 'restart')}
                  disabled={busy !== null}
                  className="flex-1 text-[10px] font-mono py-1 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/40 disabled:opacity-40"
                >
                  {busy === `${name}:restart` ? '…' : '↻ RESTART'}
                </button>
                {online ? (
                  <button
                    onClick={() => control(name, 'stop')}
                    disabled={busy !== null}
                    className="flex-1 text-[10px] font-mono py-1 rounded border border-red-900/50 text-red-400 hover:bg-red-950/40 disabled:opacity-40"
                  >
                    {busy === `${name}:stop` ? '…' : '■ STOP'}
                  </button>
                ) : (
                  <button
                    onClick={() => control(name, 'start')}
                    disabled={busy !== null}
                    className="flex-1 text-[10px] font-mono py-1 rounded border border-green-900/50 text-green-400 hover:bg-green-950/40 disabled:opacity-40"
                  >
                    {busy === `${name}:start` ? '…' : '▶ START'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
