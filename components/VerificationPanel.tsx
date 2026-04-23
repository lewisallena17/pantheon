'use client'

import { useEffect, useState } from 'react'

interface Entry {
  at:       string
  kind:     string
  ok:       boolean
  detail?:  string
  context?: Record<string, unknown>
}

interface Summary {
  total:  number
  passed: number
  failed: number
  byKind: Record<string, { passed: number; failed: number }>
}

const KIND_LABELS: Record<string, string> = {
  'devto-post':  '📝 Dev.to posts',
  'seo-page':    '📄 SEO pages',
  'git-commit':  '⎇ Git commits',
}

function relTime(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)    return `${s}s`
  if (s < 3600)  return `${Math.round(s / 60)}m`
  if (s < 86400) return `${Math.round(s / 3600)}h`
  return `${Math.round(s / 86400)}d`
}

export default function VerificationPanel() {
  const [data, setData] = useState<{ entries: Entry[]; summary: Summary } | null>(null)
  const [filter, setFilter] = useState<'all' | 'failed'>('all')

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/verifications', { cache: 'no-store' })
        if (r.ok) setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null
  const { entries, summary } = data

  if (summary.total === 0) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">✓ Output Verifications</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No verifications yet. Fires when agents publish to dev.to, write SEO pages, or auto-commit.
        </div>
      </div>
    )
  }

  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0
  const visible = filter === 'failed' ? entries.filter(e => !e.ok) : entries

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">✓ Output Verifications</span>
          <span className={`text-[10px] font-mono ${passRate >= 90 ? 'text-emerald-400' : passRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {passRate}% pass · {summary.passed}/{summary.total}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${filter === 'all' ? 'border-cyan-700/60 bg-cyan-950/40 text-cyan-300' : 'border-slate-700/50 text-slate-500'}`}
          >ALL</button>
          <button
            onClick={() => setFilter('failed')}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${filter === 'failed' ? 'border-red-700/60 bg-red-950/40 text-red-300' : 'border-slate-700/50 text-slate-500'}`}
          >
            FAILED {summary.failed > 0 && <span className="ml-0.5">({summary.failed})</span>}
          </button>
        </div>
      </div>

      {/* Per-kind summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-800/30 border-b border-slate-800/40">
        {Object.entries(summary.byKind).map(([kind, counts]) => {
          const pct = counts.passed + counts.failed > 0 ? Math.round((counts.passed / (counts.passed + counts.failed)) * 100) : 0
          return (
            <div key={kind} className="px-3 py-2">
              <div className="text-[10px] font-mono text-slate-400">{KIND_LABELS[kind] ?? kind}</div>
              <div className="flex items-baseline gap-2">
                <span className={`text-lg font-black tabular-nums ${pct >= 90 ? 'text-emerald-300' : pct >= 70 ? 'text-amber-300' : 'text-red-300'}`}>{pct}%</span>
                <span className="text-[9px] font-mono text-slate-600">{counts.passed}/{counts.passed + counts.failed}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Entries */}
      <div className="divide-y divide-slate-800/30 max-h-80 overflow-y-auto">
        {visible.length === 0 && (
          <div className="px-4 py-3 text-[11px] font-mono text-slate-600 italic">
            {filter === 'failed' ? 'No failures — all verifications passed.' : 'No entries yet.'}
          </div>
        )}
        {visible.map((e, i) => {
          const label = (() => {
            const ctx = e.context ?? {}
            if (e.kind === 'devto-post')  return String(ctx.title ?? ctx.url ?? 'dev.to post')
            if (e.kind === 'seo-page')    return String(ctx.h1 ?? ctx.slug ?? 'topic page')
            if (e.kind === 'git-commit')  return `${String(ctx.sha ?? '').slice(0, 8)} — ${String(ctx.summary ?? '')}`
            return JSON.stringify(ctx).slice(0, 60)
          })()
          return (
            <div key={i} className={`px-4 py-2 flex items-center gap-3 ${!e.ok ? 'bg-red-950/10' : ''}`}>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                e.ok ? 'border border-emerald-800/50 bg-emerald-950/30 text-emerald-300'
                     : 'border border-red-700/50 bg-red-950/40 text-red-300'
              }`}>{e.ok ? '✓' : '✕'}</span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums w-10 flex-shrink-0">{relTime(e.at)}</span>
              <span className="text-[10px] font-mono text-slate-500 w-20 flex-shrink-0 truncate">{(KIND_LABELS[e.kind] ?? e.kind).replace(/^[^\s]+\s/, '')}</span>
              <span className="flex-1 text-[11px] text-slate-300 truncate">{label}</span>
              {!e.ok && e.detail && (
                <span className="text-[10px] font-mono text-red-400/80 truncate max-w-xs" title={e.detail}>{e.detail}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
