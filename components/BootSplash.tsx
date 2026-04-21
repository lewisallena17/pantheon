'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dash:boot-shown'

// Terminal lines printed one-by-one before the dashboard appears. Keep these
// short — the whole sequence should land under 1.8s so it's immersive, not
// annoying. Session-storage gates it to once per tab.
const LINES = [
  'J.A.R.V.I.S. online.',
  'Initializing neural task matrix…',
  'Supabase realtime: ACTIVE',
  'Council convened.',
  'Agent pools: 5 online.',
  'Systems nominal. Ready, sir.',
]

export default function BootSplash() {
  const [visible, setVisible] = useState(false)
  const [shown, setShown]     = useState(0)
  const [fadingOut, setFading] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setVisible(true)

    let i = 0
    const tick = () => {
      i += 1
      setShown(i)
      if (i < LINES.length) setTimeout(tick, 180)
      else {
        // Hold final frame briefly, then fade
        setTimeout(() => setFading(true), 600)
        setTimeout(() => setVisible(false), 1200)
      }
    }
    setTimeout(tick, 150)
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Radial glow backdrop */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.12), transparent 60%)' }} />

      {/* Concentric rings pulsing while booting */}
      <div className="absolute w-[420px] h-[420px] rounded-full border border-cyan-500/10 animate-ping-slow" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/20" />
      <div className="absolute w-[180px] h-[180px] rounded-full border-2 border-cyan-400/40" />

      <div className="relative z-10 font-mono text-left space-y-2">
        <div className="text-[10px] tracking-[0.4em] text-cyan-500/60 uppercase">System Boot</div>
        <div className="text-4xl font-black text-cyan-400 tracking-wider" style={{ fontFamily: 'Orbitron, monospace' }}>
          J.A.R.V.I.S.
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent my-3" />
        <div className="space-y-1 min-h-[180px]">
          {LINES.slice(0, shown).map((line, i) => (
            <div key={i} className={`text-sm text-cyan-300/90 ${i === shown - 1 ? 'animate-pulse' : ''}`}>
              <span className="text-cyan-700">&gt;</span> {line}
            </div>
          ))}
          {shown < LINES.length && (
            <div className="text-sm text-cyan-500/60">
              <span className="text-cyan-700">&gt;</span> <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
