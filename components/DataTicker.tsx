'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

interface CostApi {
  dailyLimit?:         number
  todaySpend?:         number
  burnPerHour?:        number
  estimatedBalance?:   number | null
  creditStatus?:       string
  hoursUntilDailyCap?: number | null
}

/**
 * Fixed-bottom cinematic scrolling data stream. Pulls live signals (cost,
 * credits, last decree, agent counts, most recent thought) and renders them
 * as a CSS marquee. Duplicated children so the loop is seamless.
 */
export default function DataTicker({ todos }: Props) {
  const [cost, setCost]         = useState<CostApi | null>(null)
  const [thought, setThought]   = useState<string>('')
  const [cycle, setCycle]       = useState<number | null>(null)

  useEffect(() => {
    async function loadCost() {
      try {
        const r = await fetch('/api/cost', { cache: 'no-store' })
        if (r.ok) setCost(await r.json())
      } catch {}
    }
    loadCost()
    const id = setInterval(loadCost, 15_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('god_status').select('thought, intent').eq('id', 1).single().then(({ data }) => {
      const row = data as { thought?: string; intent?: { cycle?: number } } | null
      if (row?.thought) setThought(row.thought)
      if (row?.intent?.cycle !== undefined) setCycle(row.intent.cycle)
    })

    const channel = supabase
      .channel('ticker-god-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'god_status', filter: 'id=eq.1' }, (payload) => {
        const row = payload.new as { thought?: string; intent?: { cycle?: number } } | null
        if (row?.thought) setThought(row.thought)
        if (row?.intent?.cycle !== undefined) setCycle(row.intent.cycle)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const running   = todos.filter(t => t.status === 'in_progress').length
  const queued    = todos.filter(t => t.status === 'pending').length
  const completed = todos.filter(t => t.status === 'completed').length
  const failed    = todos.filter(t => t.status === 'failed').length

  const items = [
    cycle !== null                             ? `⟳ CYCLE ${cycle}` : null,
    thought                                    ? `◈ ${thought.replace(/[⛔★◈◉◎◆✓✕▲▼]/g, '').trim().slice(0, 80)}` : null,
    `⚡ ${running} RUNNING`,
    `◎ ${queued} QUEUED`,
    `✓ ${completed} DONE`,
    failed > 0                                 ? `✕ ${failed} FAILED` : null,
    cost?.todaySpend !== undefined             ? `$ ${cost.todaySpend.toFixed(3)} TODAY` : null,
    cost?.burnPerHour                          ? `⟲ $${cost.burnPerHour.toFixed(3)}/HR` : null,
    cost?.estimatedBalance !== null && cost?.estimatedBalance !== undefined ? `▣ $${cost.estimatedBalance.toFixed(2)} LEFT` : null,
    cost?.creditStatus === 'exhausted'         ? '⛔ CREDITS EXHAUSTED' : null,
    `◉ PANTHEON v2.4.1`,
  ].filter(Boolean) as string[]

  // Repeat the items to make the marquee look infinite + smooth
  const doubled = [...items, ...items]

  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-7 z-40 bg-black/80 backdrop-blur-sm border-t border-cyan-900/40 overflow-hidden pointer-events-none select-none"
      aria-hidden
    >
      <div className="absolute inset-0 flex items-center">
        <div className="ticker-track flex gap-8 whitespace-nowrap px-4 text-[10px] font-mono tracking-wider text-cyan-500/80">
          {doubled.map((it, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-cyan-500/60" />
              <span>{it}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
