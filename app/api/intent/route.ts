/**
 * Intent Detection API Route
 * 
 * POST /api/intent
 * Request: { query: string }
 * Response: { intent: IntentResult, response: RouterResponse }
 */

import { detectIntent, type IntentResult } from '@/lib/intent-detector'
import { routeIntent, type RouterResponse } from '@/lib/response-router'

interface IntentRequest {
  query: string
}

interface IntentAPIResponse {
  success: boolean
  intent?: IntentResult
  response?: RouterResponse
  error?: string
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: IntentRequest = await request.json()

    if (!body.query || typeof body.query !== 'string') {
      return Response.json(
        {
          success: false,
          error: 'Missing or invalid "query" field',
        } as IntentAPIResponse,
        { status: 400 },
      )
    }

    const query = body.query.trim()

    // Detect intent
    const intent = detectIntent(query)

    // Route to response
    const response = routeIntent(intent)

    return Response.json(
      {
        success: true,
        intent,
        response,
      } as IntentAPIResponse,
      { status: 200 },
    )
  } catch (err) {
    console.error('[Intent API]', err)
    return Response.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      } as IntentAPIResponse,
      { status: 500 },
    )
  }
}

/**
 * GET for health check / documentation
 */
export async function GET(): Promise<Response> {
  return Response.json({
    service: 'Intent Detector',
    version: '1.0.0',
    modes: [
      'task_creation',
      'task_search',
      'agent_control',
      'navigation',
      'analytics',
      'clarification',
    ],
    usage: {
      method: 'POST',
      path: '/api/intent',
      body: '{ "query": "your query here" }',
    },
    examples: [
      {
        query: 'Create fix login bug',
        expectedMode: 'task_creation',
      },
      {
        query: 'Find pending tasks',
        expectedMode: 'task_search',
      },
      {
        query: 'Start god',
        expectedMode: 'agent_control',
      },
      {
        query: 'Go to analytics',
        expectedMode: 'navigation',
      },
      {
        query: 'Show cost metrics',
        expectedMode: 'analytics',
      },
    ],
  })
}
