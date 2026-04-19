'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY   = 'dash:voice-enabled'
const COOLDOWN_MS   = 3500   // min gap between utterances, otherwise we talk over ourselves
const MAX_CHARS     = 160    // trim long thoughts; TTS on a long string is jarring

/**
 * Speaks God's "thought" field out loud whenever it changes.
 * Uses the browser's built-in SpeechSynthesis API — no external service, no cost.
 * Opt-in via a header toggle; muted by default so the dashboard doesn't surprise-speak.
 */
export default function VoiceNarrator() {
  const [enabled, setEnabled] = useState(false)
  const lastThoughtRef   = useRef<string>('')
  const lastSpokenAtRef  = useRef<number>(0)
  const voiceRef         = useRef<SpeechSynthesisVoice | null>(null)

  // Hydrate persisted choice
  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === '1') setEnabled(true) } catch {}
  }, [])

  // Pick a pleasant default voice once available
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      // Prefer a natural en-GB/en-US voice; fall back to first en-*
      voiceRef.current =
        voices.find(v => /en.?GB/i.test(v.lang) && /(natural|google|daniel)/i.test(v.name)) ||
        voices.find(v => /en.?US/i.test(v.lang) && /(natural|google|samantha|alex)/i.test(v.name)) ||
        voices.find(v => /^en/i.test(v.lang)) ||
        voices[0]
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
  }, [])

  // Subscribe to god_status changes
  useEffect(() => {
    if (!enabled) return
    const supabase = createClient()

    // Initial read to seed lastThought so we don't speak a stale one on mount
    supabase.from('god_status').select('thought').eq('id', 1).single().then(({ data }) => {
      const thought = (data as { thought?: string } | null)?.thought
      if (thought) lastThoughtRef.current = thought
    })

    const channel = supabase
      .channel('god-thoughts-tts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'god_status', filter: 'id=eq.1' }, (payload) => {
        const next = (payload.new as { thought?: string } | null)?.thought ?? ''
        if (!next || next === lastThoughtRef.current) return
        lastThoughtRef.current = next
        speak(next)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [enabled])

  function speak(raw: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const now = Date.now()
    if (now - lastSpokenAtRef.current < COOLDOWN_MS) return

    // Strip terminal '...' and collapse whitespace for cleaner prosody
    const cleaned = raw.replace(/\.{2,}$/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS)
    if (!cleaned) return

    const utt = new SpeechSynthesisUtterance(cleaned)
    utt.rate   = 1.02
    utt.pitch  = 0.95
    utt.volume = 0.85
    if (voiceRef.current) utt.voice = voiceRef.current
    window.speechSynthesis.cancel() // drop anything queued so latest always wins
    window.speechSynthesis.speak(utt)
    lastSpokenAtRef.current = now
  }

  function toggle() {
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    if (!next && typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }

  return (
    <button
      onClick={toggle}
      title={enabled ? 'God\'s thoughts are being read aloud. Click to mute.' : 'Click to have God\'s thoughts read aloud via browser TTS.'}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        enabled
          ? 'border-purple-700/60 bg-purple-950/40 text-purple-300'
          : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={enabled ? 'text-purple-400' : 'text-slate-600'}>
        {enabled ? '◉' : '○'}
      </span>
      VOICE {enabled ? 'ON' : 'OFF'}
    </button>
  )
}
