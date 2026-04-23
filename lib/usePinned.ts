'use client'

import { useEffect, useState } from 'react'

/**
 * Generic "pin a thing" localStorage hook. Callers supply a namespace
 * (e.g. 'agent' or 'goal') so different pin sets don't collide.
 */
export function usePinned(namespace: string) {
  const [pins, setPins] = useState<string[]>([])
  const key = `pins:${namespace}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) setPins(JSON.parse(raw))
    } catch {}
  }, [key])

  function save(next: string[]) {
    setPins(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
  }

  function toggle(id: string) {
    save(pins.includes(id) ? pins.filter(x => x !== id) : [...pins, id])
  }

  function isPinned(id: string) { return pins.includes(id) }

  return { pins, toggle, isPinned }
}
