/**
 * Example usage of the api/response.js timing delta logging module
 * 
 * This file demonstrates how to integrate response timing measurement
 * into Next.js API route handlers.
 * 
 * NOT EXECUTABLE — this is documentation only.
 * Copy patterns into your actual route handlers.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  startResponseTiming,
  measureResponseDelta,
  TimingDelta,
  formatTimingDelta,
} from '@/api/response'

/**
 * Example 1: Basic timing with explicit logComplete
 */
export async function ExampleBasicGET(req: NextRequest) {
  // Start timing measurement at handler entry
  const timing = startResponseTiming(
    '/api/todos',
    'GET',
    req.headers.get('x-request-id') || undefined
  )

  try {
    // ... fetch data from database ...
    const data = { todos: [] }

    // Create response
    const response = NextResponse.json(data)

    // Log the timing delta (status is taken from response)
    timing.logComplete(response.status)

    return response
  } catch (err) {
    // Log error with error code
    timing.logComplete(500, 'INTERNAL_ERROR')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Example 2: With queuing delay tracking
 * 
 * Useful when:
 * - Request waits in queue before processing
 * - You want to measure queuing separately from generation
 * - Analyzing performance bottlenecks
 */
export async function ExampleWithQueuingGET(req: NextRequest) {
  const timing = startResponseTiming('/api/expensive', 'GET')

  // Simulate queuing delay (e.g., waiting for connection pool)
  // In real scenarios, this might be automatic from middleware
  await new Promise((r) => setTimeout(r, 50))

  // Mark when actual processing starts
  timing.setProcessingStart(Date.now())

  try {
    // ... perform expensive operation ...
    const result = { data: 'expensive computation result' }

    const response = NextResponse.json(result)
    timing.logComplete(response.status)
    return response
  } catch (err) {
    timing.logComplete(500, 'PROCESSING_ERROR')
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Example 3: Using the convenience wrapper
 * 
 * Cleaner syntax with automatic error handling
 */
export async function ExampleWithWrapperGET(req: NextRequest) {
  const { response, timing } = await measureResponseDelta(
    async () => {
      // Your async logic here
      const data = await fetchSomething()
      return NextResponse.json(data)
    },
    '/api/data',
    'GET',
    req.headers.get('x-request-id') || undefined
  )

  return response
}

/**
 * Example 4: POST with timing and user tracking
 */
export async function ExamplePostPOST(req: NextRequest) {
  const userId = req.headers.get('x-user-id') || undefined
  const requestId = req.headers.get('x-request-id') || undefined

  const timing = startResponseTiming('/api/todos', 'POST', requestId, userId)

  try {
    const body = await req.json().catch(() => null)

    if (!body?.title) {
      timing.logComplete(400, 'INVALID_INPUT')
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      )
    }

    // Create todo in database
    const newTodo = { id: '123', title: body.title }

    const response = NextResponse.json(newTodo, { status: 201 })
    timing.logComplete(201)
    return response
  } catch (err) {
    timing.logComplete(500, 'DB_ERROR')
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    )
  }
}

/**
 * Example 5: Accessing timing data in response
 * 
 * Include timing metadata in the response envelope
 */
export async function ExampleWithMetadataGET(req: NextRequest) {
  const timing = startResponseTiming('/api/with-timing', 'GET')

  try {
    const data = { message: 'Hello' }

    // Create response with timing metadata
    const response = NextResponse.json({
      data,
      // Include timing breakdown in response
      _timing: timing.toJSON(),
    })

    timing.logComplete(response.status)
    return response
  } catch (err) {
    timing.logComplete(500)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * Example 6: Conditional logging based on classification
 */
export async function ExampleWithConditionalsGET(req: NextRequest) {
  const timing = startResponseTiming('/api/health-check', 'GET')

  try {
    const isHealthy = await checkSystemHealth()

    const status = isHealthy ? 200 : 503
    const response = NextResponse.json(
      { status: isHealthy ? 'ok' : 'degraded' },
      { status }
    )

    timing.logComplete(status)

    // Log formatted message to console if slow
    if (timing.isSlowResponse()) {
      console.warn(
        '[slow-response]',
        formatTimingDelta(timing)
      )
    }

    return response
  } catch (err) {
    timing.logComplete(500, 'HEALTH_CHECK_ERROR')
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}

/**
 * Example 7: Middleware pre-hook for queuing measurement
 * 
 * If you want to measure queuing delay from request entry to handler,
 * use middleware to capture the initial timestamp
 */
export async function middleware(req: NextRequest) {
  // Store request start time in headers for the route handler to use
  const requestStartMs = Date.now()
  req.headers.set('x-request-start-ms', String(requestStartMs))
  return req
}

export async function ExampleWithMiddlewareGET(req: NextRequest) {
  const requestStartMs = parseInt(
    req.headers.get('x-request-start-ms') || '0',
    10
  )

  const timing = startResponseTiming('/api/queued', 'GET')

  // Simulate the queuing delay that happened before handler entry
  if (requestStartMs > 0) {
    const queuingMs = Date.now() - requestStartMs
    // This would be set automatically if tracked in middleware
    timing.processingStartMs = Date.now() - queuingMs
  }

  try {
    const data = { message: 'Processed after queue' }
    const response = NextResponse.json(data)
    timing.logComplete(response.status)
    return response
  } catch (err) {
    timing.logComplete(500)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

// Placeholder functions
async function fetchSomething() {
  return { data: 'example' }
}

async function checkSystemHealth() {
  return true
}
