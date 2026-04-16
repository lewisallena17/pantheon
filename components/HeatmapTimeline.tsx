'use client'

import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

export default function HeatmapTimeline({ todos }: Props) {
  // Count tasks updated in each hour bucket (0-23)
  const buckets = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
  for (const t of todos) {
    const h = new Date(t.updated_at).getHours()
    buckets[h].count++
  }
  const max = Math.max(1, ...buckets.map(b => b.count))

  const now = new Date().getHours()

  return (
    <div className="rounded border border-cyan-900/40 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-900/40 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-cyan-700 uppercase">◈ Activity Heatmap</span>
        <span className="text-xs font-mono text-slate-700">by hour of day</span>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-end gap-0.5 h-12">
          {buckets.map(({ hour, count }) => {
            const intensity = count / max
            const isNow = hour === now
            const opacity = count === 0 ? 0.06 : 0.15 + intensity * 0.85
            return (
              <div
                key={hour}
                className="flex-1 relative group"
                title={`${hour}:00 — ${count} task${count !== 1 ? 's' : ''}`}
              >
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: count === 0 ? 4 : Math.max(4, intensity * 44),
                    background: isNow
                      ? `rgba(0,255,136,${opacity})`
                      : `rgba(0,212,255,${opacity})`,
                    boxShadow: isNow && count > 0
                      ? `0 0 6px rgba(0,255,136,0.4)`
                      : count > 0
                      ? `0 0 4px rgba(0,212,255,0.2)`
                      : 'none',
                  }}
                />
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap">
                  <div className="bg-black/90 border border-cyan-900/60 text-xs font-mono text-cyan-300 px-2 py-1 rounded">
                    {hour.toString().padStart(2,'0')}:00 · {count}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-700 mt-1">
          <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
        </div>
      </div>
    </div>
  )
}
