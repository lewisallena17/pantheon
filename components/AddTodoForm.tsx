'use client'

import { useState } from 'react'
import type { TodoPriority, TodoStatus } from '@/types/todos'

export default function AddTodoForm() {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TodoPriority>('medium')
  const [status, setStatus] = useState<TodoStatus>('pending')
  const [agent, setAgent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        priority,
        status,
        assigned_agent: agent.trim() || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'TRANSMISSION FAILED')
    } else {
      setTitle('')
      setAgent('')
    }
    setLoading(false)
  }

  const inputClass = "w-full bg-black/60 border border-cyan-900/60 rounded text-cyan-100 text-xs font-mono px-3 py-2 focus:outline-none focus:border-cyan-500/80 focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] placeholder-slate-600 transition-all"
  const selectClass = "bg-black/60 border border-cyan-900/60 rounded text-cyan-100 text-xs font-mono px-3 py-2 focus:outline-none focus:border-cyan-500/80 transition-all"
  const labelClass = "block text-xs font-mono tracking-widest text-slate-500 mb-1 uppercase"

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border border-cyan-900/40 bg-black/40 p-4 space-y-3 glow-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-cyan-500 text-xs">◈</span>
        <span className="text-xs font-mono tracking-[0.25em] text-cyan-600 uppercase">Inject New Task</span>
        <div className="flex-1 h-px bg-cyan-900/40" />
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-48">
          <label className={labelClass}>Directive</label>
          <input
            required
            className={inputClass}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="task description..."
          />
        </div>

        <div>
          <label className={labelClass}>Priority</label>
          <select className={selectClass} value={priority} onChange={e => setPriority(e.target.value as TodoPriority)}>
            {(['low', 'medium', 'high', 'critical'] as TodoPriority[]).map(p => (
              <option key={p} value={p}>{p.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select className={selectClass} value={status} onChange={e => setStatus(e.target.value as TodoStatus)}>
            {(['pending', 'in_progress', 'completed', 'failed', 'blocked'] as TodoStatus[]).map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Agent ID</label>
          <input
            className={`${inputClass} w-36`}
            value={agent}
            onChange={e => setAgent(e.target.value)}
            placeholder="agent-id"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-5 py-2 text-xs font-mono tracking-widest uppercase rounded border border-cyan-500/60 text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(0,212,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '[ SENDING... ]' : '[ INJECT ]'}
        </button>
      </div>

      {error && (
        <p className="text-xs font-mono text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 rounded">
          ⚠ {error}
        </p>
      )}
    </form>
  )
}
