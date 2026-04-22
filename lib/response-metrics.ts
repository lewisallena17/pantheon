/**
 * Response metrics — tracks and logs response byte-count distribution.
 *
 * Buckets responses by size (< 1KB, 1-10KB, 10-100KB, > 100KB) and
 * provides distribution statistics for analysis.
 *
 * Does NOT block response delivery — all tracking is fire-and-forget.
 */

interface ByteCountBucket {
  '<1KB': number
  '1-10KB': number
  '10-100KB': number
  '>100KB': number
}

interface ResponseMetrics {
  totalResponses: number
  totalBytes: number
  averageBytes: number
  distribution: ByteCountBucket
  timestamp: string
}

// In-memory tracking — resets on server restart
let metrics = {
  totalResponses: 0,
  totalBytes: 0,
  buckets: {
    '<1KB': 0,
    '1-10KB': 0,
    '10-100KB': 0,
    '>100KB': 0,
  } as ByteCountBucket,
}

/**
 * Get the byte-count size bucket for a response.
 * @param byteCount Number of bytes in the response
 * @returns Bucket name
 */
function getBucket(byteCount: number): keyof ByteCountBucket {
  if (byteCount < 1024) return '<1KB'
  if (byteCount < 10240) return '1-10KB'
  if (byteCount < 102400) return '10-100KB'
  return '>100KB'
}

/**
 * Record a response's byte count into the distribution.
 * Fire-and-forget — never blocks or throws.
 * @param byteCount Content length in bytes
 */
export function recordResponseSize(byteCount: number): void {
  try {
    metrics.totalResponses += 1
    metrics.totalBytes += byteCount

    const bucket = getBucket(byteCount)
    metrics.buckets[bucket] += 1
  } catch (err) {
    // Swallow errors — metrics should never fail the main response
    console.error('[response-metrics] Error recording size:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Get current distribution snapshot.
 * @returns Metrics object with distribution summary
 */
export function getDistribution(): ResponseMetrics {
  return {
    totalResponses: metrics.totalResponses,
    totalBytes: metrics.totalBytes,
    averageBytes: metrics.totalResponses > 0 ? Math.round(metrics.totalBytes / metrics.totalResponses) : 0,
    distribution: { ...metrics.buckets },
    timestamp: new Date().toISOString(),
  }
}

/**
 * Reset all metrics to zero.
 * Useful for testing or periodic metric rotation.
 */
export function resetMetrics(): void {
  metrics = {
    totalResponses: 0,
    totalBytes: 0,
    buckets: {
      '<1KB': 0,
      '1-10KB': 0,
      '10-100KB': 0,
      '>100KB': 0,
    },
  }
}

/**
 * Log current distribution to console (for debugging).
 */
export function logDistribution(): void {
  const current = getDistribution()
  console.log('[response-metrics]', JSON.stringify(current, null, 2))
}
