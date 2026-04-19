import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

const MEM_DIR = join(process.cwd(), 'scripts', 'agent-memory')

export const dynamic = 'force-dynamic'

interface Entry { agent: string; lesson: string; at: string; idx: number }

export async function GET() {
  if (!existsSync(MEM_DIR)) return NextResponse.json({ entries: [] })

  const files = readdirSync(MEM_DIR).filter(f => f.endsWith('.json'))
  const all: Entry[] = []

  for (const f of files) {
    const path = join(MEM_DIR, f)
    let raw
    try { raw = JSON.parse(readFileSync(path, 'utf8')) } catch { continue }
    const lessons: string[] = Array.isArray(raw?.lessons) ? raw.lessons : []
    if (!lessons.length) continue

    const mtime = statSync(path).mtime.toISOString()
    const agent = f.replace(/\.json$/, '')

    // Take the last 15 lessons from each file; the tail is the freshest.
    // We fake a per-lesson timestamp by offsetting from mtime — this gives a
    // plausible ordering for the feed without requiring schema changes.
    const tail = lessons.slice(-15)
    for (const [i, lesson] of tail.entries()) {
      all.push({
        agent,
        lesson,
        at:  new Date(new Date(mtime).getTime() - (tail.length - 1 - i) * 1000).toISOString(),
        idx: i,
      })
    }
  }

  // Newest first, cap the payload
  all.sort((a, b) => b.at.localeCompare(a.at))
  return NextResponse.json({ entries: all.slice(0, 60) })
}
