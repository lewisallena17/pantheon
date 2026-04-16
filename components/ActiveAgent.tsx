'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/types/todos'

interface Trace {
  id: string
  tool_name: string
  input_summary: string | null
  is_error: boolean
  duration_ms: number | null
}

interface Props { todos: Todo[] }

const TOOL_ICONS: Record<string, string> = {
  read_file: '📄', write_file: '✏️', list_directory: '📁',
  run_sql: '🔍', run_ddl: '🔧', list_tables: '📋', describe_table: '🗂️',
  web_search: '🌐', fetch_url: '🔗', task_complete: '✅',
}

function LiveTimer({ since }: { since: string }) {
  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    function tick() {
      const ms = Date.now() - new Date(since).getTime()
      const s = Math.floor(ms / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      if (h > 0)      setElapsed(`${h}h${m % 60}m`)
      else if (m > 0) setElapsed(`${m}m${s % 60}s`)
      else            setElapsed(`${s}s`)
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [since])
  return <>{elapsed}</>
}

function useLastTrace(taskId: string) {
  const [last, setLast] = useState<Trace | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('traces') as any)
      .select('id,tool_name,input_summary,is_error,duration_ms')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }: { data: Trace[] | null }) => {
        if (data?.[0]) setLast(data[0])
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase.from('traces') as any)
      .select('id', { count: 'exact', head: true })
      .eq('task_id', taskId)
      .then(({ count: c }: { count: number }) => setCount(c ?? 0))

    const ch = supabase.channel(`act-${taskId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traces', filter: `task_id=eq.${taskId}` },
        ({ new: row }) => { setLast(row as Trace); setCount(c => c + 1) }
      ).subscribe()
    return () => { ch.unsubscribe() }
  }, [taskId])

  return { last, count }
}

function ActiveRow({ todo }: { todo: Todo }) {
  const { last, count } = useLastTrace(todo.id)
  const pool = todo.assigned_agent?.replace(/-[a-f0-9]{6}$/, '') ?? 'agent'

  const lastLabel = last ? (() => {
    try {
      const p = JSON.parse(last.input_summary ?? '{}')
      const detail = p.path ?? p.query?.slice(0, 40) ?? p.statement?.slice(0, 40) ?? ''
      return detail ? `${TOOL_ICONS[last.tool_name] ?? '⚡'} ${detail}` : `${TOOL_ICONS[last.tool_name] ?? '⚡'} ${last.tool_name}`
    } catch { return `${TOOL_ICONS[last.tool_name] ?? '⚡'} ${last.tool_name}` }
  })() : null

  return (
    <div className="flex items-center gap-3 px-3 py-2 min-w-0">
      {/* Pulse */}
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />

      {/* Agent pool */}
      <span className="text-xs font-mono text-purple-400 flex-shrink-0 hidden sm:block w-28 truncate">
        {pool}
      </span>

      {/* Task title */}
      <span className="text-xs font-mono text-slate-300 truncate flex-1 min-w-0">
        {todo.title}
      </span>

      {/* Last tool */}
      {lastLabel && (
        <span className="text-[11px] font-mono text-slate-600 truncate max-w-36 hidden md:block flex-shrink-0">
          {lastLabel}
        </span>
      )}

      {/* Call count */}
      {count > 0 && (
        <span className="text-[10px] font-mono text-slate-700 flex-shrink-0 tabular-nums">
          {count}×
        </span>
      )}

      {/* Timer */}
      <span className="text-xs font-mono text-cyan-500 tabular-nums flex-shrink-0">
        <LiveTimer since={todo.updated_at} />
      </span>
    </div>
  )
}

export default function ActiveAgent({ todos }: Props) {
  const active = todos.filter(t => t.status === 'in_progress')

  if (active.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded border border-slate-800/40 bg-black/20">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-800 flex-shrink-0" />
        <span className="text-xs font-mono text-slate-700 tracking-widest">QUEUE IDLE</span>
      </div>
    )
  }

  // Show up to 6 rows before scrolling (~192 px at 32 px/row).
  // With 21 active tasks this gives a useful window without dominating the page.
  const MAX_VISIBLE = 6
  const visibleHeight = Math.min(active.length, MAX_VISIBLE) * 36

  return (
    <div className="rounded border border-cyan-900/30 bg-black/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-cyan-900/20 bg-black/40">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
        <span className="text-xs font-mono text-cyan-700 tracking-widest">RUNNING NOW</span>
        {/* Count badge */}
        <span className="ml-1 text-[10px] font-mono bg-cyan-900/40 text-cyan-400 border border-cyan-700/40 rounded px-1.5 py-0.5 tabular-nums">
          {active.length}
        </span>
        {active.length > MAX_VISIBLE && (
          <span className="text-[10px] font-mono text-slate-700 ml-auto">
            scroll ↕ {active.length - MAX_VISIBLE} more
          </span>
        )}
      </div>

      {/* Scrollable rows — grows to fit up to MAX_VISIBLE, then scrolls */}
      <div
        className="overflow-y-auto divide-y divide-slate-800/40"
        style={{ maxHeight: `${MAX_VISIBLE * 36}px`, height: `${visibleHeight}px` }}
      >
        {active.map(todo => (
          <ActiveRow key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  )
}
