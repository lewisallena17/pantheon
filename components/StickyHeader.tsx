'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props {
  todos:     Todo[]
  activeTab: string
  onTab:     (t: string) => void
  tabs:      Array<{ key: string; label: string; icon: string; badge?: number }>
  compact:   boolean
  onToggleCompact: () => void
}

interface AgentOnline {
  name: string
  online: boolean
}

export default function StickyHeader({
  todos, activeTab, onTab, tabs, compact, onToggleCompact,
}: Props) {
  const [agents, setAgents]     = useState<AgentOnline[]>([])
  const [dailyCost, setDailyCost] = useState<number | null>(null)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const r = await fetch('/api/agents/control', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json() as { agents?: Array<{ name: string; status: string }> }
        setAgents((j.agents ?? []).map(a => ({ name: a.name, online: a.status === 'online' })))
      } catch {}
    }
    fetchAgents()
    const id = setInterval(fetchAgents, 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function fetchCost() {
      try {
        const r = await fetch('/api/cost', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json() as { today?: number; daily?: number }
        setDailyCost(j.today ?? j.daily ?? null)
      } catch {}
    }
    fetchCost()
    const id = setInterval(fetchCost, 10_000)
    return () => clearInterval(id)
  }, [])

  const stats = useMemo(() => {
    let active = 0, failed = 0, proposed = 0, pending = 0
    for (const t of todos) {
      if (t.status === 'in_progress') active++
      else if (t.status === 'failed') failed++
      else if (t.status === 'proposed') proposed++
      else if (t.status === 'pending') pending++
    }
    return { active, failed, proposed, pending }
  }, [todos])

  const onlineAgents = agents.filter(a => a.online).length

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-black/95 backdrop-blur-md border-b border-slate-800/60">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Key metrics */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {stats.proposed > 0 && (
            <span className="px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/40 text-amber-300 animate-pulse">
              📥 {stats.proposed} inbox
            </span>
          )}
          <span className={`${stats.active > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
            <span className={stats.active > 0 ? 'inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse' : 'inline-block w-1.5 h-1.5 rounded-full bg-slate-700 mr-1'} />
            {stats.active} active
          </span>
          <span className="text-slate-500">{stats.pending} queued</span>
          <span className={stats.failed > 0 ? 'text-red-400' : 'text-slate-600'}>
            ✗ {stats.failed}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800/60" />

        {/* Agent health */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <span className="text-slate-500">agents:</span>
          {agents.map(a => (
            <span
              key={a.name}
              title={`${a.name}: ${a.online ? 'online' : 'offline'}`}
              className={`w-1.5 h-1.5 rounded-full ${a.online ? 'bg-green-400' : 'bg-red-500'}`}
            />
          ))}
          <span className="ml-1 text-slate-600">{onlineAgents}/{agents.length || '-'}</span>
        </div>

        {dailyCost !== null && (
          <>
            <div className="h-4 w-px bg-slate-800/60" />
            <span className="text-[10px] font-mono text-slate-500">
              today <span className={dailyCost > 1.5 ? 'text-amber-400' : dailyCost > 0.5 ? 'text-cyan-400' : 'text-slate-400'}>${dailyCost.toFixed(4)}</span>
            </span>
          </>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-0.5 ml-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => onTab(t.key)}
              className={`relative text-[10px] font-mono px-2.5 py-1 rounded tracking-wider uppercase transition-colors ${
                activeTab === t.key
                  ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <span className="mr-1">{t.icon}</span>{t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[8px] rounded-full bg-amber-500 text-black font-bold flex items-center justify-center">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Density toggle */}
        <button
          onClick={onToggleCompact}
          title={compact ? 'Expand' : 'Compact'}
          className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700/50 text-slate-500 hover:text-slate-300"
        >
          {compact ? '⊞' : '▭'}
        </button>
      </div>
    </div>
  )
}
