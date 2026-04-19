'use client'

import { useEffect, useState } from 'react'

interface Profile {
  inferred?: {
    role?:            string
    preferences?:     string[]
    current_goals?:   string[]
    pain_points?:     string[]
    abandoned_ideas?: string[]
  }
  updated_at?: string
  cycle?:      number
}

const SECTIONS: Array<{ key: keyof NonNullable<Profile['inferred']>; label: string; icon: string; tone: string }> = [
  { key: 'current_goals',   label: 'Current Goals',   icon: '◎', tone: 'text-emerald-300 border-emerald-800/50 bg-emerald-950/20' },
  { key: 'preferences',     label: 'Preferences',     icon: '◆', tone: 'text-cyan-300    border-cyan-800/50    bg-cyan-950/20'    },
  { key: 'pain_points',     label: 'Pain Points',     icon: '⚠', tone: 'text-amber-300   border-amber-800/50   bg-amber-950/20'   },
  { key: 'abandoned_ideas', label: 'Abandoned Ideas', icon: '✕', tone: 'text-slate-400   border-slate-700/50   bg-slate-900/30'   },
]

export default function UserProfile() {
  const [data, setData] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/user-profile', { cache: 'no-store' })
        if (r.ok) setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  if (!data?.inferred) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ What God Knows About You</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No profile yet. God will build one as it watches tasks + decisions.
        </div>
      </div>
    )
  }

  const { inferred, updated_at, cycle } = data

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ What God Knows About You</span>
        <span className="text-[10px] font-mono text-slate-600">
          {cycle !== undefined && <>cycle {cycle} · </>}
          {updated_at && <>updated {relTime(updated_at)}</>}
        </span>
      </div>

      {inferred.role && (
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="text-[10px] font-mono tracking-wider text-slate-600 uppercase mb-1">Role</div>
          <div className="text-[12px] text-slate-200">{inferred.role}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/40">
        {SECTIONS.map(s => {
          const items = (inferred[s.key] as string[] | undefined) ?? []
          if (!items.length) return null
          return (
            <div key={String(s.key)} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border tracking-wider uppercase ${s.tone}`}>
                  {s.icon} {s.label}
                </span>
                <span className="text-[10px] font-mono text-slate-700">{items.length}</span>
              </div>
              <ul className="space-y-1">
                {items.map((it, i) => (
                  <li key={i} className="text-[11px] text-slate-300 leading-relaxed flex gap-2">
                    <span className="text-slate-700 flex-shrink-0">·</span>
                    <span className="flex-1">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function relTime(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60)     return `${s}s ago`
  if (s < 3600)  return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}
