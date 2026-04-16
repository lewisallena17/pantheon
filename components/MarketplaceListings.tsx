'use client'

import { useEffect, useState, useCallback } from 'react'

type SubmissionStatus = 'not_submitted' | 'submitted' | 'live' | 'rejected'

interface Submission {
  status:       SubmissionStatus
  submittedAt?: string
  liveAt?:      string
  liveUrl?:     string
  notes?:       string
}

interface Listing {
  slug:        string
  name:        string
  submitUrl:   string
  reviewDays:  number
  priceHint:   string
  listingPath: string
  zipPath:     string | null
  submission:  Submission
}

interface Data {
  generated:   boolean
  message?:    string
  product?:    { name: string; priceUSD: number }
  listings:    Listing[]
  generatedAt?: string
}

const STATUS_STYLE: Record<SubmissionStatus, { color: string; bg: string; label: string; icon: string }> = {
  not_submitted: { color: 'text-slate-500',  bg: 'bg-slate-900/30', label: 'NOT SUBMITTED', icon: '○' },
  submitted:     { color: 'text-cyan-400',   bg: 'bg-cyan-950/30',  label: 'SUBMITTED',     icon: '◉' },
  live:          { color: 'text-green-400',  bg: 'bg-green-950/30', label: 'LIVE',          icon: '●' },
  rejected:      { color: 'text-red-400',    bg: 'bg-red-950/30',   label: 'REJECTED',      icon: '✗' },
}

export default function MarketplaceListings() {
  const [data, setData]     = useState<Data | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [busy, setBusy]     = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/marketplace/listings', { cache: 'no-store' })
      if (!r.ok) return
      setData(await r.json())
    } catch {}
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function copyListing(slug: string) {
    setBusy(`copy-${slug}`)
    try {
      const r = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'get_copy', slug }),
      })
      const j = await r.json() as { content?: string; error?: string }
      if (j.content) {
        await navigator.clipboard.writeText(j.content)
        setCopied(slug)
        setTimeout(() => setCopied(null), 2000)
      }
    } finally {
      setBusy(null)
    }
  }

  async function action(slug: string, act: 'mark_submitted' | 'mark_live' | 'mark_rejected' | 'reset', extra: Partial<Submission> = {}) {
    setBusy(`${act}-${slug}`)
    try {
      await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: act, slug, ...extra }),
      })
      await refresh()
    } finally {
      setBusy(null)
    }
  }

  async function markLive(slug: string) {
    const url = prompt('Paste the live product URL:')
    if (!url) return
    await action(slug, 'mark_live', { liveUrl: url })
  }

  if (!data) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-[10px] font-mono text-slate-600">loading marketplace listings…</span>
      </div>
    )
  }

  if (!data.generated) {
    return (
      <div className="rounded border border-amber-900/40 bg-amber-950/20 px-4 py-3">
        <div className="text-xs font-mono text-amber-400 font-bold">📦 Marketplace listings not generated</div>
        <div className="text-[10px] font-mono text-slate-400 mt-1">
          Run in PowerShell:
        </div>
        <div className="text-[10px] font-mono text-cyan-400 mt-1 select-all">
          cd C:\Users\LTAGB\task-dashboard && node scripts/generate-listings.mjs
        </div>
        <div className="text-[10px] font-mono text-slate-500 mt-1">
          Then refresh this page.
        </div>
      </div>
    )
  }

  const liveCount      = data.listings.filter(l => l.submission.status === 'live').length
  const submittedCount = data.listings.filter(l => l.submission.status === 'submitted').length

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Marketplace Listings</span>
          <span className="text-[10px] font-mono text-slate-600">
            {data.listings.length} prepared
          </span>
          {submittedCount > 0 && (
            <span className="text-[10px] font-mono text-cyan-400">
              {submittedCount} submitted
            </span>
          )}
          {liveCount > 0 && (
            <span className="text-[10px] font-mono text-green-400 animate-pulse">
              {liveCount} LIVE
            </span>
          )}
        </div>
        {data.generatedAt && (
          <span className="text-[9px] font-mono text-slate-700">
            prepared {timeAgo(data.generatedAt)}
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-800/40">
        {data.listings.map(l => {
          const s = STATUS_STYLE[l.submission.status]
          return (
            <div key={l.slug} className={`px-4 py-3 ${s.bg}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${s.color}`}>{l.name}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-current ${s.color}`}>
                      {s.icon} {s.label}
                    </span>
                    {l.reviewDays === 0 && l.submission.status === 'not_submitted' && (
                      <span className="text-[9px] font-mono text-green-500">instant</span>
                    )}
                    {l.reviewDays > 0 && l.submission.status === 'not_submitted' && (
                      <span className="text-[9px] font-mono text-amber-500">~{l.reviewDays}d review</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {l.priceHint}
                  </div>
                  {l.submission.liveUrl && (
                    <a href={l.submission.liveUrl} target="_blank" rel="noopener noreferrer"
                       className="block text-[10px] font-mono text-green-400 hover:text-green-300 mt-1 truncate">
                      ↗ {l.submission.liveUrl}
                    </a>
                  )}
                  {l.submission.submittedAt && (
                    <div className="text-[9px] font-mono text-slate-600 mt-0.5">
                      submitted {timeAgo(l.submission.submittedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {l.submission.status === 'not_submitted' && (
                  <>
                    <button
                      onClick={() => copyListing(l.slug)}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/40"
                    >
                      {copied === l.slug ? '✓ COPIED' : '📋 COPY LISTING'}
                    </button>
                    <a
                      href={l.submitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono px-2 py-1 rounded border border-purple-900/50 text-purple-400 hover:bg-purple-950/40"
                    >
                      → OPEN {l.name.split(' ')[0].toUpperCase()}
                    </a>
                    <button
                      onClick={() => action(l.slug, 'mark_submitted')}
                      disabled={busy !== null}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-amber-900/50 text-amber-400 hover:bg-amber-950/40 disabled:opacity-40"
                    >
                      ✓ MARK SUBMITTED
                    </button>
                  </>
                )}

                {l.submission.status === 'submitted' && (
                  <>
                    <button
                      onClick={() => markLive(l.slug)}
                      disabled={busy !== null}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-green-900/50 text-green-400 hover:bg-green-950/40"
                    >
                      ● MARK LIVE
                    </button>
                    <button
                      onClick={() => action(l.slug, 'mark_rejected')}
                      disabled={busy !== null}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-red-900/50 text-red-400 hover:bg-red-950/40"
                    >
                      ✗ REJECTED
                    </button>
                    <button
                      onClick={() => action(l.slug, 'reset')}
                      disabled={busy !== null}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700/50 text-slate-500 hover:bg-slate-800/40"
                    >
                      ↺ reset
                    </button>
                  </>
                )}

                {l.submission.status === 'live' && (
                  <button
                    onClick={() => action(l.slug, 'reset')}
                    disabled={busy !== null}
                    className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700/50 text-slate-500 hover:bg-slate-800/40"
                  >
                    ↺ reset
                  </button>
                )}

                {l.submission.status === 'rejected' && (
                  <>
                    <a
                      href={l.submitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono px-2 py-1 rounded border border-purple-900/50 text-purple-400 hover:bg-purple-950/40"
                    >
                      → RESUBMIT
                    </a>
                    <button
                      onClick={() => action(l.slug, 'reset')}
                      disabled={busy !== null}
                      className="text-[10px] font-mono px-2 py-1 rounded border border-slate-700/50 text-slate-500 hover:bg-slate-800/40"
                    >
                      ↺ reset
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-slate-800/40 text-[9px] font-mono text-slate-600">
        Zips live in: <span className="text-slate-500">C:\Users\LTAGB\task-dashboard\dist\listings\&lt;slug&gt;/</span>
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
