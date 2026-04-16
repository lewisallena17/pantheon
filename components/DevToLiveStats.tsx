'use client'

import { useEffect, useState } from 'react'

interface Article {
  id:          number
  title:       string
  url:         string
  views:       number
  reactions:   number
  comments:    number
  readingTime: number
  publishedAt: string
  tags:        string[]
}

interface Data {
  configured: boolean
  articles:   Article[]
  totals?: {
    views:       number
    reactions:   number
    comments:    number
    articles:    number
    estEarnings: number
  }
  error?: string
}

export default function DevToLiveStats() {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/revenue/devto', { cache: 'no-store' })
        if (!r.ok) return
        setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (!data?.configured) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-[10px] font-mono text-slate-600">
          dev.to stats unavailable — set DEV_TO_API_KEY in .env.local
        </span>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className="rounded border border-red-900/40 bg-red-950/20 px-4 py-3">
        <span className="text-[10px] font-mono text-red-400">dev.to: {data.error}</span>
      </div>
    )
  }

  const t = data.totals
  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ dev.to · LIVE</span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            syncing 1/min
          </span>
        </div>
        {t && (
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-slate-500">{t.articles} articles</span>
            <span className="text-cyan-400">{t.views.toLocaleString()} views</span>
            <span className="text-pink-400">♥ {t.reactions}</span>
            <span className="text-green-400">~${t.estEarnings.toFixed(2)} est</span>
          </div>
        )}
      </div>

      {data.articles.length === 0 ? (
        <div className="px-4 py-6 text-center text-[11px] font-mono text-slate-600">
          No articles published yet
        </div>
      ) : (
        <div className="divide-y divide-slate-800/40">
          {data.articles.map(a => (
            <a
              key={a.id}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-900/30"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 truncate">{a.title}</div>
                <div className="text-[9px] font-mono text-slate-600 mt-0.5 flex items-center gap-2">
                  <span>{timeAgo(a.publishedAt)}</span>
                  <span>·</span>
                  <span>{a.readingTime}min read</span>
                  {a.tags.length > 0 && <>
                    <span>·</span>
                    <span className="text-slate-700">{a.tags.slice(0, 3).map(t => `#${t}`).join(' ')}</span>
                  </>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
                <span className="text-cyan-400">👁 {a.views.toLocaleString()}</span>
                <span className="text-pink-400">♥ {a.reactions}</span>
                {a.comments > 0 && <span className="text-amber-400">💬 {a.comments}</span>}
              </div>
            </a>
          ))}
        </div>
      )}
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
