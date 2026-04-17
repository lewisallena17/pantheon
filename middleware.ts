import { NextRequest, NextResponse } from 'next/server'

// Routes that mutate agent state or trigger external actions.
// GET on these routes is allowed (read-only status). POST/PATCH/DELETE require auth.
const GUARDED_ROUTES = [
  '/api/agents/control',
  '/api/git/revert',
  '/api/github/issues/sync',
  '/api/marketplace/listings',
  '/api/notify/status',
  '/api/revenue/gumroad',
]

function requiresAuth(pathname: string, method: string): boolean {
  if (method === 'GET') return false
  return GUARDED_ROUTES.some(r => pathname.startsWith(r))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!requiresAuth(pathname, req.method)) return NextResponse.next()

  const secret = process.env.DASHBOARD_SECRET
  // If no secret configured, only allow localhost (127.0.0.1/::1) — dev mode
  if (!secret) {
    const host = req.headers.get('host') ?? ''
    const isLocal = host.startsWith('localhost:') || host.startsWith('127.0.0.1:') || host.startsWith('[::1]:')
    if (!isLocal) {
      return NextResponse.json({
        error: 'DASHBOARD_SECRET not configured — remote write operations are blocked. Set DASHBOARD_SECRET in .env.local.',
      }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Secret configured — require matching header or cookie
  const headerSecret = req.headers.get('x-dashboard-secret')
  const cookieSecret = req.cookies.get('dashboard-auth')?.value

  if (headerSecret === secret || cookieSecret === secret) return NextResponse.next()

  return NextResponse.json({
    error: 'Unauthorized — include x-dashboard-secret header',
  }, { status: 401 })
}

export const config = {
  matcher: [
    '/api/agents/:path*',
    '/api/git/:path*',
    '/api/github/:path*',
    '/api/marketplace/:path*',
    '/api/notify/:path*',
    '/api/revenue/gumroad',
  ],
}
