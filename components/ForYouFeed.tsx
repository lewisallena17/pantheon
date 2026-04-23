'use client'

import { useMemo, useState } from 'react'
import type { Todo } from '@/types/todos'
import PanelShell from './PanelShell'

interface Props { todos: Todo[] }

interface Card {
  id:        string
  kind:      'victory' | 'failure' | 'milestone' | 'risk' | 'pace'
  title:     string
  body:      string
  meta?:     string
  priority:  number  // 0-10, higher = shown first
}

const KIND_TONE: Record<Card['kind'], string> = {
  victory:   'border-emerald-700/40 bg-emerald-950/20',
  failure:   'border-red-800/40 bg-red-950/20',
  milestone: 'border-cyan-700/40 bg-cyan-950/20',
  risk:      'border-amber-700/40 bg-amber-950/20',
  pace:      'border-slate-700/40 bg-slate-900/30',
}
const KIND_ICON: Record<Card['kind'], string> = {
  victory:   '✓',
  failure:   '✗',
  milestone: '◆',
  risk:      '⚠',
  pace:      '→',
}

function poolName(agent: string | null): string | null {
  if (!agent) return null
  return agent.replace(/-[a-f0-9]{4,}$/, '')
}

/**
 * GitHub-"For You"-style curated card feed. Instead of chronological lines,
 * groups the last 7 days of activity into narrative cards sorted by what
 * matters (streaks, failures, rising stars). Complements (doesn't replace)
 * the raw LiveFeed.
 */
export default function ForYouFeed({ todos }: Props) {
  const [view, setView] = useState<'for-you' | 'all'>('for-you')

  const cards = useMemo(() => buildCards(todos), [todos])
  const shown = view === 'for-you' ? cards.slice(0, 8) : cards

  return (
    <PanelShell
      title="For You"
      icon="✦"
      tone="purple"
      collapsible
      id="for-you"
      defaultOpen={true}
      chipRight={
        <div className="inline-flex text-[9px] font-mono tracking-widest rounded overflow-hidden border border-slate-800">
          <button
            onClick={() => setView('for-you')}
            className={`px-1.5 py-0.5 uppercase ${view === 'for-you' ? 'bg-purple-900/40 text-purple-300' : 'text-slate-600 hover:bg-slate-900/40'}`}
          >top</button>
          <button
            onClick={() => setView('all')}
            className={`px-1.5 py-0.5 uppercase ${view === 'all' ? 'bg-purple-900/40 text-purple-300' : 'text-slate-600 hover:bg-slate-900/40'}`}
          >all</button>
        </div>
      }
    >
      <div className="px-3 py-2 space-y-2 max-h-80 overflow-y-auto">
        {shown.length === 0 && (
          <div className="text-[11px] font-mono text-slate-700 py-4 text-center">Nothing notable this week.</div>
        )}
        {shown.map(c => (
          <div key={c.id} className={`rounded border px-3 py-2 ${KIND_TONE[c.kind]}`}>
            <div className="flex items-baseline gap-2 text-[11px] font-mono">
              <span className="text-slate-400">{KIND_ICON[c.kind]}</span>
              <span className="text-slate-200 flex-1">{c.title}</span>
              {c.meta && <span className="text-[9px] text-slate-700">{c.meta}</span>}
            </div>
            <div className="text-[10px] font-mono text-slate-500 leading-relaxed mt-0.5">{c.body}</div>
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

function buildCards(todos: Todo[]): Card[] {
  const cards: Card[] = []
  const cutoff = Date.now() - 7 * 86_400_000
  const recent = todos.filter(t => new Date(t.updated_at).getTime() >= cutoff)

  // Failure streak detection
  const byAgent = new Map<string, { recent: Todo[] }>()
  for (const t of recent) {
    const p = poolName(t.assigned_agent)
    if (!p) continue
    const b = byAgent.get(p) ?? { recent: [] }
    b.recent.push(t)
    byAgent.set(p, b)
  }
  for (const [pool, b] of byAgent) {
    const ordered = b.recent.sort((a, c) => (a.updated_at ?? '').localeCompare(c.updated_at ?? ''))
    const last3   = ordered.slice(-3)
    if (last3.length >= 3 && last3.every(t => t.status === 'failed')) {
      cards.push({
        id:       `streak-fail-${pool}`,
        kind:     'failure',
        title:    `${pool} just failed 3 in a row`,
        body:     `Last failure: "${last3[last3.length - 1].title.slice(0, 60)}…". Consider rolling back or inspecting its recent prompt changes.`,
        priority: 9,
      })
    }
    const last3done = ordered.slice(-3)
    if (last3done.length >= 3 && last3done.every(t => t.status === 'completed')) {
      cards.push({
        id:       `streak-win-${pool}`,
        kind:     'victory',
        title:    `${pool} is on a hot streak`,
        body:     `3 successful completions back to back — whatever it's doing, it's working.`,
        priority: 6,
      })
    }
  }

  // Week milestone
  const doneCount = recent.filter(t => t.status === 'completed').length
  if (doneCount >= 20) {
    cards.push({
      id:       'milestone-20',
      kind:     'milestone',
      title:    `${doneCount} tasks shipped this week`,
      body:     'Above the 20/week pace — the swarm is healthy.',
      priority: 7,
    })
  } else if (doneCount > 0 && doneCount < 5) {
    cards.push({
      id:       'pace-slow',
      kind:     'pace',
      title:    `Only ${doneCount} tasks completed this week`,
      body:     'Pace is below typical cadence. Check the queue depth and cost cap.',
      priority: 4,
    })
  }

  // Stale blocked tasks
  const stale = todos.filter(t => (t.status === 'blocked' || t.status === 'pending') && Date.now() - new Date(t.updated_at).getTime() > 2 * 86_400_000)
  if (stale.length > 0) {
    cards.push({
      id:       'risk-stale',
      kind:     'risk',
      title:    `${stale.length} task${stale.length === 1 ? '' : 's'} stuck > 48h`,
      body:     stale.slice(0, 2).map(t => `• ${t.title.slice(0, 50)}`).join(' · '),
      priority: 8,
    })
  }

  // High-retry warnings
  const flakyWinners = todos.filter(t => t.status === 'completed' && t.retry_count >= 3)
  if (flakyWinners.length > 0) {
    cards.push({
      id:       'risk-flaky',
      kind:     'risk',
      title:    `${flakyWinners.length} task${flakyWinners.length === 1 ? '' : 's'} only passed after 3+ retries`,
      body:     'Worth inspecting — either the agent is underperforming or the tasks are underspecified.',
      priority: 5,
    })
  }

  // Oldest recent completion as a pacing win
  const recentDone = recent.filter(t => t.status === 'completed').sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
  if (recentDone[0]) {
    cards.push({
      id:       'recent-done',
      kind:     'victory',
      title:    `Latest ship: "${recentDone[0].title.slice(0, 60)}${recentDone[0].title.length > 60 ? '…' : ''}"`,
      body:     `Completed by ${poolName(recentDone[0].assigned_agent) ?? 'unknown'} at ${new Date(recentDone[0].updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      meta:     new Date(recentDone[0].updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      priority: 3,
    })
  }

  return cards.sort((a, b) => b.priority - a.priority)
}
