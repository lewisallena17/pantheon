'use client'

import { useEffect, useState } from 'react'

interface Stream {
  id:          string
  name:        string
  category:    string
  handsOff:    number
  status:      'active' | 'configured' | 'pending-setup' | 'not-wired'
  blocker:     string | null
  description: string
  expected:    string
  nextStep:    string
}

interface ApiResponse {
  summary: {
    topicCount:     number
    newestPageIso:  string | null
    activeStreams:  number
    pendingSetup:   number
    notWired:       number
  }
  streams: Stream[]
  recommendedNextStep: string
}

const STATUS_STYLE: Record<Stream['status'], string> = {
  'active':         'border-emerald-700/60 bg-emerald-950/30 text-emerald-300',
  'configured':     'border-cyan-700/60    bg-cyan-950/30    text-cyan-300',
  'pending-setup':  'border-amber-700/60   bg-amber-950/30   text-amber-300',
  'not-wired':      'border-slate-700/50   bg-slate-900/30   text-slate-500',
}

const STATUS_ICON: Record<Stream['status'], string> = {
  'active':        '●',
  'configured':    '◎',
  'pending-setup': '◌',
  'not-wired':     '○',
}

const STATUS_LABEL: Record<Stream['status'], string> = {
  'active':        'EARNING',
  'configured':    'CONFIGURED',
  'pending-setup': 'NEEDS SETUP',
  'not-wired':     'NOT WIRED',
}

export default function PassiveIncomeStatus() {
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/passive-income', { cache: 'no-store' })
        if (r.ok) setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 2 * 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  const { summary, streams, recommendedNextStep } = data

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">💰 Passive Income Pipelines</span>
          <span className="text-[10px] font-mono text-slate-600">
            {summary.topicCount} topic pages · {summary.activeStreams} earning · {summary.pendingSetup} need setup
          </span>
        </div>
      </div>

      {/* Recommended next step — the ONE thing to do next */}
      {recommendedNextStep && (
        <div className="px-4 py-2 border-b border-slate-800/40 bg-amber-950/10">
          <div className="text-[9px] font-mono tracking-widest text-amber-600 uppercase mb-0.5">Next Step</div>
          <div className="text-[11px] font-mono text-amber-300 leading-snug">{recommendedNextStep}</div>
        </div>
      )}

      <div className="divide-y divide-slate-800/30">
        {streams.map(s => (
          <div key={s.id} className="px-4 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border tracking-wider ${STATUS_STYLE[s.status]}`}>
                {STATUS_ICON[s.status]} {STATUS_LABEL[s.status]}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-200">{s.name}</span>
              <span className="ml-auto text-[9px] font-mono text-slate-600" title={`${s.handsOff}/10 hands-off score`}>
                hands-off {s.handsOff}/10
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 leading-relaxed mb-1">{s.description}</div>
            <div className="flex items-center gap-3 text-[9px] font-mono">
              <span className="text-slate-600">expected: <span className="text-slate-400">{s.expected}</span></span>
              {s.blocker && <span className="ml-auto text-amber-400 truncate max-w-sm" title={s.blocker}>⟡ {s.blocker}</span>}
            </div>
          </div>
        ))}
      </div>

      {summary.newestPageIso && (
        <div className="px-4 py-2 border-t border-slate-800/40 bg-black/30 text-[10px] font-mono text-slate-600">
          Agents shipped {summary.topicCount} topic pages — newest {new Date(summary.newestPageIso).toLocaleDateString()}. More traffic → more revenue across all streams.
        </div>
      )}
    </div>
  )
}
