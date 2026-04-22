/**
 * Session Logger — logs conversation_id to .meta/session.log on each response
 * 
 * Writes asynchronously to avoid blocking response delivery.
 * Appends timestamp + conversation_id + route + status on each API response.
 * 
 * Ensures .meta directory exists before writing (lazy directory creation).
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const META_DIR = join(process.cwd(), '.meta')
const SESSION_LOG_PATH = join(META_DIR, 'session.log')

interface SessionLogEntry {
  timestamp: string
  conversation_id: string
  route?: string
  method?: string
  status?: number
}

/**
 * Ensure .meta directory exists before writing
 * Uses lazy directory creation to avoid startup overhead
 */
async function ensureMetaDir(): Promise<void> {
  try {
    await mkdir(META_DIR, { recursive: true })
  } catch (err) {
    console.error('[session-logger] Failed to create .meta dir:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log a session/conversation entry with conversation_id.
 * Runs asynchronously — does NOT block response delivery.
 * 
 * @param conversationId - Unique conversation identifier
 * @param route - Optional API route
 * @param method - Optional HTTP method
 * @param status - Optional HTTP status code
 */
export async function logSessionEntry(
  conversationId: string,
  route?: string,
  method?: string,
  status?: number,
): Promise<void> {
  try {
    const entry: SessionLogEntry = {
      timestamp: new Date().toISOString(),
      conversation_id: conversationId,
      route,
      method,
      status,
    }

    await ensureMetaDir()

    const logLine = JSON.stringify(entry)

    // Fire-and-forget: append to log without awaiting
    // This ensures the log write doesn't add latency to the response
    appendFile(SESSION_LOG_PATH, logLine + '\n').catch((err) => {
      console.error('[session-logger] Failed to write log:', err instanceof Error ? err.message : String(err))
    })
  } catch (err) {
    // Swallow errors — logging should never fail the main response
    console.error('[session-logger] Error in logSessionEntry:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * Log a session entry with full context.
 * Convenience wrapper for logging at response time.
 * 
 * Usage in a route handler:
 * ```ts
 * const conversationId = req.headers.get('x-conversation-id') ?? 'unknown'
 * const response = NextResponse.json({ ... })
 * await logSession(conversationId, '/api/agents/chat', 'POST', response.status)
 * return response
 * ```
 */
export async function logSession(
  conversationId: string,
  route: string,
  method: string,
  status?: number,
): Promise<void> {
  await logSessionEntry(conversationId, route, method, status)
}
