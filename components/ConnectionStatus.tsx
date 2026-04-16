'use client'

import type { RealtimeStatus } from './TodosTable'

const STATUS_UI: Record<RealtimeStatus, { dot: string; label: string; color: string }> = {
  CONNECTING:    { dot: 'bg-yellow-400 animate-pulse', label: 'SYNCING',       color: 'text-yellow-400 border-yellow-500/30' },
  SUBSCRIBED:    { dot: 'bg-green-400 pulse-live',     label: 'LIVE',          color: 'text-green-400 border-green-500/30' },
  CHANNEL_ERROR: { dot: 'bg-red-400 animate-pulse',    label: 'LINK ERROR',    color: 'text-red-400 border-red-500/30' },
  TIMED_OUT:     { dot: 'bg-red-400',                  label: 'TIMED OUT',     color: 'text-red-400 border-red-500/30' },
  CLOSED:        { dot: 'bg-slate-500',                label: 'DISCONNECTED',  color: 'text-slate-400 border-slate-600/30' },
}

export default function ConnectionStatus({ status }: { status: RealtimeStatus }) {
  const { dot, label, color } = STATUS_UI[status] ?? STATUS_UI.CONNECTING
  return (
    <div className={`flex items-center gap-2 text-xs font-mono tracking-widest px-3 py-1.5 rounded border bg-black/60 ${color}`}>
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </div>
  )
}
