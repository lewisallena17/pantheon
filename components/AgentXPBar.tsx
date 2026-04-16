import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

const XP_PER_COMPLETE = 100
const XP_PER_FAIL     = 10
const XP_PER_LEVEL    = 500

const LEVEL_TITLES = ['RECRUIT','OPERATIVE','SPECIALIST','VETERAN','ELITE','LEGEND','MYTHIC']

interface AgentStats {
  name: string
  xp: number
  level: number
  title: string
  progress: number
  completed: number
  failed: number
  active: number    // ← NEW: currently in_progress tasks
  pending: number   // ← NEW: queued tasks
  winRate: number | null  // ← NEW: completed / (completed+failed) %
}

function computeAgentStats(todos: Todo[]): AgentStats[] {
  const map = new Map<string, { completed: number; failed: number; active: number; pending: number }>()

  for (const t of todos) {
    const agent = t.assigned_agent
    if (!agent) continue
    if (!map.has(agent)) map.set(agent, { completed: 0, failed: 0, active: 0, pending: 0 })
    const s = map.get(agent)!
    if (t.status === 'completed')  s.completed++
    if (t.status === 'failed')     s.failed++
    if (t.status === 'in_progress') s.active++
    if (t.status === 'pending')    s.pending++
  }

  return [...map.entries()]
    .map(([name, s]) => {
      const xp       = s.completed * XP_PER_COMPLETE + s.failed * XP_PER_FAIL
      const level    = Math.min(LEVEL_TITLES.length - 1, Math.floor(xp / XP_PER_LEVEL))
      const progress = (xp % XP_PER_LEVEL) / XP_PER_LEVEL
      const closed   = s.completed + s.failed
      const winRate  = closed > 0 ? Math.round((s.completed / closed) * 100) : null
      return {
        name, xp, level, title: LEVEL_TITLES[level], progress,
        completed: s.completed, failed: s.failed,
        active: s.active, pending: s.pending, winRate,
      }
    })
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 8)
}

/** Colour helpers */
function levelColor(level: number) {
  if (level >= 5) return 'text-yellow-300'
  if (level >= 3) return 'text-purple-300'
  if (level >= 1) return 'text-cyan-300'
  return 'text-slate-400'
}
function levelBar(level: number) {
  if (level >= 5) return '#ffd700'
  if (level >= 3) return '#a855f7'
  return '#00d4ff'
}
function winRateColor(rate: number | null) {
  if (rate === null) return 'text-slate-600'
  if (rate >= 70)   return 'text-green-400'
  if (rate >= 40)   return 'text-yellow-400'
  return 'text-red-400'
}

export default function AgentXPBar({ todos }: Props) {
  const agents = computeAgentStats(todos)
  if (agents.length === 0) return null

  const maxActive = Math.max(1, ...agents.map(a => a.active))

  return (
    <div className="rounded border border-cyan-900/40 bg-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/40 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-700 uppercase">◈ Agent XP Leaderboard</span>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-700">
          {/* Column legend */}
          <span className="text-cyan-800">LOAD</span>
          <span className="text-green-900">WIN%</span>
          <span className="text-green-800">✓</span>
          <span className="text-red-900">✕</span>
          <span className="border-l border-slate-800 pl-3">{agents.length} agents</span>
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {agents.map((a, i) => {
          const isTop   = i === 0
          const lColor  = levelColor(a.level)
          const barClr  = levelBar(a.level)
          const wrColor = winRateColor(a.winRate)

          // Active-load bar width (relative to busiest agent)
          const loadPct = maxActive > 0 ? (a.active / maxActive) * 100 : 0

          return (
            <div key={a.name} className={`flex items-center gap-3 ${isTop ? 'opacity-100' : 'opacity-80'}`}>
              {/* Rank */}
              <span className={`text-xs font-mono w-4 text-center flex-shrink-0 ${isTop ? 'text-yellow-400' : 'text-slate-600'}`}>
                {i === 0 ? '★' : i + 1}
              </span>

              {/* Level badge */}
              <div className={`text-xs font-mono font-bold w-5 text-center flex-shrink-0 ${lColor}`} title={a.title}>
                {a.level}
              </div>

              {/* Name + XP bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-mono text-slate-300 truncate">{a.name}</span>
                  <span className={`text-xs font-mono ${lColor} ml-2 flex-shrink-0`}>{a.xp} XP</span>
                </div>
                {/* XP progress bar */}
                <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${a.progress * 100}%`,
                      background: barClr,
                      boxShadow: `0 0 6px ${barClr}88`,
                    }}
                  />
                </div>
              </div>

              {/* ── Active load indicator ── */}
              <div
                className="flex flex-col items-center gap-0.5 flex-shrink-0 w-10"
                title={`${a.active} active · ${a.pending} queued`}
              >
                {/* Mini load bar */}
                <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${loadPct}%`,
                      background: a.active > 0 ? '#00d4ff' : 'transparent',
                      boxShadow: a.active > 0 ? '0 0 4px #00d4ff88' : 'none',
                    }}
                  />
                </div>
                <span className="text-[9px] font-mono text-slate-600 tracking-wide">
                  {a.active > 0
                    ? <span className="text-cyan-600">{a.active}▶{a.pending > 0 ? ` +${a.pending}` : ''}</span>
                    : a.pending > 0
                    ? <span className="text-slate-600">{a.pending}◌</span>
                    : <span className="text-slate-800">idle</span>
                  }
                </span>
              </div>

              {/* ── Win rate ── */}
              <div
                className={`text-xs font-mono w-9 text-right flex-shrink-0 ${wrColor}`}
                title={a.winRate !== null ? `${a.winRate}% win rate (${a.completed}✓ / ${a.failed}✕)` : 'No closed tasks yet'}
              >
                {a.winRate !== null ? `${a.winRate}%` : '—'}
              </div>

              {/* Completed / failed counts */}
              <div className="flex gap-2 text-xs font-mono flex-shrink-0">
                <span className="text-green-700 w-5 text-right">{a.completed}✓</span>
                <span className="text-red-900  w-5 text-right">{a.failed}✕</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
