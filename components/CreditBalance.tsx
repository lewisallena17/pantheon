'use client'

import { useEffect, useState } from 'react'

interface CostApi {
  dailyLimit:         number
  todaySpend:         number
  burnPerHour:        number
  cost3h:             number
  estimatedBalance:   number | null
  topupAt:            string
  creditStatus:       'exhausted' | 'low' | 'ok' | 'unknown'
  hoursUntilDailyCap: number | null
  hoursUntilZero:     number | null
}

function fmt(n: number) { return n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}` }

function fmtDuration(h: number | null) {
  if (h === null || !Number.isFinite(h) || h < 0) return '—'
  if (h >= 24) return `${Math.floor(h / 24)}d ${Math.round(h % 24)}h`
  if (h >= 1)  return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
  return `${Math.round(h * 60)}m`
}

export default function CreditBalance() {
  const [data, setData] = useState<CostApi | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/cost', { cache: 'no-store' })
        if (r.ok) setData(await r.json())
      } catch {}
    }
    load()
    const id = setInterval(load, 15_000)
    return () => clearInterval(id)
  }, [])

  if (!data) return null

  const { creditStatus, estimatedBalance, burnPerHour, hoursUntilZero, hoursUntilDailyCap, todaySpend, dailyLimit } = data

  const style =
    creditStatus === 'exhausted' ? 'border-red-700/70  bg-red-950/50  text-red-300'    :
    creditStatus === 'low'       ? 'border-amber-700/60 bg-amber-950/40 text-amber-300' :
    creditStatus === 'ok'        ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-300' :
                                   'border-slate-700/50 bg-slate-900/40 text-slate-400'

  const dot =
    creditStatus === 'exhausted' ? 'bg-red-500 animate-pulse'    :
    creditStatus === 'low'       ? 'bg-amber-400 animate-pulse'  :
    creditStatus === 'ok'        ? 'bg-emerald-500'              :
                                   'bg-slate-500'

  // When we have a real topup value, lead with balance + ETA; otherwise show burn-rate only.
  const label = (() => {
    if (creditStatus === 'exhausted') return 'CREDIT EXHAUSTED'
    if (estimatedBalance !== null) {
      const eta = hoursUntilZero !== null && hoursUntilZero > 0 && hoursUntilZero < 99
        ? ` · ${fmtDuration(hoursUntilZero)} left`
        : ''
      return `${fmt(estimatedBalance)}${eta}`
    }
    return `${fmt(burnPerHour)}/h burn`
  })()

  const tooltip = [
    `Today: ${fmt(todaySpend)} / ${fmt(dailyLimit)} daily cap`,
    `Burn rate (3h avg): ${fmt(burnPerHour)}/h`,
    hoursUntilDailyCap !== null ? `Daily cap in: ${fmtDuration(hoursUntilDailyCap)}` : null,
    estimatedBalance !== null ? `Est. balance: ${fmt(estimatedBalance)}` : 'Set ANTHROPIC_CREDITS_USD + ANTHROPIC_CREDITS_AT in .env.local for balance tracking',
    creditStatus === 'exhausted' ? '⛔ API returning credit error — top up at console.anthropic.com/billing' : null,
  ].filter(Boolean).join('\n')

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="tabular-nums">{label}</span>
    </span>
  )
}
