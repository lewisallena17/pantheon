'use client'

/**
 * CriticalAlertBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Sticky top-of-viewport ribbon that fires whenever the system fail rate
 * crosses 60 % on a meaningful sample (≥ 5 closed tasks).
 *
 * Lives at the very top of DashboardShell so the operator always sees it
 * regardless of scroll position — the existing StatsBar alarm is only visible
 * if you haven't scrolled down at all.
 *
 * Renders null when the system is healthy, so there is zero layout cost.
 */

import type { Todo } from '@/types/todos'

interface Props {
  todos: Todo[]
}

export default function CriticalAlertBanner({ todos }: Props) {
  const completed = todos.filter(t => t.status === 'completed').length
  const failed    = todos.filter(t => t.status === 'failed').length
  const active    = todos.filter(t => t.status === 'in_progress').length
  const closed    = completed + failed

  if (closed < 5) return null

  const failRate = Math.round((failed / closed) * 100)
  const winRate  = 100 - failRate

  if (failRate < 60) return null

  // Severity tier drives colour intensity
  const isCatastrophic = failRate >= 80

  return (
    <div
      className={`
        sticky top-0 z-50 w-full font-mono
        border-b
        ${isCatastrophic
          ? 'bg-red-950/95 border-red-500/70'
          : 'bg-red-950/80 border-red-700/50'
        }
      `}
      style={{
        boxShadow: isCatastrophic
          ? '0 0 32px rgba(255,51,102,0.35), 0 2px 8px rgba(0,0,0,0.6)'
          : '0 0 16px rgba(255,51,102,0.18), 0 2px 6px rgba(0,0,0,0.5)',
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">

        {/* Pulsing alarm icon */}
        <span
          className={`text-base select-none flex-shrink-0 ${isCatastrophic ? 'animate-pulse' : ''}`}
          aria-hidden
        >
          {isCatastrophic ? '🚨' : '⚠️'}
        </span>

        {/* Label */}
        <span className={`text-xs font-black tracking-[0.2em] uppercase flex-shrink-0 ${
          isCatastrophic ? 'text-red-200' : 'text-red-300'
        }`}>
          {isCatastrophic ? 'CRITICAL SYSTEM FAILURE' : 'SYSTEM DISTRESS'}
        </span>

        {/* Divider */}
        <span className="text-red-800 flex-shrink-0">│</span>

        {/* Fail rate + counts */}
        <span className="text-xs text-red-400 flex-shrink-0">
          <span className={`font-black tabular-nums ${isCatastrophic ? 'text-red-200' : 'text-red-300'}`}>
            {failRate}%
          </span>
          {' '}fail rate
          <span className="text-red-700 mx-1.5">·</span>
          <span className="text-red-300 font-bold tabular-nums">{failed}</span>
          <span className="text-red-700"> failed / </span>
          <span className="tabular-nums text-red-500">{closed}</span>
          <span className="text-red-700"> closed</span>
        </span>

        {/* Win rate */}
        <span className="text-xs text-red-700 flex-shrink-0">
          (<span className="text-emerald-600 tabular-nums">{winRate}%</span> success)
        </span>

        {/* Active counter — only shown when agents are still running */}
        {active > 0 && (
          <>
            <span className="text-red-800 flex-shrink-0">│</span>
            <span className="text-xs flex-shrink-0 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
              <span className="text-cyan-400 font-bold tabular-nums">{active}</span>
              <span className="text-cyan-700"> agent{active !== 1 ? 's' : ''} still running</span>
            </span>
          </>
        )}

        {/* Right: compact animated fail-rate bar */}
        <div className="flex-1 hidden sm:flex items-center justify-end min-w-0">
          <div className="w-32 h-1.5 rounded-full bg-slate-800/60 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCatastrophic ? 'bg-red-400' : 'bg-red-600'
              }`}
              style={{ width: `${failRate}%` }}
            />
          </div>
          <span className="ml-2 text-[10px] text-red-700 tabular-nums">{failRate}%</span>
        </div>

      </div>
    </div>
  )
}
