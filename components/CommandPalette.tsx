'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { Todo } from '@/types/todos'

interface Command {
  id:       string
  label:    string
  hint?:    string
  group:    'actions' | 'agents' | 'nav' | 'tasks'
  run:      () => void | Promise<void>
}

interface Props {
  todos: Todo[]
}

const SECTION_IDS = {
  inbox:    'section-inbox',
  god:      'section-god',
  controls: 'section-controls',
  active:   'section-active',
  cost:     'section-cost',
  revenue:  'section-revenue',
  pixel:    'section-pixel',
  analytics:'section-analytics',
  feed:     'section-feed',
  todos:    'section-todos',
  git:      'section-git',
  contrib:  'section-contrib',
}

export default function CommandPalette({ todos }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlightIdx, setHighlightIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global Ctrl+K / Cmd+K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(v => !v)
        return
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10)
      setQuery('')
      setHighlightIdx(0)
    }
  }, [open])

  async function controlAgent(name: string, action: 'stop' | 'start' | 'restart') {
    await fetch('/api/agents/control', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, action }),
    })
    setOpen(false)
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  async function injectTask(title: string, priority: 'low'|'medium'|'high'|'critical' = 'high') {
    if (!title.trim()) return
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), priority, status: 'pending' }),
    })
    setOpen(false)
  }

  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      // Navigation
      { id: 'nav-inbox',    group: 'nav', label: 'Jump to ▸ Task Inbox',     run: () => scrollTo(SECTION_IDS.inbox) },
      { id: 'nav-god',      group: 'nav', label: 'Jump to ▸ God View',       run: () => scrollTo(SECTION_IDS.god) },
      { id: 'nav-controls', group: 'nav', label: 'Jump to ▸ Agent Controls', run: () => scrollTo(SECTION_IDS.controls) },
      { id: 'nav-active',   group: 'nav', label: 'Jump to ▸ Active Agent',   run: () => scrollTo(SECTION_IDS.active) },
      { id: 'nav-cost',     group: 'nav', label: 'Jump to ▸ Cost Tracker',   run: () => scrollTo(SECTION_IDS.cost) },
      { id: 'nav-revenue',  group: 'nav', label: 'Jump to ▸ Revenue',        run: () => scrollTo(SECTION_IDS.revenue) },
      { id: 'nav-pixel',    group: 'nav', label: 'Jump to ▸ Agent Office',   run: () => scrollTo(SECTION_IDS.pixel) },
      { id: 'nav-feed',     group: 'nav', label: 'Jump to ▸ Live Feed',      run: () => scrollTo(SECTION_IDS.feed) },
      { id: 'nav-todos',    group: 'nav', label: 'Jump to ▸ All Todos',      run: () => scrollTo(SECTION_IDS.todos) },

      // Agent controls
      { id: 'c-god-stop',     group: 'agents', label: 'Stop GOD',        hint: 'pm2 stop god',         run: () => controlAgent('god', 'stop') },
      { id: 'c-god-start',    group: 'agents', label: 'Start GOD',       hint: 'pm2 start god',        run: () => controlAgent('god', 'start') },
      { id: 'c-god-restart',  group: 'agents', label: 'Restart GOD',     hint: 'pm2 restart god',      run: () => controlAgent('god', 'restart') },
      { id: 'c-agents-stop',  group: 'agents', label: 'Stop Agents',     hint: 'pm2 stop ruflo-agents',run: () => controlAgent('ruflo-agents', 'stop') },
      { id: 'c-agents-start', group: 'agents', label: 'Start Agents',    hint: 'pm2 start ruflo-agents',run: () => controlAgent('ruflo-agents', 'start') },
      { id: 'c-revenue-stop', group: 'agents', label: 'Stop Revenue',    hint: 'pm2 stop revenue',     run: () => controlAgent('revenue', 'stop') },
      { id: 'c-all-restart',  group: 'agents', label: 'Restart ALL',     hint: 'pm2 restart all',      run: () => controlAgent('all', 'restart') },
      { id: 'c-all-stop',     group: 'agents', label: '⚠ Stop ALL',      hint: 'pm2 stop all',         run: () => controlAgent('all', 'stop') },

      // Actions
      { id: 'a-inject',  group: 'actions', label: `Inject task: "${query || '…'}"`, hint: 'creates pending todo',
        run: () => injectTask(query || 'Quick task from palette') },
      { id: 'a-inject-god', group: 'actions', label: `Focus God on: "${query || '…'}"`, hint: 'critical priority',
        run: () => injectTask(`[GOD FOCUS] ${query || 'Improve dashboard'}`, 'critical') },
      { id: 'a-sync-gh', group: 'actions', label: 'Sync GitHub Issues into Inbox', hint: '→ /api/github/issues/sync',
        run: async () => { await fetch('/api/github/issues/sync', { method: 'POST' }); setOpen(false) } },

      // Nav (git views)
      { id: 'nav-git',     group: 'nav', label: 'Jump to ▸ Git History',       run: () => scrollTo(SECTION_IDS.controls) },
      { id: 'nav-contrib', group: 'nav', label: 'Jump to ▸ Contribution Graph', run: () => scrollTo(SECTION_IDS.analytics) },
    ]

    // Task entries from current todos
    const q = query.trim().toLowerCase()
    if (q.length >= 2) {
      const matches = todos
        .filter(t => t.title.toLowerCase().includes(q))
        .slice(0, 8)
        .map<Command>(t => ({
          id: `t-${t.id}`,
          group: 'tasks',
          label: `${statusIcon(t.status)} ${t.title.slice(0, 70)}`,
          hint: `${t.priority} · ${t.assigned_agent ?? '-'}`,
          run: () => scrollTo(SECTION_IDS.todos),
        }))
      return [...base, ...matches]
    }
    return base
  }, [query, todos])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) || (c.hint ?? '').toLowerCase().includes(q)
    )
  }, [commands, query])

  useEffect(() => { setHighlightIdx(0) }, [query])

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[highlightIdx]?.run()
    }
  }

  if (!open) {
    return (
      <div className="fixed bottom-3 right-3 z-40 pointer-events-none select-none">
        <kbd className="pointer-events-auto text-[9px] font-mono px-2 py-1 rounded border border-slate-700/60 bg-black/80 text-slate-500 hover:text-slate-300 cursor-pointer"
             onClick={() => setOpen(true)}>
          ⌘K · COMMANDS
        </kbd>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[10vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-slate-700/70 bg-slate-950 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/60">
          <span className="text-slate-600 text-sm">◈</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command or task to search…"
            className="flex-1 bg-transparent outline-none text-sm font-mono text-slate-200 placeholder-slate-600"
          />
          <kbd className="text-[9px] font-mono text-slate-600">ESC</kbd>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-[11px] font-mono text-slate-600">No matches</div>
          )}

          {(['nav', 'actions', 'agents', 'tasks'] as const).map(group => {
            const items = filtered.filter(c => c.group === group)
            if (items.length === 0) return null
            return (
              <div key={group}>
                <div className="px-4 pt-2 pb-1 text-[9px] font-mono text-slate-600 tracking-[0.2em] uppercase">
                  {groupLabel(group)}
                </div>
                {items.map(c => {
                  const idx = filtered.indexOf(c)
                  const active = idx === highlightIdx
                  return (
                    <button
                      key={c.id}
                      onClick={() => c.run()}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between ${
                        active ? 'bg-cyan-950/40' : 'hover:bg-slate-900/50'
                      }`}
                    >
                      <span className={`text-xs font-mono ${active ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {c.label}
                      </span>
                      {c.hint && (
                        <span className="text-[9px] font-mono text-slate-600">{c.hint}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/60 text-[9px] font-mono text-slate-600">
          <span>↑↓ navigate · ⏎ select</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  )
}

function groupLabel(g: Command['group']): string {
  return g === 'nav' ? 'Navigate' : g === 'actions' ? 'Actions' : g === 'agents' ? 'Agent Controls' : 'Tasks'
}

function statusIcon(s: string): string {
  return s === 'completed' ? '✓' : s === 'failed' ? '✗' : s === 'in_progress' ? '◉' : s === 'proposed' ? '?' : '○'
}

export { SECTION_IDS }
