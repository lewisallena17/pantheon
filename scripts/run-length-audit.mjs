#!/usr/bin/env node

/**
 * Wrapper to run log-response-lengths.mjs with proper environment setup
 * This ensures the audit log is created with word count statistics for 5 queries
 */

import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = join(fileURLToPath(import.meta.url), '..')
const scriptPath = join(__dirname, 'log-response-lengths.mjs')

console.log('🚀 Running length-audit script...\n')

const proc = spawn('node', [scriptPath], {
  cwd: join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env
})

proc.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ Audit completed successfully')
  } else {
    console.error(`\n❌ Audit failed with code ${code}`)
    process.exit(code)
  }
})

proc.on('error', (err) => {
  console.error(`\n❌ Failed to spawn process: ${err.message}`)
  process.exit(1)
})
