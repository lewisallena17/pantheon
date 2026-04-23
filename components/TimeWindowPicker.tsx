'use client'

import { useTimeWindow, type TimeWindow } from '@/lib/useTimeWindow'

const OPTIONS: Array<{ key: TimeWindow; label: string }> = [
  { key: '24h', label: '24h' },
  { key: '7d',  label: '7d'  },
  { key: '30d', label: '30d' },
  { key: 'all', label: 'all' },
]

export default function TimeWindowPicker() {
  const { window: w, setWindow } = useTimeWindow()
  return (
    <div className="inline-flex rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      {OPTIONS.map(o => (
        <button
          key={o.key}
          onClick={() => setWindow(o.key)}
          className={`px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase transition-colors ${
            w === o.key ? 'bg-cyan-900/40 text-cyan-300' : 'text-slate-500 hover:bg-slate-900/40'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
