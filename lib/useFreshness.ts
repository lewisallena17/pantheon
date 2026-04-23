'use client'

import { useEffect, useState } from 'react'

const STORAGE_PREFIX = 'panel-seen:'

/**
 * "New since last visit" signal. Each panel passes a stable id + a current
 * data-signature (hash, count, latest timestamp — whatever changes when the
 * panel's content is materially different). Returns `isNew=true` if the
 * signature differs from the last one the user saw. Calling `markSeen()`
 * clears the new state + stores the current signature.
 *
 * Typical usage:
 *   const { isNew, markSeen } = useFreshness('trophy-case', `${earnedCount}`)
 *   <PanelShell isNew={isNew} ... onClick={markSeen}>
 */
export function useFreshness(panelId: string, signature: string | number | undefined | null) {
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    if (signature === undefined || signature === null) return
    const sig = String(signature)
    try {
      const seen = localStorage.getItem(STORAGE_PREFIX + panelId)
      setIsNew(seen !== null && seen !== sig)
    } catch {
      setIsNew(false)
    }
  }, [panelId, signature])

  function markSeen() {
    if (signature === undefined || signature === null) return
    try { localStorage.setItem(STORAGE_PREFIX + panelId, String(signature)) } catch {}
    setIsNew(false)
  }

  return { isNew, markSeen }
}

/** Auto-marks seen after N seconds — useful for panels the user definitely
 *  saw (e.g. anything above-the-fold). */
export function useFreshnessAutoMark(panelId: string, signature: string | number | undefined | null, delayMs = 4000) {
  const { isNew, markSeen } = useFreshness(panelId, signature)
  useEffect(() => {
    if (!isNew) return
    const id = setTimeout(markSeen, delayMs)
    return () => clearTimeout(id)
  }, [isNew, markSeen, delayMs])
  return { isNew, markSeen }
}
