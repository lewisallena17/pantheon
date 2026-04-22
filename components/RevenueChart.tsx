'use client'

import { useEffect, useMemo, useState } from 'react'

interface CostData {
  sessions?: Array<{ at: string; cost: number }>
  total?: number
}

interface Point { day: string; cost: number; revenue: number }

/**
 * Cost vs revenue over time — SVG line chart, no chart library needed.
 * Cost is real (from cost-log.json). Revenue is placeholder (£0) until
 * AdSense/Amazon start producing data — once approved, a real /api/revenue
 * route will feed this. For now, the chart shows the cost side so you can
 * visually anticipate the break-even point.
 */
export default function RevenueChart() {
  const [cost, setCost] = useState<CostData | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/cost', { cache: 'no-store' })
        if (r.ok) setCost(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  // Bucket sessions into daily totals (last 14 days)
  const points = useMemo<Point[]>(() => {
    if (!cost?.sessions) return []
    const days: Record<string, number> = {}
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600_000).toISOString().slice(0, 10)
      days[d] = 0
    }
    for (const s of cost.sessions ?? []) {
      const day = (s.at ?? '').slice(0, 10)
      if (day in days) days[day] += (s.cost ?? 0)
    }
    // Revenue placeholder — once AdSense data is wired, pull it here
    return Object.entries(days).map(([day, c]) => ({ day, cost: c, revenue: 0 }))
  }, [cost])

  if (!points.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◎ Cost vs Revenue</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">No cost data yet.</div>
      </div>
    )
  }

  const maxCost = Math.max(...points.map(p => p.cost), 0.1)
  const maxRevenue = Math.max(...points.map(p => p.revenue), 0.1)
  const scale = Math.max(maxCost, maxRevenue)
  const total14d = points.reduce((s, p) => s + p.cost, 0)

  // SVG dimensions
  const W = 520, H = 160, padL = 36, padR = 10, padT = 16, padB = 24
  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const xFor = (i: number) => padL + (i / Math.max(1, points.length - 1)) * chartW
  const yFor = (v: number) => padT + chartH - (v / scale) * chartH

  const costLine = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.cost)}`).join(' ')
  const revLine  = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.revenue)}`).join(' ')

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◎ Cost vs Revenue</span>
          <span className="text-[10px] font-mono text-slate-600">14-day window</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-red-400">● cost ${total14d.toFixed(2)}</span>
          <span className="text-emerald-400">● revenue $0.00</span>
        </div>
      </div>

      <div className="p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => (
            <g key={pct}>
              <line x1={padL} y1={padT + chartH * (1 - pct)} x2={W - padR} y2={padT + chartH * (1 - pct)}
                    stroke="rgba(100,116,139,0.15)" strokeWidth={1} strokeDasharray="2 3" />
              <text x={padL - 6} y={padT + chartH * (1 - pct) + 3} textAnchor="end"
                    fill="#475569" fontSize={8} fontFamily="monospace">
                ${(scale * pct).toFixed(2)}
              </text>
            </g>
          ))}

          {/* Cost area */}
          <path
            d={`${costLine} L ${xFor(points.length - 1)},${yFor(0)} L ${xFor(0)},${yFor(0)} Z`}
            fill="rgba(239,68,68,0.12)"
          />
          <path d={costLine} stroke="#ef4444" strokeWidth={2} fill="none" />

          {/* Revenue line */}
          <path d={revLine} stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 3" />

          {/* Point markers on cost */}
          {points.map((p, i) => (
            <circle key={i} cx={xFor(i)} cy={yFor(p.cost)} r={2.5} fill="#ef4444" />
          ))}

          {/* X-axis date labels — every 3rd point */}
          {points.map((p, i) => {
            if (i % 3 !== 0 && i !== points.length - 1) return null
            return (
              <text key={p.day} x={xFor(i)} y={H - 6} textAnchor="middle" fill="#475569" fontSize={8} fontFamily="monospace">
                {p.day.slice(5)}
              </text>
            )
          })}
        </svg>

        <div className="text-[9px] font-mono text-slate-600 mt-1 leading-relaxed">
          Revenue line is a placeholder until AdSense approval + Amazon clicks accrue. The cost line is real — watch it stay low as prompt caching + the Ollama fallback do their job.
        </div>
      </div>
    </div>
  )
}
