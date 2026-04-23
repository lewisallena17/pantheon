'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type TimeWindow = '24h' | '7d' | '30d' | 'all'

export const WINDOW_MS: Record<Exclude<TimeWindow, 'all'>, number> = {
  '24h':       24 * 60 * 60 * 1000,
  '7d':    7 * 24 * 60 * 60 * 1000,
  '30d':  30 * 24 * 60 * 60 * 1000,
}

const TimeWindowCtx = createContext<{ window: TimeWindow; setWindow: (w: TimeWindow) => void }>({
  window: '7d',
  setWindow: () => {},
})

export function TimeWindowProvider({ children }: { children: ReactNode }) {
  const [window, setWindowState] = useState<TimeWindow>('7d')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('time-window') as TimeWindow | null
      if (saved && ['24h', '7d', '30d', 'all'].includes(saved)) setWindowState(saved)
    } catch {}
  }, [])

  function setWindow(w: TimeWindow) {
    setWindowState(w)
    try { localStorage.setItem('time-window', w) } catch {}
  }

  return <TimeWindowCtx.Provider value={{ window, setWindow }}>{children}</TimeWindowCtx.Provider>
}

export function useTimeWindow() { return useContext(TimeWindowCtx) }

/** Apply the current window to a date-like field. Returns true if within. */
export function inWindow(when: string | number | Date | null | undefined, w: TimeWindow): boolean {
  if (w === 'all') return true
  if (!when) return false
  const t = typeof when === 'number' ? when : new Date(when).getTime()
  if (!Number.isFinite(t)) return false
  return Date.now() - t < WINDOW_MS[w]
}
