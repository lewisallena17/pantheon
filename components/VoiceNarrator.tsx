'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'dash:voice-enabled'
const MAX_CHARS   = 400

/**
 * Jarvis narrator. Primary path: server-side /api/tts proxies to ElevenLabs
 * (George voice by default) and streams an MP3 blob we play via <audio>.
 * Fallback: browser SpeechSynthesis — used when no API key is set, when
 * ElevenLabs returns 401/429 (credit/rate), or when fetch fails entirely.
 *
 * Opt-in via a header toggle; muted by default.
 */
export default function VoiceNarrator() {
  const [enabled, setEnabled]     = useState(false)
  const [premium, setPremium]     = useState(false)     // true = ElevenLabs key present
  const [charsUsed, setCharsUsed] = useState(0)         // session usage counter

  const lastTextRef   = useRef<string>('')
  const voiceRef      = useRef<SpeechSynthesisVoice | null>(null)
  const queueRef      = useRef<string[]>([])
  const speakingRef   = useRef<boolean>(false)
  const audioRef      = useRef<HTMLAudioElement | null>(null)

  // Hydrate persisted choice + discover premium capability
  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === '1') setEnabled(true) } catch {}
    fetch('/api/tts').then(r => r.json()).then(d => { setPremium(Boolean(d?.enabled)) }).catch(() => {})
    if (typeof window !== 'undefined') audioRef.current = new Audio()
  }, [])

  // Fallback voice picker — UK male prioritized for when ElevenLabs is unavailable
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const score = (v: SpeechSynthesisVoice) => {
        let s = 0
        const n = v.name.toLowerCase()
        if (/en.?gb/i.test(v.lang)) s += 100
        if (/ryan|george|daniel/.test(n)) s += 70
        if (/google uk english male/.test(n)) s += 60
        if (/natural|neural/.test(n)) s += 30
        if (/female|zira|hazel|susan/.test(n)) s -= 80
        return s
      }
      voiceRef.current = [...voices].sort((a, b) => score(b) - score(a))[0] ?? voices[0]
    }
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
  }, [])

  // Subscribe to god_status changes
  useEffect(() => {
    if (!enabled) return
    const supabase = createClient()

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
        queueRef.current.push(...buildUtterances(thought, row?.meta))
        drainQueue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      stopAll()
      queueRef.current = []
    }
  }, [enabled])

  function stopAll() {
    if (typeof window === 'undefined') return
    window.speechSynthesis?.cancel()
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    speakingRef.current = false
  }

  async function speakPremium(text: string): Promise<boolean> {
    try {
      const r = await fetch('/api/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      if (!r.ok) return false
      const blob = await r.blob()
      if (!blob.size) return false

      // Track character usage from the header we set server-side
      const chars = Number(r.headers.get('X-TTS-Chars') ?? text.length)
      setCharsUsed(c => c + (Number.isFinite(chars) ? chars : 0))

      const url = URL.createObjectURL(blob)
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.src = url
      await audio.play()
      return await new Promise<boolean>((resolve) => {
        const cleanup = () => { URL.revokeObjectURL(url); resolve(true) }
        audio.onended = cleanup
        audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
      })
    } catch {
      return false
    }
  }

  function speakBrowser(text: string): Promise<boolean> {
    return new Promise(resolve => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return resolve(false)
      const utt = new SpeechSynthesisUtterance(text)
      utt.rate   = 0.92
      utt.pitch  = 0.82
      utt.volume = 0.9
      if (voiceRef.current) utt.voice = voiceRef.current
      utt.onend   = () => resolve(true)
      utt.onerror = () => resolve(false)
      window.speechSynthesis.speak(utt)
    })
  }

  async function drainQueue() {
    if (speakingRef.current) return
    speakingRef.current = true
    while (queueRef.current.length) {
      const next = queueRef.current.shift()
      if (!next) break
      const premiumOK = premium ? await speakPremium(next) : false
      if (!premiumOK) await speakBrowser(next)
      await new Promise(r => setTimeout(r, 180))
    }
    speakingRef.current = false
  }

  function toggle() {
    const next = !enabled
    setEnabled(next)
    try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0') } catch {}
    if (!next) { stopAll(); queueRef.current = [] }
    else {
      queueRef.current.push(premium ? 'Jarvis online. Ready, sir.' : "I'll narrate as I think.")
      drainQueue()
    }
  }

  const label = premium ? 'JARVIS' : 'VOICE'
  const title = enabled
    ? (premium ? `ElevenLabs active · ${charsUsed} chars used this session. Click to mute.` : 'Browser TTS active. Set ELEVENLABS_API_KEY for premium voice.')
    : (premium ? 'Click to enable Jarvis (ElevenLabs, British male).' : 'Click for browser TTS. Set ELEVENLABS_API_KEY for real Jarvis.')

  return (
    <button
      onClick={toggle}
      title={title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        enabled
          ? (premium ? 'border-amber-600/60 bg-amber-950/40 text-amber-300' : 'border-purple-700/60 bg-purple-950/40 text-purple-300')
          : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={enabled ? (premium ? 'text-amber-400' : 'text-purple-400') : 'text-slate-600'}>
        {enabled ? '◉' : '○'}
      </span>
      {label} {enabled ? 'ON' : 'OFF'}
      {enabled && premium && charsUsed > 0 && (
        <span className="text-amber-400/70 tabular-nums">{Math.round(charsUsed / 1000)}k</span>
      )}
    </button>
  )
}

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
  }
  return out.filter(Boolean)
}
