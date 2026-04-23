'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

/**
 * Clickable strip of the most-recently-updated tasks. Each chip opens the
 * TaskTraceDrawer — makes the new trace UX discoverable without needing
 * to retro-fit click handlers into every existing table/kanban/inbox.
 */
export default function RecentTasksStrip({ todos, onPick }: { todos: Todo[]; onPick: (t: Todo) => void }) {
  const recent = useMemo(
    () => [...todos].sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? '')).slice(0, 12),
    [todos],
  )
  if (recent.length === 0) return null

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono tracking-[0.2em] text-slate-500 uppercase">◆ Recent · tap for trace</span>
        <span className="text-[9px] font-mono text-slate-700">last 12</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {recent.map(t => {
          const dot =
            t.status === 'completed'   ? 'bg-emerald-500' :
            t.status === 'failed'      ? 'bg-red-500'     :
            t.status === 'in_progress' ? 'bg-cyan-500 animate-pulse' :
            t.status === 'blocked'     ? 'bg-amber-500'   :
                                         'bg-slate-600'
          return (
            <button
              key={t.id}
              onClick={() => onPick(t)}
              title={t.title}
              className="flex-shrink-0 max-w-[180px] px-2 py-1 rounded border border-slate-800 bg-black/30 hover:bg-slate-900/50 text-[11px] font-mono text-slate-300 hover:text-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="truncate">{t.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
