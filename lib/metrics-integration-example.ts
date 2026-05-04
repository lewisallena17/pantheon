/**
 * Example integration of metricsLogger with Next.js API routes
 * 
 * This file demonstrates how to integrate the word count metrics logger
 * into actual API route handlers to track and log response word counts.
 * 
 * NOT EXECUTABLE — this is documentation/examples only.
 * Copy patterns into your actual route handlers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { metricsLogger, logResponseAndMaybeFlush } from './metrics-logger'
import { TimingDelta } from '@/api/response'

/**
 * Example 1: Simple usage with manual flush
 * 
 * Initialize a batch, log responses, and flush when 5 are collected
 */
export async function ExampleSimpleGET(req: NextRequest) {
  // Initialize the batch at the start of your app or request handler
  if (metricsLogger.getResponseCount() === 0) {
    metricsLogger.initBatch()
  }

  try {
    // ... your API logic ...
    const data = { todos: ['Task 1', 'Task 2'] }
    const responseText = JSON.stringify(data)

    // Log the response word count with metadata
    metricsLogger.addResponseWordCount(responseText, {
      route: '/api/todos',
      method: 'GET',
      status: 200,
    })

    console.log('[metrics]', metricsLogger.formatLog())

    // Check if we've collected 5 responses
    if (metricsLogger.getResponseCount() === 5) {
      console.log('[metrics] Flushing metrics batch to metrics.json...')
      await metricsLogger.writeToMetricsJson()
      metricsLogger.reset()
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Example 2: Using the convenience wrapper with auto-flush
 * 
 * Cleaner syntax — automatically writes when 5 responses are logged
 */
export async function ExampleWithWrapperGET(req: NextRequest) {
  if (metricsLogger.getResponseCount() === 0) {
    metricsLogger.initBatch()
  }

  try {
    const data = { status: 'ok' }
    const responseText = JSON.stringify(data)

    // Automatically flushes when count reaches 5
    await logResponseAndMaybeFlush(responseText, {
      route: '/api/status',
      method: 'GET',
      status: 200,
      autoFlush: 5,
    })

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

/**
 * Example 3: Integration with response timing delta
 * 
 * Combine metrics logging with response timing measurement
 */
export async function ExampleWithTimingGET(req: NextRequest) {
  // Initialize batch if needed
  if (metricsLogger.getResponseCount() === 0) {
    metricsLogger.initBatch()
  }

  // Measure response timing
  const timing = new (require('@/api/response').TimingDelta)(
    '/api/expensive',
    'GET',
    req.headers.get('x-request-id') || undefined
  )

  try {
    // ... your expensive operation ...
    const result = { data: 'computation result' }
    const responseText = JSON.stringify(result)

    // Log both timing and metrics
    timing.logComplete(200)

    metricsLogger.addResponseWordCount(responseText, {
      route: '/api/expensive',
      method: 'GET',
      status: 200,
    })

    console.log('[metrics]', metricsLogger.formatLog())

    if (metricsLogger.getResponseCount() === 5) {
      await metricsLogger.writeToMetricsJson()
      metricsLogger.reset()
    }

    return NextResponse.json(result)
  } catch (err) {
    timing.logComplete(500)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}

/**
 * Example 4: Middleware hook for automatic batch initialization
 * 
 * Use middleware to initialize the metrics batch at the start of each request
 */
export async function metricsMiddleware(req: NextRequest) {
  // Initialize batch once per "session" or request window
  // In production, you might initialize at app startup or on a timer
  if (metricsLogger.getResponseCount() === 0 && !req.nextUrl.pathname.includes('/health')) {
    metricsLogger.initBatch()
  }

  return NextRequest.next()
}

/**
 * Example 5: Manual batch management
 * 
 * For advanced use cases where you need explicit control
 */
export async function ExampleManualBatchGET(req: NextRequest) {
  // Start a new batch
  metricsLogger.initBatch()

  const responses = [
    { data: 'Response 1', route: '/api/r1' },
    { data: 'Response 2 with more content', route: '/api/r2' },
    { data: 'Response 3', route: '/api/r3' },
    { data: 'Response 4 with substantial data', route: '/api/r4' },
    { data: 'Response 5 final', route: '/api/r5' },
  ]

  // Log all 5 responses
  for (const response of responses) {
    const responseText = JSON.stringify(response)
    metricsLogger.addResponseWordCount(responseText, {
      route: response.route,
      method: 'GET',
      status: 200,
    })
  }

  // Get metrics before writing
  const metrics = metricsLogger.toJSON()
  console.log('[metrics] Batch complete:', metrics)

  // Write to metrics.json
  await metricsLogger.writeToMetricsJson()

  return NextResponse.json({
    message: 'Metrics batch logged successfully',
    metrics,
  })
}

/**
 * Example 6: Error handling with metrics
 * 
 * Ensure metrics are logged even when errors occur
 */
export async function ExampleWithErrorHandlingGET(req: NextRequest) {
  if (metricsLogger.getResponseCount() === 0) {
    metricsLogger.initBatch()
  }

  try {
    const data = { result: 'success' }
    const responseText = JSON.stringify(data)

    metricsLogger.addResponseWordCount(responseText, {
      route: '/api/with-error-handling',
      method: 'GET',
      status: 200,
    })

    if (metricsLogger.getResponseCount() === 5) {
      await metricsLogger.writeToMetricsJson()
      metricsLogger.reset()
    }

    return NextResponse.json(data)
  } catch (err) {
    // Log error response to metrics as well
    const errorText = JSON.stringify({ error: 'Internal server error' })
    metricsLogger.addResponseWordCount(errorText, {
      route: '/api/with-error-handling',
      method: 'GET',
      status: 500,
    })

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Example 7: Accessing metrics data
 * 
 * Get current metrics without writing to file
 */
export async function ExampleReadMetricsGET(req: NextRequest) {
  const metrics = metricsLogger.toJSON()

  return NextResponse.json({
    message: 'Current metrics status',
    currentBatchId: metrics.batchId,
    responseCount: metrics.queryCount,
    stats: metrics.stats,
  })
}

/**
 * SETUP GUIDE:
 * 
 * 1. Initialize batch in your app startup or middleware:
 *    ```ts
 *    import { metricsLogger } from '@/lib/metrics-logger'
 *    
 *    // In your root layout or middleware
 *    metricsLogger.initBatch()
 *    ```
 * 
 * 2. Add to each API route handler:
 *    ```ts
 *    import { logResponseAndMaybeFlush } from '@/lib/metrics-logger'
 *    
 *    // In your route
 *    await logResponseAndMaybeFlush(responseText, {
 *      route: '/api/your-route',
 *      method: 'GET',
 *      status: 200,
 *    })
 *    ```
 * 
 * 3. Metrics will automatically write to public/metrics.json when 5 responses are logged
 * 
 * 4. View metrics at http://localhost:3000/metrics.json
 */
