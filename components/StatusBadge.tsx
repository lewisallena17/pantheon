import type { TodoStatus } from '@/types/todos'

const STYLES: Record<TodoStatus, { border: string; text: string; dot: string; glow: string }> = {
  proposed:    { border: 'border-amber-500/60',  text: 'text-amber-300',   dot: 'bg-amber-400 animate-pulse',      glow: 'shadow-[0_0_8px_rgba(255,191,0,0.35)]' },
  pending:     { border: 'border-slate-600/50',  text: 'text-slate-400',   dot: 'bg-slate-500',                    glow: '' },
  in_progress: { border: 'border-cyan-500/60',   text: 'text-cyan-300',    dot: 'bg-cyan-400 animate-pulse',       glow: 'shadow-[0_0_8px_rgba(0,212,255,0.4)]' },
  completed:   { border: 'border-green-500/60',  text: 'text-green-300',   dot: 'bg-green-400',                    glow: 'shadow-[0_0_8px_rgba(0,255,136,0.3)]' },
  failed:      { border: 'border-red-500/60',    text: 'text-red-400',     dot: 'bg-red-400 animate-pulse',        glow: 'shadow-[0_0_8px_rgba(255,51,102,0.4)]' },
  blocked:     { border: 'border-orange-500/60', text: 'text-orange-300',  dot: 'bg-orange-400 animate-pulse',     glow: 'shadow-[0_0_8px_rgba(255,107,0,0.4)]' },
  vetoed:      { border: 'border-slate-700/50',  text: 'text-slate-600',   dot: 'bg-slate-700',                    glow: '' },
}

export default function StatusBadge({ status }: { status: TodoStatus }) {
  const s = STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono tracking-wider uppercase ${s.border} ${s.text} ${s.glow} bg-black/40`}>
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status.replace('_', '_')}
    </span>
  )
}
