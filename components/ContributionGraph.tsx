'use client'

import { useEffect, useState, useMemo } from 'react'

interface Day {
  date:       string
  dayOfWeek:  number
  commits:    number
  godCommits: number
}

interface Data {
  days:            Day[]
  totalCommits:    number
  totalGodCommits: number
  maxCommits:      number
}

export default function ContributionGraph() {
  const [data, setData] = useState<Data | null>(null)
  const [hovered, setHovered] = useState<Day | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/git/contributions', { cache: 'no-store' })
        if (!r.ok) return
        setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  // Group days into weeks (columns) of 7 days each
  const weeks = useMemo(() => {
    if (!data) return []
    const cols: Day[][] = []
    let week: Day[] = []
    for (const d of data.days) {
      week.push(d)
      if (d.dayOfWeek === 6 && week.length > 0) {
        cols.push(week)
        week = []
      }
    }
    if (week.length > 0) cols.push(week)
    return cols
  }, [data])

  function intensity(d: Day, max: number): string {
    if (d.commits === 0) return 'bg-slate-900/40'
    const ratio = d.commits / Math.max(max, 1)
    const isGod = d.godCommits === d.commits
    if (isGod) {
      if (ratio < 0.25) return 'bg-amber-950'
      if (ratio < 0.5)  return 'bg-amber-800'
      if (ratio < 0.75) return 'bg-amber-600'
      return 'bg-amber-400'
    }
    if (ratio < 0.25) return 'bg-green-950'
    if (ratio < 0.5)  return 'bg-green-800'
    if (ratio < 0.75) return 'bg-green-600'
    return 'bg-green-400'
  }

  if (!data) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-[10px] font-mono text-slate-600">loading contribution graph…</span>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Contributions · 365d</span>
          <span className="text-[10px] font-mono text-slate-500">
            {data.totalCommits} commits
          </span>
          {data.totalGodCommits > 0 && (
            <span className="text-[10px] font-mono text-amber-400">
              👁 {data.totalGodCommits} by GOD
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
          <span>less</span>
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-sm bg-slate-900/40" />
            <div className="w-2 h-2 rounded-sm bg-green-950" />
            <div className="w-2 h-2 rounded-sm bg-green-800" />
            <div className="w-2 h-2 rounded-sm bg-green-600" />
            <div className="w-2 h-2 rounded-sm bg-green-400" />
          </div>
          <span>more</span>
          <span className="ml-2 text-amber-400">👁 god</span>
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-2.5 h-2.5 rounded-sm cursor-pointer ${intensity(day, data.maxCommits)} hover:ring-1 hover:ring-cyan-400`}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                  title={`${day.date}: ${day.commits} commit${day.commits === 1 ? '' : 's'}${day.godCommits > 0 ? ` (${day.godCommits} by god)` : ''}`}
                />
              ))}
            </div>
          ))}
        </div>

        {hovered && (
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500">{hovered.date}</span>
            <span className="mx-2 text-slate-700">·</span>
            <span>{hovered.commits} commit{hovered.commits === 1 ? '' : 's'}</span>
            {hovered.godCommits > 0 && (
              <span className="ml-2 text-amber-400">({hovered.godCommits} by god)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
