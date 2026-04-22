'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Full-screen morphing orb that appears when God has something to say.
 * Pairs with VoiceNarrator — the narrator plays audio, this is the visual
 * accompaniment. Open WebUI + Siri pattern. Fades in/out around the speech
 * event so it's a "Jarvis answering" moment, not constant background.
 */
export default function JarvisVoiceOrb() {
  const [visible, setVisible] = useState(false)
  const [thought, setThought] = useState('')
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Only show if user has voice enabled
    const voiceEnabled = (() => {
      try { return localStorage.getItem('dash:voice-enabled') === '1' } catch { return false }
    })()
    if (!voiceEnabled) return

    const supabase = createClient()
    const channel = supabase
      .channel('voice-orb')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'god_status', filter: 'id=eq.1' }, (payload) => {
        const row = payload.new as { thought?: string } | null
        const next = row?.thought ?? ''
        if (!next) return
        setThought(next.replace(/[⛔★◈◉◎◆✓✕▲▼]/g, '').trim().slice(0, 200))
        setVisible(true)
        if (hideTimer.current) clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setVisible(false), 5_500)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[8000] pointer-events-none flex items-center justify-center"
      style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.05), transparent 55%)' }}
    >
      {/* Morphing blob layers — 5 stacked rings at different speeds + hues */}
      <div className="relative" style={{ width: 320, height: 320 }}>
        {[
          { size: 320, dur: 5.5,  hue: 190, op: 0.15, blur: 20 },
          { size: 260, dur: 4.2,  hue: 200, op: 0.25, blur: 16 },
          { size: 200, dur: 3.3,  hue: 195, op: 0.40, blur: 12 },
          { size: 150, dur: 2.6,  hue: 205, op: 0.55, blur: 8  },
          { size: 100, dur: 2.0,  hue: 210, op: 0.75, blur: 4  },
        ].map((layer, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              inset:            `calc(50% - ${layer.size / 2}px)`,
              left:             `calc(50% - ${layer.size / 2}px)`,
              top:              `calc(50% - ${layer.size / 2}px)`,
              width:            layer.size,
              height:           layer.size,
              background:       `radial-gradient(circle at 50% 50%, hsla(${layer.hue}, 90%, 60%, ${layer.op}), transparent 70%)`,
              filter:           `blur(${layer.blur}px)`,
              animation:        `orb-morph ${layer.dur}s ease-in-out infinite`,
              animationDelay:   `${i * 0.15}s`,
              mixBlendMode:     'screen',
            }}
          />
        ))}

        {/* Center core */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 'calc(50% - 22px)',
            width: 44,
            height: 44,
            background: 'radial-gradient(circle, #ffffff, rgba(6,182,212,0.8) 60%, transparent)',
            boxShadow: '0 0 40px rgba(6,182,212,0.9), 0 0 80px rgba(6,182,212,0.5)',
            animation: 'orb-core 1.4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Caption underneath */}
      {thought && (
        <div className="absolute bottom-[22%] max-w-xl px-6 text-center">
          <div className="text-[10px] font-mono tracking-[0.3em] text-cyan-500/80 uppercase mb-1">J.A.R.V.I.S.</div>
          <div className="text-base text-cyan-200 font-mono leading-snug" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            {thought}
          </div>
        </div>
      )}
    </div>
  )
}
