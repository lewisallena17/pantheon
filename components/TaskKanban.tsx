'use client'

import { useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

type ColumnKey = 'proposed' | 'pending' | 'in_progress' | 'blocked' | 'completed' | 'failed'

const COLUMNS: {
  key: ColumnKey
  label: string
  color: string
  bg: string
  /** Terminal columns default-collapsed to save space for actionable lanes */
  terminal?: boolean
}[] = [
  { key: 'proposed',    label: 'INBOX',   color: 'text-slate-400',   bg: 'border-slate-700/40 bg-slate-900/20'       },
  { key: 'pending',     label: 'QUEUED',  color: 'text-sky-300',     bg: 'border-sky-800/40   bg-sky-950/20'         },
  { key: 'in_progress', label: 'RUNNING', color: 'text-cyan-300',    bg: 'border-cyan-800/50  bg-cyan-950/20'        },
  { key: 'blocked',     label: 'BLOCKED', color: 'text-amber-300',   bg: 'border-amber-800/50 bg-amber-950/20'       },
  { key: 'completed',   label: 'DONE',    color: 'text-emerald-300', bg: 'border-emerald-800/50 bg-emerald-950/20',  terminal: true },
  { key: 'failed',      label: 'FAILED',  color: 'text-red-300',     bg: 'border-red-800/50   bg-red-950/20',        terminal: true },
]

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const PRIORITY_STYLE: Record<string, string> = {
  critical: 'border-red-600/60    text-red-300',
  high:     'border-orange-600/50 text-orange-300',
  medium:   'border-slate-600/50  text-slate-300',
  low:      'border-slate-700/40  text-slate-500',
}

function relTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s`
  if (s < 3600)  return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}

function TaskCard({ t }: { t: Todo }) {
  const prioStyle = PRIORITY_STYLE[t.priority ?? 'medium'] ?? PRIORITY_STYLE.medium
  return (
    <div className="group rounded border border-slate-800/60 bg-black/40 hover:bg-black/60 hover:border-slate-700/80 transition-colors px-2 py-1.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-[8px] font-mono tracking-wider uppercase border rounded px-1 py-px ${prioStyle}`}>
          {t.priority ?? 'med'}
        </span>
        {t.task_category && t.task_category !== 'other' && (
          <span className="text-[8px] font-mono text-slate-600 tracking-wider uppercase">
            {t.task_category}
          </span>
        )}
        <span className="ml-auto text-[8px] font-mono text-slate-600">
          {relTime(t.updated_at ?? t.created_at)}
        </span>
      </div>
      <div className="text-[11px] text-slate-300 leading-snug line-clamp-3">
        {t.title}
      </div>
      {t.assigned_agent && (
        <div className="text-[9px] font-mono text-purple-500/70 mt-1 truncate">
          {t.assigned_agent}
        </div>
      )}
    </div>
  )
}

// ── Per-column card list with expandable overflow ─────────────────────────────
function ColumnCards({
  items,
  compact,
  colColor,
}: {
  items: Todo[]
  compact: boolean
  colColor: string
}) {
  const [expanded, setExpanded] = useState(false)

  const baseCap  = compact ? 3 : 12
  const showAll  = expanded || items.length <= baseCap
  const visible  = showAll ? items : items.slice(0, baseCap)
  const overflow = items.length - baseCap

  return (
    <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto max-h-[520px]">
      {visible.map(t => <TaskCard key={t.id} t={t} />)}

      {items.length === 0 && (
        <div className="text-[9px] font-mono text-slate-800 text-center py-4">—</div>
      )}

      {overflow > 0 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className={`
            w-full text-[9px] font-mono py-1.5 rounded border transition-colors
            ${expanded
              ? `border-slate-800/60 text-slate-600 hover:text-slate-400 hover:border-slate-700/60`
              : `border-slate-800/60 ${colColor} hover:bg-black/30 hover:border-slate-700/60`
            }
          `}
          title={expanded ? 'Collapse column' : `Show ${overflow} more tasks`}
        >
          {expanded ? '▲ collapse' : `▼ +${overflow} more`}
        </button>
      )}
    </div>
  )
}

// ── Collapsed terminal-column pill ───────────────────────────────────────────
/**
 * When a terminal column (DONE / FAILED) is collapsed, it renders as a slim
 * vertical pill instead of a full column, keeping the actionable lanes wide.
 */
function CollapsedPill({
  col,
  count,
  onExpand,
}: {
  col: typeof COLUMNS[number]
  count: number
  onExpand: () => void
}) {
  return (
    <button
      onClick={onExpand}
      title={`Expand ${col.label} (${count} tasks)`}
      className={`
        flex flex-col items-center justify-center gap-2
        rounded border min-h-32 px-2 py-3 w-full
        transition-all duration-200 hover:opacity-80 active:scale-95
        ${col.bg}
      `}
    >
      {/* Rotated label */}
      <span
        className={`text-[9px] font-mono tracking-[0.2em] uppercase select-none ${col.color}`}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {col.label}
      </span>
      {/* Count badge */}
      <span className={`text-[10px] font-mono tabular-nums font-bold ${col.color}`}>
        {count}
      </span>
      {/* Expand hint */}
      <span className="text-[8px] font-mono text-slate-700">▶</span>
    </button>
  )
}

export default function TaskKanban({ todos }: Props) {
  const [compact, setCompact] = useState(false)

  // Track which terminal columns are expanded. Default: collapsed.
  const [terminalExpanded, setTerminalExpanded] = useState<Partial<Record<ColumnKey, boolean>>>({})

  const grouped = useMemo(() => {
    const byCol: Record<ColumnKey, Todo[]> = {
      proposed: [], pending: [], in_progress: [], blocked: [], completed: [], failed: [],
    } as Record<ColumnKey, Todo[]>

    for (const t of todos) {
      const col = (t.status ?? 'pending') as ColumnKey
      if (byCol[col]) byCol[col].push(t)
    }

    for (const col of Object.keys(byCol) as ColumnKey[]) {
      byCol[col].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority ?? 'medium'] ?? 2
        const pb = PRIORITY_ORDER[b.priority ?? 'medium'] ?? 2
        if (pa !== pb) return pa - pb
        return (b.updated_at ?? '').localeCompare(a.updated_at ?? '')
      })
    }
    return byCol
  }, [todos])

  // Count active (non-terminal) columns that have tasks — used for grid layout
  const activeColCount = COLUMNS.filter(c => !c.terminal || terminalExpanded[c.key]).length

  // Toggle a single terminal column
  function toggleTerminal(key: ColumnKey) {
    setTerminalExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // How many terminal columns are currently expanded
  const expandedTerminalCount = COLUMNS.filter(c => c.terminal && terminalExpanded[c.key]).length
  const collapsedTerminalCount = COLUMNS.filter(c => c.terminal && !terminalExpanded[c.key]).length

  return (
    <div className="rounded border border-slate-800/60 bg-black/30 overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◆ Task Board</span>
          <span className="text-[10px] font-mono text-slate-700">{todos.length} total</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Terminal-column toggle hint */}
          <span className="text-[9px] font-mono text-slate-700 hidden sm:block">
            {collapsedTerminalCount > 0
              ? `${collapsedTerminalCount} terminal column${collapsedTerminalCount > 1 ? 's' : ''} collapsed`
              : 'all columns visible'
            }
          </span>

          {/* Collapse / expand terminal columns */}
          {expandedTerminalCount > 0 && (
            <button
              onClick={() => setTerminalExpanded({})}
              className="text-[9px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
              title="Collapse DONE and FAILED columns"
            >
              ↕ hide terminal
            </button>
          )}
          {collapsedTerminalCount > 0 && (
            <button
              onClick={() =>
                setTerminalExpanded({ completed: true, failed: true })
              }
              className="text-[9px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
              title="Show DONE and FAILED columns"
            >
              ↕ show terminal
            </button>
          )}

          <div className="w-px h-3 bg-slate-800" />

          <button
            onClick={() => setCompact(v => !v)}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            title={compact ? 'Switch to expanded view' : 'Switch to compact view'}
          >
            {compact ? '↕ expand' : '↕ compact'}
          </button>
        </div>
      </div>

      {/* ── Column grid ────────────────────────────────────────────────── */}
      {/*
        Layout strategy:
        - Collapsed terminal columns → narrow fixed-width pills on the right
        - Active columns share the remaining width via a flex layout
        - On small screens, all columns stack normally
      */}
      <div className="p-2 flex gap-2">
        {/* Actionable + expanded columns — flex-grow to fill space */}
        <div
          className={`
            grid gap-2 flex-1 min-w-0
            ${activeColCount <= 2 ? 'grid-cols-2' :
              activeColCount <= 3 ? 'grid-cols-3' :
              activeColCount <= 4 ? 'grid-cols-2 md:grid-cols-4' :
                                    'grid-cols-2 md:grid-cols-3 lg:grid-cols-${activeColCount}'}
          `}
          style={{
            gridTemplateColumns: `repeat(${activeColCount}, minmax(0, 1fr))`,
          }}
        >
          {COLUMNS.filter(col => !col.terminal || terminalExpanded[col.key]).map(col => {
            const items = grouped[col.key] ?? []
            return (
              <div key={col.key} className={`rounded border ${col.bg} flex flex-col min-h-32`}>
                {/* Column header */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800/40">
                  <span className={`text-[10px] font-mono tracking-wider uppercase ${col.color}`}>
                    {col.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-600 tabular-nums">{items.length}</span>
                    {/* Collapse button for terminal columns */}
                    {col.terminal && (
                      <button
                        onClick={() => toggleTerminal(col.key)}
                        className="text-[9px] font-mono text-slate-700 hover:text-slate-500 transition-colors ml-1"
                        title={`Collapse ${col.label} column`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <ColumnCards items={items} compact={compact} colColor={col.color} />
              </div>
            )
          })}
        </div>

        {/* Collapsed terminal column pills — rendered right of the main grid */}
        {COLUMNS.filter(col => col.terminal && !terminalExpanded[col.key]).map(col => {
          const count = (grouped[col.key] ?? []).length
          return (
            <div key={col.key} className="w-10 flex-shrink-0">
              <CollapsedPill
                col={col}
                count={count}
                onExpand={() => toggleTerminal(col.key)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
