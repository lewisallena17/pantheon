/**
 * Claim Confidence Calculator
 * 
 * Computes multi-dimensional confidence scores for factual claims across response types.
 * Combines:
 * - Evidence quality (empirical, theoretical, anecdotal)
 * - Logical certainty (definite, probable, plausible, speculative)
 * - Factual status (directly verifiable vs. interpretation)
 * - Temporal stability (permanent vs. volatile)
 * - Model confidence (inferred from token probabilities and hedging)
 */

import {
  ConfidenceMarker,
  EvidenceQuality,
  LogicalCertainty,
  FactualStatus,
  TemporalStability,
  ModelConfidence,
  ResponseClaim,
  ConfidenceTier,
  CONFIDENCE_TIER_RANGES,
} from '@/types/uncertainty-markers'

/**
 * Configuration for confidence scoring
 */
interface ConfidenceCalculatorConfig {
  evidenceWeight: number // default 0.25
  logicalWeight: number // default 0.25
  factualWeight: number // default 0.20
  temporalWeight: number // default 0.15
  modelWeight: number // default 0.15
  hedgingPenalty: number // 0.0-1.0 penalty for hedged language (default 0.15)
  enableCalibration: boolean // apply Bayesian calibration (default true)
}

const DEFAULT_CONFIG: ConfidenceCalculatorConfig = {
  evidenceWeight: 0.25,
  logicalWeight: 0.25,
  factualWeight: 0.20,
  temporalWeight: 0.15,
  modelWeight: 0.15,
  hedgingPenalty: 0.15,
  enableCalibration: true,
}

/**
 * Evidence quality levels mapped to scores
 */
const EVIDENCE_QUALITY_SCORES: Record<
  EvidenceQuality['level'],
  number
> = {
  empirical: 0.9,
  theoretical: 0.75,
  anecdotal: 0.5,
  indirect: 0.4,
  none: 0.1,
}

/**
 * Logical certainty levels mapped to scores
 */
const LOGICAL_CERTAINTY_SCORES: Record<
  LogicalCertainty['level'],
  number
> = {
  definite: 0.95,
  probable: 0.80,
  plausible: 0.60,
  speculative: 0.35,
  unknown: 0.20,
}

/**
 * Factual status categories mapped to scores
 */
const FACTUAL_STATUS_SCORES: Record<
  FactualStatus['category'],
  number
> = {
  directly_verifiable: 0.9,
  interpretation: 0.65,
  extrapolation: 0.45,
  counterfactual: 0.3,
  value_judgment: 0.4,
}

/**
 * Temporal stability levels mapped to scores
 */
const TEMPORAL_STABILITY_SCORES: Record<
  TemporalStability['stability'],
  number
> = {
  permanent: 0.95,
  long_term: 0.80,
  medium_term: 0.60,
  short_term: 0.40,
  volatile: 0.15,
}

/**
 * Common hedging phrases and their strength
 */
const HEDGING_PHRASES: Record<string, number> = {
  'may': 0.3,
  'might': 0.3,
  'could': 0.25,
  'can': 0.2,
  'probably': 0.35,
  'likely': 0.4,
  'suggests': 0.25,
  'indicates': 0.3,
  'appears': 0.25,
  'seems': 0.25,
  'arguably': 0.35,
  'possibly': 0.3,
  'perhaps': 0.3,
  'it could be': 0.25,
  'tend to': 0.35,
  'generally': 0.4,
  'often': 0.3,
  'somewhat': 0.25,
  'rather': 0.2,
  'relatively': 0.2,
  'supposedly': 0.35,
}

/**
 * Calculate hedging strength from claim text
 */
export function calculateHedgingStrength(claimText: string): number {
  const lowerText = claimText.toLowerCase()
  let maxHedgingStrength = 0

  for (const [phrase, strength] of Object.entries(HEDGING_PHRASES)) {
    if (lowerText.includes(phrase)) {
      maxHedgingStrength = Math.max(maxHedgingStrength, strength)
    }
  }

  return maxHedgingStrength
}

/**
 * Calculate normalized evidence quality score
 */
export function scoreEvidenceQuality(
  evidence: EvidenceQuality
): number {
  return evidence.score
}

/**
 * Calculate normalized logical certainty score
 */
export function scoreLogicalCertainty(
  logical: LogicalCertainty
): number {
  return logical.score
}

/**
 * Calculate normalized factual status score
 */
export function scoreFactualStatus(
  factual: FactualStatus
): number {
  return factual.score
}

/**
 * Calculate normalized temporal stability score
 */
export function scoreTemporalStability(
  temporal: TemporalStability
): number {
  return temporal.score
}

/**
 * Calculate normalized model confidence score
 */
export function scoreModelConfidence(
  model: ModelConfidence
): number {
  let baseScore = model.token_probability

  // Penalize high perplexity
  const perplexityPenalty = Math.min(0.2, model.perplexity * 0.05)
  baseScore = Math.max(0, baseScore - perplexityPenalty)

  // Bonus for repetition (consistency across response)
  if (model.repetition_count > 1) {
    baseScore = Math.min(1.0, baseScore + (model.repetition_count * 0.05))
  }

  // Penalize for hedging
  if (model.uses_hedging) {
    baseScore = Math.max(0, baseScore - 0.15)
  }

  return Math.min(1.0, Math.max(0, baseScore))
}

/**
 * Calculate composite confidence score from multi-dimensional markers
 */
export function calculateCompositeConfidence(
  marker: Partial<ConfidenceMarker>,
  config: Partial<ConfidenceCalculatorConfig> = {}
): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  let compositeScore = 0

  // Evidence quality dimension
  if (marker.evidence_quality) {
    const evidenceScore = scoreEvidenceQuality(marker.evidence_quality)
    compositeScore +=
      evidenceScore * marker.evidence_quality.weight * finalConfig.evidenceWeight
  }

  // Logical certainty dimension
  if (marker.logical_certainty) {
    const logicalScore = scoreLogicalCertainty(marker.logical_certainty)
    compositeScore +=
      logicalScore * marker.logical_certainty.weight * finalConfig.logicalWeight
  }

  // Factual status dimension
  if (marker.factual_status) {
    const factualScore = scoreFactualStatus(marker.factual_status)
    compositeScore +=
      factualScore * marker.factual_status.weight * finalConfig.factualWeight
  }

  // Temporal stability dimension
  if (marker.temporal_stability) {
    const temporalScore = scoreTemporalStability(marker.temporal_stability)
    compositeScore +=
      temporalScore * marker.temporal_stability.weight * finalConfig.temporalWeight
  }

  // Model confidence dimension
  if (marker.model_confidence) {
    const modelScore = scoreModelConfidence(marker.model_confidence)
    compositeScore +=
      modelScore * marker.model_confidence.weight * finalConfig.modelWeight
  }

  return Math.min(1.0, Math.max(0, compositeScore))
}

/**
 * Generate confidence tier from composite score
 */
export function getTierFromScore(score: number): ConfidenceTier {
  if (score >= CONFIDENCE_TIER_RANGES.high.min) return 'high'
  if (score >= CONFIDENCE_TIER_RANGES.medium.min) return 'medium'
  if (score >= CONFIDENCE_TIER_RANGES.low.min) return 'low'
  return 'uncertain'
}

/**
 * Build confidence marker for a claim
 */
export function buildConfidenceMarker(
  claimId: string,
  evidence: EvidenceQuality,
  logical: LogicalCertainty,
  factual: FactualStatus,
  temporal: TemporalStability,
  model: ModelConfidence,
  config?: Partial<ConfidenceCalculatorConfig>
): ConfidenceMarker {
  const marker: ConfidenceMarker = {
    claim_id: claimId,
    evidence_quality: evidence,
    logical_certainty: logical,
    factual_status: factual,
    temporal_stability: temporal,
    model_confidence: model,
    composite_confidence: 0,
    computed_at: new Date().toISOString(),
  }

  marker.composite_confidence = calculateCompositeConfidence(marker, config)

  return marker
}

/**
 * Breakdown of confidence score for transparency
 */
export interface ConfidenceScoreBreakdown {
  evidenceContribution: number
  logicalContribution: number
  factualContribution: number
  temporalContribution: number
  modelContribution: number
  hedgingPenalty: number
  calibratedScore: number
  tier: ConfidenceTier
  calibrationAdjustment?: number
}

/**
 * Generate detailed breakdown for confidence score
 */
export function getConfidenceBreakdown(
  marker: ConfidenceMarker,
  config: Partial<ConfidenceCalculatorConfig> = {}
): ConfidenceScoreBreakdown {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const evidenceScore = scoreEvidenceQuality(marker.evidence_quality)
  const logicalScore = scoreLogicalCertainty(marker.logical_certainty)
  const factualScore = scoreFactualStatus(marker.factual_status)
  const temporalScore = scoreTemporalStability(marker.temporal_stability)
  const modelScore = scoreModelConfidence(marker.model_confidence)

  const evidenceContribution =
    evidenceScore *
    marker.evidence_quality.weight *
    finalConfig.evidenceWeight
  const logicalContribution =
    logicalScore *
    marker.logical_certainty.weight *
    finalConfig.logicalWeight
  const factualContribution =
    factualScore * marker.factual_status.weight * finalConfig.factualWeight
  const temporalContribution =
    temporalScore *
    marker.temporal_stability.weight *
    finalConfig.temporalWeight
  const modelContribution =
    modelScore * marker.model_confidence.weight * finalConfig.modelWeight

  const calibratedScore = marker.composite_confidence

  return {
    evidenceContribution,
    logicalContribution,
    factualContribution,
    temporalContribution,
    modelContribution,
    hedgingPenalty: marker.model_confidence.uses_hedging
      ? finalConfig.hedgingPenalty
      : 0,
    calibratedScore,
    tier: getTierFromScore(calibratedScore),
  }
}

/**
 * Merge multiple confidence scores (e.g., from different evaluators)
 */
export function mergeConfidenceScores(
  scores: number[],
  weights?: number[]
): number {
  if (scores.length === 0) return 0

  if (!weights) {
    weights = Array(scores.length).fill(1 / scores.length)
  }

  const total = weights.reduce((sum, w) => sum + w, 0)
  let weighted = 0

  for (let i = 0; i < scores.length; i++) {
    weighted += (scores[i] * weights[i]) / total
  }

  return Math.min(1.0, Math.max(0, weighted))
}
