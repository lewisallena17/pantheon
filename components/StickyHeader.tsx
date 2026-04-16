'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
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

// How a retry result comes back from the button
type RetryState = 'idle' | 'running' | 'done' | 'error'

export default function StickyHeader({
  todos, activeTab, onTab, tabs, compact, onToggleCompact,
}: Props) {
  const [agents, setAgents]       = useState<AgentOnline[]>([])
  const [dailyCost, setDailyCost] = useState<number | null>(null)
  const [retryState, setRetryState] = useState<RetryState>('idle')
  const [retryMsg,   setRetryMsg]   = useState<string>('')

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

  const failedTodos = useMemo(() => todos.filter(t => t.status === 'failed'), [todos])
  const onlineAgents = agents.filter(a => a.online).length

  // ── Batch-retry all failed tasks ─────────────────────────────────────────
  // PATCH each failed task back to `pending` so agents can pick them up again.
  // Shows a brief success/error message that auto-clears after 4 s.
  const retryAllFailed = useCallback(async () => {
    if (retryState === 'running' || failedTodos.length === 0) return
    setRetryState('running')
    setRetryMsg('')
    try {
      const results = await Promise.allSettled(
        failedTodos.map(t =>
          fetch('/api/todos', {
            method:  'PATCH',
            headers: { 'content-type': 'application/json' },
            body:    JSON.stringify({ id: t.id, status: 'pending' }),
          })
        )
      )
      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const errCount  = results.length - succeeded
      if (errCount === 0) {
        setRetryMsg(`✓ ${succeeded} task${succeeded !== 1 ? 's' : ''} re-queued`)
        setRetryState('done')
      } else {
        setRetryMsg(`⚠ ${succeeded} ok · ${errCount} failed`)
        setRetryState('error')
      }
    } catch {
      setRetryMsg('✗ retry failed')
      setRetryState('error')
    } finally {
      setTimeout(() => { setRetryState('idle'); setRetryMsg('') }, 4000)
    }
  }, [failedTodos, retryState])

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 py-2 bg-black/95 backdrop-blur-md border-b border-slate-800/60">
      <div className="flex items-center gap-2 flex-wrap">

        {/* ── Key metrics ── */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {stats.proposed > 0 && (
            <span className="px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/40 text-amber-300 animate-pulse">
              📥 {stats.proposed} inbox
            </span>
          )}
          <span className={`${stats.active > 0 ? 'text-cyan-300' : 'text-slate-500'}`}>
            <span className={stats.active > 0
              ? 'inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse'
              : 'inline-block w-1.5 h-1.5 rounded-full bg-slate-700 mr-1'
            } />
            {stats.active} active
          </span>
          <span className="text-slate-500">{stats.pending} queued</span>
          <span className={stats.failed > 0 ? 'text-red-400' : 'text-slate-600'}>
            ✗ {stats.failed}
          </span>
        </div>

        {/* ── Retry failed button — only rendered when there are failures ── */}
        {stats.failed > 0 && (
          <button
            onClick={retryAllFailed}
            disabled={retryState === 'running'}
            title={`Re-queue all ${stats.failed} failed task${stats.failed !== 1 ? 's' : ''} as pending`}
            className={`
              text-[10px] font-mono px-2 py-0.5 rounded border transition-all duration-200 flex-shrink-0
              ${retryState === 'running'
                ? 'border-slate-700/50 text-slate-600 cursor-wait'
                : retryState === 'done'
                  ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400'
                  : retryState === 'error'
                    ? 'border-red-800/60 bg-red-950/30 text-red-400'
                    : 'border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-700/60'
              }
            `}
          >
            {retryState === 'running' ? '⟳ retrying…'
            : retryState === 'done'   ? retryMsg
            : retryState === 'error'  ? retryMsg
            : `⟳ retry ${stats.failed} failed`}
          </button>
        )}

        <div className="h-4 w-px bg-slate-800/60" />

        {/* ── Agent health dots ── */}
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
              today <span className={
                dailyCost > 1.5  ? 'text-amber-400' :
                dailyCost > 0.5  ? 'text-cyan-400'  :
                                   'text-slate-400'
              }>${dailyCost.toFixed(4)}</span>
            </span>
          </>
        )}

        {/* ── Tab switcher ── */}
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

        {/* ── Density toggle ── */}
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
