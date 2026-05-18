#!/usr/bin/env node
/**
 * constraint-echo.js
 * 
 * Logs back what limits/constraints it receives.
 * 
 * Accepts constraint objects (rate limits, timeouts, quotas, token limits, etc.)
 * and echoes them back with timestamp and metadata.
 * 
 * Usage:
 *   import { echoConstraints } from './constraint-echo.js'
 *   
 *   echoConstraints({
 *     rate_limit: { requests: 100, window_s: 60 },
 *     timeout_ms: 30000,
 *     max_tokens: 4096,
 *     quota: { daily_limit: 10000, used: 5432 }
 *   })
 * 
 * Or as a CLI:
 *   node constraint-echo.js '{"rate_limit":{"requests":100,"window_s":60}}'
 */

import { appendFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_DIR = join(__dirname, '..', 'logs')
const ECHO_LOG_FILE = join(LOG_DIR, 'constraint-echo.log')

/**
 * Interface for constraint objects that can be logged.
 * 
 * Examples:
 * - { rate_limit: { requests: 100, window_s: 60 } }
 * - { timeout_ms: 30000, max_tokens: 4096 }
 * - { quota: { daily_limit: 10000, used: 5432 }, expires_at: '2024-12-31' }
 * - { tokens: { input: 1000, output: 1500 }, total: 2500 }
 */
export interface ConstraintObject {
  [key: string]: unknown
}

/**
 * Constraint echo event — what we receive and when.
 */
export interface ConstraintEchoEvent {
  /** ISO timestamp when constraints were received */
  timestamp: string
  
  /** UUID or request ID for tracing (optional) */
  request_id?: string
  
  /** The constraint object itself */
  constraints: ConstraintObject
  
  /** Normalized fields extracted from the constraint object */
  fields: {
    rate_limit?: {
      max_requests?: number
      window_seconds?: number
      reset_at?: string
    }
    timeout?: {
      milliseconds?: number
      type?: string
    }
    quota?: {
      limit?: number
      used?: number
      remaining?: number
      reset_date?: string
    }
    tokens?: {
      input?: number
      output?: number
      total?: number
      max?: number
    }
    memory?: {
      limit_mb?: number
      current_mb?: number
    }
    [key: string]: unknown
  }
  
  /** Source context (e.g., route, function name, API) */
  source?: string
  
  /** Any additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Normalize a constraint object into standard fields.
 * 
 * Extracts common constraint patterns:
 * - rate_limit / rate-limit / rateLimit -> { max_requests, window_seconds }
 * - timeout / timeout_ms / timeoutMs -> { milliseconds, type }
 * - quota / quotas -> { limit, used, remaining, reset_date }
 * - tokens / token_count / tokenCount -> { input, output, total, max }
 * - memory / mem_limit -> { limit_mb, current_mb }
 * 
 * @param constraints - The constraint object to normalize
 * @returns Normalized fields object
 */
export function normalizeConstraints(constraints: ConstraintObject) {
  const fields: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(constraints)) {
    const lowerKey = key.toLowerCase().replace(/[_-]/g, '')
    
    // Rate limit variants: rate_limit, rate-limit, rateLimit, rateLimits
    if (lowerKey.includes('ratelimit')) {
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        fields.rate_limit = {
          max_requests: obj.max || obj.requests || obj.limit,
          window_seconds: obj.window_s || obj.window || obj.windowSeconds,
          reset_at: obj.reset_at || obj.resetAt || obj.reset,
        }
      }
    }
    
    // Timeout variants: timeout, timeout_ms, timeoutMs
    else if (lowerKey.includes('timeout')) {
      fields.timeout = {
        milliseconds: typeof value === 'number' ? value : (value as Record<string, unknown>)?.ms,
        type: typeof value === 'object' ? (value as Record<string, unknown>)?.type : undefined,
      }
    }
    
    // Quota variants: quota, quotas
    else if (lowerKey.includes('quota')) {
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        fields.quota = {
          limit: obj.limit || obj.max,
          used: obj.used || obj.current,
          remaining: obj.remaining || (obj.limit && obj.used ? (obj.limit as number) - (obj.used as number) : undefined),
          reset_date: obj.reset_date || obj.resetDate || obj.reset,
        }
      }
    }
    
    // Token variants: tokens, token_count, tokenCount, token_limit
    else if (lowerKey.includes('token')) {
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        fields.tokens = {
          input: obj.input || obj.input_tokens || obj.prompt,
          output: obj.output || obj.output_tokens || obj.completion,
          total: obj.total || obj.total_tokens,
          max: obj.max || obj.max_tokens || obj.limit,
        }
      } else if (typeof value === 'number') {
        fields.tokens = { total: value }
      }
    }
    
    // Memory variants: memory, mem_limit, memoryLimit
    else if (lowerKey.includes('mem')) {
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        fields.memory = {
          limit_mb: obj.limit_mb || obj.limitMb || obj.max,
          current_mb: obj.current_mb || obj.currentMb || obj.used,
        }
      } else if (typeof value === 'number') {
        fields.memory = { limit_mb: value }
      }
    }
    
    // Pass through any other constraint keys as-is
    else {
      fields[key] = value
    }
  }
  
  return fields
}

/**
 * Ensure the log directory exists.
 */
async function ensureLogDir() {
  try {
    await mkdir(LOG_DIR, { recursive: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('[constraint-echo] Failed to create log directory:', (err as Error).message)
    }
  }
}

/**
 * Echo (log) a constraint object.
 * 
 * Receives a constraint object, normalizes it, and logs to constraint-echo.log.
 * Returns the event that was logged.
 * 
 * @param constraints - The constraint object to echo
 * @param source - Optional source context (route, function name, API endpoint)
 * @param requestId - Optional request ID for tracing
 * @param metadata - Optional additional metadata
 * @returns The constraint echo event that was logged
 * 
 * @example
 * ```js
 * const event = await echoConstraints(
 *   { rate_limit: { requests: 100, window_s: 60 }, timeout_ms: 30000 },
 *   '/api/chat',
 *   'req-12345',
 *   { user_id: 'user-999' }
 * )
 * console.log(event)
 * // {
 * //   timestamp: '2024-01-15T10:30:45.123Z',
 * //   request_id: 'req-12345',
 * //   constraints: { rate_limit: {...}, timeout_ms: 30000 },
 * //   fields: { rate_limit: {...}, timeout: {...} },
 * //   source: '/api/chat',
 * //   metadata: { user_id: 'user-999' }
 * // }
 * ```
 */
export async function echoConstraints(
  constraints: ConstraintObject,
  source?: string,
  requestId?: string,
  metadata?: Record<string, unknown>,
): Promise<ConstraintEchoEvent> {
  const event: ConstraintEchoEvent = {
    timestamp: new Date().toISOString(),
    request_id: requestId,
    constraints,
    fields: normalizeConstraints(constraints),
    source,
    metadata,
  }
  
  // Log asynchronously without blocking
  try {
    await ensureLogDir()
    await appendFile(ECHO_LOG_FILE, JSON.stringify(event) + '\n', 'utf8')
  } catch (err) {
    // Logging should not throw
    console.error(
      '[constraint-echo] Failed to write log:',
      err instanceof Error ? err.message : String(err),
    )
  }
  
  return event
}

/**
 * Synchronous version of echoConstraints (for fire-and-forget use).
 * Does NOT return the event; use the async version if you need the return value.
 * 
 * @param constraints - The constraint object to echo
 * @param source - Optional source context
 * @param requestId - Optional request ID
 * @param metadata - Optional metadata
 */
export function echoConstraintsSync(
  constraints: ConstraintObject,
  source?: string,
  requestId?: string,
  metadata?: Record<string, unknown>,
): void {
  // Fire-and-forget; errors are swallowed
  echoConstraints(constraints, source, requestId, metadata).catch(() => {
    // Silence
  })
}

/**
 * Get a human-readable summary of echoed constraints.
 * 
 * Reads the log file and prints a summary.
 */
export async function summarizeEchoedConstraints(): Promise<string> {
  try {
    const fs = await import('node:fs/promises')
    const content = await fs.readFile(ECHO_LOG_FILE, 'utf8')
    const lines = content.trim().split('\n').filter(Boolean)
    
    if (lines.length === 0) {
      return 'No constraints logged yet.'
    }
    
    const events = lines.map(line => JSON.parse(line) as ConstraintEchoEvent)
    
    const rateLimit = events.filter(e => e.fields.rate_limit).length
    const timeouts = events.filter(e => e.fields.timeout).length
    const quotas = events.filter(e => e.fields.quota).length
    const tokens = events.filter(e => e.fields.tokens).length
    const memory = events.filter(e => e.fields.memory).length
    
    const recent = events.slice(-3)
    
    return `
Echoed Constraints Summary
==========================
Total events logged: ${lines.length}
Rate limit constraints: ${rateLimit}
Timeout constraints: ${timeouts}
Quota constraints: ${quotas}
Token constraints: ${tokens}
Memory constraints: ${memory}

Recent events:
${recent.map(e => `  [${e.timestamp}] source=${e.source || 'unknown'} | keys=${Object.keys(e.constraints).join(', ')}`).join('\n')}

Log file: ${ECHO_LOG_FILE}
    `.trim()
  } catch (err) {
    return `Error reading log: ${err instanceof Error ? err.message : String(err)}`
  }
}

/**
 * CLI interface
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
constraint-echo.js — Log and echo back constraint objects

Usage:
  node constraint-echo.js <constraint-json> [source] [request-id]
  node constraint-echo.js --summary

Examples:
  node constraint-echo.js '{"rate_limit":{"requests":100,"window_s":60}}'
  node constraint-echo.js '{"timeout_ms":30000,"max_tokens":4096}' '/api/chat' 'req-123'
  node constraint-echo.js --summary
    `)
    process.exit(0)
  }
  
  if (args[0] === '--summary' || args[0] === '-s') {
    summarizeEchoedConstraints().then(summary => {
      console.log(summary)
    })
  } else {
    try {
      const constraints = JSON.parse(args[0]) as ConstraintObject
      const source = args[1]
      const requestId = args[2]
      
      echoConstraints(constraints, source, requestId).then(event => {
        console.log('✓ Constraint echoed:')
        console.log(JSON.stringify(event, null, 2))
      })
    } catch (err) {
      console.error('Error parsing constraint JSON:', (err as Error).message)
      process.exit(1)
    }
  }
}

export default {
  echoConstraints,
  echoConstraintsSync,
  normalizeConstraints,
  summarizeEchoedConstraints,
}
