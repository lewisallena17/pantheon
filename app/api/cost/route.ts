import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

const COST_LOG_PATH = join(process.cwd(), 'scripts', 'cost-log.json')
const GOD_ERR_LOG   = join(process.env.USERPROFILE || process.env.HOME || '', '.pm2', 'logs', 'god-error.log')

export const dynamic = 'force-dynamic'

interface Session { at: string; agent: string; cost: number; inputTokens: number; outputTokens: number }

function readCostLog() {
  try {
    if (!existsSync(COST_LOG_PATH)) return { total: 0, byAgent: {}, sessions: [] as Session[] }
    return JSON.parse(readFileSync(COST_LOG_PATH, 'utf8'))
  } catch {
    return { total: 0, byAgent: {}, sessions: [] as Session[] }
  }
}

/** Sum cost of sessions whose timestamp is within the last `minutes` minutes. */
function costWithin(sessions: Session[], minutes: number) {
  const cutoff = Date.now() - minutes * 60_000
  return sessions
    .filter(s => s.at && new Date(s.at).getTime() >= cutoff)
    .reduce((sum, s) => sum + (s.cost ?? 0), 0)
}

function costSince(sessions: Session[], iso: string) {
  if (!iso) return 0
  const cutoff = new Date(iso).getTime()
  if (!Number.isFinite(cutoff)) return 0
  return sessions
    .filter(s => s.at && new Date(s.at).getTime() >= cutoff)
    .reduce((sum, s) => sum + (s.cost ?? 0), 0)
}

/** Cheap tail of the pm2 error log — last 80 lines, looking for credit errors in the last 10 min. */
function recentCreditExhaustion(): boolean {
  try {
    if (!existsSync(GOD_ERR_LOG)) return false
    const raw = readFileSync(GOD_ERR_LOG, 'utf8')
    // Keep the tail cheap
    const tail = raw.slice(-12_000).split('\n').slice(-80)
    const tenMinAgo = Date.now() - 10 * 60_000

    for (const line of tail) {
      if (!/credit|CREDIT/.test(line)) continue
      // pm2 prefixes lines with a timestamp like "2026-04-19T..."; try to parse
      const tsMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      if (tsMatch) {
        const ts = new Date(tsMatch[0]).getTime()
        if (Number.isFinite(ts) && ts >= tenMinAgo) return true
      } else {
        // No timestamp — if "credit" appears in last 80 lines, assume it's recent
        return true
      }
    }
    return false
  } catch {
    return false
  }
}

export async function GET() {
  const data = readCostLog()
  const sessions: Session[] = data.sessions ?? []

  const dailyLimit = Number(process.env.DAILY_COST_LIMIT_USD ?? 2)
  const topupUsd   = Number(process.env.ANTHROPIC_CREDITS_USD ?? 0)
  const topupAt    = process.env.ANTHROPIC_CREDITS_AT ?? ''

  // Burn rate: averaged over the last 3 hours (higher signal than 24h for a
  // system that bursts), clamped to a tiny floor so ETAs don't divide by zero.
  const cost3h        = costWithin(sessions, 180)
  const burnPerHour   = Math.max(cost3h / 3, 0.0001)
  const todaySpend    = sessions
    .filter(s => s.at?.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, s) => sum + (s.cost ?? 0), 0)

  const spentSinceTopup   = costSince(sessions, topupAt)
  const estimatedBalance  = topupUsd > 0 ? Math.max(topupUsd - spentSinceTopup, 0) : null
  const exhausted         = recentCreditExhaustion()

  const hoursUntilDailyCap = burnPerHour > 0.001 ? (dailyLimit - todaySpend) / burnPerHour : null
  const hoursUntilZero     = estimatedBalance !== null && burnPerHour > 0.001 ? estimatedBalance / burnPerHour : null

  const creditStatus: 'exhausted' | 'low' | 'ok' | 'unknown' =
    exhausted                                                                         ? 'exhausted' :
    estimatedBalance !== null && estimatedBalance < 2                                 ? 'low' :
    estimatedBalance !== null                                                         ? 'ok' :
                                                                                        'unknown'

  return NextResponse.json({
    ...data,
    dailyLimit,
    todaySpend,
    burnPerHour,
    cost3h,
    estimatedBalance,
    topupAt,
    creditStatus,
    hoursUntilDailyCap,
    hoursUntilZero,
  })
}
