'use client'

import { useEffect, useState, useCallback } from 'react'

interface Competitor {
  name: string
  url?: string
  price?: string
  positioning?: string
  key_features?: string[]
  differentiators?: string
}

interface ResearchFinding {
  at: string
  cycle: number
  query?: string
  competitors?: Competitor[]
  pricing_insights?: string
  positioning_gaps?: string
  suggested_changes?: string[]
}

interface FunnelFinding {
  summary: {
    devto?: { articles: number; views: number; engagement: number }
    subscribers?: { total: number; subRatePct: number }
    seoPages?: { count: number; note: string }
    gumroad?: { live: boolean; knownSales: number }
  }
  diagnosis: {
    weakest_step: string
    diagnosis:    string
    fix:          string
    category:     string
    priority:     string
  } | null
}

interface ListingProposal {
  cycle:            number
  at:               string
  applied:          boolean
  rationale?:       string
  new_title?:       string
  new_tagline?:     string
  new_description?: string
  confidence?:      string
}

interface Data {
  cycle: number
  latestMarket:    ResearchFinding | null
  latestFunnel:    FunnelFinding | null
  pendingListing:  ListingProposal[]
}

export default function MarketIntel() {
  const [data, setData] = useState<Data | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/market-intel', { cache: 'no-store' })
      if (!r.ok) return
      setData(await r.json())
    } catch {}
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 20_000)
    return () => clearInterval(id)
  }, [refresh])

  async function markApplied(cycle: number) {
    await fetch('/api/market-intel', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cycle, applied: true }),
    })
    refresh()
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }

  if (!data) return null
  const hasAnything = data.latestMarket || data.latestFunnel || data.pendingListing.length > 0
  if (!hasAnything) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Market Intel</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          Nothing yet — first research fires at cycle 25 (currently cycle {data.cycle}).
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Market Intel</span>
          {data.pendingListing.length > 0 && (
            <span className="text-[10px] font-mono text-amber-400 animate-pulse">
              {data.pendingListing.length} listing update{data.pendingListing.length > 1 ? 's' : ''} ready
            </span>
          )}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
        >
          {expanded ? '↑ collapse' : '↓ expand all'}
        </button>
      </div>

      {/* ── Pending listing updates (highest priority) ─────────────────────── */}
      {data.pendingListing.map(p => (
        <div key={p.cycle} className="px-4 py-3 border-b border-slate-800/40 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-amber-300 font-bold tracking-wider">
              📝 LISTING UPDATE · cycle {p.cycle} · confidence {p.confidence}
            </span>
            <button
              onClick={() => markApplied(p.cycle)}
              className="text-[10px] font-mono px-2 py-0.5 rounded border border-green-900/60 text-green-400 hover:bg-green-950/30"
            >
              ✓ MARK APPLIED
            </button>
          </div>
          <div className="text-[11px] text-slate-400 mb-2 italic">{p.rationale}</div>
          <div className="space-y-2">
            {p.new_title && (
              <CopyBlock label="Title" value={p.new_title} onCopy={() => copy(p.new_title!, `title-${p.cycle}`)} copied={copied === `title-${p.cycle}`} />
            )}
            {p.new_tagline && (
              <CopyBlock label="Tagline" value={p.new_tagline} onCopy={() => copy(p.new_tagline!, `tag-${p.cycle}`)} copied={copied === `tag-${p.cycle}`} />
            )}
            {p.new_description && (
              <CopyBlock label="Description" value={p.new_description} onCopy={() => copy(p.new_description!, `desc-${p.cycle}`)} copied={copied === `desc-${p.cycle}`} multiline />
            )}
          </div>
          <div className="text-[9px] font-mono text-slate-600 mt-2">
            Paste into Gumroad → <a href="https://app.gumroad.com/products" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">your products</a> → edit → save
          </div>
        </div>
      ))}

      {/* ── Latest funnel diagnosis ────────────────────────────────────────── */}
      {data.latestFunnel?.diagnosis && (
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider mb-1">
            📊 FUNNEL · weakest step: {data.latestFunnel.diagnosis.weakest_step}
          </div>
          <div className="text-[11px] text-slate-400 italic mb-2">{data.latestFunnel.diagnosis.diagnosis}</div>
          <div className="text-[11px] text-slate-300"><span className="text-amber-400">💡</span> {data.latestFunnel.diagnosis.fix}</div>
          {data.latestFunnel.summary && (
            <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] font-mono">
              <Stat label="dev.to views"  value={data.latestFunnel.summary.devto?.views} />
              <Stat label="subscribers"   value={data.latestFunnel.summary.subscribers?.total} />
              <Stat label="SEO pages"     value={data.latestFunnel.summary.seoPages?.count} />
              <Stat label="Gumroad live?" value={data.latestFunnel.summary.gumroad?.live ? 'yes' : 'no'} />
            </div>
          )}
        </div>
      )}

      {/* ── Market research ────────────────────────────────────────────────── */}
      {data.latestMarket && (
        <div className="px-4 py-3">
          <div className="text-[10px] font-mono text-purple-400 font-bold tracking-wider mb-1">
            🔍 MARKET · {(data.latestMarket.competitors ?? []).length} competitors found · query: {(data.latestMarket.query ?? '').slice(0, 60)}
          </div>
          {data.latestMarket.pricing_insights && (
            <div className="text-[11px] text-slate-400 mb-1"><span className="text-slate-500">pricing:</span> {data.latestMarket.pricing_insights}</div>
          )}
          {data.latestMarket.positioning_gaps && (
            <div className="text-[11px] text-slate-400 mb-1"><span className="text-slate-500">gap:</span> {data.latestMarket.positioning_gaps}</div>
          )}
          {data.latestMarket.suggested_changes && data.latestMarket.suggested_changes.length > 0 && (
            <ul className="text-[11px] text-slate-300 space-y-0.5 mt-2">
              {data.latestMarket.suggested_changes.slice(0, 3).map((s, i) => (
                <li key={i}>💡 {s}</li>
              ))}
            </ul>
          )}
          {expanded && (data.latestMarket.competitors ?? []).length > 0 && (
            <div className="mt-3 space-y-2 pt-3 border-t border-slate-800/40">
              {(data.latestMarket.competitors ?? []).slice(0, 5).map((c, i) => (
                <div key={i} className="text-[11px]">
                  <span className="text-slate-200 font-bold">{c.name}</span>
                  {c.price && <span className="text-slate-500 ml-2">{c.price}</span>}
                  {c.positioning && <div className="text-slate-400">{c.positioning}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <div className="text-slate-600">{label}</div>
      <div className="text-slate-200 font-bold">{value ?? '—'}</div>
    </div>
  )
}

function CopyBlock({ label, value, onCopy, copied, multiline }: {
  label: string; value: string; onCopy: () => void; copied: boolean; multiline?: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-mono text-slate-600 tracking-wider uppercase">{label}</span>
        <button
          onClick={onCopy}
          className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400 hover:text-slate-200"
        >
          {copied ? '✓ copied' : '📋 copy'}
        </button>
      </div>
      <pre className={`text-[11px] text-slate-300 bg-slate-950 border border-slate-800/60 rounded p-2 ${multiline ? 'whitespace-pre-wrap max-h-40 overflow-y-auto' : 'truncate'}`}>
        {value}
      </pre>
    </div>
  )
}
