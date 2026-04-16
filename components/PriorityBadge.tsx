import type { TodoPriority } from '@/types/todos'

const STYLES: Record<TodoPriority, { text: string; label: string }> = {
  low:      { text: 'text-slate-500',  label: '▽ LOW' },
  medium:   { text: 'text-yellow-500', label: '◇ MED' },
  high:     { text: 'text-orange-400', label: '△ HIGH' },
  critical: { text: 'text-red-400',    label: '▲ CRIT' },
}

export default function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const s = STYLES[priority]
  return (
    <span className={`text-xs font-mono tracking-widest ${s.text}`}>
      {s.label}
    </span>
  )
}
