'use client'

import { useEffect, useState } from 'react'

interface Shortcut { keys: string[]; label: string }

const SHORTCUTS: Shortcut[] = [
  { keys: ['?'],         label: 'Open this cheat-sheet' },
  { keys: ['1'],         label: 'Switch to Overview tab' },
  { keys: ['2'],         label: 'Switch to Tasks tab' },
  { keys: ['3'],         label: 'Switch to Agents tab' },
  { keys: ['4'],         label: 'Switch to Revenue tab' },
  { keys: ['5'],         label: 'Switch to Code tab' },
  { keys: ['Ctrl', 'K'], label: 'Open command palette' },
  { keys: ['Cmd', 'K'],  label: 'Open command palette (Mac)' },
  { keys: ['Esc'],       label: 'Close any open drawer / modal' },
  { keys: ['↑/↓'],       label: 'Navigate command palette items' },
  { keys: ['Enter'],     label: 'Confirm command palette / send Ask God' },
]

/**
 * Press `?` from anywhere (outside text inputs) to see all keyboard shortcuts.
 * Closes on Esc, click-outside, or another `?`.
 */
export default function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded border border-slate-700/60 bg-slate-950 shadow-2xl overflow-hidden"
      >
        <header className="px-4 py-3 border-b border-slate-800/60 bg-black/60 flex items-center justify-between">
          <span className="text-xs font-mono tracking-[0.2em] text-cyan-400 uppercase">⌘ Keyboard</span>
          <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-200 text-xl leading-none">×</button>
        </header>
        <div className="px-4 py-3 space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.label} className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map(k => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900/60 text-slate-300 text-[10px] tabular-nums"
                  >{k}</kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <footer className="px-4 py-2 border-t border-slate-800/60 bg-black/40 text-[10px] font-mono text-slate-700">
          press <kbd className="px-1 py-0.5 rounded border border-slate-700 bg-slate-900/60 text-slate-400">?</kbd> again or <kbd className="px-1 py-0.5 rounded border border-slate-700 bg-slate-900/60 text-slate-400">Esc</kbd> to close
        </footer>
      </div>
    </div>
  )
}
