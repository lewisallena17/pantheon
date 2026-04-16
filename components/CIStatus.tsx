'use client'

import { useEffect, useState } from 'react'

interface Run {
  id:         number
  name:       string
  branch:     string
  sha:        string
  status:     string
  conclusion: string | null
  url:        string
  at:         string
  runNumber:  number
}

export default function CIStatus() {
  const [runs, setRuns] = useState<Run[]>([])
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchRuns() {
      try {
        const r = await fetch('/api/github/ci', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json() as { configured: boolean; runs: Run[] }
        if (!cancelled) {
          setConfigured(j.configured)
          setRuns(j.runs)
        }
      } catch {}
    }
    fetchRuns()
    const id = setInterval(fetchRuns, 15_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (configured === false) return null
  if (runs.length === 0) return null

  const latest = runs[0]
  const passed = runs.filter(r => r.conclusion === 'success').length
  const failed = runs.filter(r => r.conclusion === 'failure').length

  const { color, bg, border, icon, label } = statusStyle(latest)

  return (
    <div className={`rounded border ${border} ${bg} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ CI Status</span>
          <span className={`text-[10px] font-mono font-bold ${color}`}>
            {icon} {label}
          </span>
          <span className="text-[10px] font-mono text-slate-600">
            last {runs.length}: ✓ {passed} · ✗ {failed}
          </span>
        </div>
        <a
          href={latest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-cyan-500 hover:text-cyan-300"
        >
          view run ↗
        </a>
      </div>

      <div className="divide-y divide-slate-800/30">
        {runs.slice(0, 5).map(r => {
          const rs = statusStyle(r)
          return (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-1.5 hover:bg-slate-900/30"
            >
              <span className={`shrink-0 text-xs font-mono ${rs.color}`}>{rs.icon}</span>
              <span className="font-mono text-[10px] text-slate-500 shrink-0 min-w-10">#{r.runNumber}</span>
              <span className="font-mono text-[10px] text-slate-500 shrink-0">{r.sha}</span>
              <span className="text-[10px] font-mono text-slate-400 truncate flex-1">{r.branch}</span>
              <span className="text-[9px] font-mono text-slate-600 shrink-0">{timeAgo(r.at)}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function statusStyle(r: Run): { color: string; bg: string; border: string; icon: string; label: string } {
  if (r.status === 'in_progress' || r.status === 'queued') {
    return { color: 'text-cyan-400', bg: 'bg-cyan-950/20', border: 'border-cyan-900/40', icon: '◉', label: 'RUNNING' }
  }
  if (r.conclusion === 'success') {
    return { color: 'text-green-400', bg: 'bg-green-950/20', border: 'border-green-900/40', icon: '✓', label: 'PASSING' }
  }
  if (r.conclusion === 'failure') {
    return { color: 'text-red-400', bg: 'bg-red-950/20', border: 'border-red-900/40', icon: '✗', label: 'FAILING' }
  }
  if (r.conclusion === 'cancelled') {
    return { color: 'text-slate-500', bg: 'bg-slate-900/20', border: 'border-slate-800/40', icon: '⏹', label: 'CANCELLED' }
  }
  return { color: 'text-slate-400', bg: 'bg-slate-900/20', border: 'border-slate-800/40', icon: '?', label: r.status.toUpperCase() }
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
