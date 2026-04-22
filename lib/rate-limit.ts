// Simple in-memory sliding-window rate limiter.
//
// Good enough for a single-instance deployment (your Vercel setup has
// multiple edge regions but each keeps its own counter — abuse traffic
// from one IP lands on one region most of the time).
//
// For multi-region strict enforcement, swap the in-memory map for Upstash
// Redis or Vercel KV and read/write via fetch. The API surface below
// stays identical.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { logRateLimitExceeded } from './fallback-events'

interface Bucket {
  requests: number[]   // timestamps (ms) of requests in the window
}

// Per-bucket state. Garbage-collected when entries age out of the window.
const buckets = new Map<string, Bucket>()

interface Limits {
  // Max requests allowed in the window
  max:      number
  // Window length in seconds
  windowS:  number
}

// Configure limits per route prefix. Longest-match wins.
export const ROUTE_LIMITS: Array<{ prefix: string; limits: Limits }> = [
  // Critical destructive endpoints — tight limit
  { prefix: '/api/agents/control',      limits: { max: 20,  windowS: 60 } },
  { prefix: '/api/git/revert',          limits: { max: 10,  windowS: 60 } },
  { prefix: '/api/newsletter/send',     limits: { max: 5,   windowS: 60 } },
  { prefix: '/api/notify/status',       limits: { max: 10,  windowS: 60 } },

  // Public-facing write endpoints — more generous but still capped
  { prefix: '/api/subscribe',           limits: { max: 10,  windowS: 60 } },    // sign-up spam
  { prefix: '/api/todos',               limits: { max: 120, windowS: 60 } },    // UI click-through

  // Read endpoints — high ceiling
  { prefix: '/api/revenue',             limits: { max: 60,  windowS: 60 } },
  { prefix: '/api/marketplace',         limits: { max: 60,  windowS: 60 } },
  { prefix: '/api/promote',             limits: { max: 60,  windowS: 60 } },

  // Fallback for any other /api route
  { prefix: '/api',                     limits: { max: 300, windowS: 60 } },
]

function findLimits(pathname: string): Limits | null {
  for (const r of ROUTE_LIMITS) {
    if (pathname.startsWith(r.prefix)) return r.limits
  }
  return null
}

function clientKey(req: NextRequest): string {
  // Vercel edge forwards client IP in `x-forwarded-for` (left-most is the real client).
  // Fallback to `x-real-ip`, then the anonymous "unknown" bucket.
  const xff = req.headers.get('x-forwarded-for')
  const ip  = xff?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  return ip
}

/**
 * Returns `null` if the request should be allowed, or a `NextResponse`
 * with a 429 status if the caller has exceeded the limit.
 */
export function rateLimit(req: NextRequest, pathname: string): NextResponse | null {
  const limits = findLimits(pathname)
  if (!limits) return null

  const now  = Date.now()
  const key  = `${clientKey(req)}:${pathname.split('/').slice(0, 4).join('/')}`
  const bucket = buckets.get(key) ?? { requests: [] }

  // Drop expired timestamps
  const windowMs = limits.windowS * 1000
  bucket.requests = bucket.requests.filter(t => now - t < windowMs)

  if (bucket.requests.length >= limits.max) {
    const oldest = bucket.requests[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    
    // Log fallback event: rate limit triggered
    logRateLimitExceeded(
      pathname,
      'RateLimiter',
      {
        fallbackStrategy: 'RETURN_429',
        retryAttempts: limits.max,
        clientKey: key,
        retryAfterSeconds: retryAfter,
      },
    )
    
    return NextResponse.json({
      error:      'Rate limit exceeded',
      limit:      limits.max,
      windowS:    limits.windowS,
      retryAfter,
    }, {
      status: 429,
      headers: {
        'retry-after':         String(retryAfter),
        'x-ratelimit-limit':   String(limits.max),
        'x-ratelimit-window':  String(limits.windowS),
        'x-ratelimit-remaining': '0',
      },
    })
  }

  bucket.requests.push(now)
  buckets.set(key, bucket)

  // Opportunistic GC — every 500 writes, evict buckets that haven't seen
  // a request in 2× the longest window (~2 min)
  if (buckets.size > 500 && Math.random() < 0.02) {
    const stale = now - 120_000
    for (const [k, b] of buckets.entries()) {
      if (b.requests.length === 0 || b.requests[b.requests.length - 1] < stale) {
        buckets.delete(k)
      }
    }
  }

  return null
}
