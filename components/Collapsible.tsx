'use client'

import { useEffect, useState, type ReactNode } from 'react'

interface Props {
  id:            string
  title?:        string
  defaultOpen?:  boolean
  children:      ReactNode
}

export default function Collapsible({ id, title, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`collapse:${id}`)
      if (saved !== null) setOpen(saved === 'open')
    } catch {}
    setLoaded(true)
  }, [id])

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem(`collapse:${id}`, open ? 'open' : 'closed') } catch {}
  }, [open, id, loaded])

  if (!title) return <>{children}</>

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-2 py-1 text-[9px] font-mono text-slate-600 hover:text-slate-300 transition-colors"
      >
        <span className="font-bold">{open ? '▼' : '▶'}</span>
        <span className="tracking-[0.2em] uppercase">{title}</span>
        <span className="flex-1 h-px bg-slate-800/40 ml-2" />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}
