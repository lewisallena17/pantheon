/**
 * sql-safety.mjs — Mandatory SQL guard layer for all agent DB operations
 *
 * Every agent_exec_sql / agent_exec_ddl call MUST pass through these
 * helpers before touching the database.  The layer enforces:
 *
 *  1. LIMIT injection  — SELECT without a LIMIT gets one added (max 10)
 *  2. Unbounded query detection — blocks SELECT * without WHERE or LIMIT
 *  3. DDL write-gate  — INSERT/UPDATE/DELETE/CREATE/DROP requires prior
 *                        schema validation via schemaCheck()
 *  4. Schema pre-flight — validate a table exists before any operation
 *  5. Curiosity block  — rejects exploratory queries with no task anchor
 *
 * Usage:
 *   import { safeExecSql, safeExecDdl, schemaCheck } from './sql-safety.mjs'
 *
 *   // For SELECT queries (agent_exec_sql):
 *   const result = await safeExecSql(supabase, 'SELECT id, title FROM todos', { taskId: 'abc' })
 *
 *   // For write operations (agent_exec_ddl):
 *   const validated = await schemaCheck(supabase, 'todos')
 *   if (validated.ok) {
 *     const result = await safeExecDdl(supabase, 'INSERT INTO todos ...', { taskId: 'abc' })
 *   }
 */

const DEFAULT_LIMIT    = 10
const MAX_LIMIT        = 50
const SCHEMA_CACHE_TTL = 5 * 60 * 1000   // 5 minutes

// ── In-memory schema cache ────────────────────────────────────────────────
// Prevents repeated information_schema queries on the same table within a
// single agent run.  Shared across all imports in the same process.
const _schemaCache = new Map()   // tableName → { columns, cachedAt }

// ── 1. LIMIT injection ────────────────────────────────────────────────────
/**
 * Inject a LIMIT clause into a SELECT query if one is missing.
 * Returns the (possibly modified) SQL string.
 */
export function injectLimit(sql, limit = DEFAULT_LIMIT) {
  if (typeof sql !== 'string') return sql
  const trimmed = sql.trim()
  // Only patch SELECT statements
  if (!/^\s*SELECT\b/i.test(trimmed)) return trimmed

  // Already has LIMIT — honour it (but cap it)
  const existingMatch = trimmed.match(/\bLIMIT\s+(\d+)/i)
  if (existingMatch) {
    const existing = parseInt(existingMatch[1], 10)
    if (existing <= MAX_LIMIT) return trimmed
    // Cap oversized LIMIT
    return trimmed.replace(/\bLIMIT\s+\d+/i, `LIMIT ${MAX_LIMIT}`)
  }

  // No LIMIT — append one before any trailing semicolon
  const withoutSemi = trimmed.replace(/;+\s*$/, '')
  return `${withoutSemi} LIMIT ${limit};`
}

// ── 2. Unbounded query detection ──────────────────────────────────────────
/**
 * Returns { safe: false, reason } for dangerous queries, { safe: true } otherwise.
 */
export function detectUnbounded(sql) {
  if (typeof sql !== 'string') return { safe: false, reason: 'SQL must be a string' }
  const normalized = sql.trim().replace(/\s+/g, ' ').toUpperCase()

  // Allow non-SELECT statements to pass through (DDL checks are separate)
  if (!/^SELECT\b/.test(normalized)) return { safe: true }

  // SELECT * without WHERE or LIMIT is the canonical "unbounded" query
  if (
    /SELECT\s+\*/.test(normalized) &&
    !/WHERE\b/.test(normalized) &&
    !/LIMIT\s+\d+/.test(normalized)
  ) {
    return {
      safe: false,
      reason: 'Unbounded SELECT * without WHERE or LIMIT — add LIMIT or explicit column list',
    }
  }

  return { safe: true }
}

// ── 3. Schema pre-flight ──────────────────────────────────────────────────
/**
 * Validate that `tableName` exists in the public schema.
 * Returns { ok: true, columns } on success, { ok: false, reason } on failure.
 * Results are cached for SCHEMA_CACHE_TTL ms.
 */
export async function schemaCheck(supabase, tableName) {
  if (!tableName || typeof tableName !== 'string') {
    return { ok: false, reason: 'tableName must be a non-empty string' }
  }

  const cached = _schemaCache.get(tableName)
  if (cached && Date.now() - cached.cachedAt < SCHEMA_CACHE_TTL) {
    return { ok: true, columns: cached.columns, fromCache: true }
  }

  try {
    const { data, error } = await supabase.rpc('agent_exec_sql', {
      query: `SELECT column_name, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name   = '${tableName.replace(/'/g, "''")}'
              ORDER BY ordinal_position
              LIMIT 50`,
    })

    if (error) {
      return { ok: false, reason: `Schema check RPC failed: ${error.message}` }
    }

    const columns = (Array.isArray(data) ? data : []).flat()
    if (!columns.length) {
      return { ok: false, reason: `Table '${tableName}' not found in public schema` }
    }

    _schemaCache.set(tableName, { columns, cachedAt: Date.now() })
    return { ok: true, columns }
  } catch (e) {
    return { ok: false, reason: `Schema check threw: ${e.message}` }
  }
}

// ── 4. Safe SELECT executor ───────────────────────────────────────────────
/**
 * Execute a SELECT query with automatic LIMIT injection and unbounded-query
 * detection.  Pass `{ taskId }` for audit logging.
 *
 * Returns { data, error } — same shape as supabase.rpc()
 */
export async function safeExecSql(supabase, sql, { taskId = 'unknown', limit = DEFAULT_LIMIT } = {}) {
  // Step 1 — Detect unbounded before injection (catches the worst patterns)
  const check = detectUnbounded(sql)
  if (!check.safe) {
    const msg = `[sql-safety] BLOCKED unbounded query (task=${taskId}): ${check.reason}`
    console.warn(msg)
    return { data: null, error: new Error(msg) }
  }

  // Step 2 — Inject LIMIT
  const safeSql = injectLimit(sql, limit)

  console.log(`[sql-safety] exec (task=${taskId}): ${safeSql.slice(0, 120)}`)

  try {
    const { data, error } = await supabase.rpc('agent_exec_sql', { query: safeSql })
    if (error) {
      console.warn(`[sql-safety] query error (task=${taskId}): ${error.message}`)
    }
    return { data, error }
  } catch (e) {
    console.error(`[sql-safety] threw (task=${taskId}): ${e.message}`)
    return { data: null, error: e }
  }
}

// ── 5. Safe DDL / write executor ─────────────────────────────────────────
/**
 * Execute a write operation (INSERT / UPDATE / DELETE / CREATE / DROP).
 * Requires `schemaValidated: true` in opts, or will block.
 * Pass `{ taskId, schemaValidated }` — you MUST call schemaCheck() first.
 *
 * Returns { data, error }
 */
export async function safeExecDdl(supabase, sql, { taskId = 'unknown', schemaValidated = false } = {}) {
  if (!schemaValidated) {
    const msg = `[sql-safety] BLOCKED DDL without prior schema validation (task=${taskId}). Call schemaCheck() first.`
    console.error(msg)
    return { data: null, error: new Error(msg) }
  }

  // Block DROP and TRUNCATE unconditionally — too destructive for autonomous agents
  const upper = sql.trim().toUpperCase()
  if (/^\s*(DROP|TRUNCATE)\b/.test(upper)) {
    const msg = `[sql-safety] BLOCKED destructive DDL: DROP/TRUNCATE not permitted (task=${taskId})`
    console.error(msg)
    return { data: null, error: new Error(msg) }
  }

  console.log(`[sql-safety] ddl (task=${taskId}): ${sql.slice(0, 120)}`)

  try {
    // DDL uses agent_exec_sql as well (the DB function handles writes too)
    const { data, error } = await supabase.rpc('agent_exec_sql', { query: sql })
    if (error) {
      console.warn(`[sql-safety] ddl error (task=${taskId}): ${error.message}`)
    }
    return { data, error }
  } catch (e) {
    console.error(`[sql-safety] ddl threw (task=${taskId}): ${e.message}`)
    return { data: null, error: e }
  }
}

// ── 6. Curiosity / exploratory query guard ────────────────────────────────
/**
 * Returns true if a task title looks like pure curiosity / exploration with
 * no concrete deliverable.  Use to skip or deprioritise such tasks.
 *
 * Heuristic: matches known exploratory title patterns from failure logs.
 */
const CURIOSITY_PATTERNS = [
  /^\[CURIOSITY\]/i,
  /\bexplor\w*/i,
  /\bcuriosity\b/i,
  /\binvestigat\w* (schema|database|table)\b/i,
  /\bprobe\b/i,
  /\bsee what.*(in|inside|contains)/i,
  /^(research|discover|understand) (the |a )?(db|database|schema)/i,
]

export function isCuriosityTask(title = '') {
  return CURIOSITY_PATTERNS.some(re => re.test(title))
}

// ── 7. Quick-reference summary (used in agent system prompts) ─────────────
export const SQL_SAFETY_RULES = `
## Mandatory SQL Execution Rules (enforced by sql-safety.mjs)

1. ALWAYS call schemaCheck(supabase, tableName) before any INSERT/UPDATE/DELETE.
   - If schemaCheck returns ok:false → do NOT execute the write, report the error.

2. ALWAYS use explicit column lists in SELECT — never SELECT * without a WHERE clause.

3. ALWAYS include LIMIT 5-10 on every SELECT.  safeExecSql() auto-injects LIMIT ${DEFAULT_LIMIT}
   but you must still write the LIMIT explicitly so intent is clear.

4. NEVER call agent_exec_ddl directly.  Use safeExecDdl() with schemaValidated:true.

5. NEVER execute DROP or TRUNCATE — blocked unconditionally.

6. Skip tasks with [CURIOSITY] prefix or pure exploratory titles — they have no
   concrete deliverable and will exceed the token budget without producing output.

7. Query execution order:
   a. schemaCheck(table)    ← always first
   b. safeExecSql(SELECT)   ← reads
   c. safeExecDdl(WRITE)    ← writes, only after step a
`.trim()
