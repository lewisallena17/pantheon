#!/usr/bin/env node

/**
 * insert-baseline-observability.mjs
 * 
 * Inserts a baseline observability record into the god_status table
 * using direct Supabase client instead of problematic agent_exec_ddl functions.
 * 
 * Usage:
 *   node scripts/insert-baseline-observability.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// Load environment
const envPath = join(PROJECT_ROOT, '.env.local')
let env = {}
try {
  const envFile = readFileSync(envPath, 'utf8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) env[match[1].trim()] = match[2].trim()
  }
} catch (e) {
  console.error(`⚠️  Failed to load .env.local: ${e.message}`)
  process.exit(1)
}

// Initialize Supabase client with service role
const supabase = createClient(
  env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function insertBaselineRecord() {
  try {
    console.log('📝 Inserting baseline observability record into god_status...')

    // Define the baseline observability record
    const baselineRecord = {
      id: 1,
      thought: 'Baseline observability initialized',
      name: 'baseline_observability',
      value: 'System introspection started',
      updated_at: new Date().toISOString(),
    }

    // Use upsert to handle existing record
    const { data, error } = await supabase
      .from('god_status')
      .upsert(baselineRecord, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('❌ Error inserting baseline record:')
      console.error(`   Code: ${error.code}`)
      console.error(`   Message: ${error.message}`)
      console.error(`   Details: ${error.details}`)
      process.exit(1)
    }

    console.log('✅ Baseline observability record inserted successfully!')
    console.log(`   ID: ${data[0].id}`)
    console.log(`   Thought: ${data[0].thought}`)
    console.log(`   Name: ${data[0].name}`)
    console.log(`   Value: ${data[0].value}`)
    console.log(`   Updated: ${data[0].updated_at}`)

    // Verify the record exists with a follow-up SELECT
    console.log('\n🔍 Verifying insertion...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('god_status')
      .select('*')
      .eq('id', 1)
      .single()

    if (verifyError) {
      console.error('❌ Verification failed:')
      console.error(`   Message: ${verifyError.message}`)
      process.exit(1)
    }

    console.log('✅ Verification successful!')
    console.log(`   Record exists with name: "${verifyData.name}"`)
    console.log(`   Record value: "${verifyData.value}"`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Unexpected error:')
    console.error(err)
    process.exit(1)
  }
}

insertBaselineRecord()
