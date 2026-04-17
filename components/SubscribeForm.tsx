'use client'

import { useState } from 'react'

interface Props {
  source?:    string
  title?:     string
  subtitle?:  string
  compact?:   boolean
}

export default function SubscribeForm({
  source   = 'dashboard',
  title    = 'Stay updated',
  subtitle = 'Occasional updates about the self-improving agent system — no spam.',
  compact  = false,
}: Props) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg]     = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading')
    setMsg('')

    try {
      const referrer = typeof document !== 'undefined' ? document.referrer : undefined
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source, referrer }),
      })
      const j = await r.json() as { ok?: boolean; error?: string; message?: string; already?: boolean }

      if (!r.ok || !j.ok) {
        setState('error')
        setMsg(j.error ?? 'Something went wrong')
        return
      }

      setState('success')
      setMsg(j.message ?? 'Thanks!')
      setEmail('')
    } catch (e) {
      setState('error')
      setMsg(e instanceof Error ? e.message : 'Network error')
    }
  }

  if (compact) {
    return (
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state === 'loading' || state === 'success'}
          className="flex-1 bg-black/60 border border-slate-700/60 rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-700/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading' || state === 'success'}
          className={`text-[10px] font-mono px-3 py-1.5 rounded border tracking-wider transition-colors ${
            state === 'success' ? 'border-green-700 bg-green-950/40 text-green-300' :
            state === 'error'   ? 'border-red-700 bg-red-950/40 text-red-300' :
                                  'border-cyan-700 text-cyan-300 hover:bg-cyan-950/30 disabled:opacity-40'
          }`}
        >
          {state === 'loading' ? '…' : state === 'success' ? '✓ SUBSCRIBED' : 'SUBSCRIBE'}
        </button>
      </form>
    )
  }

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 p-4">
      <h3 className="text-sm font-mono font-bold text-slate-300 tracking-widest uppercase mb-1">
        {title}
      </h3>
      <p className="text-[11px] text-slate-500 mb-3">{subtitle}</p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state === 'loading' || state === 'success'}
          className="flex-1 bg-slate-950 border border-slate-700/60 rounded px-3 py-2 text-sm font-mono text-slate-200 placeholder-slate-600 outline-none focus:border-cyan-700/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading' || state === 'success'}
          className={`text-[11px] font-mono px-4 py-2 rounded border tracking-wider uppercase transition-colors ${
            state === 'success' ? 'border-green-700 bg-green-950/40 text-green-300' :
            state === 'error'   ? 'border-red-700 bg-red-950/40 text-red-300' :
                                  'border-cyan-700 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40 disabled:opacity-40'
          }`}
        >
          {state === 'loading' ? 'Subscribing…'
           : state === 'success' ? '✓ Subscribed'
           : 'Subscribe'}
        </button>
      </form>
      {msg && (
        <p className={`mt-2 text-[11px] font-mono ${
          state === 'success' ? 'text-green-400' : state === 'error' ? 'text-red-400' : 'text-slate-500'
        }`}>
          {msg}
        </p>
      )}
    </div>
  )
}
