'use client'

import { useState, useRef, useEffect } from 'react'
import PanelShell from './PanelShell'

interface Turn { q: string; a: string | null; err?: string; t: number }

/**
 * Conversational slot for asking God grounded questions. Keeps the last
 * 5 turns in localStorage so reloading doesn't nuke the transcript.
 */
export default function AskGod() {
  const [q, setQ]         = useState('')
  const [busy, setBusy]   = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const boxRef            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ask-god:turns')
      if (raw) setTurns(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem('ask-god:turns', JSON.stringify(turns.slice(-5))) } catch {}
  }, [turns])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, busy])

  async function ask(e?: React.FormEvent) {
    e?.preventDefault()
    const question = q.trim()
    if (!question || busy) return
    setBusy(true)
    setQ('')
    const t = Date.now()
    setTurns(prev => [...prev, { q: question, a: null, t }])
    try {
      const res  = await fetch('/api/god-chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question }) })
      const json = await res.json() as { reply?: string; error?: string }
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setTurns(prev => prev.map(x => x.t === t ? { ...x, a: json.reply ?? '(empty reply)' } : x))
    } catch (err) {
      setTurns(prev => prev.map(x => x.t === t ? { ...x, a: null, err: err instanceof Error ? err.message : 'failed' } : x))
    } finally {
      setBusy(false)
    }
  }

  function clear() { setTurns([]) }

  return (
    <PanelShell
      title="Ask God"
      icon="◉"
      tone="purple"
      chipRight={turns.length > 0 ? (
        <button onClick={clear} className="text-[10px] font-mono text-slate-600 hover:text-slate-300">clear</button>
      ) : null}
    >
      <div ref={boxRef} className="max-h-64 overflow-y-auto px-3 py-2 space-y-3">
        {turns.length === 0 && (
          <div className="text-[11px] font-mono text-slate-600 leading-relaxed">
            Ask a grounded question — God will answer using current status, roadmap, recent lessons, and cost context.
            <div className="mt-1.5 text-slate-700">Examples: <span className="text-slate-500">why did the last task fail?</span> · <span className="text-slate-500">what should I focus on today?</span></div>
          </div>
        )}
        {turns.map(t => (
          <div key={t.t} className="space-y-1">
            <div className="text-[11px] font-mono text-cyan-400">
              <span className="text-slate-700">you:</span> {t.q}
            </div>
            {t.a !== null ? (
              <div className="text-[11px] font-mono text-purple-300 leading-relaxed whitespace-pre-wrap">
                <span className="text-slate-700">god:</span> {t.a}
              </div>
            ) : t.err ? (
              <div className="text-[11px] font-mono text-red-500">god: {t.err}</div>
            ) : (
              <div className="text-[11px] font-mono text-slate-600 animate-pulse">god is thinking…</div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={ask} className="flex gap-2 px-3 py-2 border-t border-slate-800/60 bg-black/40">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ask god…"
          maxLength={500}
          disabled={busy}
          className="flex-1 bg-transparent text-[12px] font-mono text-slate-200 placeholder:text-slate-700 outline-none"
        />
        <button
          type="submit"
          disabled={busy || !q.trim()}
          className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase disabled:text-slate-700"
        >
          {busy ? '…' : 'ask →'}
        </button>
      </form>
    </PanelShell>
  )
}
