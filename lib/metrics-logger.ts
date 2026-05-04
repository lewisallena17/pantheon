/**
 * Metrics logger — logs response word counts to metrics.json
 *
 * Tracks word counts for up to N consecutive queries/responses and writes
 * aggregated statistics to metrics.json with atomic write guarantees.
 *
 * Usage:
 * ```ts
 * import { metricsLogger } from '@/lib/metrics-logger'
 *
 * // Log a response word count
 * metricsLogger.addResponseWordCount("Some response text...", {
 *   route: '/api/todos',
 *   method: 'GET',
 *   status: 200,
 * })
 *
 * // After 5 queries, write to metrics.json
 * if (metricsLogger.getResponseCount() === 5) {
 *   await metricsLogger.writeToMetricsJson()
 * }
 * ```
 */

import { promises as fs } from 'fs'
import { join } from 'path'
import { countWords } from './word-count-logger'
import { atomicWriteMetadata } from './atomic-write'

const METRICS_JSON_PATH = join(process.cwd(), 'public', 'metrics.json')

/**
 * Word count entry for a single response
 */
interface ResponseWordCountEntry {
  wordCount: number
  route?: string
  method?: string
  status?: number
  timestamp: string
}

/**
 * Metrics data structure
 */
interface MetricsData {
  timestamp: string
  batchId: string
  queryCount: number
  responses: ResponseWordCountEntry[]
  stats: {
    minWords: number
    maxWords: number
    rangeWords: number
    totalWords: number
    avgWords: number
  }
}

/**
 * Options for adding a response word count
 */
interface ResponseOptions {
  route?: string
  method?: string
  status?: number
}

/**
 * Metrics logger — tracks word counts and writes to metrics.json
 */
class MetricsLogger {
  private responses: ResponseWordCountEntry[] = []
  private batchId: string = ''

  /**
   * Initialize a new batch
   */
  public initBatch(): void {
    this.batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}`
    this.reset()
  }

  /**
   * Add a response and count its words
   *
   * @param responseText The response text to count words in
   * @param options Optional metadata (route, method, status)
   */
  public addResponseWordCount(responseText: string, options?: ResponseOptions): void {
    const wordCount = countWords(responseText)
    this.responses.push({
      wordCount,
      route: options?.route,
      method: options?.method,
      status: options?.status,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Get the current number of responses tracked
   */
  public getResponseCount(): number {
    return this.responses.length
  }

  /**
   * Get all tracked responses
   */
  public getResponses(): ResponseWordCountEntry[] {
    return [...this.responses]
  }

  /**
   * Calculate statistics for the current batch
   */
  private calculateStats() {
    if (this.responses.length === 0) {
      return {
        minWords: 0,
        maxWords: 0,
        rangeWords: 0,
        totalWords: 0,
        avgWords: 0,
      }
    }

    const wordCounts = this.responses.map((r) => r.wordCount)
    const minWords = Math.min(...wordCounts)
    const maxWords = Math.max(...wordCounts)
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0)
    const avgWords = Math.round((totalWords / wordCounts.length) * 100) / 100

    return {
      minWords,
      maxWords,
      rangeWords: maxWords - minWords,
      totalWords,
      avgWords,
    }
  }

  /**
   * Build the metrics data object
   */
  private buildMetricsData(): MetricsData {
    return {
      timestamp: new Date().toISOString(),
      batchId: this.batchId,
      queryCount: this.responses.length,
      responses: this.responses,
      stats: this.calculateStats(),
    }
  }

  /**
   * Write the current batch metrics to metrics.json using atomic write.
   * Appends to existing metrics if file exists.
   */
  public async writeToMetricsJson(): Promise<void> {
    try {
      const metricsData = this.buildMetricsData()

      // Try to read existing metrics.json
      let allMetrics: MetricsData[] = []
      try {
        const existingContent = await fs.readFile(METRICS_JSON_PATH, 'utf-8')
        const parsed = JSON.parse(existingContent)
        allMetrics = Array.isArray(parsed) ? parsed : [parsed]
      } catch (err) {
        // File doesn't exist or can't be parsed, start fresh
        allMetrics = []
      }

      // Append the new batch
      allMetrics.push(metricsData)

      // Write using atomic write for safety
      const result = await atomicWriteMetadata(
        { batches: allMetrics, lastUpdated: new Date().toISOString() },
        METRICS_JSON_PATH,
        {
          computeHash: true,
          validateTokenCount: false, // We don't have token counts in metrics
          ensureDirectory: true,
        }
      )

      if (!result.success) {
        console.error('[metrics-logger] Atomic write failed:', result.error)
      } else {
        console.log('[metrics-logger] Successfully wrote metrics to', METRICS_JSON_PATH)
      }
    } catch (err) {
      console.error(
        '[metrics-logger] Error writing to metrics.json:',
        err instanceof Error ? err.message : String(err)
      )
    }
  }

  /**
   * Reset the current batch (clear all responses but keep batchId)
   */
  public reset(): void {
    this.responses = []
  }

  /**
   * Reset everything including batch ID
   */
  public resetAll(): void {
    this.responses = []
    this.batchId = ''
  }

  /**
   * Get JSON representation of current metrics (without writing)
   */
  public toJSON(): MetricsData {
    return this.buildMetricsData()
  }

  /**
   * Get a formatted log message for debugging
   */
  public formatLog(): string {
    const stats = this.calculateStats()
    return `[metrics] responses=${this.responses.length} min=${stats.minWords} max=${stats.maxWords} avg=${stats.avgWords} total=${stats.totalWords}`
  }
}

/**
 * Global singleton metrics logger instance
 */
export const metricsLogger = new MetricsLogger()

/**
 * Convenience wrapper to log a response and check if batch is complete.
 * Automatically writes to metrics.json when 5 responses are logged.
 *
 * Usage:
 * ```ts
 * await logResponseAndMaybeFlush(responseText, {
 *   route: '/api/todos',
 *   method: 'GET',
 *   status: 200,
 *   autoFlush: 5  // write when 5 responses accumulated
 * })
 * ```
 */
export async function logResponseAndMaybeFlush(
  responseText: string,
  options?: ResponseOptions & { autoFlush?: number }
): Promise<void> {
  const autoFlushThreshold = options?.autoFlush ?? 5

  metricsLogger.addResponseWordCount(responseText, options)
  console.log('[metrics-logger]', metricsLogger.formatLog())

  if (metricsLogger.getResponseCount() >= autoFlushThreshold) {
    await metricsLogger.writeToMetricsJson()
    metricsLogger.reset()
  }
}
