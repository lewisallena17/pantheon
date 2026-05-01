'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  /** Left-side panel title, rendered in small-caps mono */
  title: string
  /** Optional left-of-title icon or glyph (a single character is ideal) */
  icon?: string
  /** Small chip rendered just right of title — e.g. a status label */
  chipLeft?: ReactNode
  /** Right-aligned text or chip — e.g. counts, latency, filter toggles */
  chipRight?: ReactNode
  /** When true, starts closed and can be toggled */
  collapsible?: boolean
  /** Default state if collapsible */
  defaultOpen?: boolean
  /** Stable id — used for localStorage open-state persistence */
  id?: string
  /** Tone variant for accent borders (default neutral) */
  tone?: 'default' | 'cyan' | 'amber' | 'red' | 'emerald' | 'purple' | 'yellow'
  /** Optional NEW badge (rendered inline next to the title) */
  isNew?: boolean
  /** Body */
  children: ReactNode
}

const TONES: Record<NonNullable<Props['tone']>, { border: string; headerBg: string; accent: string }> = {
  default:  { border: 'border-slate-800/60',    headerBg: 'bg-black/60',        accent: 'text-slate-500' },
  cyan:     { border: 'border-cyan-800/40',     headerBg: 'bg-cyan-950/30',     accent: 'text-cyan-400' },
  amber:    { border: 'border-amber-800/40',    headerBg: 'bg-amber-950/30',    accent: 'text-amber-400' },
  red:      { border: 'border-red-800/50',      headerBg: 'bg-red-950/30',      accent: 'text-red-400' },
  emerald:  { border: 'border-emerald-800/50',  headerBg: 'bg-emerald-950/30',  accent: 'text-emerald-400' },
  purple:   { border: 'border-purple-800/50',   headerBg: 'bg-purple-950/30',   accent: 'text-purple-400' },
  yellow:   { border: 'border-yellow-900/40',   headerBg: 'bg-black/60',        accent: 'text-yellow-500' },
}

/**
 * The one true panel shape. Every dashboard card should use this.
 * Consistent header (title + chips), optional collapsibility with persisted
 * open-state, consistent border tones per category.
 */
export default function PanelShell({
  title,
  icon,
  chipLeft,
  chipRight,
  collapsible = false,
  defaultOpen = true,
  id,
  tone = 'default',
  isNew = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const t = TONES[tone]

  // Hydrate collapsible state from localStorage
  useEffect(() => {
    if (!collapsible || !id) return
    try {
      const saved = localStorage.getItem(`panel:${id}:open`)
      if (saved !== null) setOpen(saved === '1')
    } catch {}
  }, [collapsible, id])

  function toggle() {
    if (!collapsible) return
    const next = !open
    setOpen(next)
    if (id) {
      try { localStorage.setItem(`panel:${id}:open`, next ? '1' : '0') } catch {}
    }
  }

  // Toggle target is the title-side button; chipRight sits outside it as a
  // sibling so callers can pass interactive controls (other <button>s) in
  // chipRight without nesting buttons (which causes a hydration error).
  return (
    <div className={`rounded border ${t.border} bg-black/40 overflow-hidden transition-colors`}>
      <div className={`flex items-center justify-between gap-3 px-4 py-2 border-b ${t.border} ${t.headerBg}`}>
        <button
          type="button"
          onClick={toggle}
          disabled={!collapsible}
          aria-expanded={open}
          className={`flex items-center gap-2.5 min-w-0 flex-1 text-left ${collapsible ? 'cursor-pointer hover:opacity-90' : 'cursor-default'}`}
        >
          {icon && <span className={`flex-shrink-0 ${t.accent}`}>{icon}</span>}
          <span className={`text-xs font-mono tracking-[0.2em] ${t.accent} uppercase truncate`}>{title}</span>
          {chipLeft && <span className="flex-shrink-0">{chipLeft}</span>}
          {isNew && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-mono text-cyan-300 animate-pulse">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400" />
              new
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {chipRight}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              aria-label={open ? 'Collapse' : 'Expand'}
              className={`text-[10px] font-mono ${t.accent} opacity-60 hover:opacity-100`}
            >
              {open ? '▴' : '▾'}
            </button>
          )}
        </div>
      </div>

      {open && <div>{children}</div>}
    </div>
  )
}
