'use client'

/**
 * StatsBar — Mission Progress Strip
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the old duplicate-of-header stat tiles with two complementary views:
 *
 *  1. MISSION BAR  — a single stacked bar visualising the full task funnel
 *                    (active → queued → done → failed) with a completion %
 *                    and throughput insight (tasks closed per hour).
 *
 *  2. FAILURE TRIAGE — category-level failure breakdown (only when ≥ 3 failed).
 *                      Shows which workstream is on fire so the operator knows
 *                      where to focus, not just that something is broken.
 *
 * Intentionally does NOT repeat the individual tile numbers already shown in
 * DashboardHeader + StickyHeader — it adds net-new insight instead.
 */

import { useMemo } from 'react'
import type { Todo, TodoStatus, TaskCategory } from '@/types/todos'

// ── Failure Triage ────────────────────────────────────────────────────────────

const CAT_META: Record<TaskCategory, { label: string; icon: string; bar: string; text: string }> = {
  db:       { label: 'DB',       icon: '🗄', bar: 'bg-blue-500',   text: 'text-blue-400'   },
  ui:       { label: 'UI',       icon: '🖥', bar: 'bg-purple-500', text: 'text-purple-400' },
  infra:    { label: 'INFRA',    icon: '⚙', bar: 'bg-orange-500', text: 'text-orange-400' },
  analysis: { label: 'ANALYSIS', icon: '📊', bar: 'bg-teal-500',   text: 'text-teal-400'   },
  other:    { label: 'OTHER',    icon: '◈',  bar: 'bg-slate-500',  text: 'text-slate-400'  },
}

function FailureTriage({ todos }: { todos: Todo[] }) {
  const failed = useMemo(() => todos.filter(t => t.status === 'failed'), [todos])
  if (failed.length < 3) return null

  const catFailed = new Map<TaskCategory, number>()
  const catTotal  = new Map<TaskCategory, number>()
  for (const t of todos) {
    const cat = (t.task_category ?? 'other') as TaskCategory
    catTotal.set(cat, (catTotal.get(cat) ?? 0) + 1)
    if (t.status === 'failed') catFailed.set(cat, (catFailed.get(cat) ?? 0) + 1)
  }

  const cats = (Object.keys(CAT_META) as TaskCategory[])
    .filter(c => (catFailed.get(c) ?? 0) > 0)
    .sort((a, b) => (catFailed.get(b) ?? 0) - (catFailed.get(a) ?? 0))

  if (cats.length === 0) return null
  const maxFailed = catFailed.get(cats[0]) ?? 1

  return (
    <div className="pt-2 border-t border-slate-800/50 space-y-1.5">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono tracking-[0.2em] text-slate-700 uppercase select-none">
          ▼ Failure Triage
        </span>
        <div className="flex-1 h-px bg-red-900/20" />
        <span className="text-[9px] font-mono text-red-700 tabular-nums">{failed.length} failed</span>
      </div>

      {/* Per-category rows */}
      <div className="space-y-1">
        {cats.map(cat => {
          const f   = catFailed.get(cat) ?? 0
          const tot = catTotal.get(cat)  ?? 0
          const pct = Math.round((f / tot) * 100)
          const barW = Math.round((f / maxFailed) * 100)
          const meta = CAT_META[cat]
          const critical = pct >= 80

          return (
            <div key={cat} className="flex items-center gap-2">
              <span className={`text-[9px] font-mono w-[4.5rem] flex-shrink-0 flex items-center gap-1 ${
                critical ? 'text-red-400' : meta.text
              }`}>
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </span>

              <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    critical ? 'bg-red-500 shadow-[0_0_4px_rgba(255,51,102,0.5)]' : meta.bar
                  }`}
                  style={{ width: `${barW}%` }}
                />
              </div>

              <span className={`text-[9px] font-mono tabular-nums flex-shrink-0 w-[4.5rem] text-right ${
                critical ? 'text-red-400' : 'text-slate-600'
              }`}>
                <span className={critical ? 'text-red-300 font-bold' : 'text-slate-400'}>{f}</span>
                <span className="text-slate-700">/{tot}</span>
                <span className={`ml-1 ${critical ? 'text-red-500' : 'text-slate-700'}`}>({pct}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mission Progress Bar ──────────────────────────────────────────────────────

const SEGMENTS: { status: TodoStatus; bg: string; label: string; textColor: string }[] = [
  { status: 'in_progress', bg: 'bg-cyan-500',    label: 'ACTIVE',  textColor: 'text-cyan-400'    },
  { status: 'proposed',    bg: 'bg-amber-500',   label: 'INBOX',   textColor: 'text-amber-400'   },
  { status: 'pending',     bg: 'bg-slate-600',   label: 'QUEUED',  textColor: 'text-slate-500'   },
  { status: 'blocked',     bg: 'bg-orange-500',  label: 'BLOCKED', textColor: 'text-orange-400'  },
  { status: 'completed',   bg: 'bg-emerald-500', label: 'DONE',    textColor: 'text-emerald-400' },
  { status: 'failed',      bg: 'bg-red-600',     label: 'FAILED',  textColor: 'text-red-400'     },
]

/** Compute a rough tasks-per-hour rate from completed todos with timestamps. */
function computeThroughput(todos: Todo[]): string | null {
  const completed = todos
    .filter(t => t.status === 'completed' && t.updated_at)
    .map(t => new Date(t.updated_at).getTime())
    .sort((a, b) => a - b)

  if (completed.length < 2) return null

  // Use span from oldest to newest completed task
  const span = completed[completed.length - 1] - completed[0]
  if (span < 60_000) return null // too short a window

  const rate = (completed.length / (span / 3_600_000)) // tasks per hour
  if (rate < 0.1) return null

  // Human-friendly: if < 1/hr, show per-day instead
  if (rate < 1) return `~${Math.round(rate * 24)}/day`
  return `~${rate.toFixed(1)}/hr`
}

export default function StatsBar({ todos }: { todos: Todo[] }) {
  const counts = useMemo(() => {
    const m: Partial<Record<TodoStatus, number>> = {}
    for (const t of todos) m[t.status] = (m[t.status] ?? 0) + 1
    return m
  }, [todos])

  const total = todos.length
  if (total === 0) {
    return (
      <div className="text-[10px] font-mono text-slate-700 text-center py-1 tracking-widest">
        NO TASKS LOADED
      </div>
    )
  }

  const completed  = counts['completed'] ?? 0
  const failed     = counts['failed']    ?? 0
  const closed     = completed + failed
  const donePct    = Math.round((completed / total) * 100)
  const winRate    = closed >= 3 ? Math.round((completed / closed) * 100) : null
  const throughput = computeThroughput(todos)

  const healthColor =
    winRate === null  ? 'text-slate-500'   :
    winRate >= 70     ? 'text-emerald-400' :
    winRate >= 40     ? 'text-amber-400'   :
                        'text-red-400'

  return (
    <div className="space-y-2">
      {/* ── Top row: completion % + win-rate insight ── */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
        {/* Left: completion fraction */}
        <span className="text-slate-500">
          <span className="text-slate-300 font-bold tabular-nums">{completed}</span>
          <span className="text-slate-700">/{total}</span>
          <span className="ml-1.5 text-slate-600">complete</span>
          <span className="ml-1 text-slate-700 tabular-nums">({donePct}%)</span>
        </span>

        {/* Right: win-rate + throughput */}
        <div className="flex items-center gap-3">
          {winRate !== null && (
            <span className={`font-bold tabular-nums ${healthColor}`}>
              {winRate}% win-rate
            </span>
          )}
          {throughput && (
            <span className="text-slate-700 tabular-nums">{throughput}</span>
          )}
        </div>
      </div>

      {/* ── Stacked mission bar ── */}
      <div className="relative">
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-900/80 gap-px">
          {SEGMENTS.map(({ status, bg }) => {
            const count = counts[status] ?? 0
            const pct   = (count / total) * 100
            if (pct === 0) return null
            const label = SEGMENTS.find(s => s.status === status)?.label ?? status
            return (
              <div
                key={status}
                className={`h-full ${bg} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
                style={{ width: `${pct}%` }}
                title={`${label}: ${count} (${Math.round(pct)}%)`}
              />
            )
          })}
        </div>

        {/* Completion % overlay text on the bar */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          {donePct >= 15 && (
            <span className="text-[8px] font-black font-mono text-black/60 tracking-widest select-none">
              {donePct}% DONE
            </span>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
        {SEGMENTS.map(({ status, bg, label, textColor }) => {
          const count = counts[status] ?? 0
          if (count === 0) return null
          const pct = Math.round((count / total) * 100)
          return (
            <span key={status} className={`flex items-center gap-1 text-[9px] font-mono ${textColor}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${bg} flex-shrink-0`} />
              <span className="tabular-nums font-bold">{count}</span>
              <span className="text-slate-700">{label}</span>
              <span className="text-slate-800">({pct}%)</span>
            </span>
          )
        })}
      </div>

      {/* ── Category failure breakdown (only when ≥ 3 failed) ── */}
      <FailureTriage todos={todos} />
    </div>
  )
}
