import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

const STORE_PATH = path.resolve(process.cwd(), 'scripts/subscribers.json')

interface Subscriber {
  email:      string
  source:     string
  referrer?:  string
  createdAt:  string
  confirmed:  boolean
}

interface Store {
  subscribers: Subscriber[]
}

async function loadStore(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, 'utf8')) as Store
  } catch {
    return { subscribers: [] }
  }
}

async function saveStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2))
}

// Simple RFC-5322 lite validator — good enough for form input
function validEmail(e: string): boolean {
  return typeof e === 'string'
    && e.length >= 6
    && e.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

// POST /api/subscribe — add a subscriber
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as {
    email?:    string
    source?:   string
    referrer?: string
  }

  const email = (body.email ?? '').trim().toLowerCase()
  if (!validEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const store = await loadStore()
  const existing = store.subscribers.find(s => s.email === email)
  if (existing) {
    return NextResponse.json({
      ok: true,
      already: true,
      message: 'You\'re already on the list — thanks!',
    })
  }

  store.subscribers.push({
    email,
    source:    (body.source ?? 'unknown').slice(0, 80),
    referrer:  body.referrer?.slice(0, 200),
    createdAt: new Date().toISOString(),
    confirmed: false,
  })
  await saveStore(store)

  return NextResponse.json({
    ok: true,
    message: 'Thanks — you\'re in. I\'ll ping you when there\'s something worth sharing.',
    total:   store.subscribers.length,
  })
}

// GET /api/subscribe — stats + list (dashboard use)
export async function GET(req: NextRequest) {
  const store  = await loadStore()
  const format = req.nextUrl.searchParams.get('format')

  if (format === 'csv') {
    const header = 'email,source,referrer,createdAt'
    const rows = store.subscribers.map(s =>
      [s.email, s.source, s.referrer ?? '', s.createdAt].map(csvEscape).join(',')
    )
    return new NextResponse([header, ...rows].join('\n'), {
      status: 200,
      headers: {
        'content-type':        'text/csv',
        'content-disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  const total = store.subscribers.length
  const recent = store.subscribers
    .slice(-20)
    .reverse()

  const today = new Date().toISOString().slice(0, 10)
  const last7 = Date.now() - 7 * 86_400_000
  const today_count = store.subscribers.filter(s => s.createdAt.startsWith(today)).length
  const week_count  = store.subscribers.filter(s => new Date(s.createdAt).getTime() >= last7).length

  const bySource: Record<string, number> = {}
  for (const s of store.subscribers) bySource[s.source] = (bySource[s.source] ?? 0) + 1

  return NextResponse.json({
    total,
    today:  today_count,
    week:   week_count,
    recent,
    bySource,
  })
}

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}
