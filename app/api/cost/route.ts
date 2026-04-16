import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

const COST_LOG_PATH = join(process.cwd(), 'scripts', 'cost-log.json')

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    if (!existsSync(COST_LOG_PATH)) {
      return NextResponse.json({ total: 0, byAgent: {}, sessions: [] })
    }
    const data = JSON.parse(readFileSync(COST_LOG_PATH, 'utf8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ total: 0, byAgent: {}, sessions: [] })
  }
}
