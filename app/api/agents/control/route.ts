import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const ALLOWED_NAMES = new Set(['god', 'ruflo-agents', 'ruflo-orchestrator', 'revenue', 'all'])
const ALLOWED_ACTIONS = new Set(['start', 'stop', 'restart', 'reload'])

export async function POST(req: NextRequest) {
  const body = await req.json() as { action?: string; name?: string }
  const action = (body.action ?? '').toLowerCase()
  const name   = (body.name   ?? '').toLowerCase()

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: `action must be one of: ${Array.from(ALLOWED_ACTIONS).join(', ')}` }, { status: 400 })
  }
  if (!ALLOWED_NAMES.has(name)) {
    return NextResponse.json({ error: `name must be one of: ${Array.from(ALLOWED_NAMES).join(', ')}` }, { status: 400 })
  }

  try {
    const cmd = `pm2 ${action} ${name} --update-env`
    const { stdout, stderr } = await execAsync(cmd, { timeout: 15_000 })
    return NextResponse.json({ ok: true, action, name, stdout, stderr })
  } catch (e) {
    const err = e as { message?: string; stderr?: string; stdout?: string }
    return NextResponse.json({
      ok: false,
      error: err.message ?? 'pm2 command failed',
      stderr: err.stderr ?? '',
      stdout: err.stdout ?? '',
    }, { status: 500 })
  }
}

// GET /api/agents/control — returns current pm2 status
export async function GET() {
  try {
    const { stdout } = await execAsync('pm2 jlist', { timeout: 10_000 })
    const procs = JSON.parse(stdout || '[]') as Array<{
      name: string
      pm2_env: { status: string; restart_time: number; pm_uptime: number }
      monit: { cpu: number; memory: number }
    }>
    return NextResponse.json({
      agents: procs
        .filter(p => ALLOWED_NAMES.has(p.name))
        .map(p => ({
          name:        p.name,
          status:      p.pm2_env.status,
          restarts:    p.pm2_env.restart_time,
          uptimeStart: p.pm2_env.pm_uptime,
          cpu:         p.monit?.cpu    ?? 0,
          memoryMb:    Math.round((p.monit?.memory ?? 0) / 1024 / 1024),
        })),
    })
  } catch (e) {
    const err = e as { message?: string }
    return NextResponse.json({ error: err.message ?? 'pm2 jlist failed' }, { status: 500 })
  }
}
