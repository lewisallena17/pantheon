import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

function computeStreak(todos: Todo[]): number {
  const sorted = [...todos]
    .filter(t => t.status === 'completed' || t.status === 'failed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  let streak = 0
  for (const t of sorted) {
    if (t.status === 'completed') streak++
    else break
  }
  return streak
}

const RANK_THRESHOLDS = [
  { min: 20, label: 'LEGENDARY', color: 'text-yellow-300', glow: 'rgba(255,215,0,0.4)' },
  { min: 10, label: 'ELITE',     color: 'text-purple-300', glow: 'rgba(168,85,247,0.3)' },
  { min:  5, label: 'VETERAN',   color: 'text-cyan-300',   glow: 'rgba(0,212,255,0.3)'  },
  { min:  3, label: 'RISING',    color: 'text-green-300',  glow: 'rgba(0,255,136,0.2)'  },
  { min:  1, label: 'ACTIVE',    color: 'text-slate-300',  glow: ''                      },
  { min:  0, label: 'IDLE',      color: 'text-slate-600',  glow: ''                      },
]

export default function StreakCounter({ todos }: Props) {
  const streak = computeStreak(todos)
  const rank = RANK_THRESHOLDS.find(r => streak >= r.min) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1]

  return (
    <div
      className="rounded border border-cyan-900/40 bg-black/40 px-4 py-3 flex items-center gap-4"
      style={{ boxShadow: rank.glow ? `0 0 20px ${rank.glow}` : undefined }}
    >
      <div className="text-center">
        <div
          className={`text-3xl font-bold font-mono leading-none ${rank.color}`}
          style={{ fontFamily: 'Orbitron, monospace', textShadow: rank.glow ? `0 0 12px ${rank.glow}` : undefined }}
        >
          {String(streak).padStart(2, '0')}
        </div>
        <div className="text-xs font-mono text-slate-600 tracking-widest mt-0.5">STREAK</div>
      </div>
      <div className="h-8 w-px bg-cyan-900/40" />
      <div>
        <div className={`text-xs font-mono tracking-widest font-bold ${rank.color}`}>{rank.label}</div>
        <div className="text-xs font-mono text-slate-600 mt-0.5">
          {streak === 0
            ? 'No consecutive wins'
            : `${streak} task${streak !== 1 ? 's' : ''} in a row`}
        </div>
      </div>
      {streak >= 3 && (
        <div className="ml-auto text-xl">{streak >= 20 ? '★' : streak >= 10 ? '✦' : streak >= 5 ? '◈' : '▶'}</div>
      )}
    </div>
  )
}
