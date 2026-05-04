/**
 * main.ts — Main entry point with token usage checkpoint monitoring
 *
 * Tracks token consumption against configured budget (MAX_INPUT_TOKENS_PER_RUN)
 * and logs a checkpoint warning when reaching 80% of the budget.
 *
 * Integrates with src/monitor.ts for token consumption logging and tracks
 * cumulative usage to emit budget warnings.
 *
 * Run:
 *   npm run build && node --loader ts-node/esm main.ts
 *   or compile to JS first:
 *   npx tsc main.ts && node main.js
 */

import { getTokenStats, logTokenStats, logTokenConsumption } from './src/monitor'

// ── Configuration ─────────────────────────────────────────────────────────
const MAX_INPUT_TOKENS = parseInt(process.env.MAX_INPUT_TOKENS_PER_RUN || '120000', 10)
const BUDGET_WARNING_THRESHOLD = 0.8 // Log checkpoint at 80% budget

interface BudgetCheckpoint {
  timestamp: string
  totalTokensUsed: number
  maxTokenBudget: number
  percentageUsed: number
  tokensRemaining: number
  warningThreshold: number
  thresholdExceeded: boolean
}

let budgetCheckpointLogged = false

/**
 * Check token budget and log checkpoint if at or exceeding 80%
 * @returns True if checkpoint was logged, false otherwise
 */
export function checkAndLogBudgetCheckpoint(): boolean {
  const stats = getTokenStats()
  const percentageUsed = stats.totalTokens / MAX_INPUT_TOKENS
  const thresholdExceeded = percentageUsed >= BUDGET_WARNING_THRESHOLD

  if (thresholdExceeded && !budgetCheckpointLogged) {
    const checkpoint: BudgetCheckpoint = {
      timestamp: new Date().toISOString(),
      totalTokensUsed: stats.totalTokens,
      maxTokenBudget: MAX_INPUT_TOKENS,
      percentageUsed: Math.round(percentageUsed * 100 * 100) / 100, // 2 decimals
      tokensRemaining: Math.max(0, MAX_INPUT_TOKENS - stats.totalTokens),
      warningThreshold: BUDGET_WARNING_THRESHOLD * 100,
      thresholdExceeded: true,
    }

    console.log('[main] 🚨 TOKEN BUDGET CHECKPOINT', JSON.stringify(checkpoint, null, 2))
    budgetCheckpointLogged = true
    return true
  }

  return false
}

/**
 * Log current token statistics and budget status
 */
export function logBudgetStatus(): void {
  const stats = getTokenStats()
  const percentageUsed = (stats.totalTokens / MAX_INPUT_TOKENS) * 100

  console.log('[main] Token Budget Status:')
  console.log(`  Total Used:     ${stats.totalTokens.toLocaleString()} tokens`)
  console.log(`  Max Budget:     ${MAX_INPUT_TOKENS.toLocaleString()} tokens`)
  console.log(`  Remaining:      ${Math.max(0, MAX_INPUT_TOKENS - stats.totalTokens).toLocaleString()} tokens`)
  console.log(`  Usage:          ${percentageUsed.toFixed(2)}%`)
  console.log(`  Requests:       ${stats.totalRequests}`)
  console.log(`  Avg per Req:    ${stats.averageTokensPerRequest.toLocaleString()} tokens`)
}

/**
 * Initialize main entry point
 */
async function main(): Promise<void> {
  console.log('[START]', new Date().toISOString())

  try {
    console.log('[main] Initializing task dashboard with token monitoring...')
    console.log(`[main] Max token budget configured: ${MAX_INPUT_TOKENS.toLocaleString()}`)
    console.log(`[main] Budget warning threshold: ${BUDGET_WARNING_THRESHOLD * 100}%`)

    // Simulate initialization work
    await new Promise((resolve) => setTimeout(resolve, 100))

    // On startup, check if we're already at budget threshold
    // (e.g., from a previous run, or if stats are persisted)
    checkAndLogBudgetCheckpoint()

    // Log initial status
    logBudgetStatus()

    console.log('[main] Task dashboard ready for requests')
  } catch (err) {
    console.error('[main] Initialization error:', err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('[main] Received SIGINT, logging final stats...')
  logBudgetStatus()
  console.log('[END]', new Date().toISOString())
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('[main] Received SIGTERM, logging final stats...')
  logBudgetStatus()
  console.log('[END]', new Date().toISOString())
  process.exit(0)
})

// ── Execute ───────────────────────────────────────────────────────────────
await main()
