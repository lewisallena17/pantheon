import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const dynamic = 'force-dynamic'

const MANIFEST_PATH = join(process.cwd(), 'public', 'briefings', 'manifest.json')

export async function GET() {
  try {
    if (!existsSync(MANIFEST_PATH)) return NextResponse.json({ daily: [], weekly: [] })
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
    return NextResponse.json({
      daily:  (manifest.daily ?? []).slice(-10).reverse(),
      weekly: (manifest.weekly ?? []).slice(-10).reverse(),
    })
  } catch {
    return NextResponse.json({ daily: [], weekly: [] })
  }
}
