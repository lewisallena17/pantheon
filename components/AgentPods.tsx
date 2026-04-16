'use client'

import type { Todo, TodoStatus } from '@/types/todos'

interface Props { todos: Todo[] }

const STATUS_COLOR: Record<TodoStatus, { border: string; text: string; bg: string; glow: string; label: string }> = {
  proposed:    { border: 'border-amber-500/60',  text: 'text-amber-300',  bg: 'bg-amber-950/20',  glow: '#ffbf00', label: 'PROPOSED' },
  in_progress: { border: 'border-cyan-500/70',   text: 'text-cyan-300',   bg: 'bg-cyan-950/40',   glow: '#00d4ff', label: 'WORKING'  },
  pending:     { border: 'border-slate-600/40',  text: 'text-slate-400',  bg: 'bg-slate-950/20',  glow: '#475569', label: 'STANDBY'  },
  completed:   { border: 'border-green-500/60',  text: 'text-green-300',  bg: 'bg-green-950/20',  glow: '#00ff88', label: 'DONE'     },
  failed:      { border: 'border-red-500/60',    text: 'text-red-400',    bg: 'bg-red-950/20',    glow: '#ff3366', label: 'ERROR'    },
  blocked:     { border: 'border-orange-500/60', text: 'text-orange-300', bg: 'bg-orange-950/20', glow: '#ff6b00', label: 'BLOCKED'  },
  vetoed:      { border: 'border-slate-700/50',  text: 'text-slate-600',  bg: 'bg-slate-950/10',  glow: '#334155', label: 'VETOED'   },
}

const PATROL_ANIMS = ['patrol-a', 'patrol-b', 'patrol-c', 'patrol-d', 'patrol-e']
const AVATARS      = ['◈', '◆', '▣', '⬡', '◉', '⬢', '▦', '◍']
const SPEEDS       = ['7s', '9s', '11s', '8s', '13s']

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return h
}

function dominant(tasks: Todo[]): TodoStatus {
  for (const s of ['failed','blocked','in_progress','pending','completed'] as TodoStatus[])
    if (tasks.some(t => t.status === s)) return s
  return 'pending'
}

export default function AgentPods({ todos }: Props) {
  const map = new Map<string, Todo[]>()
  for (const t of todos) {
    const k = t.assigned_agent ?? '__unassigned__'
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(t)
  }

  const agents = [...map.entries()].sort(([,a],[,b]) => {
    const aW = a.some(t => t.status === 'in_progress')
    const bW = b.some(t => t.status === 'in_progress')
    return aW === bW ? 0 : aW ? -1 : 1
  })

  if (agents.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-700 uppercase">◈ Agent Pods</span>
        <div className="flex-1 h-px bg-cyan-900/30" />
        <span className="text-xs font-mono text-slate-700">{map.size} units online</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {agents.map(([name, tasks]) => (
          <AgentPod key={name} agentName={name} tasks={tasks} />
        ))}
      </div>
    </div>
  )
}

function AgentPod({ agentName, tasks }: { agentName: string; tasks: Todo[] }) {
  const isUnassigned = agentName === '__unassigned__'
  const displayName  = isUnassigned ? 'UNASSIGNED' : agentName
  const status       = dominant(tasks)
  const isWorking    = tasks.some(t => t.status === 'in_progress')
  const isIdle       = status === 'pending' || status === 'completed'
  const { border, text, bg, glow, label } = STATUS_COLOR[status]

  const h        = hash(agentName)
  const avatar   = isUnassigned ? '?' : AVATARS[h % AVATARS.length]
  const patrol   = PATROL_ANIMS[h % PATROL_ANIMS.length]
  const speed    = SPEEDS[h % SPEEDS.length]

  const activeTask  = tasks.find(t => t.status === 'in_progress')
  const focusTask   = activeTask ?? tasks.find(t => t.status === 'pending') ?? tasks[0]

  const activeCt  = tasks.filter(t => t.status === 'in_progress').length
  const pendingCt = tasks.filter(t => t.status === 'pending').length
  const doneCt    = tasks.filter(t => t.status === 'completed').length
  const errCt     = tasks.filter(t => t.status === 'failed' || t.status === 'blocked').length

  // Agent body animation style
  const agentStyle: React.CSSProperties = isWorking
    ? { animation: 'lock-on 1.4s ease-in-out infinite' }
    : isIdle
    ? { animation: `idle-drift 4s ease-in-out infinite` }
    : { animation: `${patrol} ${speed} ease-in-out infinite` }

  return (
    <div className={`relative rounded border ${border} ${bg} flex flex-col overflow-hidden min-h-[160px] ${isWorking ? 'agent-active' : ''}`}>

      {/* Scanline sweep when working */}
      {isWorking && <div className="agent-scan absolute inset-0 pointer-events-none" />}

      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${border} bg-black/50 z-10`}>
        <div className={`text-xs font-mono font-bold tracking-widest ${text}`}>{label}</div>
        <div className="flex-1" />
        {isWorking && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
      </div>

      {/* Arena — agent moves around in here */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: 80 }}>

        {/* Grid dots background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle, ${glow} 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }}
        />

        {/* Orbit ring when working */}
        {isWorking && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: 32, height: 32 }}
          >
            <div
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
              style={{
                background: glow,
                animation: 'orbit 1.8s linear infinite',
                boxShadow: `0 0 6px ${glow}`,
                marginTop: -2,
                marginLeft: -2,
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
              style={{
                background: glow,
                animation: 'orbit 1.8s linear infinite',
                animationDelay: '-0.9s',
                boxShadow: `0 0 6px ${glow}`,
                marginTop: -2,
                marginLeft: -2,
              }}
            />
          </div>
        )}

        {/* The agent unit */}
        <div
          className="absolute top-1/2 left-1/2 z-10 flex items-center justify-center"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`
              flex items-center justify-center w-9 h-9 rounded text-lg font-bold
              border ${border} ${text}
            `}
            style={{
              ...agentStyle,
              background: `${glow}18`,
              boxShadow: isWorking
                ? `0 0 12px ${glow}, 0 0 24px ${glow}55`
                : `0 0 6px ${glow}44`,
            }}
          >
            {avatar}
          </div>
        </div>

        {/* Corner marks */}
        <div className={`absolute top-1 left-1 w-2 h-2 border-t border-l opacity-30 ${border}`} />
        <div className={`absolute top-1 right-1 w-2 h-2 border-t border-r opacity-30 ${border}`} />
        <div className={`absolute bottom-1 left-1 w-2 h-2 border-b border-l opacity-30 ${border}`} />
        <div className={`absolute bottom-1 right-1 w-2 h-2 border-b border-r opacity-30 ${border}`} />
      </div>

      {/* Agent name + current task */}
      <div className={`px-3 py-2 border-t ${border} bg-black/50 z-10 space-y-1`}>
        <div className={`text-xs font-mono truncate font-bold ${isUnassigned ? 'text-slate-600 italic' : text}`}>
          {displayName}
        </div>
        {focusTask && (
          <div className="text-xs text-slate-500 truncate leading-snug">
            {isWorking && <span className={`${text} mr-1`}>&gt;</span>}
            {focusTask.title}
            {isWorking && <span className={`${text} blink`}>_</span>}
          </div>
        )}

        {/* Mini counters */}
        <div className="flex gap-2 text-xs font-mono pt-0.5">
          {activeCt  > 0 && <span className="text-cyan-600">{activeCt}▶</span>}
          {pendingCt > 0 && <span className="text-slate-600">{pendingCt}◌</span>}
          {doneCt    > 0 && <span className="text-green-800">{doneCt}✓</span>}
          {errCt     > 0 && <span className="text-red-800">{errCt}✕</span>}
        </div>
      </div>
    </div>
  )
}
