'use client'

import { useEffect, useState, useRef } from 'react'

interface BriefingEntry {
  at:     string
  date:   string
  file:   string
  script: string
  bytes:  number
}

interface ApiResponse {
  daily?:  BriefingEntry[]
  weekly?: BriefingEntry[]
}

const AUTO_PLAY_KEY = 'dash:auto-briefing-played'

export default function JarvisBriefing() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [tab, setTab]   = useState<'daily' | 'weekly'>('daily')
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/briefings', { cache: 'no-store' })
        if (r.ok) setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  // Auto-play today's daily briefing the first time the page loads
  useEffect(() => {
    if (!data) return
    const today = new Date().toISOString().slice(0, 10)
    const latest = data.daily?.[0]
    if (!latest || latest.date !== today) return
    try {
      const played = localStorage.getItem(AUTO_PLAY_KEY)
      if (played === today) return
      localStorage.setItem(AUTO_PLAY_KEY, today)
      // Gentle auto-play — browsers block audio without user interaction so it
      // may silently fail; we still mark "played" so we don't retry all day.
      play(latest.file)
    } catch {}
  }, [data])

  function play(file: string) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    const audio = new Audio(`/briefings/${file}`)
    audioRef.current = audio
    audio.play()
      .then(() => setPlaying(file))
      .catch(() => setPlaying(null))
    audio.onended = () => setPlaying(null)
  }

  function stop() {
    if (audioRef.current) audioRef.current.pause()
    setPlaying(null)
  }

  const entries = (tab === 'daily' ? data?.daily : data?.weekly) ?? []

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Jarvis Briefings</span>
          <span className="text-[10px] font-mono text-slate-600">auto-plays the morning one</span>
        </div>
        <div className="flex gap-1">
          {(['daily', 'weekly'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border tracking-wider ${
                tab === t
                  ? 'border-cyan-700/60 bg-cyan-950/40 text-cyan-300'
                  : 'border-slate-700/50 bg-slate-900/40 text-slate-500'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="px-4 py-3 text-[11px] font-mono text-slate-600">
          No {tab} briefing yet. {tab === 'daily' ? 'Runs every morning at 07:05.' : 'Runs every Sunday at 18:00.'}
        </div>
      ) : (
        <div className="divide-y divide-slate-800/30 max-h-60 overflow-y-auto">
          {entries.map(e => {
            const isPlaying = playing === e.file
            return (
              <div key={e.file} className="px-4 py-2 flex items-center gap-3">
                <button
                  onClick={() => isPlaying ? stop() : play(e.file)}
                  className={`flex-shrink-0 h-8 w-8 rounded-full border flex items-center justify-center transition-colors ${
                    isPlaying
                      ? 'border-cyan-600/60 bg-cyan-950/50 text-cyan-300 animate-pulse'
                      : 'border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-cyan-700/60 hover:text-cyan-300'
                  }`}
                >
                  {isPlaying ? '■' : '▶'}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono text-slate-300 tabular-nums">{e.date}</div>
                  <div className="text-[10px] font-mono text-slate-500 line-clamp-2 leading-tight">{e.script.slice(0, 200)}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-700 tabular-nums">{Math.round(e.bytes / 1024)}k</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
