'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY  = 'dash:voice-enabled'
const COOLDOWN_MS  = 2500
const MAX_CHARS    = 260

/**
 * Speaks God's "thought" field out loud whenever it changes — tuned for a
 * Jarvis-esque delivery: British male voice (when available), slower measured
 * pace, slightly lower pitch. Also narrates God's "meta" decision payload
 * (decreed task titles, failure postmortems, research findings) so you hear
 * the reasoning, not just the status line.
 *
 * Opt-in via a header toggle; muted by default so the dashboard doesn't
 * surprise-speak. Uses the browser's built-in SpeechSynthesis — no cost.
 */
export default function VoiceNarrator() {
  const [enabled, setEnabled] = useState(false)
  const lastSpokenAtRef = useRef<number>(0)
  const lastTextRef     = useRef<string>('')
  const voiceRef        = useRef<SpeechSynthesisVoice | null>(null)
  const queueRef        = useRef<string[]>([])

  // Hydrate persisted choice
  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === '1') setEnabled(true) } catch {}
  }, [])

  // Pick the most Jarvis-like voice available. Windows 11 has Ryan (UK neural),
  // Chrome has Google UK English Male; fall back to anything UK-male.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return

      const score = (v: SpeechSynthesisVoice) => {
        let s = 0
        const name = v.name.toLowerCase()
        if (/en.?gb/i.test(v.lang))                         s += 100
        if (/en.?au/i.test(v.lang))                         s += 40   // Aus male is also passable
        if (/en/i.test(v.lang))                             s += 20
        // UK male neural-quality names
        if (/ryan/.test(name))                              s += 80   // Windows 11 neural UK male
        if (/george/.test(name))                            s += 60
        if (/daniel/.test(name))                            s += 55   // macOS UK male
        if (/google uk english male/.test(name))            s += 70
        if (/british.*male|uk.*male|male.*british|male.*uk/.test(name)) s += 50
        if (/natural|neural|premium|online/.test(name))     s += 30
        // Penalties
        if (/female|zira|hazel|susan|samantha|karen/.test(name)) s -= 80
        if (/child|kid|junior/.test(name))                  s -= 30
        return s
      }

      const ranked = voices.map(v => ({ v, s: score(v) })).sort((a, b) => b.s - a.s)
      voiceRef.current = ranked[0]?.v ?? voices[0]
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
  }, [])

  // Subscribe to god_status changes (thought + meta)
  useEffect(() => {
    if (!enabled) return
    const supabase = createClient()

    // Seed last-thought so we don't speak a stale one on mount
    supabase.from('god_status').select('thought').eq('id', 1).single().then(({ data }) => {
      const thought = (data as { thought?: string } | null)?.thought
      if (thought) lastTextRef.current = thought
    })

    const channel = supabase
      .channel('god-thoughts-tts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'god_status', filter: 'id=eq.1' }, (payload) => {
        const row = payload.new as { thought?: string; meta?: Record<string, unknown> } | null
        const thought = row?.thought ?? ''
        if (!thought || thought === lastTextRef.current) return
        lastTextRef.current = thought

        // If meta carries something richer (decrees, postmortems, findings), prepend
        // those as follow-up utterances so the narration reflects actual reasoning.
        const utterances = buildUtterances(thought, row?.meta)
        queueRef.current.push(...utterances)
        drainQueue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
      queueRef.current = []
    }
  }, [enabled])

  function drainQueue() {
    if (!queueRef.current.length) return
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    // Serial delivery: speak one, then speak the next after `end`
    function speakNext() {
      const next = queueRef.current.shift()
      if (!next) return
      const utt = new SpeechSynthesisUtterance(next)
      utt.rate   = 0.92   // measured, Jarvis-like
      utt.pitch  = 0.82   // slightly lower register
      utt.volume = 0.9
      if (voiceRef.current) utt.voice = voiceRef.current
      utt.onend   = () => { setTimeout(speakNext, 180) }
      utt.onerror = () => { setTimeout(speakNext, 180) }
      window.speechSynthesis.speak(utt)
      lastSpokenAtRef.current = Date.now()
    }

    // If nothing is currently speaking, start; otherwise let `onend` pick it up.
    if (!window.speechSynthesis.speaking) speakNext()
  }

  function toggle() {
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    if (!next && typeof window !== 'undefined') {
      window.speechSynthesis?.cancel()
      queueRef.current = []
    }
    if (next) {
      // Opener so the user hears confirmation the first time they toggle on
      queueRef.current.push("Online. I'll narrate as I think.")
      drainQueue()
    }
  }

  // Mark cooldown as referenced (currently reserved for future rate-limiting)
  void lastSpokenAtRef
  void COOLDOWN_MS

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Muting Jarvis. Click to un-mute.' : 'Speak God\'s thoughts aloud (British male voice when available).'}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        enabled
          ? 'border-purple-700/60 bg-purple-950/40 text-purple-300'
          : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={enabled ? 'text-purple-400' : 'text-slate-600'}>
        {enabled ? '◉' : '○'}
      </span>
      JARVIS {enabled ? 'ON' : 'OFF'}
    </button>
  )
}

/**
 * Converts a thought line + optional meta into a narration sequence.
 *   - First line: the thought itself (cleaned)
 *   - Then: any task decrees in meta.decreed[] (read one by one)
 *   - Then: any failure postmortem, mood transition, or research headline
 * Each utterance is ≤ MAX_CHARS so the TTS engine doesn't stall.
 */
function buildUtterances(thought: string, meta?: Record<string, unknown>): string[] {
  const out: string[] = []
  const clean = (s: string) => s.replace(/[⛔★◈◉◎◆✓✕▲▼]/g, '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS)

  const primary = clean(thought)
  if (primary) out.push(primary)

  if (meta && typeof meta === 'object') {
    const decreed = Array.isArray(meta.decreed) ? meta.decreed as Array<{ title?: string }> : null
    if (decreed?.length) {
      const titles = decreed.map(d => d.title).filter(Boolean) as string[]
      if (titles.length === 1)      out.push(`Decreeing: ${clean(titles[0])}`)
      else if (titles.length > 1)   out.push(`Decreeing ${titles.length} tasks. First: ${clean(titles[0])}`)
    }

    const lesson = typeof meta.lesson === 'string' ? meta.lesson : null
    if (lesson) out.push(`Lesson learned. ${clean(lesson)}`)

    const postmortem = typeof meta.postmortem === 'string' ? meta.postmortem : null
    if (postmortem) out.push(`Postmortem. ${clean(postmortem)}`)

    const mood = typeof meta.mood === 'string' ? meta.mood : null
    const moodPrev = typeof meta.moodPrev === 'string' ? meta.moodPrev : null
    if (mood && moodPrev && mood !== moodPrev) {
      out.push(`Mood shifting from ${moodPrev.toLowerCase()} to ${mood.toLowerCase()}.`)
    }
  }

  return out.filter(Boolean)
}
