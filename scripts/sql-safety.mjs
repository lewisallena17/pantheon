/**
 * sql-safety.mjs — Shared SQL safety utilities for all agent runners
 *
 * Imported by ruflo-runner.mjs and specialists.mjs to enforce:
 *   1. Mandatory LIMIT on every SELECT query (prevents unbounded table scans)
 *   2. Schema-first validation hint (warns when agent skips information_schema)
 *   3. Query audit logging (makes tool invocation failures visible)
 *
 * These three rules directly address the top recurring failure patterns:
 *   ✗ SELECT * FROM todos          → auto-patched to SELECT * FROM todos LIMIT 50
 *   ✗ SELECT * FROM god_status     → auto-patched to SELECT * FROM god_status LIMIT 50
 *   ✗ Silent tool failures         → now logged to agent-memory/sql-audit.jsonl
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUDIT_DIR  = join(__dirname, 'agent-memory')
const AUDIT_PATH = join(AUDIT_DIR, 'sql-audit.jsonl')

if (!existsSync(AUDIT_DIR)) mkdirSync(AUDIT_DIR, { recursive: true })

// ── Default safety limit injected when none is present ────────────────────
const DEFAULT_LIMIT = 50

/**
 * Sanitize an agent-supplied SQL query before it hits the database.
 *
 * Rules applied (in order):
 *   1. Strip leading/trailing whitespace and trailing semicolons so that
 *      appending LIMIT doesn't create invalid SQL ("SELECT 1; LIMIT 50").
 *   2. If the query is a SELECT and already has a LIMIT clause → leave it alone.
 *   3. If the query is a SELECT with no LIMIT → append "LIMIT <DEFAULT_LIMIT>".
 *   4. Non-SELECT statements (INSERT, UPDATE, DELETE, CREATE, …) → pass through
 *      unchanged (DDL/DML should not be LIMIT-capped).
 *
 * Returns { query: string, wasPatched: boolean, reason: string|null }
 */
export function sanitizeSql(rawQuery) {
  if (typeof rawQuery !== 'string' || !rawQuery.trim()) {
    return { query: rawQuery, wasPatched: false, reason: null }
  }

  // Normalise: strip trailing semicolons and collapse surrounding whitespace
  const trimmed = rawQuery.trim().replace(/;+\s*$/, '')

  const upperTrimmed = trimmed.toUpperCase()

  // Only apply LIMIT enforcement to SELECT queries
  if (!upperTrimmed.startsWith('SELECT') && !upperTrimmed.startsWith('WITH')) {
    return { query: trimmed, wasPatched: false, reason: null }
  }

  // Already has a LIMIT clause — respect the agent's intent
  // (handles both "LIMIT 10" and "LIMIT ALL" patterns)
  if (/\bLIMIT\s+\d+/i.test(trimmed)) {
    return { query: trimmed, wasPatched: false, reason: null }
  }

  // Has a FETCH FIRST / FETCH NEXT (SQL standard equivalent of LIMIT) → leave alone
  if (/\bFETCH\s+(FIRST|NEXT)\b/i.test(trimmed)) {
    return { query: trimmed, wasPatched: false, reason: null }
  }

  // Inject a safety LIMIT
  const patched = `${trimmed} LIMIT ${DEFAULT_LIMIT}`
  return {
    query:      patched,
    wasPatched: true,
    reason:     `Auto-added LIMIT ${DEFAULT_LIMIT} — unbounded SELECT detected`,
  }
}

/**
 * Append a single audit record to sql-audit.jsonl (one JSON object per line).
 * Failures are written synchronously so they survive process crashes.
 *
 * @param {object} record
 *   agent    {string}  - agent pool name (e.g. "db-specialist")
 *   taskId   {string}  - todo id being processed
 *   tool     {string}  - tool name ("run_sql", "agent_exec_sql", …)
 *   rawQuery {string}  - original query from the agent
 *   finalQuery {string} - query actually sent to the DB (may have LIMIT added)
 *   wasPatched {boolean}
 *   result   {string}  - "ok" | "error"
 *   errorMsg {string?} - error message if result === "error"
 *   durationMs {number}
 */
export function auditSqlCall(record) {
  try {
    const line = JSON.stringify({ ts: new Date().toISOString(), ...record }) + '\n'
    writeFileSync(AUDIT_PATH, line, { flag: 'a', encoding: 'utf8' })
  } catch {
    // Never let audit logging crash the agent
  }
}

/**
 * The SQL Safety System Prompt block injected into EVERY agent system prompt.
 *
 * This is the single source of truth for DB-safety rules that agents must
 * follow. It lives here so ruflo-runner.mjs and specialists.mjs both pull
 * from the same definition.
 */
export const SQL_SAFETY_SYSTEM_PROMPT = `
## ⚠️ MANDATORY SQL SAFETY RULES (non-negotiable)

You have access to a live production database. These rules are ENFORCED at the
tool layer AND required of your reasoning — violating them wastes budget and
causes task failure.

### Rule 1 — Schema-first, always
Before querying any table for data, you MUST first validate its schema:
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = '<table>' ORDER BY ordinal_position;

Skip this step only if you already ran it earlier in this same conversation.

### Rule 2 — LIMIT every SELECT
Every SELECT query on a data table MUST include a LIMIT clause.
Use LIMIT 10 for exploratory queries, LIMIT 50 for export tasks.
Never issue SELECT * without LIMIT. The tool layer will auto-append LIMIT 50
if you forget, but this costs an extra retry round-trip.

  ✓ SELECT id, title, status FROM todos LIMIT 10
  ✓ SELECT * FROM god_status LIMIT 50
  ✗ SELECT * FROM todos           ← NEVER — will be auto-blocked

### Rule 3 — Name columns explicitly for information_schema
When querying information_schema, ALWAYS name the columns you want:
  ✓ SELECT column_name, data_type, is_nullable FROM information_schema.columns ...
  ✗ SELECT * FROM information_schema.columns ...   ← too wide, wastes tokens

### Rule 4 — One tool call, one purpose
Do not chain multiple DB reads into a single tool call via semicolons.
Issue one SELECT per tool invocation. This prevents the "overloaded function"
ambiguity error that occurs with multi-statement queries.

### Rule 5 — Stop after first clean result
If a bounded query returns the rows you need, call task_complete immediately.
Do not re-issue the same query "just to double-check". Each redundant call
costs ~$0.03 and eats into the token budget.
`.trim()
