'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface Event {
  ts:       number
  source:   string
  level:    'info' | 'warn' | 'error'
  category: string
  text:     string
}

const SOURCE_COLOR: Record<string, string> = {
  'god':                'text-amber-400',
  'ruflo-agents':       'text-cyan-400',
  'ruflo-orchestrator': 'text-purple-400',
  'revenue':            'text-yellow-400',
}

const CATEGORY_COLOR: Record<string, string> = {
  'edit':       'bg-cyan-950/60 text-cyan-400 border-cyan-900/50',
  'agent-edit': 'bg-purple-950/60 text-purple-400 border-purple-900/50',
  'web':        'bg-blue-950/60 text-blue-400 border-blue-900/50',
  'learn':      'bg-indigo-950/60 text-indigo-400 border-indigo-900/50',
  'decree':     'bg-amber-950/60 text-amber-400 border-amber-900/50',
  'cost':       'bg-red-950/60 text-red-400 border-red-900/50',
  'revenue':    'bg-yellow-950/60 text-yellow-400 border-yellow-900/50',
  'specialist': 'bg-teal-950/60 text-teal-400 border-teal-900/50',
  'info':       'bg-slate-900/60 text-slate-500 border-slate-800/50',
}

const SOURCE_FILTERS = ['all', 'god', 'ruflo-agents', 'ruflo-orchestrator', 'revenue'] as const
const LEVEL_FILTERS  = ['all', 'info', 'warn', 'error']  as const

export default function LiveFeed() {
  const [events, setEvents] = useState<Event[]>([])
  const [source, setSource] = useState<string>('all')
  const [level, setLevel]   = useState<string>('all')
  const [search, setSearch] = useState('')
  const [paused, setPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (paused) return
    let cancelled = false

    async function fetchLogs() {
      try {
        const r = await fetch('/api/agents/logs?n=200', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json() as { events: Event[] }
        if (!cancelled) setEvents(j.events)
      } catch {}
    }

    fetchLogs()
    const id = setInterval(fetchLogs, 2500)
    return () => { cancelled = true; clearInterval(id) }
  }, [paused])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return events.filter(e => {
      if (source !== 'all' && e.source !== source) return false
      if (level !== 'all' && e.level !== level) return false
      if (q && !e.text.toLowerCase().includes(q)) return false
      return true
    })
  }, [events, source, level, search])

  // Auto-scroll to bottom unless user scrolled up
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom) el.scrollTop = el.scrollHeight
  }, [filtered])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of events) c[e.source] = (c[e.source] ?? 0) + 1
    return c
  }, [events])

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Live Feed</span>
          {!paused && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              paused
                ? 'border-green-900/50 text-green-400 hover:bg-green-950/30'
                : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/30'
            }`}
          >
            {paused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>
          <span className="text-[9px] font-mono text-slate-600">
            {filtered.length}/{events.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-slate-800/40 bg-black/40 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-mono text-slate-600 tracking-wider mr-1">SRC:</span>
          {SOURCE_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setSource(s)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                source === s
                  ? 'border-cyan-700 text-cyan-300 bg-cyan-950/40'
                  : 'border-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}{s !== 'all' && counts[s] !== undefined ? ` (${counts[s]})` : ''}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[9px] font-mono text-slate-600 tracking-wider mr-1">LVL:</span>
          {LEVEL_FILTERS.map(l => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                level === l
                  ? l === 'error' ? 'border-red-700 text-red-300 bg-red-950/40'
                    : l === 'warn' ? 'border-yellow-700 text-yellow-300 bg-yellow-950/40'
                    : 'border-cyan-700 text-cyan-300 bg-cyan-950/40'
                  : 'border-slate-800/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {l}
            </button>
          ))}

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="filter text…"
            className="flex-1 min-w-20 ml-auto bg-slate-950 border border-slate-800/60 rounded px-2 py-0.5 text-[10px] font-mono text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-800/50"
          />
        </div>
      </div>

      {/* Feed */}
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto px-3 py-2 font-mono text-[10px] space-y-0.5"
      >
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-600">No events match your filters</div>
        ) : (
          filtered.map((e, i) => {
            const catClass = CATEGORY_COLOR[e.category] ?? CATEGORY_COLOR.info
            return (
              <div
                key={`${e.ts}-${i}`}
                className="flex items-start gap-2 hover:bg-slate-900/30 px-1 py-0.5 rounded"
              >
                <span className={`shrink-0 px-1 py-px text-[8px] border rounded uppercase tracking-wider ${catClass}`}>
                  {e.category}
                </span>
                <span className={`shrink-0 ${SOURCE_COLOR[e.source] ?? 'text-slate-400'} min-w-24`}>
                  {e.source}
                </span>
                <span className={
                  e.level === 'error' ? 'text-red-300' :
                  e.level === 'warn'  ? 'text-yellow-300' :
                  'text-slate-300'
                }>{e.text}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
