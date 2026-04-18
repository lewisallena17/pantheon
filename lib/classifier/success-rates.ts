/**
 * Success Rate Manager
 * 
 * Fetches and caches category success rates from god_status table.
 * Provides weighted scoring for classifier based on historical performance.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { TaskCategory } from '@/types/todos'

// ============================================================
// TYPES
// ============================================================

export interface CategorySuccessRate {
  category: TaskCategory
  successRate: number
  totalTasks: number
  completedTasks: number
  failedTasks: number
  lastUpdated: string
}

export interface SuccessRateData {
  [key: string]: CategorySuccessRate
}

// ============================================================
// IN-MEMORY CACHE
// ============================================================

let cachedSuccessRates: SuccessRateData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// ============================================================
// SUCCESS RATE CALCULATION
// ============================================================

/**
 * Fetch success rates from god_status table
 * god_status stores metadata about task category success as JSON in 'value' column
 * Format: { "db": { "total": N, "completed": M, ... }, ... }
 */
export async function fetchSuccessRates(): Promise<SuccessRateData> {
  try {
    const supabase = createAdminClient()

    // Query god_status for success rate metadata
    const { data, error } = await supabase
      .from('god_status')
      .select('name, value')
      .eq('name', 'category_success_rates')
      .single()

    if (error || !data) {
      // Fallback to default rates if data doesn't exist
      return getDefaultSuccessRates()
    }

    try {
      const parsed = typeof data.value === 'string' 
        ? JSON.parse(data.value) 
        : data.value

      return normalizeSuccessRateData(parsed)
    } catch {
      return getDefaultSuccessRates()
    }
  } catch (err) {
    console.error('Error fetching success rates:', err)
    return getDefaultSuccessRates()
  }
}

/**
 * Get cached success rates with auto-refresh
 */
export async function getCachedSuccessRates(): Promise<SuccessRateData> {
  const now = Date.now()

  // Use cache if still valid
  if (cachedSuccessRates && now - cacheTimestamp < CACHE_DURATION_MS) {
    return cachedSuccessRates
  }

  // Refresh cache
  cachedSuccessRates = await fetchSuccessRates()
  cacheTimestamp = now

  return cachedSuccessRates
}

/**
 * Normalize success rate data to consistent format
 */
function normalizeSuccessRateData(data: unknown): SuccessRateData {
  const result: SuccessRateData = {}
  const categories: TaskCategory[] = ['db', 'ui', 'infra', 'analysis', 'other']

  if (typeof data !== 'object' || data === null) {
    return getDefaultSuccessRates()
  }

  for (const category of categories) {
    const categoryData = (data as Record<string, unknown>)[category]

    if (categoryData && typeof categoryData === 'object') {
      const total = (categoryData as Record<string, unknown>).total as number || 0
      const completed = (categoryData as Record<string, unknown>).completed as number || 0
      const failed = (categoryData as Record<string, unknown>).failed as number || 0

      result[category] = {
        category,
        successRate: total > 0 ? completed / total : 0.5,
        totalTasks: total,
        completedTasks: completed,
        failedTasks: failed,
        lastUpdated: new Date().toISOString(),
      }
    } else {
      result[category] = getDefaultRate(category)
    }
  }

  return result
}

/**
 * Get default success rates (from classifier training data)
 */
function getDefaultSuccessRates(): SuccessRateData {
  const categories: TaskCategory[] = ['db', 'ui', 'infra', 'analysis', 'other']
  const result: SuccessRateData = {}

  for (const category of categories) {
    result[category] = getDefaultRate(category)
  }

  return result
}

/**
 * Get default rate for a single category
 */
function getDefaultRate(category: TaskCategory): CategorySuccessRate {
  // Defaults from classifier training
  const defaults: Record<TaskCategory, number> = {
    db: 0.92,
    ui: 0.88,
    infra: 0.85,
    analysis: 0.82,
    other: 0.75,
  }

  return {
    category,
    successRate: defaults[category],
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Update success rates in god_status (for background jobs)
 */
export async function updateSuccessRates(data: SuccessRateData): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('god_status')
      .upsert({
        id: 1,
        name: 'category_success_rates',
        value: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error updating success rates:', error)
      return false
    }

    // Invalidate cache
    cachedSuccessRates = null

    return true
  } catch (err) {
    console.error('Error updating success rates:', err)
    return false
  }
}

/**
 * Invalidate cache (call after manual updates)
 */
export function invalidateCache(): void {
  cachedSuccessRates = null
  cacheTimestamp = 0
}

/**
 * Get success rate for a specific category
 */
export async function getCategorySuccessRate(
  category: TaskCategory
): Promise<number> {
  const rates = await getCachedSuccessRates()
  return rates[category]?.successRate ?? 0.75
}
