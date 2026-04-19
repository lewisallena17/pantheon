'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

interface ScoredTodo { id: string; title: string; score: number; reason: string; agent: string | null }

const STARS = ['1★ Useless', '2★ Padding', '3★ Partial', '4★ Mostly', '5★ Solid']
const STAR_COLORS = ['bg-red-700',   'bg-orange-600', 'bg-amber-500', 'bg-cyan-600', 'bg-emerald-600']

export default function QualityDistribution({ todos }: Props) {
  const { scored, buckets, avg, worst } = useMemo(() => {
    const scoredArr: ScoredTodo[] = []
    for (const t of todos) {
      // metadata is loosely typed (see types/todos.ts); read defensively
      const meta = (t as unknown as { metadata?: Record<string, unknown> }).metadata
      const score = Number(meta?.quality_score)
      if (!Number.isFinite(score) || score < 1 || score > 5) continue
      scoredArr.push({
        id:     t.id,
        title:  t.title,
        score,
        reason: String(meta?.quality_reason ?? ''),
        agent:  t.assigned_agent,
      })
    }
    const bucketsArr = [0, 0, 0, 0, 0]
    for (const s of scoredArr) bucketsArr[s.score - 1]++

    const avgVal = scoredArr.length ? scoredArr.reduce((s, x) => s + x.score, 0) / scoredArr.length : 0
    const worstArr = [...scoredArr].sort((a, b) => a.score - b.score).slice(0, 5)

    return { scored: scoredArr, buckets: bucketsArr, avg: avgVal, worst: worstArr }
  }, [todos])

  if (!scored.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">★ Quality Judge</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No graded tasks yet. Judge activates when tasks complete (requires API credits).
        </div>
      </div>
    )
  }

  const max = Math.max(...buckets, 1)
  const avgRounded = Math.round(avg * 10) / 10
  const avgColor =
    avg >= 4.2 ? 'text-emerald-300' :
    avg >= 3.5 ? 'text-cyan-300'    :
    avg >= 2.8 ? 'text-amber-400'   :
                 'text-red-400'

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">★ Quality Judge</span>
          <span className={`text-[11px] font-mono font-bold tabular-nums ${avgColor}`}>
            avg {avgRounded}/5
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-600">{scored.length} graded</span>
      </div>

      {/* Histogram 1-5 */}
      <div className="p-3 space-y-1">
        {buckets.map((count, i) => {
          const pct = (count / max) * 100
          return (
            <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-slate-500 w-20 text-right">{STARS[i]}</span>
              <div className="flex-1 h-3 bg-slate-900 rounded overflow-hidden">
                <div className={`h-full ${STAR_COLORS[i]} rounded transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-slate-400 tabular-nums w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      {/* Worst offenders so the user can spot "technically-done-but-garbage" tasks */}
      {worst.length > 0 && worst[0].score <= 3 && (
        <div className="border-t border-slate-800/40 p-3">
          <div className="text-[9px] font-mono tracking-widest text-slate-600 uppercase mb-1.5">Worst-rated</div>
          <div className="space-y-1">
            {worst.filter(w => w.score <= 3).map(w => (
              <div key={w.id} className="flex items-start gap-2 text-[10px] font-mono">
                <span className={`flex-shrink-0 tabular-nums w-6 text-right font-bold ${
                  w.score <= 2 ? 'text-red-400' : 'text-amber-400'
                }`}>{w.score}★</span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-300 truncate">{w.title}</div>
                  {w.reason && <div className="text-slate-600 italic truncate">{w.reason}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
