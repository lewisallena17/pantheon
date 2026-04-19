'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dash:dense'

/**
 * Dashboard is readable by default. This toggle opts INTO the original dense
 * 9/10/11px cyberpunk aesthetic for people who want it. Persists to localStorage.
 */
export default function ReadableModeToggle() {
  const [dense, setDense] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setDense(true)
        document.body.classList.add('dash-dense')
      }
    } catch {}
  }, [])

  function toggle() {
    const next = !dense
    setDense(next)
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    document.body.classList.toggle('dash-dense', next)
  }

  return (
    <button
      onClick={toggle}
      title={dense ? 'Back to readable-sized text.' : 'Shrink to the original dense cyberpunk sizing.'}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        dense
          ? 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
          : 'border-cyan-700/60 bg-cyan-950/40 text-cyan-300'
      }`}
    >
      <span className={dense ? 'text-slate-600' : 'text-cyan-400'}>{dense ? 'a' : 'A'}</span>
      {dense ? 'DENSE' : 'READABLE'}
    </button>
  )
}
