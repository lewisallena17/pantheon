// Thin wrapper around fetch() that attaches the dashboard-secret header.
// Reads the secret from NEXT_PUBLIC_DASHBOARD_SECRET (exposed to the browser
// bundle by Next — fine because the threat model is drive-by requests from
// other machines on the LAN, not cross-site attacks).
//
// Usage:
//   import { authFetch } from '@/lib/auth-fetch'
//   await authFetch('/api/agents/control', { method: 'POST', body: ... })

export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const secret = process.env.NEXT_PUBLIC_DASHBOARD_SECRET
  if (!secret) return fetch(input, init)

  const headers = new Headers(init?.headers ?? {})
  headers.set('x-dashboard-secret', secret)

  return fetch(input, { ...init, headers })
}
