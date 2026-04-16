'use client'

import { useEffect, useState } from 'react'

interface Status {
  discord: boolean
  slack: boolean
  pushover: boolean
  telegram: boolean
  any: boolean
}

export default function NotificationStatus() {
  const [status, setStatus] = useState<Status | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/notify/status')
      .then(r => r.json() as Promise<Status>)
      .then(setStatus)
      .catch(() => {})
  }, [])

  async function test() {
    setBusy(true)
    setMsg(null)
    try {
      const r = await fetch('/api/notify/status', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Test from dashboard',
          message: `Ping at ${new Date().toLocaleTimeString()} — if you see this, notifications work.`,
        }),
      })
      const j = await r.json() as { ok?: boolean; sent?: number; errors?: string[]; error?: string }
      if (j.ok) setMsg(`✓ Sent to ${j.sent} channel${j.sent !== 1 ? 's' : ''}`)
      else setMsg(`✗ ${j.error ?? j.errors?.join(', ') ?? 'failed'}`)
    } catch (e) {
      setMsg(`✗ ${e instanceof Error ? e.message : 'failed'}`)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(null), 5000)
    }
  }

  if (!status) return null

  const channels = [
    { key: 'discord',  label: 'Discord',  on: status.discord  },
    { key: 'slack',    label: 'Slack',    on: status.slack    },
    { key: 'pushover', label: 'Pushover', on: status.pushover },
    { key: 'telegram', label: 'Telegram', on: status.telegram },
  ]

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Notifications</span>
          <span className={`text-[10px] font-mono ${status.any ? 'text-green-400' : 'text-slate-600'}`}>
            {status.any ? '● active' : '○ none configured'}
          </span>
        </div>
        <button
          onClick={test}
          disabled={busy || !status.any}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30 disabled:opacity-40"
          title={!status.any ? 'Configure a webhook in .env.local first' : 'Send a test ping'}
        >
          {busy ? '… sending' : '📢 TEST'}
        </button>
      </div>

      {msg && (
        <div className={`px-4 py-1.5 border-b border-slate-800/40 text-[10px] font-mono ${
          msg.startsWith('✓') ? 'text-green-400 bg-green-950/20' : 'text-red-400 bg-red-950/20'
        }`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-4 gap-px bg-slate-800/40">
        {channels.map(c => (
          <div key={c.key} className="bg-black/60 px-3 py-2 text-center">
            <div className={`text-[10px] font-mono ${c.on ? 'text-green-400' : 'text-slate-600'}`}>
              <span className={c.on ? 'text-green-400' : 'text-slate-700'}>
                {c.on ? '●' : '○'}
              </span>{' '}
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {!status.any && (
        <div className="px-4 py-2 text-[10px] font-mono text-slate-600 border-t border-slate-800/40">
          Set one in <span className="text-slate-500">.env.local</span>:{' '}
          <span className="text-slate-500">DISCORD_WEBHOOK_URL</span>,{' '}
          <span className="text-slate-500">SLACK_WEBHOOK_URL</span>,{' '}
          <span className="text-slate-500">PUSHOVER_USER+TOKEN</span>, or{' '}
          <span className="text-slate-500">TELEGRAM_BOT_TOKEN+CHAT_ID</span>.
        </div>
      )}
    </div>
  )
}
