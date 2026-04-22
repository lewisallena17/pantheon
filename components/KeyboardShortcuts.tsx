'use client'

import { useEffect, useState } from 'react'

const SHORTCUTS: Array<{ key: string; label: string; section: string }> = [
  { section: 'Navigation', key: '1',   label: 'Overview tab' },
  { section: 'Navigation', key: '2',   label: 'Tasks tab' },
  { section: 'Navigation', key: '3',   label: 'Agents tab' },
  { section: 'Navigation', key: '4',   label: 'Revenue tab' },
  { section: 'Navigation', key: '5',   label: 'Code tab' },
  { section: 'Navigation', key: '⌘K',  label: 'Command palette' },
  { section: 'Search',     key: '/',   label: 'Focus task search (on Tasks tab)' },
  { section: 'Search',     key: 'Esc', label: 'Clear search / close modal' },
  { section: 'Help',       key: '?',   label: 'Show this help' },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement
      const typing = tgt?.tagName === 'INPUT' || tgt?.tagName === 'TEXTAREA' || tgt?.isContentEditable
      if (typing) return
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300 text-[10px] font-mono tracking-wider transition-colors"
        title="Keyboard shortcuts (press ?)"
      >
        <kbd className="text-[9px] px-1 py-px rounded border border-slate-700">?</kbd>
        SHORTCUTS
      </button>
    )
  }

  const sections = [...new Set(SHORTCUTS.map(s => s.section))]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyan-700/60 bg-cyan-950/40 text-cyan-300 text-[10px] font-mono tracking-wider"
      >
        <kbd className="text-[9px] px-1 py-px rounded border border-cyan-700">?</kbd>
        SHORTCUTS
      </button>

      {/* Modal overlay */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[8500] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      >
        <div
          className="relative max-w-md w-full mx-4 rounded-lg border border-cyan-700/60 bg-slate-950 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-900/50 bg-black/60">
            <span className="text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              ⌨ Keyboard Shortcuts
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-200 text-lg"
              aria-label="close"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {sections.map(section => (
              <div key={section}>
                <div className="text-[10px] font-mono tracking-[0.2em] text-slate-600 uppercase mb-2">{section}</div>
                <div className="space-y-1">
                  {SHORTCUTS.filter(s => s.section === section).map(s => (
                    <div key={s.key} className="flex items-center gap-3 text-[12px] font-mono">
                      <kbd className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded border border-slate-700 bg-slate-900 text-cyan-300 text-[11px] font-bold">
                        {s.key}
                      </kbd>
                      <span className="text-slate-300">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-2 border-t border-slate-800/50 text-[10px] font-mono text-slate-600 text-center">
            Press <kbd className="px-1 rounded border border-slate-700">?</kbd> or <kbd className="px-1 rounded border border-slate-700">Esc</kbd> to close
          </div>
        </div>
      </div>
    </>
  )
}
