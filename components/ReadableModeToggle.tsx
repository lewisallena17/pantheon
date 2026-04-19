'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dash:readable'

/**
 * Toggles a `dash-readable` class on <body>. Globals.css responds with larger
 * sizes + brighter dim-text palette. Zero per-component edits required.
 */
export default function ReadableModeToggle() {
  const [enabled, setEnabled] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setEnabled(true)
        document.body.classList.add('dash-readable')
      }
    } catch {}
  }, [])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    document.body.classList.toggle('dash-readable', next)
  }

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Shrink text back to the default dense layout.' : 'Bump all text up one size for easier reading.'}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        enabled
          ? 'border-cyan-700/60 bg-cyan-950/40 text-cyan-300'
          : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={enabled ? 'text-cyan-400' : 'text-slate-600'}>{enabled ? 'A+' : 'A'}</span>
      READABLE
    </button>
  )
}
