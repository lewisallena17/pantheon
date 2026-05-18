/**
 * Coherence-check helper for response flow validation.
 * Validates that response state transitions follow allowed sequences.
 */

import { CompletionMarker } from './response'

type StateTransitionRule = Record<CompletionMarker, CompletionMarker[]>

const validTransitions: StateTransitionRule = {
  PENDING: ['STREAMING', 'SUCCESS', 'ERROR', 'TIMEOUT'],
  STREAMING: ['SUCCESS', 'ERROR', 'TIMEOUT', 'PARTIAL'],
  SUCCESS: [],
  ERROR: ['RETRYING'],
  PARTIAL: ['SUCCESS', 'ERROR'],
  TIMEOUT: ['RETRYING'],
  CANCELLED: [],
  RETRYING: ['SUCCESS', 'ERROR', 'TIMEOUT'],
  FALLBACK: [],
}

/**
 * Validate that a state transition is coherent and allowed.
 * Returns true if the transition is valid, false + details if invalid.
 */
export function validateResponseFlow(
  fromState: CompletionMarker,
  toState: CompletionMarker,
): { valid: boolean; reason?: string } {
  const allowed = validTransitions[fromState] || []
  if (!allowed.includes(toState)) {
    return {
      valid: false,
      reason: `Invalid transition: ${fromState} → ${toState}`,
    }
  }
  return { valid: true }
}
