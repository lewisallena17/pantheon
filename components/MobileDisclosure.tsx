'use client'

import { useState, type ReactNode } from 'react'

interface Props {
  /** Stable id — remembered in localStorage so mobile users don't re-toggle */
  id: string
  /** Small label shown on the collapsed mobile button */
  label: string
  /** Optional hint rendered next to the label (e.g. "12 pools") */
  hint?: string
  children: ReactNode
}

/**
 * Hides heavy panels behind a tap target on mobile screens. On md+ breakpoints
 * the panel renders normally — the disclosure only applies below 768px wide.
 * Saves a lot of vertical scroll on phones without hiding anything on desktop.
 */
export default function MobileDisclosure({ id, label, hint, children }: Props) {
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try { return localStorage.getItem(`md:${id}:open`) === '1' } catch { return false }
  })

  function toggle() {
    const next = !open
    setOpen(next)
    try { localStorage.setItem(`md:${id}:open`, next ? '1' : '0') } catch {}
  }

  return (
    <>
      {/* Mobile: collapsed by default behind a disclosure button */}
      <div className="md:hidden">
        {open ? (
          <div className="space-y-1">
            <button
              onClick={toggle}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded border border-slate-800/50 bg-black/40 text-[10px] font-mono text-slate-500 hover:bg-slate-900/40"
            >
              <span className="tracking-widest">▴ HIDE {label.toUpperCase()}</span>
              {hint && <span className="text-slate-700">{hint}</span>}
            </button>
            {children}
          </div>
        ) : (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded border border-slate-800/60 bg-black/40 hover:bg-slate-900/40 transition-colors"
          >
            <span className="text-[11px] font-mono tracking-[0.2em] text-slate-400 uppercase">▾ {label}</span>
            {hint && <span className="text-[10px] font-mono text-slate-600">{hint}</span>}
          </button>
        )}
      </div>

      {/* Desktop: always rendered, no toggle */}
      <div className="hidden md:block">{children}</div>
    </>
  )
}
