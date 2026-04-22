/**
 * Response timer — measure elapsed milliseconds per function call.
 *
 * Provides utilities to measure execution time for sync/async functions
 * and async operations. Useful for performance profiling and latency tracking.
 *
 * Supports:
 * - Manual start/stop timing
 * - Wrapper functions for automatic timing
 * - High-resolution timing with performance.now()
 * - Fallback to Date.now() for compatibility
 *
 * Fire-and-forget: timing never blocks or throws.
 */

/**
 * Timer snapshot — captures elapsed time at a moment in time.
 */
export interface TimerSnapshot {
  elapsedMs: number
  startMs: number
  endMs: number
}

/**
 * Async function result with timing metadata.
 */
export interface TimedResult<T> {
  result: T
  elapsedMs: number
  startMs: number
  endMs: number
}

/**
 * Start a timer and return control functions.
 *
 * Usage:
 * ```ts
 * const timer = startTimer()
 * // ... do work ...
 * const elapsed = timer.stop()
 * console.log(`Work took ${elapsed.elapsedMs}ms`)
 * ```
 *
 * @returns Timer control object with start/stop/elapsed methods
 */
export function startTimer(): {
  stop: () => TimerSnapshot
  elapsed: () => number
  reset: () => void
  startMs: number
} {
  let startMs = Date.now()

  return {
    stop: (): TimerSnapshot => {
      const endMs = Date.now()
      return {
        elapsedMs: endMs - startMs,
        startMs,
        endMs,
      }
    },
    elapsed: (): number => Date.now() - startMs,
    reset: (): void => {
      startMs = Date.now()
    },
    startMs,
  }
}

/**
 * Start a high-resolution timer using performance.now().
 * Falls back to Date.now() in non-browser/non-Node.js environments.
 *
 * Usage:
 * ```ts
 * const timer = startHighResTimer()
 * // ... do work ...
 * const elapsed = timer.stop()
 * console.log(`Work took ${elapsed.elapsedMs.toFixed(2)}ms`)
 * ```
 *
 * @returns High-resolution timer control object
 */
export function startHighResTimer(): {
  stop: () => TimerSnapshot
  elapsed: () => number
  reset: () => void
  startMs: number
} {
  const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now()

  return {
    stop: (): TimerSnapshot => {
      const endMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
      return {
        elapsedMs: endMs - startMs,
        startMs,
        endMs,
      }
    },
    elapsed: (): number => {
      const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
      return nowMs - startMs
    },
    reset: (): void => {
      // Note: cannot truly reset with performance.now() since it's monotonic
      // This method exists for API consistency but is a no-op for high-res timers
    },
    startMs,
  }
}

/**
 * Manually calculate elapsed milliseconds between two timestamps.
 *
 * Usage:
 * ```ts
 * const startMs = Date.now()
 * // ... do work ...
 * const elapsed = elapsedMs(startMs)
 * ```
 *
 * @param startMs Start timestamp in milliseconds
 * @returns Elapsed milliseconds since startMs
 */
export function elapsedMs(startMs: number): number {
  return Date.now() - startMs
}

/**
 * Measure execution time of a synchronous function.
 * Catches and re-throws errors without modifying them.
 *
 * Usage:
 * ```ts
 * const { result, elapsedMs } = measureSync(() => expensiveComputation())
 * console.log(`Computation took ${elapsedMs}ms and returned:`, result)
 * ```
 *
 * @param fn Synchronous function to measure
 * @returns Object with result and timing metadata
 * @throws Re-throws any error thrown by fn
 */
export function measureSync<T>(fn: () => T): TimedResult<T> {
  const startMs = Date.now()

  try {
    const result = fn()
    const endMs = Date.now()

    return {
      result,
      elapsedMs: endMs - startMs,
      startMs,
      endMs,
    }
  } catch (err) {
    // Re-throw error as-is; timing is not recorded on error path
    throw err
  }
}

/**
 * Measure execution time of an asynchronous function.
 * Catches and re-throws errors without modifying them.
 * Promise rejection is not swallowed — it propagates to caller.
 *
 * Usage:
 * ```ts
 * const { result, elapsedMs } = await measureAsync(async () => {
 *   return await fetchData()
 * })
 * console.log(`Fetch took ${elapsedMs}ms`)
 * ```
 *
 * @param fn Async function to measure
 * @returns Promise that resolves to object with result and timing metadata
 * @throws Re-throws any error thrown by fn
 */
export async function measureAsync<T>(fn: () => Promise<T>): Promise<TimedResult<T>> {
  const startMs = Date.now()

  try {
    const result = await fn()
    const endMs = Date.now()

    return {
      result,
      elapsedMs: endMs - startMs,
      startMs,
      endMs,
    }
  } catch (err) {
    // Re-throw error as-is; timing is not recorded on error path
    throw err
  }
}

/**
 * Wrap a synchronous function to automatically time and log each call.
 * Original function errors are propagated to caller (timing is not recorded on error).
 *
 * Usage:
 * ```ts
 * const timedAdd = timedSync((a: number, b: number) => a + b, 'add')
 * const result = timedAdd(2, 3)
 * // Logs: [response-timer-add] 5 elapsed 1ms
 * ```
 *
 * @param fn Synchronous function to wrap
 * @param label Optional label for logging (defaults to function name)
 * @returns Wrapped function that measures and logs execution time
 */
export function timedSync<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  label?: string
): (...args: Args) => R {
  const name = label || fn.name || 'anonymous'

  return (...args: Args): R => {
    try {
      const timer = startTimer()
      const result = fn(...args)
      const elapsed = timer.stop()

      console.log(`[response-timer-${name}] elapsed ${elapsed.elapsedMs}ms`)
      return result
    } catch (err) {
      // Re-throw without logging the error (caller is responsible for error handling)
      throw err
    }
  }
}

/**
 * Wrap an asynchronous function to automatically time and log each call.
 * Original function errors and promise rejections are propagated to caller.
 * Timing is not recorded on error path.
 *
 * Usage:
 * ```ts
 * const timedFetch = timedAsync(async (url: string) => {
 *   const res = await fetch(url)
 *   return res.json()
 * }, 'fetch')
 *
 * const data = await timedFetch('https://api.example.com/data')
 * // Logs: [response-timer-fetch] elapsed 245ms
 * ```
 *
 * @param fn Async function to wrap
 * @param label Optional label for logging (defaults to function name)
 * @returns Wrapped async function that measures and logs execution time
 */
export function timedAsync<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  label?: string
): (...args: Args) => Promise<R> {
  const name = label || fn.name || 'anonymous'

  return async (...args: Args): Promise<R> => {
    try {
      const timer = startTimer()
      const result = await fn(...args)
      const elapsed = timer.stop()

      console.log(`[response-timer-${name}] elapsed ${elapsed.elapsedMs}ms`)
      return result
    } catch (err) {
      // Re-throw without logging the error (caller is responsible for error handling)
      throw err
    }
  }
}

/**
 * Higher-order function: measure and log multiple calls to the same operation.
 * Useful for batch operations or repeated calls.
 *
 * Usage:
 * ```ts
 * const timer = createBatchTimer('database-inserts')
 * for (const item of items) {
 *   timer.mark('insert')
 *   await db.insert(item)
 * }
 * timer.report()
 * // Logs: [response-timer-batch] database-inserts: 5 inserts, 1250ms total, 250ms avg
 * ```
 *
 * @param label Name of the batch operation
 * @returns Batch timer control object
 */
export function createBatchTimer(label: string): {
  mark: (operation?: string) => void
  report: () => { total: number; count: number; average: number }
  reset: () => void
} {
  let startMs = Date.now()
  let operationCount = 0
  const operations: { [key: string]: number } = {}

  return {
    mark: (operation = 'default'): void => {
      operations[operation] = (operations[operation] || 0) + 1
      operationCount += 1
    },
    report: (): { total: number; count: number; average: number } => {
      const total = Date.now() - startMs
      const average = operationCount > 0 ? Math.round(total / operationCount) : 0

      const report = {
        total,
        count: operationCount,
        average,
      }

      console.log(`[response-timer-batch] ${label}:`, JSON.stringify(report))
      return report
    },
    reset: (): void => {
      startMs = Date.now()
      operationCount = 0
      Object.keys(operations).forEach((key) => delete operations[key])
    },
  }
}

/**
 * Check if timer module is available (always true in Node.js/browser environments).
 * Useful for conditional timing in cross-platform code.
 */
export function isTimerAvailable(): boolean {
  return typeof Date !== 'undefined' && typeof performance !== 'undefined'
}

/**
 * Format milliseconds as a human-readable string.
 * Automatically selects units (ms, s, m) based on magnitude.
 *
 * Usage:
 * ```ts
 * formatElapsedTime(1500)  // "1.50s"
 * formatElapsedTime(45)    // "45ms"
 * formatElapsedTime(120000) // "2.00m"
 * ```
 *
 * @param ms Milliseconds to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with appropriate unit
 */
export function formatElapsedTime(ms: number, decimals = 2): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(decimals)}s`
  }

  return `${(ms / 60000).toFixed(decimals)}m`
}
