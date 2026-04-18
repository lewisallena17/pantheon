// Shared cross-agent memory — a single JSON file every agent pool + God
// read and write to. The point: a lesson learned by db-specialist should
// be visible to ui-specialist on its next task. Previously God's wisdom
// was siloed in its own file; now the high-signal entries get bridged
// into the shared pool too.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const MAX_LESSONS = 50

export function sharedMemoryPath(agentMemoryDir) {
  return `${agentMemoryDir}/global-lessons.json`
}

export function loadShared(agentMemoryDir) {
  const p = sharedMemoryPath(agentMemoryDir)
  try { if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')) } catch {}
  return { lessons: [], taskCount: 0 }
}

export function saveShared(agentMemoryDir, state) {
  const p = sharedMemoryPath(agentMemoryDir)
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true })
  try { writeFileSync(p, JSON.stringify(state, null, 2), 'utf8') } catch {}
}

/** Add a lesson. De-dups against existing. Caps at MAX_LESSONS. */
export function publishShared(agentMemoryDir, lesson) {
  if (!lesson || typeof lesson !== 'string') return
  const mem = loadShared(agentMemoryDir)
  if (mem.lessons.includes(lesson)) return   // already there
  mem.lessons = [...mem.lessons.slice(-(MAX_LESSONS - 1)), lesson]
  mem.taskCount = (mem.taskCount ?? 0) + 1
  saveShared(agentMemoryDir, mem)
}

/** Add multiple lessons at once. */
export function publishSharedBatch(agentMemoryDir, lessons) {
  if (!Array.isArray(lessons) || lessons.length === 0) return
  const mem = loadShared(agentMemoryDir)
  const seen = new Set(mem.lessons)
  const fresh = lessons.filter(l => l && typeof l === 'string' && !seen.has(l))
  if (!fresh.length) return
  mem.lessons = [...mem.lessons, ...fresh].slice(-MAX_LESSONS)
  mem.taskCount = (mem.taskCount ?? 0) + fresh.length
  saveShared(agentMemoryDir, mem)
}
