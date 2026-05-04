#!/usr/bin/env node

/**
 * Log response word counts to ./logs/length-audit.txt for 5 queries.
 * 
 * This script:
 * - Creates ./logs directory if missing
 * - Runs 5 sample queries against the Supabase database
 * - Counts words in each JSON response
 * - Appends results with timestamps to length-audit.txt
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const LOGS_DIR = join(process.cwd(), 'logs')
const AUDIT_FILE = join(LOGS_DIR, 'length-audit.txt')

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true })
  console.log(`[log-response-lengths] Created logs directory: ${LOGS_DIR}`)
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('[log-response-lengths] ERROR: Missing Supabase env vars')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * Count words in a string by splitting on whitespace.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Count words in a JSON response (entire stringified output).
 * @param {any} data
 * @returns {number}
 */
function countResponseWords(data) {
  const jsonStr = JSON.stringify(data)
  return countWords(jsonStr)
}

/**
 * Log a single query result to the audit file.
 * @param {string} queryName
 * @param {number} wordCount
 * @param {string} jsonSnippet
 */
function logAuditEntry(queryName, wordCount, jsonSnippet) {
  const timestamp = new Date().toISOString()
  const entry = `${timestamp} | query=${queryName} | word_count=${wordCount} | snippet=${jsonSnippet}\n`
  writeFileSync(AUDIT_FILE, entry, { flag: 'a' })
  console.log(`  ✓ ${queryName}: ${wordCount} words`)
}

/**
 * Main execution.
 */
async function main() {
  console.log('[log-response-lengths] Starting response word count audit...')
  const startTime = Date.now()
  let totalWords = 0

  try {
    // Query 1: todos (simple list)
    console.log('\n[1/5] Querying todos...')
    const { data: todos, error: err1 } = await supabase
      .from('todos')
      .select('id, title, description')
      .limit(10)
    if (err1) throw err1
    const todosWords = countResponseWords(todos)
    logAuditEntry('todos', todosWords, `[${todos.length} rows]`)
    totalWords += todosWords

    // Query 2: task_history
    console.log('[2/5] Querying task_history...')
    const { data: history, error: err2 } = await supabase
      .from('task_history')
      .select('*')
      .limit(10)
    if (err2) throw err2
    const historyWords = countResponseWords(history)
    logAuditEntry('task_history', historyWords, `[${history.length} rows]`)
    totalWords += historyWords

    // Query 3: slo_baselines
    console.log('[3/5] Querying slo_baselines...')
    const { data: baselines, error: err3 } = await supabase
      .from('slo_baselines')
      .select('*')
      .limit(10)
    if (err3) throw err3
    const baselinesWords = countResponseWords(baselines)
    logAuditEntry('slo_baselines', baselinesWords, `[${baselines.length} rows]`)
    totalWords += baselinesWords

    // Query 4: rpc_error_log
    console.log('[4/5] Querying rpc_error_log...')
    const { data: errors, error: err4 } = await supabase
      .from('rpc_error_log')
      .select('*')
      .limit(10)
    if (err4) throw err4
    const errorsWords = countResponseWords(errors)
    logAuditEntry('rpc_error_log', errorsWords, `[${errors.length} rows]`)
    totalWords += errorsWords

    // Query 5: god_status
    console.log('[5/5] Querying god_status...')
    const { data: godStatus, error: err5 } = await supabase
      .from('god_status')
      .select('*')
      .limit(10)
    if (err5) throw err5
    const statusWords = countResponseWords(godStatus)
    logAuditEntry('god_status', statusWords, `[${godStatus.length} rows]`)
    totalWords += statusWords

    // Summary
    const elapsed = Date.now() - startTime
    const summary = `\n=== AUDIT SUMMARY ===\nTimestamp: ${new Date().toISOString()}\nTotal word count: ${totalWords}\nElapsed: ${elapsed}ms\n`
    writeFileSync(AUDIT_FILE, summary, { flag: 'a' })

    console.log(`\n✓ Audit complete!`)
    console.log(`  Total word count: ${totalWords}`)
    console.log(`  Elapsed: ${elapsed}ms`)
    console.log(`  Logged to: ${AUDIT_FILE}`)

  } catch (err) {
    const errEntry = `${new Date().toISOString()} | ERROR: ${err.message}\n`
    writeFileSync(AUDIT_FILE, errEntry, { flag: 'a' })
    console.error(`\n✗ Error during audit:`, err.message)
    process.exit(1)
  }
}

main()
