'use client'

import { useMemo } from 'react'
import type { Todo } from '@/types/todos'

interface Props { todos: Todo[] }

const DAY = 24 * 60 * 60 * 1000

// Collapse noisy per-task-id agent names (e.g. db-specialist-ca15a6) into their
// pool so we get meaningful reliability per role rather than per invocation.
function poolName(agent: string | null | undefined): string | null {
  if (!agent) return null
  const m = agent.match(/^([a-z]+-[a-z]+)(?:-[a-z0-9]{4,})?$/i)
  return m ? m[1] : agent
}

interface Score { pool: string; total: number; done: number; failed: number; reliability: number; recent7d: number; trend: number }

function computeScore(
  todos: Todo[],
  windowDays: number | null,
): Map<string, { done: number; failed: number; total: number }> {
  const cutoff = windowDays ? Date.now() - windowDays * DAY : 0
  const acc = new Map<string, { done: number; failed: number; total: number }>()
  for (const t of todos) {
    const pool = poolName(t.assigned_agent)
    if (!pool) continue
    const when = new Date(t.updated_at ?? t.created_at ?? 0).getTime()
    if (cutoff && when < cutoff) continue
    const isDone = t.status === 'completed'
    const isFail = t.status === 'failed'
    if (!isDone && !isFail) continue
    const b = acc.get(pool) ?? { done: 0, failed: 0, total: 0 }
    if (isDone) b.done += 1
    if (isFail) b.failed += 1
    b.total += 1
    acc.set(pool, b)
  }
  return acc
}

/** 0-100 reliability: weighted wins %, but with a low-sample penalty so a pool
 * with 2/2 wins ranks below one with 50/52. */
function reliability(done: number, failed: number) {
  const total = done + failed
  if (!total) return null
  const raw = (done / total) * 100
  // Wilson score lower bound at 95% confidence — punishes low-N scores
  const z = 1.96, n = total, p = done / n
  const denom = 1 + z * z / n
  const center = p + z * z / (2 * n)
  const margin = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)
  const lower = (center - margin) / denom
  return { raw: Math.round(raw), conservative: Math.round(lower * 100) }
}

export default function TrustScores({ todos }: Props) {
  const scores: Score[] = useMemo(() => {
    const all    = computeScore(todos, null)
    const last7  = computeScore(todos, 7)
    const prev7  = computeScore(todos, 14)

    const out: Score[] = []
    for (const [pool, cur] of all) {
      const r = reliability(cur.done, cur.failed)
      if (!r) continue

      const r7  = reliability(last7.get(pool)?.done ?? 0,  last7.get(pool)?.failed ?? 0)
      // prev7 covers last 14 days; subtract last7 for the PRIOR 7-day window
      const prev = prev7.get(pool) ?? { done: 0, failed: 0, total: 0 }
      const sevenAgo = {
        done:   prev.done   - (last7.get(pool)?.done   ?? 0),
        failed: prev.failed - (last7.get(pool)?.failed ?? 0),
      }
      const rPrev = reliability(Math.max(sevenAgo.done, 0), Math.max(sevenAgo.failed, 0))
      const trend = (r7?.raw ?? null) !== null && (rPrev?.raw ?? null) !== null
        ? r7!.raw - rPrev!.raw
        : 0

      out.push({
        pool,
        total: cur.done + cur.failed,
        done: cur.done,
        failed: cur.failed,
        reliability: r.conservative,
        recent7d: r7?.raw ?? 0,
        trend,
      })
    }
    out.sort((a, b) => b.reliability - a.reliability)
    return out
  }, [todos])

  if (!scores.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Trust Scores</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">No completions yet.</div>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Trust Scores</span>
        <span className="text-[10px] font-mono text-slate-600">Wilson 95% · 7-day drift</span>
      </div>
      <div className="divide-y divide-slate-800/30">
        {scores.map(s => {
          const fill =
            s.reliability >= 75 ? 'bg-emerald-600' :
            s.reliability >= 50 ? 'bg-amber-500'   :
            s.reliability >= 25 ? 'bg-orange-500'  :
                                  'bg-red-600'
          const trendIcon =
            s.trend >   5 ? { glyph: '▲', cls: 'text-emerald-400' } :
            s.trend < -5 ? { glyph: '▼', cls: 'text-red-400'     } :
                           { glyph: '—', cls: 'text-slate-600'   }
          return (
            <div key={s.pool} className="px-4 py-2 flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-300 w-36 truncate">{s.pool}</span>
              <div className="flex-1 h-2 bg-slate-900 rounded overflow-hidden">
                <div className={`h-full ${fill} transition-all duration-700`} style={{ width: `${s.reliability}%` }} />
              </div>
              <span className="text-[11px] font-mono tabular-nums text-slate-300 w-10 text-right">{s.reliability}</span>
              <span className={`text-[10px] font-mono tabular-nums w-12 text-right ${trendIcon.cls}`} title={`7-day change: ${s.trend > 0 ? '+' : ''}${s.trend}`}>
                {trendIcon.glyph} {s.trend > 0 ? '+' : ''}{s.trend}
              </span>
              <span className="text-[9px] font-mono text-slate-600 w-20 text-right tabular-nums">
                {s.done}✓ / {s.failed}✗
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
