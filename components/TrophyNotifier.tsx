'use client'

import { useEffect, useState, useRef } from 'react'
import type { Todo } from '@/types/todos'
import { TROPHIES, earnedTrophies, type Trophy } from '@/lib/trophies'

interface Props { todos: Todo[] }

const SEEN_KEY = 'dash:trophies-seen'
const POP_DURATION_MS = 6000

const TIER_STYLE: Record<Trophy['tier'], string> = {
  bronze:    'border-amber-700/60 bg-amber-950/50 text-amber-300',
  silver:    'border-slate-400/60 bg-slate-800/60 text-slate-200',
  gold:      'border-yellow-500/70 bg-yellow-950/60 text-yellow-300',
  legendary: 'border-fuchsia-500/70 bg-fuchsia-950/60 text-fuchsia-300 animate-pulse',
}

function loadSeen(): Set<string> {
  try { return new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')) } catch { return new Set() }
}

function saveSeen(set: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set])) } catch {}
}

export default function TrophyNotifier({ todos }: Props) {
  const [active, setActive] = useState<Trophy[]>([])
  const seenRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    seenRef.current = loadSeen()
  }, [])

  useEffect(() => {
    const earned = earnedTrophies({ todos })
    const fresh = earned.filter(t => !seenRef.current.has(t.id))
    if (!fresh.length) return

    // Mark as seen + enqueue pop-ups
    for (const t of fresh) seenRef.current.add(t.id)
    saveSeen(seenRef.current)

    // Stack them one-by-one so all fresh unlocks get their moment
    for (const [i, t] of fresh.entries()) {
      setTimeout(() => {
        setActive(prev => [...prev, t])
        setTimeout(() => setActive(prev => prev.filter(x => x.id !== t.id)), POP_DURATION_MS)
      }, i * 800)
    }
  }, [todos])

  if (!active.length) return null

  return (
    <div className="fixed bottom-10 right-4 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite">
      {active.map(t => (
        <div
          key={t.id}
          className={`w-80 rounded border-2 ${TIER_STYLE[t.tier]} backdrop-blur-sm px-4 py-3 shadow-2xl transition-all duration-500`}
          style={{ animation: 'trophy-in 0.5s ease-out' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
              {t.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-mono tracking-widest uppercase opacity-70">
                Achievement Unlocked · {t.tier}
              </div>
              <div className="text-base font-black tracking-wide" style={{ fontFamily: 'Orbitron, monospace' }}>
                {t.title}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5 font-mono">{t.description}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Trophy Case panel (separate export) — shows everything earned so far
export function TrophyCase({ todos }: Props) {
  const earned = earnedTrophies({ todos })
  const earnedIds = new Set(earned.map(t => t.id))

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">🏆 Trophy Case</span>
        <span className="text-[10px] font-mono text-slate-600">{earned.length} / {TROPHIES.length} unlocked</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
        {TROPHIES.map(t => {
          const unlocked = earnedIds.has(t.id)
          return (
            <div
              key={t.id}
              className={`rounded border px-3 py-2 flex items-center gap-3 ${
                unlocked ? TIER_STYLE[t.tier] : 'border-slate-800/60 bg-slate-900/40 text-slate-700'
              }`}
              title={t.description}
            >
              <span className={`text-2xl ${unlocked ? '' : 'grayscale opacity-40'}`}>{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] font-mono font-bold truncate ${unlocked ? '' : 'text-slate-500'}`}>
                  {t.title}
                </div>
                <div className="text-[9px] font-mono opacity-70 truncate">
                  {unlocked ? t.description : '???'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
