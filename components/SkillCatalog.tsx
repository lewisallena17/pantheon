'use client'

import { useEffect, useMemo, useState } from 'react'

interface MemEntry { agent: string; lesson: string; at: string; idx: number }

/**
 * Groups agent-memory lessons into named "skills" using keyword heuristics.
 * Each skill gets a usage count and a success-ratio estimate (lessons prefixed
 * with ✓ or "succeeded" count as wins; "failed" or "cost cap" as misses).
 */
const SKILL_RULES: Array<{ name: string; icon: string; match: RegExp }> = [
  { name: 'Database queries',      icon: '🗄', match: /\b(select|insert|update|delete|query|agent_exec_sql|schema|table|rows?|postgres)\b/i },
  { name: 'Task routing',          icon: '⇌', match: /\b(rout(e|ing)|dispatch|specialist|assign|queue|priority|category)\b/i },
  { name: 'Budget & cost control', icon: '💰', match: /\b(budget|cost|token|limit|cap|spend|burn|cheap|haiku)\b/i },
  { name: 'Failure recovery',      icon: '⟲', match: /\b(fail|retry|error|revert|rollback|exception|regression)\b/i },
  { name: 'Code generation',       icon: '⎇', match: /\b(commit|diff|patch|refactor|implement|write\s+file|create\s+file|tsx|ts\s|jsx)\b/i },
  { name: 'Memory & learning',     icon: '◉', match: /\b(lesson|memory|recall|jaccard|dedupe?|wisdom|history|reflect)\b/i },
  { name: 'Market & revenue',      icon: '$', match: /\b(market|revenue|gumroad|subscriber|funnel|competitor|listing|pricing|seo)\b/i },
  { name: 'Security & audit',      icon: '◈', match: /\b(security|audit|vulnerab|owasp|injection|xss|rls|sanitize|auth)\b/i },
  { name: 'Git & deploys',         icon: '⎔', match: /\b(git|deploy|vercel|branch|push|pull|release|pipeline|ci)\b/i },
  { name: 'Other',                 icon: '·', match: /./ },
]

function classify(lesson: string) {
  for (const rule of SKILL_RULES) {
    if (rule.match.test(lesson)) return rule.name
  }
  return 'Other'
}

function isWin(lesson: string) {
  if (/\b(fail|error|cost\s+cap\s+hit|token\s+budget\s+reached)/i.test(lesson)) return false
  if (/✓|succeeded/i.test(lesson)) return true
  return null // unknown — don't count
}

export default function SkillCatalog() {
  const [entries, setEntries] = useState<MemEntry[]>([])
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/shared-memory', { cache: 'no-store' })
        if (r.ok) setEntries(((await r.json()).entries ?? []) as MemEntry[])
      } catch {}
    }
    load()
    const id = setInterval(load, 8000)
    return () => clearInterval(id)
  }, [])

  const skills = useMemo(() => {
    const acc = new Map<string, { name: string; icon: string; uses: number; wins: number; losses: number; recent: MemEntry[] }>()
    for (const rule of SKILL_RULES) {
      acc.set(rule.name, { name: rule.name, icon: rule.icon, uses: 0, wins: 0, losses: 0, recent: [] })
    }
    for (const e of entries) {
      const name = classify(e.lesson)
      const s = acc.get(name)!
      s.uses += 1
      const w = isWin(e.lesson)
      if (w === true) s.wins += 1
      else if (w === false) s.losses += 1
      if (s.recent.length < 5) s.recent.push(e)
    }
    return [...acc.values()]
      .filter(s => s.uses > 0)
      .sort((a, b) => b.uses - a.uses)
  }, [entries])

  if (!entries.length) {
    return (
      <div className="rounded border border-slate-800/60 bg-black/40 px-4 py-3">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◆ Skill Catalog</span>
        <div className="text-[11px] font-mono text-slate-600 mt-1">
          No skills yet. Agents populate this as they complete tasks.
        </div>
      </div>
    )
  }

  const totalUses = skills.reduce((s, x) => s + x.uses, 0)

  return (
    <div className="rounded border border-slate-800/60 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 bg-black/60">
        <span className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◆ Skill Catalog</span>
        <span className="text-[10px] font-mono text-slate-600">{skills.length} skills · {totalUses} lessons</span>
      </div>
      <div className="divide-y divide-slate-800/30">
        {skills.map(s => {
          const rated = s.wins + s.losses
          const winPct = rated > 0 ? Math.round((s.wins / rated) * 100) : null
          const pct = totalUses > 0 ? (s.uses / totalUses) * 100 : 0
          const expanded = expandedSkill === s.name
          return (
            <div key={s.name}>
              <button
                onClick={() => setExpandedSkill(expanded ? null : s.name)}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-900/30 transition-colors text-left"
              >
                <span className="text-sm">{s.icon}</span>
                <span className="text-[11px] font-mono text-slate-300 w-44 truncate">{s.name}</span>
                <div className="flex-1 h-1 bg-slate-900 rounded overflow-hidden">
                  <div className="h-full bg-cyan-700/60" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-slate-500 tabular-nums w-10 text-right">{s.uses}</span>
                {winPct !== null && (
                  <span className={`text-[10px] font-mono tabular-nums w-12 text-right ${
                    winPct >= 80 ? 'text-emerald-400' : winPct >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {winPct}%
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-600">{expanded ? '▲' : '▼'}</span>
              </button>
              {expanded && (
                <div className="px-4 pb-3 space-y-1">
                  {s.recent.map((e, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-500 flex gap-2 leading-snug">
                      <span className="text-purple-500/70 flex-shrink-0">{e.agent}</span>
                      <span className="flex-1 break-words">{e.lesson.slice(0, 180)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
