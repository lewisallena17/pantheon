'use client'

import { useEffect, useState, useCallback } from 'react'

interface Commit {
  sha:          string
  shortSha:     string
  subject:      string
  author:       string
  date:         string
  filesChanged: number
  isGod:        boolean
}

export default function GitHistory() {
  const [commits, setCommits]   = useState<Commit[]>([])
  const [branch,  setBranch]    = useState<string>('')
  const [error,   setError]     = useState<string | null>(null)
  const [busy,    setBusy]      = useState<string | null>(null)
  const [showAll, setShowAll]   = useState(false)

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/git/log?n=30', { cache: 'no-store' })
      if (!r.ok) throw new Error(await r.text())
      const j = await r.json() as { commits: Commit[]; currentBranch: string }
      setCommits(j.commits)
      setBranch(j.currentBranch)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'git log failed')
    }
  }, [])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 10_000)
    return () => clearInterval(id)
  }, [refresh])

  async function revert(sha: string, subject: string) {
    if (!confirm(`Revert "${subject.slice(0, 60)}"?\n\nThis creates a new commit that undoes ${sha}.`)) return
    setBusy(sha)
    try {
      const r = await fetch('/api/git/revert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sha }),
      })
      if (!r.ok) {
        const j = await r.json() as { error?: string }
        throw new Error(j.error ?? 'revert failed')
      }
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'revert failed')
    } finally {
      setBusy(null)
    }
  }

  const visible = showAll ? commits : commits.slice(0, 8)
  const godCommits = commits.filter(c => c.isGod).length

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ Git History</span>
          {branch && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-800/50">
              ⎇ {branch}
            </span>
          )}
          {godCommits > 0 && (
            <span className="text-[10px] font-mono text-amber-400">{godCommits} by GOD</span>
          )}
        </div>
        <span className="text-[9px] font-mono text-slate-600">
          click commit to revert
        </span>
      </div>

      {error && (
        <div className="px-4 py-1.5 border-b border-red-900/40 bg-red-950/20 text-[10px] font-mono text-red-400">
          ⚠ {error}
        </div>
      )}

      {commits.length === 0 ? (
        <div className="px-4 py-6 text-center text-[11px] font-mono text-slate-600">
          No commits yet
        </div>
      ) : (
        <div className="divide-y divide-slate-800/40">
          {visible.map(c => (
            <div
              key={c.sha}
              className={`px-4 py-2 flex items-center gap-3 hover:bg-slate-900/30 ${c.isGod ? 'bg-amber-950/10' : ''}`}
            >
              <span className={`font-mono text-[10px] ${c.isGod ? 'text-amber-400' : 'text-slate-500'}`}>
                {c.shortSha}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-300 truncate">
                  {c.isGod && <span className="text-amber-500 mr-1">👁</span>}
                  {c.subject}
                </div>
                <div className="text-[9px] font-mono text-slate-600 mt-0.5 flex items-center gap-2">
                  <span>{c.author}</span>
                  <span>·</span>
                  <span>{timeAgo(c.date)}</span>
                  {c.filesChanged > 0 && <><span>·</span><span>{c.filesChanged} file{c.filesChanged > 1 ? 's' : ''}</span></>}
                </div>
              </div>

              <button
                onClick={() => revert(c.sha, c.subject)}
                disabled={busy !== null}
                className="text-[10px] font-mono px-2 py-1 rounded border border-red-900/50 text-red-400 hover:bg-red-950/40 disabled:opacity-40 shrink-0"
              >
                {busy === c.sha ? '…' : '↶ REVERT'}
              </button>
            </div>
          ))}

          {commits.length > 8 && (
            <div className="px-4 py-1.5 text-center">
              <button
                onClick={() => setShowAll(s => !s)}
                className="text-[10px] font-mono text-slate-500 hover:text-cyan-400"
              >
                {showAll ? '↑ show less' : `↓ show ${commits.length - 8} more`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
