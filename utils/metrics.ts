/**
 * Metrics utility — log response word-count ranges in a single API call
 *
 * Provides a lightweight metrics logger that buckets response word counts
 * into predefined ranges and logs them efficiently.
 *
 * Range buckets:
 * - 0-100 words: "xs" (extra small)
 * - 101-500 words: "sm" (small)
 * - 501-1000 words: "md" (medium)
 * - 1001-5000 words: "lg" (large)
 * - 5001+ words: "xl" (extra large)
 *
 * Usage:
 * ```ts
 * import { logResponseRange } from '@/utils/metrics'
 *
 * // Single API call to log response and bucket it
 * await logResponseRange("Hello world, this is a response", {
 *   route: '/api/todos',
 *   method: 'GET',
 *   status: 200,
 * })
 * ```
 */

import { countWords } from '@/lib/word-count-logger'

/**
 * Range bucket identifier
 */
export type WordCountRange = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Range bucket definition
 */
interface RangeBucket {
  id: WordCountRange
  label: string
  min: number
  max: number
}

/**
 * Metrics entry for a single logged response
 */
interface MetricsEntry {
  timestamp: string
  wordCount: number
  range: WordCountRange
  route?: string
  method?: string
  status?: number
}

/**
 * Options for logging a response
 */
interface LogResponseOptions {
  route?: string
  method?: string
  status?: number
}

/**
 * Word-count range bucket definitions
 */
const RANGE_BUCKETS: RangeBucket[] = [
  { id: 'xs', label: 'extra small', min: 0, max: 100 },
  { id: 'sm', label: 'small', min: 101, max: 500 },
  { id: 'md', label: 'medium', min: 501, max: 1000 },
  { id: 'lg', label: 'large', min: 1001, max: 5000 },
  { id: 'xl', label: 'extra large', min: 5001, max: Infinity },
]

/**
 * Determine which range bucket a word count falls into
 *
 * @param wordCount Number of words to categorize
 * @returns Range bucket identifier
 */
export function getWordCountRange(wordCount: number): WordCountRange {
  for (const bucket of RANGE_BUCKETS) {
    if (wordCount >= bucket.min && wordCount <= bucket.max) {
      return bucket.id
    }
  }
  return 'xl' // Fallback to extra large
}

/**
 * Get human-readable range label
 *
 * @param range Range bucket identifier
 * @returns Human-readable label
 */
export function getRangeLabel(range: WordCountRange): string {
  const bucket = RANGE_BUCKETS.find((b) => b.id === range)
  return bucket ? bucket.label : 'unknown'
}

/**
 * Global metrics tracker (in-memory, suitable for single-request metrics)
 */
class MetricsTracker {
  private entries: MetricsEntry[] = []
  private rangeCounters: Record<WordCountRange, number> = {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
  }

  /**
   * Log a single response and bucket it by word count range.
   * This is the main API call for metrics logging.
   *
   * @param responseText The response text to analyze and log
   * @param options Optional metadata (route, method, status)
   * @returns Metrics entry that was logged
   */
  public logResponse(responseText: string, options?: LogResponseOptions): MetricsEntry {
    const wordCount = countWords(responseText)
    const range = getWordCountRange(wordCount)

    const entry: MetricsEntry = {
      timestamp: new Date().toISOString(),
      wordCount,
      range,
      route: options?.route,
      method: options?.method,
      status: options?.status,
    }

    this.entries.push(entry)
    this.rangeCounters[range]++

    return entry
  }

  /**
   * Get all logged entries
   */
  public getEntries(): MetricsEntry[] {
    return [...this.entries]
  }

  /**
   * Get count of responses in each range
   */
  public getRangeCounters(): Record<WordCountRange, number> {
    return { ...this.rangeCounters }
  }

  /**
   * Get count of responses in a specific range
   */
  public getRangeCount(range: WordCountRange): number {
    return this.rangeCounters[range]
  }

  /**
   * Get total number of logged responses
   */
  public getTotalCount(): number {
    return this.entries.length
  }

  /**
   * Get range distribution as percentages
   */
  public getRangeDistribution(): Record<WordCountRange, number> {
    const total = this.getTotalCount()
    if (total === 0) {
      return { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 }
    }

    return Object.entries(this.rangeCounters).reduce(
      (acc, [range, count]) => {
        acc[range as WordCountRange] = Math.round((count / total) * 100 * 100) / 100
        return acc
      },
      {} as Record<WordCountRange, number>
    )
  }

  /**
   * Get formatted log message for debugging
   */
  public formatLog(): string {
    const counters = this.getRangeCounters()
    const total = this.getTotalCount()
    return `[metrics] total=${total} xs=${counters.xs} sm=${counters.sm} md=${counters.md} lg=${counters.lg} xl=${counters.xl}`
  }

  /**
   * Get detailed summary
   */
  public getSummary(): object {
    return {
      totalResponses: this.getTotalCount(),
      rangeDistribution: this.getRangeCounters(),
      percentages: this.getRangeDistribution(),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Reset all metrics (clear all entries and counters)
   */
  public reset(): void {
    this.entries = []
    this.rangeCounters = {
      xs: 0,
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
    }
  }
}

/**
 * Global singleton metrics tracker instance
 */
export const metricsTracker = new MetricsTracker()

/**
 * Main API call — log response word-count range in a single call.
 * This is the primary public interface for the metrics utility.
 *
 * Usage:
 * ```ts
 * await logResponseRange("Hello world this is a response", {
 *   route: '/api/todos',
 *   method: 'GET',
 *   status: 200,
 * })
 * ```
 *
 * @param responseText The response text to analyze and log
 * @param options Optional metadata (route, method, status)
 * @returns The metrics entry that was logged
 */
export function logResponseRange(responseText: string, options?: LogResponseOptions): MetricsEntry {
  const entry = metricsTracker.logResponse(responseText, options)

  // Log to console for visibility
  console.log(`[metrics] range=${entry.range} words=${entry.wordCount} ${metricsTracker.formatLog()}`)

  return entry
}

/**
 * Get current metrics summary (useful for debugging/monitoring)
 */
export function getMetricsSummary(): object {
  return metricsTracker.getSummary()
}

/**
 * Reset all metrics
 */
export function resetMetrics(): void {
  metricsTracker.reset()
}

/**
 * Get formatted debug log
 */
export function getMetricsLog(): string {
  return metricsTracker.formatLog()
}
