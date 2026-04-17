'use client'

import { useEffect, useState, useCallback } from 'react'
import SubscribeForm from './SubscribeForm'

interface Subscriber {
  email:     string
  source:    string
  createdAt: string
}

interface Stats {
  total:    number
  today:    number
  week:     number
  recent:   Subscriber[]
  bySource: Record<string, number>
}

export default function SubscribersPanel() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [copied, setCopied]       = useState(false)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/subscribe', { cache: 'no-store' })
      if (!r.ok) return
      setStats(await r.json())
    } catch {}
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 15_000)
    return () => clearInterval(id)
  }, [refresh])

  const embedSnippet = `<!-- Embed this on dev.to, personal site, or anywhere -->
<form action="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/subscribe" method="POST" style="display:flex;gap:8px;max-width:420px;">
  <input type="hidden" name="source" value="dev-to-article" />
  <input type="email" name="email" placeholder="your@email.com" required
    style="flex:1;padding:10px 12px;border:1px solid #334;border-radius:4px;background:#0a0a0b;color:#e2e8f0;font-family:monospace;font-size:13px;" />
  <button type="submit"
    style="padding:10px 16px;border:1px solid #0891b2;background:#083344;color:#67e8f9;font-family:monospace;font-size:12px;border-radius:4px;cursor:pointer;letter-spacing:0.1em;">
    SUBSCRIBE
  </button>
</form>`

  const subscribeLink = typeof window !== 'undefined'
    ? `${window.location.origin}/subscribe`
    : 'http://localhost:3000/subscribe'

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  if (!stats) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-[10px] font-mono text-slate-600">loading subscriber stats…</span>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Email List</span>
          <span className="text-[10px] font-mono">
            <span className="text-cyan-400 font-bold">{stats.total}</span>
            <span className="text-slate-600"> total</span>
            {stats.today > 0 && (
              <span className="text-green-400 ml-2 animate-pulse">+{stats.today} today</span>
            )}
            {stats.today === 0 && stats.week > 0 && (
              <span className="text-slate-500 ml-2">+{stats.week} this week</span>
            )}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowForm(v => !v)}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700/50 text-slate-400 hover:bg-slate-800/30"
          >
            {showForm ? '↑ hide form' : '📧 test form'}
          </button>
          <button
            onClick={() => setShowEmbed(v => !v)}
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
          >
            {showEmbed ? '↑ hide embed' : '</>  embed code'}
          </button>
          <a
            href="/api/subscribe?format=csv"
            className="text-[10px] font-mono px-2 py-0.5 rounded border border-green-900/50 text-green-400 hover:bg-green-950/30"
            title={stats.total === 0 ? 'No subscribers yet' : `Export ${stats.total} subscribers as CSV`}
          >
            ↓ CSV
          </a>
        </div>
      </div>

      {/* Source breakdown + public subscribe link */}
      <div className="px-4 py-2 border-b border-slate-800/40 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-slate-600 tracking-wider uppercase">Public link:</span>
          <button
            onClick={() => copy(subscribeLink)}
            className="text-[10px] font-mono text-cyan-500 hover:text-cyan-300"
            title="Click to copy"
          >
            {copied ? '✓ COPIED' : subscribeLink}
          </button>
        </div>

        {Object.keys(stats.bySource).length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[9px] font-mono text-slate-600 tracking-wider uppercase">Sources:</span>
            {Object.entries(stats.bySource)
              .sort((a, b) => b[1] - a[1])
              .map(([src, count]) => (
                <span key={src} className="text-[10px] font-mono text-slate-500">
                  {src}: <span className="text-slate-300">{count}</span>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Test form */}
      {showForm && (
        <div className="px-4 py-3 border-b border-slate-800/40 bg-black/30">
          <div className="text-[9px] font-mono text-slate-600 tracking-wider uppercase mb-2">
            Live form — use this to test
          </div>
          <SubscribeForm source="dashboard-test" compact />
        </div>
      )}

      {/* Embed code snippet */}
      {showEmbed && (
        <div className="px-4 py-3 border-b border-slate-800/40 bg-black/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-mono text-slate-600 tracking-wider uppercase">
              Paste this HTML on dev.to, your site, anywhere
            </span>
            <button
              onClick={() => copy(embedSnippet)}
              className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
            >
              {copied ? '✓ COPIED' : '📋 COPY HTML'}
            </button>
          </div>
          <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800/60 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-48">
{embedSnippet}
          </pre>
          <div className="mt-2 text-[9px] font-mono text-amber-500">
            ⚠ For this form to work outside localhost, your dashboard needs a public URL (deploy to Vercel or tunnel with ngrok).
          </div>
        </div>
      )}

      {/* Recent subscribers */}
      {stats.total === 0 ? (
        <div className="px-4 py-6 text-center">
          <div className="text-[11px] font-mono text-slate-600 mb-3">
            No subscribers yet — share your subscribe link!
          </div>
          <div className="flex justify-center gap-2">
            <a
              href="/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono px-3 py-1 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
            >
              → PREVIEW /subscribe PAGE
            </a>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/40 max-h-64 overflow-y-auto">
          {stats.recent.map((s, i) => (
            <div key={`${s.email}-${i}`} className="px-4 py-1.5 flex items-center gap-3">
              <span className="font-mono text-[10px] text-slate-500 min-w-0 truncate flex-1">{s.email}</span>
              <span className="font-mono text-[9px] text-slate-600">{s.source}</span>
              <span className="font-mono text-[9px] text-slate-700 shrink-0">{timeAgo(s.createdAt)}</span>
            </div>
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
