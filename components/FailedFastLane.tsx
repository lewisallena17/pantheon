'use client'

/**
 * FailedFastLane
 * ─────────────────────────────────────────────────────────────────────────────
 * A compact, always-visible triage panel that surfaces every failed task and
 * lets the operator re-queue them individually or in bulk — without switching
 * tabs or scrolling through the full task list.
 *
 * Appears only when there is ≥ 1 failed task. Auto-collapses when the failure
 * list is cleared so it never clutters a healthy dashboard.
 */

import { useCallback, useMemo, useState } from 'react'
import type { Todo, TaskCategory } from '@/types/todos'

interface Props {
  todos: Todo[]
  /** Called after a successful status patch so parent can optimistically update */
  onRetried?: (ids: string[]) => void
}

const CAT_ICONS: Record<TaskCategory, string> = {
  db: '🗄', ui: '🖥', infra: '⚙', analysis: '📊', other: '◈',
}

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-500',
  medium:   'bg-cyan-500',
  low:      'bg-slate-600',
}

type RowState = 'idle' | 'retrying' | 'done' | 'error'

function FailedRow({
  todo,
  onRetried,
}: {
  todo: Todo
  onRetried: (id: string) => void
}) {
  const [state, setState] = useState<RowState>('idle')

  async function retry() {
    if (state === 'retrying') return
    setState('retrying')
    try {
      const r = await fetch('/api/todos', {
        method:  'PATCH',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ id: todo.id, status: 'pending' }),
      })
      if (!r.ok) throw new Error('patch failed')
      setState('done')
      setTimeout(() => onRetried(todo.id), 600)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const lastComment = todo.comments?.slice(-1)[0]

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 text-xs font-mono
        border-b border-slate-800/40 last:border-0 group
        transition-all duration-300
        ${state === 'done' ? 'opacity-40' : 'hover:bg-red-950/10'}
      `}
    >
      {/* Priority dot */}
      <span
        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[todo.priority] ?? 'bg-slate-600'}`}
        title={todo.priority}
      />

      {/* Category icon */}
      {todo.task_category && todo.task_category !== 'other' && (
        <span className="text-slate-700 flex-shrink-0" title={todo.task_category}>
          {CAT_ICONS[todo.task_category]}
        </span>
      )}

      {/* Title — truncated, shows last comment on hover via title */}
      <span
        className="flex-1 min-w-0 text-red-200/70 truncate"
        title={lastComment ? `${lastComment.agent}: ${lastComment.text}` : todo.title}
      >
        {todo.title}
      </span>

      {/* Retry count badge */}
      {(todo.retry_count ?? 0) > 0 && (
        <span className="text-yellow-800 flex-shrink-0 tabular-nums" title="Previous retry attempts">
          ↺{todo.retry_count}
        </span>
      )}

      {/* Elapsed since failure */}
      <span className="text-slate-700 flex-shrink-0 tabular-nums hidden sm:block">
        {elapsedShort(todo.updated_at)}
      </span>

      {/* Per-row retry button */}
      <button
        onClick={retry}
        disabled={state === 'retrying' || state === 'done'}
        title="Re-queue this task as pending"
        className={`
          flex-shrink-0 px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider
          transition-all duration-150 active:scale-95
          ${state === 'retrying' ? 'border-slate-700 text-slate-600 cursor-wait' :
            state === 'done'     ? 'border-emerald-800/50 text-emerald-600 cursor-default' :
            state === 'error'    ? 'border-orange-700/50 text-orange-400' :
            'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-700/60 hover:text-red-300'
          }
        `}
      >
        {state === 'retrying' ? '…'   :
         state === 'done'     ? '✓'   :
         state === 'error'    ? '✗'   :
         '↺'}
      </button>
    </div>
  )
}

export default function FailedFastLane({ todos, onRetried }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [bulkState, setBulkState] = useState<RowState>('idle')
  const [bulkMsg,   setBulkMsg]   = useState('')

  // Derive failed list sorted by priority then recency
  const failed = useMemo(() =>
    todos
      .filter(t => t.status === 'failed')
      .sort((a, b) => {
        const PRIO: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
        const pd = (PRIO[a.priority] ?? 2) - (PRIO[b.priority] ?? 2)
        if (pd !== 0) return pd
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }),
    [todos],
  )

  const retryAll = useCallback(async () => {
    if (bulkState === 'running' || failed.length === 0) return
    setBulkState('retrying')
    setBulkMsg('')
    try {
      const results = await Promise.allSettled(
        failed.map(t =>
          fetch('/api/todos', {
            method:  'PATCH',
            headers: { 'content-type': 'application/json' },
            body:    JSON.stringify({ id: t.id, status: 'pending' }),
          })
        )
      )
      const ok  = results.filter(r => r.status === 'fulfilled').length
      const err = results.length - ok
      setBulkMsg(err === 0 ? `✓ ${ok} re-queued` : `⚠ ${ok} ok · ${err} err`)
      setBulkState('done')
      onRetried?.(failed.map(t => t.id))
    } catch {
      setBulkMsg('✗ retry failed')
      setBulkState('error')
    } finally {
      setTimeout(() => { setBulkState('idle'); setBulkMsg('') }, 4000)
    }
  }, [failed, bulkState, onRetried])

  const handleRowRetried = useCallback((id: string) => {
    onRetried?.([id])
  }, [onRetried])

  if (failed.length === 0) return null

  // Category summary for collapsed header
  const catCounts = failed.reduce<Record<string, number>>((acc, t) => {
    const c = t.task_category ?? 'other'
    acc[c] = (acc[c] ?? 0) + 1
    return acc
  }, {})
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, n]) => `${CAT_ICONS[cat as TaskCategory] ?? '◈'} ${n}`)
    .join('  ')

  return (
    <div className="rounded border border-red-900/40 bg-black/50 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/20 border-b border-red-900/30">

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left group"
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand failed tasks' : 'Collapse'}
        >
          <span className="text-red-500 text-xs flex-shrink-0 select-none">
            {collapsed ? '▶' : '▼'}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400 uppercase flex-shrink-0">
            ⚠ Failed Tasks
          </span>
          <span className="text-[10px] font-mono bg-red-900/50 text-red-300 border border-red-700/40 rounded px-1.5 py-0.5 tabular-nums flex-shrink-0">
            {failed.length}
          </span>
          {collapsed && topCats && (
            <span className="text-[10px] font-mono text-slate-700 truncate">
              {topCats}
            </span>
          )}
        </button>

        {/* Bulk retry button */}
        <button
          onClick={retryAll}
          disabled={bulkState === 'retrying' || bulkState === 'done'}
          title={`Re-queue all ${failed.length} failed tasks as pending`}
          className={`
            flex-shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded border
            transition-all duration-200 active:scale-95
            ${bulkState === 'retrying' ? 'border-slate-700 text-slate-600 cursor-wait' :
              bulkState === 'done'     ? 'border-emerald-800/50 bg-emerald-950/20 text-emerald-400 cursor-default' :
              bulkState === 'error'    ? 'border-orange-700/40 text-orange-400' :
              'border-red-700/50 bg-red-950/30 text-red-300 hover:bg-red-900/40 hover:border-red-600/60 hover:text-red-200'
            }
          `}
        >
          {bulkMsg || (bulkState === 'retrying' ? '⟳ retrying…' : `⟳ retry all ${failed.length}`)}
        </button>
      </div>

      {/* ── Task rows ──────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="max-h-56 overflow-y-auto overscroll-contain">
          {failed.map(todo => (
            <FailedRow
              key={todo.id}
              todo={todo}
              onRetried={handleRowRetried}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Returns a compact elapsed string like "3m", "1h", "2d" */
function elapsedShort(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s`
  if (s < 3600)  return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}
