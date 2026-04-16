import type { Todo, TodoStatus, TaskCategory } from '@/types/todos'

const STATUS_ORDER: TodoStatus[] = ['proposed', 'in_progress', 'pending', 'blocked', 'completed', 'failed']

const STAT_STYLES: Record<TodoStatus, { border: string; text: string; label: string; glow: string }> = {
  proposed:    { border: 'border-amber-500/40',  text: 'text-amber-300',  label: 'PROPOSED',  glow: 'shadow-[0_0_12px_rgba(255,191,0,0.15)]' },
  in_progress: { border: 'border-cyan-500/40',   text: 'text-cyan-300',   label: 'ACTIVE',    glow: 'shadow-[0_0_12px_rgba(0,212,255,0.15)]' },
  pending:     { border: 'border-slate-600/40',  text: 'text-slate-400',  label: 'QUEUED',    glow: '' },
  blocked:     { border: 'border-orange-500/40', text: 'text-orange-300', label: 'BLOCKED',   glow: 'shadow-[0_0_12px_rgba(255,107,0,0.15)]' },
  completed:   { border: 'border-green-500/40',  text: 'text-green-300',  label: 'DONE',      glow: 'shadow-[0_0_12px_rgba(0,255,136,0.15)]' },
  failed:      { border: 'border-red-500/40',    text: 'text-red-400',    label: 'FAILED',    glow: 'shadow-[0_0_12px_rgba(255,51,102,0.15)]' },
  vetoed:      { border: 'border-slate-700/40',  text: 'text-slate-600',  label: 'VETOED',    glow: '' },
}

// ── Category failure breakdown ────────────────────────────────────────────────
// Shown whenever there are ≥ 3 failed tasks. Breaks the failure mass down by
// task_category so the operator can immediately see which work stream is on
// fire — e.g. "db: 31 failed" is far more actionable than "48 failed total".

const CAT_META: Record<TaskCategory, { label: string; icon: string; bar: string; text: string }> = {
  db:       { label: 'DB',       icon: '🗄', bar: 'bg-blue-500',   text: 'text-blue-400'   },
  ui:       { label: 'UI',       icon: '🖥', bar: 'bg-purple-500', text: 'text-purple-400' },
  infra:    { label: 'INFRA',    icon: '⚙', bar: 'bg-orange-500', text: 'text-orange-400' },
  analysis: { label: 'ANALYSIS', icon: '📊', bar: 'bg-teal-500',   text: 'text-teal-400'   },
  other:    { label: 'OTHER',    icon: '◈',  bar: 'bg-slate-500',  text: 'text-slate-400'  },
}

function FailureCategoryBreakdown({ todos }: { todos: Todo[] }) {
  const failed = todos.filter(t => t.status === 'failed')
  if (failed.length < 3) return null

  // Build per-category failure + success counts
  const catFailed  = new Map<TaskCategory, number>()
  const catTotal   = new Map<TaskCategory, number>()

  for (const t of todos) {
    const cat = t.task_category ?? 'other'
    catTotal.set(cat, (catTotal.get(cat) ?? 0) + 1)
    if (t.status === 'failed') catFailed.set(cat, (catFailed.get(cat) ?? 0) + 1)
  }

  // Only show categories that actually have failures, sorted worst-first
  const cats = (Object.keys(CAT_META) as TaskCategory[])
    .filter(c => (catFailed.get(c) ?? 0) > 0)
    .sort((a, b) => (catFailed.get(b) ?? 0) - (catFailed.get(a) ?? 0))

  if (cats.length === 0) return null

  const maxFailed = catFailed.get(cats[0]) ?? 1

  return (
    <div className="space-y-1.5">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono tracking-[0.2em] text-slate-700 uppercase">
          FAILURE TRIAGE
        </span>
        <div className="flex-1 h-px bg-red-900/20" />
        <span className="text-[9px] font-mono text-red-800">{failed.length} total failed</span>
      </div>

      {/* Per-category rows */}
      <div className="space-y-1">
        {cats.map(cat => {
          const f     = catFailed.get(cat) ?? 0
          const tot   = catTotal.get(cat) ?? 0
          const pct   = Math.round((f / tot) * 100)
          const barW  = Math.round((f / maxFailed) * 100)
          const meta  = CAT_META[cat]

          // Severity: >80% fail rate = critical styling
          const isCatCritical = pct >= 80
          const barCls = isCatCritical ? 'bg-red-500' : meta.bar

          return (
            <div key={cat} className="flex items-center gap-2 group">
              {/* Category label */}
              <span className={`text-[9px] font-mono w-16 flex-shrink-0 flex items-center gap-1 ${
                isCatCritical ? 'text-red-400' : meta.text
              }`}>
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </span>

              {/* Mini bar */}
              <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barCls} ${
                    isCatCritical ? 'shadow-[0_0_4px_rgba(255,51,102,0.5)]' : ''
                  }`}
                  style={{ width: `${barW}%` }}
                />
              </div>

              {/* Count + rate */}
              <span className={`text-[9px] font-mono tabular-nums flex-shrink-0 w-20 text-right ${
                isCatCritical ? 'text-red-400' : 'text-slate-600'
              }`}>
                <span className={isCatCritical ? 'text-red-300 font-bold' : 'text-slate-400'}>{f}</span>
                <span className="text-slate-700">/{tot}</span>
                <span className={`ml-1 ${isCatCritical ? 'text-red-500' : 'text-slate-700'}`}>
                  ({pct}%)
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── System Health Bar ─────────────────────────────────────────────────────────
// A stacked horizontal bar showing the full task funnel.
function SystemHealthBar({ counts, total }: {
  counts: Partial<Record<TodoStatus, number>>
  total: number
}) {
  if (total === 0) return null

  const segments: { status: TodoStatus; bg: string; glow: string }[] = [
    { status: 'in_progress', bg: 'bg-cyan-500',    glow: '' },
    { status: 'pending',     bg: 'bg-slate-600',   glow: '' },
    { status: 'blocked',     bg: 'bg-orange-500',  glow: '' },
    { status: 'completed',   bg: 'bg-emerald-500', glow: '' },
    { status: 'failed',      bg: 'bg-red-600',     glow: 'shadow-[0_0_6px_rgba(255,51,102,0.5)]' },
  ]

  const closed    = (counts['completed'] ?? 0) + (counts['failed'] ?? 0)
  const winRate   = closed > 0 ? Math.round(((counts['completed'] ?? 0) / closed) * 100) : null
  const failRate  = closed > 0 ? Math.round(((counts['failed']    ?? 0) / closed) * 100) : null

  const healthColor =
    winRate === null ? 'text-slate-500' :
    winRate >= 70   ? 'text-emerald-400' :
    winRate >= 40   ? 'text-yellow-400'  :
                      'text-red-400'

  return (
    <div className="w-full space-y-1.5">
      {/* Stacked funnel bar */}
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-900 gap-px">
        {segments.map(({ status, bg, glow }) => {
          const count = counts[status] ?? 0
          const pct   = (count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={status}
              className={`h-full ${bg} ${glow} transition-all duration-700 first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${pct}%` }}
              title={`${STAT_STYLES[status].label}: ${count} (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-3 flex-wrap">
        {segments.map(({ status, bg }) => {
          const count = counts[status] ?? 0
          if (count === 0) return null
          const pct   = Math.round((count / total) * 100)
          const label = STAT_STYLES[status].label
          const textColor =
            status === 'in_progress' ? 'text-cyan-400'   :
            status === 'pending'     ? 'text-slate-500'   :
            status === 'blocked'     ? 'text-orange-400'  :
            status === 'completed'   ? 'text-emerald-400' :
                                       'text-red-400'
          return (
            <span key={status} className={`flex items-center gap-1 text-[10px] font-mono ${textColor}`}>
              <span className={`inline-block w-2 h-2 rounded-sm ${bg} opacity-80`} />
              {label} <span className="opacity-70">{pct}%</span>
            </span>
          )
        })}

        <span className="flex-1" />

        {closed > 0 && (
          <span className={`text-[10px] font-mono ${healthColor} flex items-center gap-1.5`}
                title={`${closed} closed: ${counts['completed'] ?? 0} succeeded, ${counts['failed'] ?? 0} failed`}>
            <span className="opacity-50">HEALTH</span>
            <span className="font-bold">{winRate}% WIN</span>
            <span className="opacity-40">·</span>
            <span className="text-red-500 font-bold">{failRate}% FAIL</span>
            <span className="opacity-40">({closed} closed)</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default function StatsBar({ todos }: { todos: Todo[] }) {
  const counts = todos.reduce<Partial<Record<TodoStatus, number>>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const total     = todos.length
  const completed = counts['completed'] ?? 0
  const failed    = counts['failed'] ?? 0
  const active    = counts['in_progress'] ?? 0
  const closed    = completed + failed
  const winRate   = closed > 0 ? Math.round((completed / closed) * 100) : null
  const failRate  = closed > 0 ? Math.round((failed    / closed) * 100) : null

  // Critical alarm: fail rate ≥ 60 % on a meaningful sample
  const isCritical = closed >= 5 && failRate !== null && failRate >= 60

  return (
    <div className="space-y-3 w-full">

      {/* ── Critical failure alarm banner ── */}
      {isCritical && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded border border-red-500/60 bg-red-950/30 font-mono"
          style={{ boxShadow: '0 0 24px rgba(255,51,102,0.18)' }}
        >
          <span className="text-red-400 text-sm animate-pulse select-none">⚠</span>
          <span className="text-xs text-red-300 tracking-widest font-bold uppercase">System Distress</span>
          <span className="text-xs text-red-500 tracking-wide">—</span>
          <span className="text-xs text-red-400 tracking-wide">
            <span className="font-bold text-red-300">{failRate}%</span> failure rate
            &nbsp;·&nbsp;
            <span className="font-bold text-red-300">{failed}</span> failed
            &nbsp;/&nbsp;
            <span className="text-red-500">{closed}</span> closed tasks
          </span>

          {active > 0 && (
            <>
              <span className="text-red-800 mx-1">|</span>
              <span className="text-xs text-cyan-600 tracking-wide">
                <span className="text-cyan-400 font-bold">{active}</span> still active
              </span>
            </>
          )}

          <div className="flex-1 ml-2 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${failRate}%`,
                background: 'linear-gradient(90deg, rgba(239,68,68,0.8), rgba(220,38,38,1))',
              }}
            />
          </div>
        </div>
      )}

      {/* ── System health funnel bar ── */}
      <SystemHealthBar counts={counts} total={total} />

      {/* ── Failure triage by category ── */}
      {failed >= 3 && (
        <div className="pt-1 border-t border-slate-800/50">
          <FailureCategoryBreakdown todos={todos} />
        </div>
      )}

    </div>
  )
}
