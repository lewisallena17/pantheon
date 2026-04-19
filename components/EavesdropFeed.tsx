'use client'

import { useEffect, useRef, useState } from 'react'

interface Entry { agent: string; lesson: string; at: string; idx: number }

const POLL_MS = 4000
const MAX_ROWS = 40

// Pin each agent to a stable accent color so the feed reads at a glance
const AGENT_COLORS: Record<string, string> = {
  'db-specialist':    'text-cyan-300     border-cyan-800/40     bg-cyan-950/20',
  'ui-specialist':    'text-purple-300   border-purple-800/40   bg-purple-950/20',
  'ruflo-critical':   'text-red-300      border-red-800/50      bg-red-950/30',
  'ruflo-high':       'text-orange-300   border-orange-800/40   bg-orange-950/20',
  'ruflo-medium':     'text-yellow-300   border-yellow-800/40   bg-yellow-950/20',
  'ruflo-low':        'text-slate-300    border-slate-700/40    bg-slate-900/30',
  'global-lessons':   'text-emerald-300  border-emerald-800/50  bg-emerald-950/30',
}

function agentStyle(agent: string) {
  return AGENT_COLORS[agent] ?? 'text-slate-400 border-slate-700/40 bg-slate-900/20'
}

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.round(ms / 1000)
  if (s < 60)      return `${s}s ago`
  if (s < 3600)    return `${Math.round(s / 60)}m ago`
  if (s < 86_400)  return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86_400)}d ago`
}

export default function EavesdropFeed() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set())
  const seenRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/shared-memory', { cache: 'no-store' })
        if (!r.ok) return
        const data = await r.json()
        const fresh: Entry[] = (data.entries ?? []).slice(0, MAX_ROWS)

        // Flag entries we haven't seen before so they can fade in
        const arrived = new Set<string>()
        for (const e of fresh) {
          const k = `${e.agent}::${e.lesson}`
          if (!seenRef.current.has(k)) {
            arrived.add(k)
            seenRef.current.add(k)
          }
        }
        setEntries(fresh)
        if (arrived.size) {
          setNewKeys(arrived)
          // Remove the "new" highlight after 2.5s so it fades to normal styling
          setTimeout(() => setNewKeys(new Set()), 2500)
        }
      } catch {}
    }
    load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [])

  if (!entries.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◉ Agent Chatter</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No shared-memory activity yet. Agents write lessons here as they finish tasks.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◉ Agent Chatter</span>
        <span className="text-[10px] font-mono text-slate-600">{entries.length} recent · eavesdropping live</span>
      </div>
      <div className="divide-y divide-slate-800/30 max-h-[420px] overflow-y-auto">
        {entries.map(e => {
          const k = `${e.agent}::${e.lesson}`
          const isNew = newKeys.has(k)
          return (
            <div
              key={k}
              className={`flex items-start gap-3 px-4 py-2 transition-colors duration-700 ${
                isNew ? 'bg-emerald-950/30' : 'hover:bg-slate-900/30'
              }`}
            >
              <span className={`flex-shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded border tracking-wider uppercase ${agentStyle(e.agent)}`}>
                {e.agent}
              </span>
              <span className="text-[11px] text-slate-300 flex-1 leading-relaxed break-words">
                {e.lesson.length > 220 ? e.lesson.slice(0, 220) + '…' : e.lesson}
              </span>
              <span className="flex-shrink-0 text-[9px] font-mono text-slate-600 tabular-nums">
                {relTime(e.at)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
