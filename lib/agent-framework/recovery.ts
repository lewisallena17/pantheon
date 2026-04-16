/**
 * Recovery Strategy Engine
 * Implements tiered recovery approaches for validation failures
 * - Tier 1: Auto-correction (fix format issues)
 * - Tier 2: Retry with context (provide error details to LLM)
 * - Tier 3: Alternative tool (use fallback implementation)
 * - Tier 4: Human escalation (task marked for review)
 */

import { ValidationResult, ValidationError } from './validation'

export enum RecoveryTier {
  /** Attempt automatic correction without LLM assistance */
  AUTO_CORRECT = 'auto_correct',
  /** Retry with context: tell the LLM what went wrong */
  RETRY_WITH_CONTEXT = 'retry_with_context',
  /** Switch to alternative implementation/tool */
  ALTERNATIVE_TOOL = 'alternative_tool',
  /** Mark task for human review */
  ESCALATE_TO_HUMAN = 'escalate_to_human',
  /** Circuit breaker: stop further attempts */
  CIRCUIT_BREAK = 'circuit_break',
}

export interface RecoveryAction {
  tier: RecoveryTier
  reason: string
  corrected?: unknown
  context?: string
  alternatives?: string[]
  escalationMessage?: string
}

export interface RecoveryPlan {
  initialTier: RecoveryTier
  fallbackTiers: RecoveryTier[]
  maxRetries: number
  circuitBreakerThreshold: number
}

/**
 * Default recovery plans for different error types
 */
export const RECOVERY_PLANS: Record<string, RecoveryPlan> = {
  // Format errors can usually be auto-corrected
  'TOOL_USE_ID_INVALID_FORMAT': {
    initialTier: RecoveryTier.AUTO_CORRECT,
    fallbackTiers: [RecoveryTier.RETRY_WITH_CONTEXT, RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 2,
    circuitBreakerThreshold: 3,
  },
  'TOOL_USE_ID_TOO_LONG': {
    initialTier: RecoveryTier.AUTO_CORRECT,
    fallbackTiers: [RecoveryTier.RETRY_WITH_CONTEXT, RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 1,
    circuitBreakerThreshold: 2,
  },
  // Structural errors need LLM guidance
  'TOOL_USE_ID_TYPE_INVALID': {
    initialTier: RecoveryTier.RETRY_WITH_CONTEXT,
    fallbackTiers: [RecoveryTier.ALTERNATIVE_TOOL, RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 2,
    circuitBreakerThreshold: 3,
  },
  'BLOCK_TYPE_INVALID': {
    initialTier: RecoveryTier.RETRY_WITH_CONTEXT,
    fallbackTiers: [RecoveryTier.ALTERNATIVE_TOOL, RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 2,
    circuitBreakerThreshold: 3,
  },
  // Correlation mismatches indicate logic errors — escalate quickly
  'TOOL_USE_ID_MISMATCH': {
    initialTier: RecoveryTier.RETRY_WITH_CONTEXT,
    fallbackTiers: [RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 1,
    circuitBreakerThreshold: 2,
  },
  'TOOL_RESULT_NO_MATCHING_USE': {
    initialTier: RecoveryTier.RETRY_WITH_CONTEXT,
    fallbackTiers: [RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 1,
    circuitBreakerThreshold: 2,
  },
  // Unknown errors — be conservative
  'UNKNOWN': {
    initialTier: RecoveryTier.RETRY_WITH_CONTEXT,
    fallbackTiers: [RecoveryTier.ESCALATE_TO_HUMAN],
    maxRetries: 1,
    circuitBreakerThreshold: 2,
  },
}

/**
 * Attempt automatic correction of common validation errors
 */
export function tryAutoCorrect(
  errors: ValidationError[],
  input: unknown
): { corrected: unknown; fixed: boolean } | null {
  // Only try to correct format errors on tool_use_id
  const formatError = errors.find(e => e.code === 'TOOL_USE_ID_INVALID_FORMAT')
  if (!formatError || typeof input !== 'string') {
    return null
  }

  // Sanitize: remove invalid characters, keep alphanumeric, underscore, hyphen
  const corrected = input.replace(/[^a-zA-Z0-9_-]/g, '')

  // Truncate if too long
  const sanitized = corrected.slice(0, 128)

  // If result is empty or didn't change, can't auto-correct
  if (sanitized.length === 0 || sanitized === input) {
    return null
  }

  return {
    corrected: sanitized,
    fixed: true,
  }
}

/**
 * Determine the next recovery tier based on failure history
 */
export function getNextRecoveryTier(
  errorCode: string,
  retryCount: number,
  previousTiers: RecoveryTier[]
): RecoveryTier | null {
  const plan = RECOVERY_PLANS[errorCode] ?? RECOVERY_PLANS['UNKNOWN']

  // Check circuit breaker
  if (retryCount >= plan.circuitBreakerThreshold) {
    return RecoveryTier.CIRCUIT_BREAK
  }

  // Check max retries
  if (retryCount >= plan.maxRetries) {
    return plan.fallbackTiers[0] ?? RecoveryTier.ESCALATE_TO_HUMAN
  }

  // If this is the first attempt, use initial tier
  if (previousTiers.length === 0) {
    return plan.initialTier
  }

  // Move to next fallback tier
  const lastTier = previousTiers[previousTiers.length - 1]
  const lastIndex = plan.fallbackTiers.indexOf(lastTier)
  const nextTier = plan.fallbackTiers[lastIndex + 1]

  return nextTier ?? RecoveryTier.ESCALATE_TO_HUMAN
}

/**
 * Generate recovery context string for the LLM
 */
export function generateRecoveryContext(
  errors: ValidationError[],
  warnings: string[],
  previousAttempts: RecoveryAction[]
): string {
  const lines: string[] = [
    '=== VALIDATION ERROR CONTEXT ===',
    `Validation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`,
    '',
  ]

  if (errors.length > 0) {
    lines.push('ERRORS:')
    for (const err of errors) {
      lines.push(`- [${err.code}] ${err.message}`)
      if (err.path) lines.push(`  Path: ${err.path}`)
      if (err.expected !== undefined) lines.push(`  Expected: ${JSON.stringify(err.expected)}`)
      if (err.actual !== undefined) lines.push(`  Actual: ${JSON.stringify(err.actual)}`)
    }
    lines.push('')
  }

  if (warnings.length > 0) {
    lines.push('WARNINGS:')
    for (const w of warnings) {
      lines.push(`- ${w}`)
    }
    lines.push('')
  }

  if (previousAttempts.length > 0) {
    lines.push(`PREVIOUS ATTEMPTS (${previousAttempts.length}):`)
    for (let i = 0; i < previousAttempts.length; i++) {
      const attempt = previousAttempts[i]
      lines.push(`${i + 1}. Tier: ${attempt.tier}`)
      lines.push(`   Reason: ${attempt.reason}`)
      if (attempt.context) lines.push(`   Context: ${attempt.context}`)
    }
    lines.push('')
  }

  lines.push('GUIDANCE:')
  lines.push('- Ensure all tool_use_id values match between tool_use and tool_result blocks')
  lines.push('- Use valid IDs: alphanumeric, underscores, hyphens, 1-128 chars')
  lines.push('- Always wrap content in proper tool_result blocks with type="tool_result"')
  lines.push('- Match the exact tool_use_id from the corresponding tool_use block')

  return lines.join('\n')
}

/**
 * Build a recovery action based on validation errors
 */
export function buildRecoveryAction(
  errors: ValidationError[],
  warnings: string[],
  previousTiers: RecoveryTier[] = [],
  retryCount: number = 0
): RecoveryAction {
  const primaryError = errors[0]
  const errorCode = primaryError?.code ?? 'UNKNOWN'

  // Try auto-correct for simple format issues
  if (errorCode === 'TOOL_USE_ID_INVALID_FORMAT') {
    const autoCorrect = tryAutoCorrect(errors, primaryError.actual)
    if (autoCorrect?.fixed) {
      return {
        tier: RecoveryTier.AUTO_CORRECT,
        reason: `Automatically corrected invalid format: "${primaryError.actual}" → "${autoCorrect.corrected}"`,
        corrected: autoCorrect.corrected,
      }
    }
  }

  // Determine next tier
  const nextTier = getNextRecoveryTier(errorCode, retryCount, previousTiers)
  if (!nextTier) {
    return {
      tier: RecoveryTier.ESCALATE_TO_HUMAN,
      reason: 'No more recovery tiers available',
      escalationMessage: `Unrecoverable validation error: ${errorCode}`,
    }
  }

  const context = generateRecoveryContext(errors, warnings, [])

  if (nextTier === RecoveryTier.RETRY_WITH_CONTEXT) {
    return {
      tier: RecoveryTier.RETRY_WITH_CONTEXT,
      reason: `Retrying with validation context (attempt ${retryCount + 1})`,
      context,
    }
  }

  if (nextTier === RecoveryTier.ALTERNATIVE_TOOL) {
    return {
      tier: RecoveryTier.ALTERNATIVE_TOOL,
      reason: `Switching to alternative tool due to: ${errorCode}`,
      alternatives: ['run_sql', 'run_ddl'],
      context,
    }
  }

  if (nextTier === RecoveryTier.CIRCUIT_BREAK) {
    return {
      tier: RecoveryTier.CIRCUIT_BREAK,
      reason: `Circuit breaker activated after ${retryCount} failures`,
      escalationMessage: `Too many validation failures for error: ${errorCode}`,
    }
  }

  return {
    tier: RecoveryTier.ESCALATE_TO_HUMAN,
    reason: `Escalating unrecoverable error: ${errorCode}`,
    escalationMessage: context,
  }
}
