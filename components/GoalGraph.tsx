'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'

interface Goal {
  id:             string
  title:          string
  status:         'active' | 'completed' | 'abandoned'
  priority?:      string
  activatedCycle?: number
  retiredCycle?:  number
}

interface Roadmap { goals: Goal[]; completedGoals?: unknown[] }
interface Wisdom  { cycles: number; roadmap: Roadmap }

interface Props { todos: Todo[] }

/**
 * SVG-based force-free goal graph. Each active goal is a node sized by age,
 * connected to completed goals it branched from (inferred by adjacency in
 * the roadmap history). No react-flow dep — pure SVG + CSS. Langflow-lite.
 */
export default function GoalGraph({ todos }: Props) {
  const [wisdom, setWisdom] = useState<Wisdom | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/wisdom', { cache: 'no-store' })
        if (r.ok) setWisdom(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const nodes = useMemo(() => {
    if (!wisdom) return []
    const goals = wisdom.roadmap?.goals ?? []
    const currentCycle = wisdom.cycles
    return goals.map((g, i) => {
      const age = g.activatedCycle !== undefined ? currentCycle - g.activatedCycle : 0
      const tasksAlignedCount = todos.filter(t =>
        g.title?.toLowerCase().split(/\s+/).some(w => w.length >= 5 && t.title.toLowerCase().includes(w))
      ).length
      return {
        id:     g.id ?? `g${i}`,
        title:  g.title ?? '(unnamed)',
        status: g.status,
        age,
        tasksCount: tasksAlignedCount,
        x: 0,  // filled in layout pass
        y: 0,
      }
    })
  }, [wisdom, todos])

  // Simple circular layout — active goals at top, completed clustered below
  const positioned = useMemo(() => {
    const active    = nodes.filter(n => n.status === 'active')
    const completed = nodes.filter(n => n.status !== 'active')
    const W = 600, H = 320, cx = W / 2

    const aY = 70
    const activeSpacing = active.length > 1 ? (W - 160) / (active.length - 1) : 0
    for (const [i, n] of active.entries()) {
      n.x = 80 + i * activeSpacing
      n.y = aY
    }

    const cY = 230
    const completedSpacing = completed.length > 1 ? (W - 160) / (completed.length - 1) : 0
    for (const [i, n] of completed.entries()) {
      n.x = 80 + i * completedSpacing
      n.y = cY
    }
    void cx
    return { active, completed, W, H }
  }, [nodes])

  if (!wisdom || !nodes.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">🎯 Goal Graph</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">No roadmap yet. God generates one every 4 cycles.</div>
      </div>
    )
  }

  const { active, completed, W, H } = positioned

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">🎯 Goal Graph</span>
        <span className="text-[10px] font-mono text-slate-600">
          {active.length} active · {completed.length} retired · cycle {wisdom.cycles}
        </span>
      </div>
      <div className="p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 320 }}>
          {/* Connections — each active goal linked to every retired predecessor */}
          {active.flatMap(a =>
            completed.map(c => (
              <line
                key={`${a.id}-${c.id}`}
                x1={a.x} y1={a.y} x2={c.x} y2={c.y}
                stroke="rgba(100, 116, 139, 0.15)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
            ))
          )}

          {/* Active goal nodes */}
          {active.map(n => {
            const radius = Math.min(34, 20 + n.tasksCount * 1.5)
            const stale = n.age >= 15
            const glow  = n.age < 10 ? 'rgba(16, 185, 129, 0.8)' : stale ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.8)'
            const fill  = n.age < 10 ? 'rgba(16, 185, 129, 0.25)' : stale ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.25)'
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={radius} fill={fill} stroke={glow} strokeWidth={2}
                        style={{ filter: `drop-shadow(0 0 8px ${glow})`, animation: stale ? 'pulse 1.2s ease-in-out infinite' : undefined }} />
                <text x={n.x} y={n.y + 4} textAnchor="middle"
                      fill="#e2e8f0" fontSize={9} fontFamily="monospace" fontWeight="bold">
                  {n.age}c
                </text>
                <text x={n.x} y={n.y + radius + 14} textAnchor="middle"
                      fill="#94a3b8" fontSize={9} fontFamily="monospace">
                  {n.title.slice(0, 32)}{n.title.length > 32 ? '…' : ''}
                </text>
              </g>
            )
          })}

          {/* Retired goal nodes (smaller, muted) */}
          {completed.map(n => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={12} fill="rgba(100, 116, 139, 0.15)" stroke="rgba(100, 116, 139, 0.4)" strokeWidth={1} />
              <text x={n.x} y={n.y + 3} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace">✓</text>
              <text x={n.x} y={n.y + 24} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="monospace">
                {n.title.slice(0, 28)}{n.title.length > 28 ? '…' : ''}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex gap-4 mt-2 text-[10px] font-mono text-slate-600">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />fresh (&lt;10c)</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />aging (10-14c)</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse" />stale (15c+)</span>
          <span className="ml-auto text-slate-700">node size = tasks aligned · dashed line = lineage</span>
        </div>
      </div>
    </div>
  )
}
