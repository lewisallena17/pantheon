/**
 * Word-count logger — tracks response word-count ranges and logs to /tmp/depth.txt
 *
 * Counts words in response strings, maintains min/max/range statistics,
 * and writes the final summary to /tmp/depth.txt after a request batch.
 *
 * Usage:
 * ```ts
 * const counter = new WordCountTracker()
 * counter.addResponse("Hello world") // 2 words
 * counter.addResponse("This is a test") // 4 words
 * await counter.writeToFile() // writes min/max/range to /tmp/depth.txt
 * ```
 */

import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEPTH_LOG_PATH = '/tmp/depth.txt'

interface WordCountStats {
  minWords: number
  maxWords: number
  rangeWords: number
  responseCount: number
  totalWords: number
  avgWords: number
  timestamp: string
}

/**
 * Count words in a string by splitting on whitespace.
 * Handles multiple spaces, tabs, newlines.
 *
 * @param text Input string
 * @returns Number of words (blank strings return 0)
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0
  }
  return text.trim().split(/\s+/).length
}

/**
 * Tracker for response word counts across multiple responses.
 * Maintains min/max/range statistics and writes to file.
 */
export class WordCountTracker {
  private wordCounts: number[] = []
  private minWords: number = Infinity
  private maxWords: number = 0

  /**
   * Add a response string and count its words.
   * Updates min/max automatically.
   */
  public addResponse(responseText: string): void {
    const wordCount = countWords(responseText)
    this.wordCounts.push(wordCount)

    if (wordCount < this.minWords) {
      this.minWords = wordCount
    }
    if (wordCount > this.maxWords) {
      this.maxWords = wordCount
    }
  }

  /**
   * Get current statistics.
   */
  public getStats(): WordCountStats {
    const responseCount = this.wordCounts.length
    const totalWords = this.wordCounts.reduce((sum, count) => sum + count, 0)
    const avgWords = responseCount > 0 ? totalWords / responseCount : 0
    const rangeWords = responseCount > 0 ? this.maxWords - this.minWords : 0

    return {
      minWords: this.minWords === Infinity ? 0 : this.minWords,
      maxWords: this.maxWords,
      rangeWords,
      responseCount,
      totalWords,
      avgWords: Math.round(avgWords * 100) / 100,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Write statistics to /tmp/depth.txt.
   * Formats as JSON for easy parsing.
   */
  public async writeToFile(): Promise<void> {
    try {
      const stats = this.getStats()
      const logLine = JSON.stringify({
        timestamp: stats.timestamp,
        minWords: stats.minWords,
        maxWords: stats.maxWords,
        rangeWords: stats.rangeWords,
        avgWords: stats.avgWords,
        totalWords: stats.totalWords,
        responseCount: stats.responseCount,
      })

      await writeFile(DEPTH_LOG_PATH, logLine + '\n', { flag: 'a' })
    } catch (err) {
      console.error('[word-count-logger] Failed to write to /tmp/depth.txt:', err instanceof Error ? err.message : String(err))
    }
  }

  /**
   * Reset the tracker (clear all counts).
   */
  public reset(): void {
    this.wordCounts = []
    this.minWords = Infinity
    this.maxWords = 0
  }

  /**
   * Get all word counts (for debugging).
   */
  public getWordCounts(): number[] {
    return [...this.wordCounts]
  }
}

/**
 * Global singleton tracker instance (optional convenience export).
 * Can be reused across multiple logging calls within a request.
 */
export const globalWordCountTracker = new WordCountTracker()
