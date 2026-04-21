'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

function greetingFor(date: Date) {
  const h = date.getHours()
  if (h >= 5  && h < 12) return 'Good morning, sir.'
  if (h >= 12 && h < 17) return 'Good afternoon, sir.'
  if (h >= 17 && h < 22) return 'Good evening, sir.'
  return 'Burning the midnight oil, sir.'
}

/**
 * Small greeting line in the header. Updates when the hour tips over,
 * appends a one-liner summary of what happened while the user was away.
 */
export default function JarvisGreeting({ todos }: Props) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  const summary = useMemo(() => {
    if (!now) return null
    const recentHours = 8
    const cutoff = now.getTime() - recentHours * 3600_000
    let done = 0, failed = 0
    for (const t of todos) {
      const when = new Date(t.updated_at ?? t.created_at ?? 0).getTime()
      if (when < cutoff) continue
      if (t.status === 'completed') done++
      if (t.status === 'failed')    failed++
    }
    if (done === 0 && failed === 0) return null
    const parts: string[] = []
    if (done > 0)   parts.push(`${done} task${done === 1 ? '' : 's'} completed`)
    if (failed > 0) parts.push(`${failed} failed`)
    return parts.join(', ') + ' overnight.'
  }, [now, todos])

  if (!now) return null

  return (
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-xs text-slate-300 italic font-mono" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
        {greetingFor(now)}
      </span>
      {summary && (
        <span className="text-[10px] text-slate-500 font-mono">{summary}</span>
      )}
    </div>
  )
}
