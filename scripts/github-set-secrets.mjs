#!/usr/bin/env node
/**
 * github-set-secrets.mjs — syncs env vars to GitHub Actions secrets
 * using the repo's public key encryption. Run this once so the nightly
 * backup workflow has access to Supabase credentials.
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sodium from 'libsodium-wrappers'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// Load .env.local
for (const line of readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const REPO  = process.env.GITHUB_REPO
const TOKEN = process.env.GITHUB_TOKEN

if (!REPO || !TOKEN) { console.error('GITHUB_REPO + GITHUB_TOKEN required'); process.exit(1) }

const SECRETS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
]

await sodium.ready

// 1. Fetch repo public key
const keyRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, {
  headers: {
    'Authorization':        `Bearer ${TOKEN}`,
    'Accept':               'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
})
if (!keyRes.ok) { console.error(`get public key: ${keyRes.status} ${await keyRes.text()}`); process.exit(1) }
const { key, key_id } = await keyRes.json()

// 2. Encrypt + PUT each secret
for (const name of SECRETS) {
  const value = process.env[name]
  if (!value) { console.log(`[${name}] ⚠ not set in .env.local — skipping`); continue }

  const keyBytes   = sodium.from_base64(key, sodium.base64_variants.ORIGINAL)
  const valBytes   = sodium.from_string(value)
  const sealedRaw  = sodium.crypto_box_seal(valBytes, keyBytes)
  const sealedB64  = sodium.to_base64(sealedRaw, sodium.base64_variants.ORIGINAL)

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/${name}`, {
    method: 'PUT',
    headers: {
      'Authorization':        `Bearer ${TOKEN}`,
      'Accept':               'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type':         'application/json',
    },
    body: JSON.stringify({ encrypted_value: sealedB64, key_id }),
  })
  if (putRes.ok) {
    console.log(`[${name}] ✓ synced`)
  } else {
    console.log(`[${name}] ✗ ${putRes.status} ${await putRes.text()}`)
  }
}
