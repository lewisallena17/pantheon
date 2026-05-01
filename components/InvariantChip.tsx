'use client'

import { useEffect, useState } from 'react'

interface Check { name: string; ok: boolean; detail: string }
interface Health { ok: boolean; checks: Check[]; at: string }

/**
 * Surfaces broken system invariants. Polls /api/health/invariants every 60s
 * and renders a single red chip with the failing-count when something's off.
 * Hover (or expand) shows the full list — with the actual reason — so silent
 * failures (like "roadmap stuck") become loud.
 */
export default function InvariantChip() {
  const [health, setHealth] = useState<Health | null>(null)
  const [open, setOpen]     = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const r = await fetch('/api/health/invariants', { cache: 'no-store' })
        const j = await r.json() as Health
        if (!cancelled) setHealth(j)
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (!health) return null
  const failing = health.checks.filter(c => !c.ok)
  if (failing.length === 0) return null

  return (
    <div className="rounded border border-red-800/50 bg-red-950/20 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2 hover:bg-red-950/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-red-400 animate-pulse">⛔</span>
          <span className="text-[11px] font-mono tracking-[0.2em] text-red-300 uppercase">
            {failing.length} invariant{failing.length === 1 ? '' : 's'} failing
          </span>
        </div>
        <span className="text-[10px] font-mono text-red-500/70">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="px-4 py-2 border-t border-red-900/30 space-y-1">
          {failing.map(c => (
            <div key={c.name} className="text-[11px] font-mono">
              <span className="text-red-400">✗ {c.name}</span>
              <span className="text-slate-500"> — {c.detail}</span>
            </div>
          ))}
          {health.checks.filter(c => c.ok).length > 0 && (
            <div className="text-[10px] font-mono text-slate-700 pt-1 border-t border-red-900/20">
              {health.checks.filter(c => c.ok).length} other invariants healthy
            </div>
          )}
        </div>
      )}
    </div>
  )
}
