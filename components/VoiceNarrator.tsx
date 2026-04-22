'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'dash:voice-enabled'
const MAX_CHARS   = 400

type TtsEngine = 'elevenlabs' | 'edge' | 'browser'

/**
 * Jarvis narrator — three-tier priority:
 *   1. ElevenLabs   — if ELEVENLABS_API_KEY set server-side (premium)
 *   2. Edge Neural  — free Microsoft Edge Ryan voice via /api/tts/edge
 *   3. Browser TTS  — last-resort fallback when both above are unavailable
 *
 * Opt-in via header toggle; persisted to localStorage.
 */
export default function VoiceNarrator() {
  const [enabled, setEnabled]     = useState(false)
  const [engine, setEngine]       = useState<TtsEngine>('browser')
  const [charsUsed, setCharsUsed] = useState(0)

  const lastTextRef = useRef<string>('')
  const voiceRef    = useRef<SpeechSynthesisVoice | null>(null)
  const queueRef    = useRef<string[]>([])
  const speakingRef = useRef<boolean>(false)
  const audioRef    = useRef<HTMLAudioElement | null>(null)

  // Hydrate + discover what's available
  useEffect(() => {
    try { if (localStorage.getItem(STORAGE_KEY) === '1') setEnabled(true) } catch {}
    // Priority: ElevenLabs (if paid key) → Edge (free neural, no key)
    fetch('/api/tts').then(r => r.json()).then(d => {
      if (d?.enabled) setEngine('elevenlabs')
      else setEngine('edge')
    }).catch(() => setEngine('edge'))
    if (typeof window !== 'undefined') audioRef.current = new Audio()
  }, [])

  // Fallback voice picker for browser TTS
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices()
      if (!voices.length) return
      const score = (v: SpeechSynthesisVoice) => {
        let s = 0
        const n = v.name.toLowerCase()
        if (/en.?gb/i.test(v.lang)) s += 100
        if (/ryan|george|daniel|alan/.test(n)) s += 70
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

  async function speakElevenLabs(text: string): Promise<boolean> {
    try {
      const r = await fetch('/api/tts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      if (!r.ok) return false
      const blob = await r.blob()
      if (!blob.size) return false
      setCharsUsed(c => c + Number(r.headers.get('X-TTS-Chars') ?? text.length))
      return await playBlob(blob)
    } catch { return false }
  }

  async function speakEdge(text: string): Promise<boolean> {
    try {
      const r = await fetch('/api/tts/edge', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      })
      if (!r.ok) return false
      const blob = await r.blob()
      if (!blob.size) return false
      setCharsUsed(c => c + Number(r.headers.get('X-TTS-Chars') ?? text.length))
      return await playBlob(blob)
    } catch { return false }
  }

  function playBlob(blob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob)
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.src = url
      audio.play()
        .then(() => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve(true) }
          audio.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
        })
        .catch(() => { URL.revokeObjectURL(url); resolve(false) })
    })
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
      let ok = false
      if      (engine === 'elevenlabs') ok = await speakElevenLabs(next)
      else if (engine === 'edge')       ok = await speakEdge(next)
      // Any failure → fall through to browser TTS so the queue never stalls
      if (!ok) await speakBrowser(next)
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
      const opener =
        engine === 'elevenlabs' ? 'Jarvis online. Ready, sir.' :
        engine === 'edge'       ? 'Good evening, sir. Systems online.' :
                                  "I'll narrate as I think."
      queueRef.current.push(opener)
      drainQueue()
    }
  }

  const label =
    engine === 'elevenlabs' ? 'JARVIS+' :
    engine === 'edge'       ? 'JARVIS' :
                              'VOICE'

  const tone =
    engine === 'elevenlabs' ? 'border-amber-600/60 bg-amber-950/40 text-amber-300' :
    engine === 'edge'       ? 'border-cyan-700/60  bg-cyan-950/40  text-cyan-300'    :
                              'border-purple-700/60 bg-purple-950/40 text-purple-300'

  const title = !enabled
    ? (engine === 'elevenlabs' ? 'Click to enable premium Jarvis voice (ElevenLabs).' :
       engine === 'edge'       ? 'Click to enable free neural Jarvis voice (Edge Ryan).' :
                                 'Click to enable narration (browser TTS).')
    : (engine === 'elevenlabs' ? `ElevenLabs · ${charsUsed} chars this session. Click to mute.` :
       engine === 'edge'       ? `Edge neural (Ryan) · ${charsUsed} chars. Click to mute.` :
                                 'Browser TTS. Click to mute.')

  return (
    <button
      onClick={toggle}
      title={title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider transition-colors ${
        enabled ? tone : 'border-slate-700/50 bg-slate-900/40 text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className={enabled ? '' : 'text-slate-600'}>{enabled ? '◉' : '○'}</span>
      {label} {enabled ? 'ON' : 'OFF'}
      {enabled && charsUsed > 0 && (
        <span className="opacity-70 tabular-nums">{Math.round(charsUsed / 1000)}k</span>
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
      if (titles.length === 1)    out.push(`Decreeing: ${clean(titles[0])}`)
      else if (titles.length > 1) out.push(`Decreeing ${titles.length} tasks. First: ${clean(titles[0])}`)
    }
    const lesson = typeof meta.lesson === 'string' ? meta.lesson : null
    if (lesson) out.push(`Lesson learned. ${clean(lesson)}`)
    const postmortem = typeof meta.postmortem === 'string' ? meta.postmortem : null
    if (postmortem) out.push(`Postmortem. ${clean(postmortem)}`)
  }
  return out.filter(Boolean)
}
