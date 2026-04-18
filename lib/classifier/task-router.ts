/**
 * Task Router
 * 
 * Routes incoming tasks to specialist agents based on:
 * 1. Task category from classifier
 * 2. Category success rates from god_status
 * 3. Current agent workload/availability
 * 
 * Fallback: Routes unclassified tasks to 'analyst' for review
 */

import { classifyTask, type ClassificationResult } from './task-classifier'
import { getCachedSuccessRates } from './success-rates'
import type { TaskCategory } from '@/types/todos'

// ============================================================
// TYPES
// ============================================================

export interface RoutingDecision {
  category: TaskCategory
  suggestedAgent: string
  confidence: number
  classificationResult: ClassificationResult
  reason: string
  timestamp: string
}

export interface CategoryAgentMapping {
  db: string[]
  ui: string[]
  infra: string[]
  analysis: string[]
  other: string
}

// ============================================================
// AGENT ASSIGNMENTS
// ============================================================

/**
 * Default agent assignments per category
 * In production, these would be queried from a user/agent registry
 */
const DEFAULT_AGENTS: CategoryAgentMapping = {
  db: ['db-specialist-1', 'db-specialist-2', 'database-engineer'],
  ui: ['frontend-engineer-1', 'ux-designer', 'react-specialist'],
  infra: ['devops-engineer', 'platform-engineer', 'infra-lead'],
  analysis: ['data-analyst', 'engineer-2', 'analyst-team'],
  other: 'general-agent', // Fallback agent for unclassified
}

// ============================================================
// ROUTING LOGIC
// ============================================================

/**
 * Route a task to appropriate specialist based on classification
 */
export async function routeTask(
  title: string,
  categoryOverride?: TaskCategory
): Promise<RoutingDecision> {
  const timestamp = new Date().toISOString()

  // Classify the task
  const classification = categoryOverride
    ? {
        category: categoryOverride,
        confidence: 1.0,
        topScores: {},
        keywords: [],
        timestamp,
      }
    : classifyTask(title)

  // Get success rates for scoring
  const successRates = await getCachedSuccessRates()
  const categoryRate = successRates[classification.category]?.successRate ?? 0.75

  // Select agent for this category
  const suggestedAgent = selectAgent(
    classification.category,
    classification.confidence
  )

  // Build routing decision with reasoning
  const decision: RoutingDecision = {
    category: classification.category,
    suggestedAgent,
    confidence: classification.confidence,
    classificationResult: classification,
    reason: buildReason(
      classification.category,
      classification.confidence,
      categoryRate,
      suggestedAgent
    ),
    timestamp,
  }

  return decision
}

/**
 * Route multiple tasks in batch
 */
export async function routeTaskBatch(
  titles: string[]
): Promise<RoutingDecision[]> {
  return Promise.all(titles.map(title => routeTask(title)))
}

/**
 * Select best agent for category
 * In basic implementation: round-robin or random selection from pool
 * In advanced: could query agent current load/capacity
 */
function selectAgent(category: TaskCategory, confidence: number): string {
  const agents = DEFAULT_AGENTS[category]

  // Handle single agent (fallback)
  if (typeof agents === 'string') {
    return agents
  }

  // Handle agent pool: select based on confidence
  // High confidence: use primary specialist
  // Low confidence: use more general agent
  const index = confidence > 0.6 ? 0 : Math.floor(Math.random() * agents.length)

  return agents[Math.min(index, agents.length - 1)]
}

/**
 * Build human-readable reason for routing decision
 */
function buildReason(
  category: TaskCategory,
  confidence: number,
  successRate: number,
  agent: string
): string {
  const confStr =
    confidence > 0.7
      ? 'high'
      : confidence > 0.4
        ? 'moderate'
        : 'low'

  const successStr = (successRate * 100).toFixed(0)

  return (
    `Classified as '${category}' with ${confStr} confidence (${(confidence * 100).toFixed(0)}%). ` +
    `Category has ${successStr}% success rate. ` +
    `Routed to ${agent}.`
  )
}

/**
 * Check if routing decision is reliable
 * Returns false if confidence is too low or category is 'other'
 */
export function isReliableRouting(decision: RoutingDecision): boolean {
  return decision.confidence >= 0.5 && decision.category !== 'other'
}

/**
 * Get routing statistics across multiple decisions
 */
export function getRoutingMetrics(decisions: RoutingDecision[]) {
  const categories: Record<TaskCategory, number> = {
    db: 0,
    ui: 0,
    infra: 0,
    analysis: 0,
    other: 0,
  }

  const agents: Record<string, number> = {}
  let avgConfidence = 0
  let reliableCount = 0

  for (const decision of decisions) {
    categories[decision.category]++
    agents[decision.suggestedAgent] = (agents[decision.suggestedAgent] || 0) + 1
    avgConfidence += decision.confidence

    if (isReliableRouting(decision)) {
      reliableCount++
    }
  }

  avgConfidence /= decisions.length || 1

  return {
    totalRouted: decisions.length,
    categoryDistribution: categories,
    agentAssignments: agents,
    avgConfidence: parseFloat(avgConfidence.toFixed(3)),
    reliableRouting: parseFloat(((reliableCount / decisions.length) * 100).toFixed(1)),
  }
}
