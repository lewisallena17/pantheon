'use client'

import { useEffect, useState } from 'react'
import PanelShell from './PanelShell'

interface NewsItem { source: string; title: string; link: string; pubDate: string | null }

const TONE: Record<string, string> = {
  anthropic: 'text-purple-400',
  vercel:    'text-white',
  github:    'text-emerald-400',
}

/**
 * Upstream status feed strip. Gives a heads-up when Anthropic / Vercel /
 * GitHub are reporting incidents, so a failed run can be diagnosed as
 * "their thing" vs "our thing" in seconds.
 */
export default function SystemNews() {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/system-news', { cache: 'no-store' })
        if (r.ok) setItems(((await r.json()).items ?? []) as NewsItem[])
      } catch {}
      setLoaded(true)
    }
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  if (!loaded) return null
  if (items.length === 0) return null

  return (
    <PanelShell
      title="Upstream Status"
      icon="☵"
      tone="default"
      collapsible
      id="system-news"
      defaultOpen={false}
      chipRight={<span className="text-[10px] font-mono text-slate-600">{items.length} recent</span>}
    >
      <div className="px-3 py-2 space-y-1.5 max-h-48 overflow-y-auto">
        {items.map((n, i) => (
          <a
            key={i}
            href={n.link || '#'}
            target="_blank"
            rel="noreferrer noopener"
            className="block text-[11px] font-mono hover:bg-slate-900/40 px-2 py-1 rounded transition-colors"
          >
            <div className="flex items-baseline gap-2">
              <span className={`text-[9px] tracking-widest uppercase ${TONE[n.source] ?? 'text-slate-500'}`}>{n.source}</span>
              <span className="text-[9px] text-slate-700">
                {n.pubDate ? new Date(n.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
              </span>
            </div>
            <div className="text-slate-300 leading-snug truncate">{n.title}</div>
          </a>
        ))}
      </div>
    </PanelShell>
  )
}
