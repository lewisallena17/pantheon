'use client'

import { useRef, useState, useMemo } from 'react'

export interface LogEntry {
  id: string
  at: Date
  agent: string | null
  task: string
  event: 'created' | 'started' | 'completed' | 'failed' | 'blocked' | 'retried' | 'boss_slain'
}

interface Props { entries: LogEntry[] }

const EVENT_STYLE: Record<LogEntry['event'], {
  icon: string
  color: string        // text colour for icon + label
  label: string
  rowBg: string        // full-row tint
  tagBg: string        // label pill background
}> = {
  created:    { icon: '◈', color: 'text-slate-400',   label: 'NEW',   rowBg: '',                                               tagBg: 'bg-slate-800/70'                         },
  started:    { icon: '▶', color: 'text-cyan-400',    label: 'RUN',   rowBg: '',                                               tagBg: 'bg-cyan-950/60 border-cyan-800/50'       },
  completed:  { icon: '✓', color: 'text-emerald-400', label: 'DONE',  rowBg: 'bg-emerald-950/10',                              tagBg: 'bg-emerald-950/60 border-emerald-800/50' },
  failed:     { icon: '✕', color: 'text-red-400',     label: 'FAIL',  rowBg: 'bg-red-950/15',                                  tagBg: 'bg-red-950/70 border-red-800/50'         },
  blocked:    { icon: '⊘', color: 'text-orange-400',  label: 'HOLD',  rowBg: '',                                               tagBg: 'bg-orange-950/60 border-orange-800/50'   },
  retried:    { icon: '↺', color: 'text-yellow-400',  label: 'RETRY', rowBg: 'bg-yellow-950/10',                               tagBg: 'bg-yellow-950/60 border-yellow-800/50'   },
  boss_slain: { icon: '★', color: 'text-yellow-300',  label: 'BOSS',  rowBg: 'bg-yellow-950/30 border-b border-yellow-500/20', tagBg: 'bg-yellow-800/50 border-yellow-600/50'   },
}

type FilterKey = 'all' | LogEntry['event']

const FILTER_OPTIONS: { key: FilterKey; label: string; color: string }[] = [
  { key: 'all',       label: 'ALL',   color: 'text-slate-400'   },
  { key: 'failed',    label: 'FAIL',  color: 'text-red-400'     },
  { key: 'retried',   label: 'RETRY', color: 'text-yellow-400'  },
  { key: 'completed', label: 'DONE',  color: 'text-emerald-400' },
  { key: 'started',   label: 'RUN',   color: 'text-cyan-400'    },
  { key: 'created',   label: 'NEW',   color: 'text-slate-400'   },
  { key: 'blocked',   label: 'HOLD',  color: 'text-orange-400'  },
]

/** Format a Date as HH:MM:SS */
function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

/** Strip trailing hex agent suffix (-a1b2c3) */
function shortAgent(agent: string): string {
  return agent.replace(/-[a-f0-9]{6}$/i, '')
}

export default function BattleLog({ entries }: Props) {
  const [paused,       setPaused] = useState(false)
  const [activeFilter, setFilter] = useState<FilterKey>('all')
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── All hooks must run unconditionally before any early return ──────────
  const counts = useMemo(() => {
    const c: Partial<Record<FilterKey, number>> = { all: entries.length }
    for (const e of entries) c[e.event] = (c[e.event] ?? 0) + 1
    return c
  }, [entries])

  const displayed = useMemo(() => {
    const filtered = activeFilter === 'all'
      ? entries
      : entries.filter(e => e.event === activeFilter)
    return [...filtered].reverse()
  }, [entries, activeFilter])
  // ────────────────────────────────────────────────────────────────────────

  if (entries.length === 0) return null

  return (
    <div className="rounded border border-cyan-900/40 bg-black/40 overflow-hidden">

      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/40 bg-black/60 gap-3">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-700 uppercase select-none flex-shrink-0">
          ◈ Battle Log
        </span>

        {/* Filter chips */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          {FILTER_OPTIONS.map(opt => {
            const cnt = counts[opt.key] ?? 0
            if (opt.key !== 'all' && cnt === 0) return null
            const isActive = activeFilter === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`
                  flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded
                  text-[10px] font-mono border transition-colors duration-150
                  ${isActive
                    ? `${opt.color} border-current bg-black/60`
                    : 'text-slate-700 border-slate-800/50 hover:text-slate-500 hover:border-slate-700'
                  }
                `}
              >
                <span>{opt.label}</span>
                <span className={`tabular-nums ${isActive ? 'opacity-80' : 'opacity-40'}`}>{cnt}</span>
              </button>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-mono text-slate-700 hidden sm:block">↑ newest</span>
          <button
            onClick={() => setPaused(p => !p)}
            className={`text-[10px] font-mono tracking-wider transition-colors ${
              paused ? 'text-yellow-500 hover:text-yellow-300' : 'text-slate-700 hover:text-slate-500'
            }`}
            title={paused ? 'Resume live updates' : 'Pause scroll'}
          >
            {paused ? '▶ live' : '⏸ pause'}
          </button>
        </div>
      </div>

      {/* ── Event rows ───────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="overflow-y-auto font-mono text-xs"
        style={{ maxHeight: '13rem' }}
      >
        {displayed.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-slate-700 text-xs font-mono tracking-widest">
            NO EVENTS MATCHING FILTER
          </div>
        ) : (
          displayed.map((e, idx) => {
            const { icon, color, label, rowBg, tagBg } = EVENT_STYLE[e.event]
            const isNewest = !paused && idx === 0

            return (
              <div
                key={e.id}
                className={`
                  flex items-center gap-2 px-3 py-[3px] border-b border-slate-900/60
                  ${rowBg}
                  ${isNewest ? 'ring-1 ring-inset ring-cyan-900/30' : ''}
                  hover:bg-slate-900/20 transition-colors duration-100
                `}
              >
                {/* Event icon */}
                <span className={`${color} w-3 text-center flex-shrink-0 text-[11px]`} aria-hidden>
                  {icon}
                </span>

                {/* Timestamp */}
                <span className="text-slate-700 tabular-nums flex-shrink-0 w-[52px] text-[10px]">
                  {fmtTime(e.at)}
                </span>

                {/* Label chip — coloured pill with border */}
                <span
                  className={`
                    ${color} font-bold flex-shrink-0 w-[38px] text-center
                    text-[9px] tracking-wider rounded border px-1 py-px leading-none
                    ${tagBg}
                  `}
                >
                  {label}
                </span>

                {/* Agent */}
                {e.agent ? (
                  <span className="text-purple-400/60 flex-shrink-0 w-24 truncate text-[10px]" title={e.agent}>
                    {shortAgent(e.agent)}
                  </span>
                ) : (
                  <span className="flex-shrink-0 w-24" />
                )}

                {/* Task title */}
                <span
                  className={`truncate flex-1 min-w-0 ${
                    e.event === 'failed'     ? 'text-red-300/80'     :
                    e.event === 'completed'  ? 'text-emerald-300/70' :
                    e.event === 'boss_slain' ? 'text-yellow-200'     :
                    e.event === 'retried'    ? 'text-yellow-400/70'  :
                                              'text-slate-300'
                  }`}
                  title={e.task}
                >
                  {e.task}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer summary bar ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-t border-slate-900/60 bg-black/40">
        {(
          [
            ['failed',    'text-red-600',     counts.failed    ?? 0, 'FAIL' ],
            ['retried',   'text-yellow-700',  counts.retried   ?? 0, 'RETRY'],
            ['completed', 'text-emerald-700', counts.completed ?? 0, 'DONE' ],
            ['started',   'text-cyan-800',    counts.started   ?? 0, 'RUN'  ],
          ] as [FilterKey, string, number, string][]
        ).filter(([,, cnt]) => cnt > 0).map(([key, cls, cnt, lbl]) => (
          <span
            key={key}
            className={`text-[10px] font-mono ${cls} tabular-nums cursor-pointer hover:opacity-80`}
            onClick={() => setFilter(activeFilter === key ? 'all' : key)}
            title={`Filter to ${lbl} events`}
          >
            {cnt} {lbl}
          </span>
        ))}
        <span className="flex-1" />
        {activeFilter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="text-[10px] font-mono text-slate-700 hover:text-slate-400 transition-colors"
          >
            ✕ clear filter
          </button>
        )}
        <span className="text-[10px] font-mono text-slate-800 tabular-nums">
          {entries.length} events
        </span>
      </div>
    </div>
  )
}
