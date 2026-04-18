'use client'

import { useEffect } from 'react'

// Caught by Next.js when any client component in the `app/` tree throws.
// Keeps the rest of the app navigable and gives the user a way to retry.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded border border-red-900/40 bg-red-950/20 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-mono tracking-[0.2em] text-red-400 uppercase">◈ Client Error</span>
        </div>
        <h2 className="text-sm font-mono text-slate-200">Something threw in a component</h2>
        <p className="text-[11px] font-mono text-slate-400 break-words">
          {error.message || 'Unknown error'}
        </p>
        {error.digest && (
          <p className="text-[9px] font-mono text-slate-600">digest: {error.digest}</p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={reset}
            className="text-[10px] font-mono px-3 py-1.5 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
          >
            ↻ RETRY
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-[10px] font-mono px-3 py-1.5 rounded border border-slate-700/50 text-slate-400 hover:bg-slate-800/30"
          >
            ↺ HARD REFRESH
          </button>
        </div>
      </div>
    </div>
  )
}
