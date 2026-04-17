'use client'

/**
 * CriticalAlertBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Sticky top-of-viewport ribbon that fires whenever the system fail rate
 * crosses 60 % on a meaningful sample (≥ 5 closed tasks).
 *
 * Now includes a one-click "Retry All Failed" button that re-queues every
 * failed task back to `pending` directly from the banner — no need to scroll
 * down to the StickyHeader retry button.
 */

import { useCallback, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props {
  todos: Todo[]
}

type RetryState = 'idle' | 'running' | 'done' | 'error'

export default function CriticalAlertBanner({ todos }: Props) {
  const completed = todos.filter(t => t.status === 'completed').length
  const failed    = todos.filter(t => t.status === 'failed').length
  const active    = todos.filter(t => t.status === 'in_progress').length
  const closed    = completed + failed

  const [retryState, setRetryState] = useState<RetryState>('idle')
  const [retryMsg,   setRetryMsg]   = useState('')

  const failedTodos = todos.filter(t => t.status === 'failed')

  const retryAll = useCallback(async () => {
    if (retryState === 'running' || failedTodos.length === 0) return
    setRetryState('running')
    setRetryMsg('')
    try {
      const results = await Promise.allSettled(
        failedTodos.map(t =>
          fetch('/api/todos', {
            method:  'PATCH',
            headers: { 'content-type': 'application/json' },
            body:    JSON.stringify({ id: t.id, status: 'pending' }),
          })
        )
      )
      const ok  = results.filter(r => r.status === 'fulfilled').length
      const err = results.length - ok
      if (err === 0) {
        setRetryMsg(`✓ ${ok} task${ok !== 1 ? 's' : ''} re-queued`)
        setRetryState('done')
      } else {
        setRetryMsg(`⚠ ${ok} ok · ${err} failed`)
        setRetryState('error')
      }
    } catch {
      setRetryMsg('✗ retry failed')
      setRetryState('error')
    } finally {
      setTimeout(() => { setRetryState('idle'); setRetryMsg('') }, 5000)
    }
  }, [failedTodos, retryState])

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

        {/* ── ONE-CLICK RETRY — the most important new affordance ── */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <button
            onClick={retryAll}
            disabled={retryState === 'running' || failed === 0}
            title={`Re-queue all ${failed} failed task${failed !== 1 ? 's' : ''} as pending`}
            className={`
              text-[11px] font-mono font-bold px-3 py-1 rounded border transition-all duration-200
              ${retryState === 'running'
                ? 'border-red-800/40 text-red-700 cursor-wait bg-transparent'
                : retryState === 'done'
                  ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300 cursor-default'
                  : retryState === 'error'
                    ? 'border-orange-700/60 bg-orange-950/30 text-orange-300 cursor-default'
                    : isCatastrophic
                      ? 'border-red-400/60 bg-red-900/50 text-red-100 hover:bg-red-800/60 hover:border-red-300/70 active:scale-95'
                      : 'border-red-600/60 bg-red-900/40 text-red-200 hover:bg-red-800/50 hover:border-red-500/70 active:scale-95'
              }
            `}
          >
            {retryState === 'running' ? '⟳ retrying…'
             : retryState === 'done'  ? retryMsg
             : retryState === 'error' ? retryMsg
             : `⟳ retry all ${failed} failed`}
          </button>
        </div>

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
