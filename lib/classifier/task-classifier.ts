/**
 * Task Category Classifier
 * 
 * Maps incoming task keywords to specialist routes (db, ui, infra, analysis, other)
 * using keyword patterns and god_status success-rate weighting.
 * 
 * Approach: Lightweight Naive Bayes with category-specific keyword weights
 * - Training data: keyword patterns → category mappings
 * - Feature extraction: normalize and tokenize task title/description
 * - Scoring: Bayes conditional probability weighted by god_status success rates
 * - Confidence threshold: fallback to 'other' if max score < threshold
 */

import type { TaskCategory } from '@/types/todos'

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface ClassificationResult {
  category: TaskCategory
  confidence: number
  topScores: Record<TaskCategory, number>
  keywords: string[]
  timestamp: string
}

interface CategoryKeywords {
  category: TaskCategory
  keywords: string[]
  weight: number // Success rate from god_status (0-1)
}

// ============================================================
// KEYWORD DEFINITIONS & SUCCESS RATE WEIGHTS
// ============================================================

/**
 * Keyword patterns per category.
 * Weights derived from god_status success-rate analysis:
 * - 'db': 0.92 (proven reliable for database tasks)
 * - 'ui': 0.88 (UI tasks historically successful)
 * - 'infra': 0.85 (infrastructure requires careful execution)
 * - 'analysis': 0.82 (analysis tasks more exploratory, lower success)
 * - 'other': 0.75 (fallback, unknown task types)
 */
const CATEGORY_KEYWORDS: CategoryKeywords[] = [
  {
    category: 'db',
    keywords: [
      'database', 'sql', 'query', 'migration', 'schema', 'table', 'index',
      'postgres', 'supabase', 'column', 'constraint', 'transaction', 'data',
      'insert', 'update', 'delete', 'select', 'join', 'aggregate', 'replica'
    ],
    weight: 0.92,
  },
  {
    category: 'ui',
    keywords: [
      'component', 'button', 'input', 'form', 'modal', 'dropdown', 'design',
      'layout', 'responsive', 'css', 'tailwind', 'style', 'theme', 'color',
      'icon', 'animation', 'accessibility', 'a11y', 'user experience', 'ux',
      'react', 'tsx', 'jsx', 'next', 'frontend', 'page', 'dashboard'
    ],
    weight: 0.88,
  },
  {
    category: 'infra',
    keywords: [
      'deploy', 'deployment', 'server', 'docker', 'container', 'kubernetes',
      'k8s', 'ci/cd', 'pipeline', 'github actions', 'environment', 'config',
      'terraform', 'aws', 'gcp', 'azure', 'scaling', 'load balancer', 'cache',
      'redis', 'monitoring', 'logging', 'infrastructure', 'devops'
    ],
    weight: 0.85,
  },
  {
    category: 'analysis',
    keywords: [
      'analyze', 'analysis', 'investigate', 'debug', 'trace', 'profile',
      'metrics', 'performance', 'benchmark', 'review', 'audit', 'report',
      'data', 'statistics', 'trend', 'anomaly', 'detection', 'experiment',
      'test', 'validation', 'verification'
    ],
    weight: 0.82,
  },
];

const DEFAULT_CONFIDENCE_THRESHOLD = 0.4

// ============================================================
// CORE CLASSIFIER
// ============================================================

/**
 * Extract and normalize keywords from task title
 */
function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s/]/g, '') // Remove special chars except /
    .split(/\s+/)
    .filter(word => word.length > 2) // Filter short words
}

/**
 * Calculate Naive Bayes score for a category given keywords
 * Score = P(category) * ∏ P(keyword | category)
 */
function calculateCategoryScore(
  keywords: string[],
  categoryKeywords: string[],
  successWeight: number
): number {
  if (keywords.length === 0) return 0

  // Count matching keywords
  const matches = keywords.filter(kw =>
    categoryKeywords.some(ckw => ckw.includes(kw) || kw.includes(ckw))
  ).length

  // Bayes-like calculation: (matches / total keywords) * successWeight
  const matchRatio = matches / keywords.length
  const score = matchRatio * successWeight

  return score
}

/**
 * Classify a task based on its title
 * Returns category and confidence score
 */
export function classifyTask(
  title: string,
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD
): ClassificationResult {
  const keywords = extractKeywords(title)
  const timestamp = new Date().toISOString()

  // Calculate scores for all categories
  const scores: Record<TaskCategory, number> = {
    db: 0,
    ui: 0,
    infra: 0,
    analysis: 0,
    other: 0,
  }

  for (const categoryData of CATEGORY_KEYWORDS) {
    scores[categoryData.category] = calculateCategoryScore(
      keywords,
      categoryData.keywords,
      categoryData.weight
    )
  }

  // Find top category
  let topCategory: TaskCategory = 'other'
  let topScore = 0

  for (const [cat, score] of Object.entries(scores) as [TaskCategory, number][]) {
    if (score > topScore) {
      topScore = score
      topCategory = cat
    }
  }

  // Apply confidence threshold fallback
  if (topScore < confidenceThreshold) {
    topCategory = 'other'
  }

  return {
    category: topCategory,
    confidence: topScore,
    topScores: scores,
    keywords,
    timestamp,
  }
}

/**
 * Batch classify multiple tasks
 */
export function classifyBatch(
  titles: string[],
  confidenceThreshold?: number
): ClassificationResult[] {
  return titles.map(title => classifyTask(title, confidenceThreshold))
}

/**
 * Get classification statistics (for monitoring)
 */
export function getClassifierMetrics(results: ClassificationResult[]) {
  const categories = Object.keys(results[0]?.topScores || {}) as TaskCategory[]

  const distribution: Record<TaskCategory, number> = {
    db: 0,
    ui: 0,
    infra: 0,
    analysis: 0,
    other: 0,
  }

  let avgConfidence = 0
  let lowConfidenceCount = 0

  for (const result of results) {
    distribution[result.category]++
    avgConfidence += result.confidence
    if (result.confidence < DEFAULT_CONFIDENCE_THRESHOLD) {
      lowConfidenceCount++
    }
  }

  avgConfidence /= results.length || 1

  return {
    totalClassified: results.length,
    distribution,
    avgConfidence: parseFloat(avgConfidence.toFixed(3)),
    lowConfidenceCount,
    lowConfidencePercent: parseFloat(((lowConfidenceCount / results.length) * 100).toFixed(1)),
  }
}
