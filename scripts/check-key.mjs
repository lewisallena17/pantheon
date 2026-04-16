import fs from 'node:fs'
import path from 'node:path'

// Load .env.local manually (Next.js convention, dotenv doesn't read it by default)
const envLocal = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

const key = process.env.ANTHROPIC_API_KEY
if (!key) { console.error('❌ ANTHROPIC_API_KEY not set'); process.exit(1) }

console.log(`🔑 Key: ${key.slice(0, 15)}…${key.slice(-6)}`)
console.log(`   Length: ${key.length} chars\n`)

// 1) Models endpoint — works even without credits
console.log('📋 Testing /v1/models (works without credits)...')
try {
  const r = await fetch('https://api.anthropic.com/v1/models', {
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
  })
  console.log(`   Status: ${r.status} ${r.statusText}`)
  if (r.ok) {
    const j = await r.json()
    console.log(`   ✅ Key is valid. ${j.data?.length ?? 0} models available.`)
  } else {
    console.log(`   ❌ ${await r.text()}`)
  }
} catch (e) { console.log(`   ❌ ${e.message}`) }

// 2) Minimal message — tests actual credit balance
console.log('\n💳 Testing /v1/messages (requires credits)...')
try {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'hi' }],
    }),
  })
  console.log(`   Status: ${r.status} ${r.statusText}`)

  const rateLimit = {
    requestsLimit:     r.headers.get('anthropic-ratelimit-requests-limit'),
    requestsRemaining: r.headers.get('anthropic-ratelimit-requests-remaining'),
    tokensLimit:       r.headers.get('anthropic-ratelimit-tokens-limit'),
    tokensRemaining:   r.headers.get('anthropic-ratelimit-tokens-remaining'),
    inputLimit:        r.headers.get('anthropic-ratelimit-input-tokens-limit'),
    inputRemaining:    r.headers.get('anthropic-ratelimit-input-tokens-remaining'),
    outputLimit:       r.headers.get('anthropic-ratelimit-output-tokens-limit'),
    outputRemaining:   r.headers.get('anthropic-ratelimit-output-tokens-remaining'),
  }

  if (r.ok) {
    const j = await r.json()
    const inT  = j.usage?.input_tokens  ?? 0
    const outT = j.usage?.output_tokens ?? 0
    const cost = (inT / 1e6) * 1.00 + (outT / 1e6) * 5.00  // haiku pricing approx
    console.log(`   ✅ SUCCESS — credits work`)
    console.log(`   Used: ${inT} in + ${outT} out tokens (~$${cost.toFixed(6)})`)
  } else {
    const err = await r.text()
    console.log(`   ❌ ${err}`)
    if (err.includes('credit balance')) {
      console.log('\n   💡 Balance is $0. Top up: https://console.anthropic.com/settings/billing')
    } else if (err.includes('authentication')) {
      console.log('\n   💡 Key is invalid/revoked. Create a new one at console.anthropic.com')
    }
  }

  console.log('\n📊 Rate limit headers (shows quota, not $ balance):')
  for (const [k, v] of Object.entries(rateLimit)) {
    if (v) console.log(`   ${k}: ${v}`)
  }
} catch (e) { console.log(`   ❌ ${e.message}`) }

console.log('\nℹ️  Anthropic does not expose $ balance via API.')
console.log('   Actual balance: https://console.anthropic.com/settings/billing')
