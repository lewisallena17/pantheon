import type { Todo, TodoStatus } from '@/types/todos'

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

// Failed pill gets extra intensity when the count is high
function failedPillStyle(count: number): { border: string; text: string; glow: string } {
  if (count >= 40) return {
    border: 'border-red-500/80',
    text:   'text-red-300',
    glow:   'shadow-[0_0_20px_rgba(255,51,102,0.45)]',
  }
  if (count >= 20) return {
    border: 'border-red-500/60',
    text:   'text-red-400',
    glow:   'shadow-[0_0_14px_rgba(255,51,102,0.30)]',
  }
  return STAT_STYLES.failed
}

// ── System Health Bar ─────────────────────────────────────────────────────────
// A stacked horizontal bar showing the full task funnel:
//   [ACTIVE ░░░] [QUEUED ░░] [BLOCKED ░] [DONE ░░] [FAILED ████████]
// Percentages are shown inline so the operator can see at a glance what share
// of the pipeline each state occupies without reading individual pill numbers.
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

      {/* Legend row — compact, single line */}
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

        {/* Spacer pushes health score right */}
        <span className="flex-1" />

        {/* Win / fail rate summary — replaces the separate ml-auto pill */}
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
    <div className="space-y-2 w-full">

      {/* ── Critical failure alarm banner ── */}
      {isCritical && (
        <div
          className="flex items-center gap-3 px-3 py-2 rounded border border-red-500/60 bg-red-950/30 font-mono"
          style={{ boxShadow: '0 0 24px rgba(255,51,102,0.18)' }}
        >
          {/* Pulsing icon */}
          <span className="text-red-400 text-sm animate-pulse select-none">⚠</span>

          {/* Main message */}
          <span className="text-xs text-red-300 tracking-widest font-bold uppercase">
            System Distress
          </span>
          <span className="text-xs text-red-500 tracking-wide">—</span>
          <span className="text-xs text-red-400 tracking-wide">
            <span className="font-bold text-red-300">{failRate}%</span> failure rate
            &nbsp;·&nbsp;
            <span className="font-bold text-red-300">{failed}</span> failed
            &nbsp;/&nbsp;
            <span className="text-red-500">{closed}</span> closed tasks
          </span>

          {/* Active-task counter */}
          {active > 0 && (
            <>
              <span className="text-red-800 mx-1">|</span>
              <span className="text-xs text-cyan-600 tracking-wide">
                <span className="text-cyan-400 font-bold">{active}</span> still active
              </span>
            </>
          )}

          {/* Right-side animated bar representing fail rate */}
          <div className="flex-1 ml-2 h-1.5 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${failRate}%`,
                background: 'linear-gradient(90deg, #ff3366, #ff0022)',
                boxShadow: '0 0 8px #ff336688',
              }}
            />
          </div>
        </div>
      )}

      {/* ── System health funnel bar ── */}
      <SystemHealthBar counts={counts} total={total} />

      {/* ── Pill row ── */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Per-status pills */}
        {STATUS_ORDER.map(status => {
          const count = counts[status] ?? 0

          const style =
            status === 'failed'
              ? failedPillStyle(count)
              : STAT_STYLES[status]

          const { border, text, glow } = style
          const label = STAT_STYLES[status].label

          return (
            <div
              key={status}
              className={`flex items-center gap-2 px-3 py-2 rounded border bg-black/60 font-mono ${border} ${glow}`}
            >
              <span
                className={`text-xl font-bold leading-none ${text}`}
                style={{ fontFamily: 'Orbitron, monospace' }}
              >
                {String(count).padStart(2, '0')}
              </span>
              <span className={`text-xs tracking-widest ${text} opacity-70`}>{label}</span>
            </div>
          )
        })}

        {/* Total */}
        <div className="flex items-center gap-2 px-3 py-2 rounded border border-cyan-500/20 bg-black/60 font-mono">
          <span
            className="text-xl font-bold leading-none text-cyan-500"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            {String(total).padStart(2, '0')}
          </span>
          <span className="text-xs tracking-widest text-cyan-600">TOTAL</span>
        </div>
      </div>
    </div>
  )
}
