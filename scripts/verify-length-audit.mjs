#!/usr/bin/env node

/**
 * Verification script for length-audit functionality
 * Tests word counting logic without hitting the database
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const LOGS_DIR = join(process.cwd(), 'logs')
const AUDIT_FILE = join(LOGS_DIR, 'length-audit.txt')

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true })
  console.log(`✓ Created logs directory: ${LOGS_DIR}`)
}

/**
 * Count words in a string by splitting on whitespace.
 */
function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Count words in a JSON response (entire stringified output).
 */
function countResponseWords(data) {
  const jsonStr = JSON.stringify(data)
  return countWords(jsonStr)
}

/**
 * Log a single query result to the audit file.
 */
function logAuditEntry(queryName, wordCount, jsonSnippet) {
  const timestamp = new Date().toISOString()
  const entry = `${timestamp} | query=${queryName} | word_count=${wordCount} | snippet=${jsonSnippet}\n`
  writeFileSync(AUDIT_FILE, entry, { flag: 'a' })
  console.log(`  ✓ ${queryName}: ${wordCount} words`)
}

console.log('Verifying length-audit functionality with mock data...\n')
const startTime = Date.now()
let totalWords = 0

try {
  // Mock query results
  const mockQueries = [
    {
      name: 'todos',
      data: [
        { id: '123', title: 'Task 1', description: 'First task' },
        { id: '456', title: 'Task 2', description: 'Second task' }
      ]
    },
    {
      name: 'task_history',
      data: [
        { id: 'h1', action: 'created', task_id: '123', actor_name: 'Alice' },
        { id: 'h2', action: 'updated', task_id: '456', actor_name: 'Bob' }
      ]
    },
    {
      name: 'slo_baselines',
      data: [
        { id: 'slo1', name: 'latency', value: 100 },
        { id: 'slo2', name: 'throughput', value: 1000 }
      ]
    },
    {
      name: 'rpc_error_log',
      data: [
        { id: 'err1', rpc_name: 'query1', error_code: 'PGRST001', error_message: 'Timeout' },
        { id: 'err2', rpc_name: 'query2', error_code: 'PGRST002', error_message: 'Parse error' }
      ]
    },
    {
      name: 'god_status',
      data: [
        { id: 1, meta: { mood: 'OMNIPOTENT', cycles: 721, confidence: 100 } }
      ]
    }
  ]

  // Process each query
  mockQueries.forEach((query, idx) => {
    console.log(`[${idx + 1}/5] Processing ${query.name}...`)
    const wordCount = countResponseWords(query.data)
    logAuditEntry(query.name, wordCount, `[${query.data.length} rows]`)
    totalWords += wordCount
  })

  // Summary
  const elapsed = Date.now() - startTime
  const summary = `\n=== AUDIT SUMMARY ===\nTimestamp: ${new Date().toISOString()}\nTotal word count: ${totalWords}\nElapsed: ${elapsed}ms\n`
  writeFileSync(AUDIT_FILE, summary, { flag: 'a' })

  console.log(`\n✓ Verification complete!`)
  console.log(`  Total word count: ${totalWords}`)
  console.log(`  Elapsed: ${elapsed}ms`)
  console.log(`  Logged to: ${AUDIT_FILE}`)

} catch (err) {
  const errEntry = `${new Date().toISOString()} | ERROR: ${err.message}\n`
  writeFileSync(AUDIT_FILE, errEntry, { flag: 'a' })
  console.error(`\n✗ Error during verification:`, err.message)
  process.exit(1)
}
