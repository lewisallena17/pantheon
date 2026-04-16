/**
 * specialists.mjs — Domain-specific autonomous agents
 *
 * DB Specialist:  Only picks tasks related to SQL, database schema, migrations
 * UI Specialist:  Only picks tasks related to React, Next.js, components, UI/UX
 *
 * Run as separate PM2 processes:
 *   pm2 start scripts/specialists.mjs --name db-specialist -- --type db
 *   pm2 start scripts/specialists.mjs --name ui-specialist -- --type ui
 */

import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname    = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')

// ── Load env ──────────────────────────────────────────────────────────────
try {
  const envFile = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
} catch {}

const SPECIALIST_TYPE = process.argv.find(a => a.startsWith('--type='))?.split('=')[1]
  ?? process.argv[process.argv.indexOf('--type') + 1]
  ?? 'db'

if (!['db', 'ui'].includes(SPECIALIST_TYPE)) {
  console.error('Usage: node specialists.mjs --type=db|ui')
  process.exit(1)
}

const IS_DB = SPECIALIST_TYPE === 'db'
const AGENT_NAME = IS_DB ? 'db-specialist' : 'ui-specialist'
const MODEL = IS_DB ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001'

// Keywords that route to each specialist
const DB_KEYWORDS  = /\b(sql|select|insert|update|delete|supabase|database|db|table|column|index|trigger|function|schema|migration|query|rpc|rls|policy|row|foreign key|constraint|join|view|materialized)\b/i
const UI_KEYWORDS  = /\b(react|next\.?js|component|tsx?|ui|ux|dashboard|page|layout|style|tailwind|css|hook|state|prop|render|display|view|form|button|modal|card|grid|flex|animation|canvas)\b/i
const MY_KEYWORDS  = IS_DB ? DB_KEYWORDS : UI_KEYWORDS

console.log(`🔬 ${AGENT_NAME} starting — specialising in ${IS_DB ? 'DATABASE' : 'UI/REACT'} tasks`)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase  = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const AGENT_MEMORY_DIR = join(__dirname, 'agent-memory')
if (!existsSync(AGENT_MEMORY_DIR)) mkdirSync(AGENT_MEMORY_DIR, { recursive: true })

const COST_PER_TOKEN = {
  'claude-haiku-4-5-20251001': { input: 0.0000008,  output: 0.000004  },
  'claude-sonnet-4-6':          { input: 0.000003,   output: 0.000015  },
}
const COST_LOG_PATH = join(__dirname, 'cost-log.json')
let costLog = { total: 0, byAgent: {}, sessions: [] }
try { costLog = JSON.parse(readFileSync(COST_LOG_PATH, 'utf8')) } catch {}

function recordCost(inputTokens, outputTokens) {
  const rates = COST_PER_TOKEN[MODEL] ?? COST_PER_TOKEN['claude-haiku-4-5-20251001']
  const cost = inputTokens * rates.input + outputTokens * rates.output
  costLog.total = (costLog.total ?? 0) + cost
  costLog.byAgent[AGENT_NAME] = (costLog.byAgent[AGENT_NAME] ?? 0) + cost
  costLog.sessions = [...(costLog.sessions ?? []).slice(-199), {
    at: new Date().toISOString(), agent: AGENT_NAME, cost, inputTokens, outputTokens
  }]
  try { writeFileSync(COST_LOG_PATH, JSON.stringify(costLog, null, 2), 'utf8') } catch {}
  return cost
}

function loadMemory() {
  const p = join(AGENT_MEMORY_DIR, `${AGENT_NAME}.json`)
  try { if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8')) } catch {}
  return { lessons: [], taskCount: 0 }
}

function saveMemory(lesson) {
  const p = join(AGENT_MEMORY_DIR, `${AGENT_NAME}.json`)
  const mem = loadMemory()
  if (lesson) mem.lessons = [...mem.lessons.slice(-19), lesson]
  mem.taskCount = (mem.taskCount ?? 0) + 1
  try { writeFileSync(p, JSON.stringify(mem, null, 2), 'utf8') } catch {}
}

function safePath(p) {
  const abs = resolve(PROJECT_ROOT, p)
  if (!abs.startsWith(PROJECT_ROOT)) throw new Error(`Path outside project: ${p}`)
  return abs
}

// ── Specialist tools ──────────────────────────────────────────────────────
const DB_TOOLS = IS_DB ? [
  {
    name: 'run_sql',
    description: 'Run a SELECT query against the database.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
  },
  {
    name: 'run_ddl',
    description: 'Execute DDL/DML (CREATE TABLE, ALTER TABLE, INSERT, etc.).',
    input_schema: { type: 'object', properties: { statement: { type: 'string' } }, required: ['statement'] }
  },
  {
    name: 'list_tables',
    description: 'List all tables in the public schema.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'describe_table',
    description: 'Show columns and types for a table.',
    input_schema: { type: 'object', properties: { table_name: { type: 'string' } }, required: ['table_name'] }
  },
] : []

const FILE_TOOLS = [
  {
    name: 'read_file',
    description: 'Read a file in the project.',
    input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
  },
  {
    name: 'write_file',
    description: 'Write or overwrite a file.',
    input_schema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] }
  },
  {
    name: 'list_directory',
    description: 'List files in a directory.',
    input_schema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] }
  },
  {
    name: 'web_search',
    description: 'Search the web for documentation.',
    input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] }
  },
  {
    name: 'fetch_url',
    description: 'Fetch a URL for documentation.',
    input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] }
  },
  {
    name: 'task_complete',
    description: 'Signal task done.',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        files_changed: { type: 'array', items: { type: 'string' } }
      },
      required: ['summary']
    }
  }
]

const ALL_TOOLS = [...DB_TOOLS, ...FILE_TOOLS]

async function executeTool(name, input) {
  if (name === 'run_sql') {
    try {
      const { data, error } = await supabase.rpc('agent_exec_sql', { query: input.query })
      if (error) return `SQL error: ${error.message}`
      return JSON.stringify(data, null, 2).slice(0, 4000)
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'run_ddl') {
    try {
      const { data, error } = await supabase.rpc('agent_exec_ddl', { statement: input.statement })
      if (error) return `DDL error: ${error.message}`
      return data ?? 'OK'
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'list_tables') {
    try {
      const { data, error } = await supabase.rpc('agent_exec_sql', {
        query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
      })
      if (error) return `Error: ${error.message}`
      return JSON.stringify(data, null, 2)
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'describe_table') {
    try {
      const { data, error } = await supabase.rpc('agent_exec_sql', {
        query: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='${input.table_name}' ORDER BY ordinal_position`
      })
      if (error) return `Error: ${error.message}`
      return JSON.stringify(data, null, 2)
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'read_file') {
    try {
      const abs = safePath(input.path)
      if (!existsSync(abs)) return `File not found: ${input.path}`
      const content = readFileSync(abs, 'utf8')
      return content.length > 8000 ? content.slice(0, 8000) + '\n...[truncated]' : content
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'write_file') {
    try {
      const abs = safePath(input.path)
      const dir = dirname(abs)
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(abs, input.content, 'utf8')
      return `Written: ${input.path}`
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'list_directory') {
    try {
      const abs = safePath(input.path)
      if (!existsSync(abs)) return `Not found: ${input.path}`
      return readdirSync(abs, { withFileTypes: true })
        .map(e => `${e.isDirectory() ? '[dir]' : '[file]'} ${e.name}`).join('\n')
    } catch (e) { return `Error: ${e.message}` }
  }
  if (name === 'web_search') {
    try {
      const q = encodeURIComponent(input.query)
      const res = await fetch(`https://s.jina.ai/?q=${q}`, {
        headers: { 'Accept': 'text/plain', 'X-No-Cache': 'true' },
        signal: AbortSignal.timeout(20000),
      })
      const text = await res.text()
      return text.slice(0, 6000) || 'No results found.'
    } catch (e) { return `Search error: ${e.message}` }
  }
  if (name === 'fetch_url') {
    try {
      const res = await fetch(`https://r.jina.ai/${input.url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: AbortSignal.timeout(15000),
      })
      return (await res.text()).slice(0, 6000)
    } catch (e) { return `Fetch error: ${e.message}` }
  }
  if (name === 'task_complete') return '__DONE__'
  return `Unknown tool: ${name}`
}

const SPECIALIST_SYSTEM = IS_DB
  ? `You are the DATABASE SPECIALIST agent — an expert in SQL, PostgreSQL, Supabase, and database schema design.

Project root: ${PROJECT_ROOT}
Stack: Next.js 14, Supabase (PostgreSQL), TypeScript

Your domain: SQL queries, schema changes, migrations, indexes, triggers, functions, RLS policies, and any data-layer work.
You have direct DB access via run_sql (SELECT) and run_ddl (CREATE/ALTER/INSERT).

Always:
- Check existing schema with list_tables/describe_table before creating new tables
- Use IF NOT EXISTS for DDL to be idempotent
- Verify changes with run_sql after DDL
- Write efficient SQL with proper indexes
- Use web_search when you need Supabase docs, PostgreSQL syntax, or RLS examples
- When done, call task_complete with a clear summary`
  : `You are the UI SPECIALIST agent — an expert in React, Next.js 14, TypeScript, and Tailwind CSS.

Project root: ${PROJECT_ROOT}
Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Supabase Realtime

Your domain: React components, Next.js pages, UI/UX improvements, Tailwind styling, hooks, and frontend logic.
The dashboard lives in components/ and app/. Key files: DashboardShell.tsx, GodView.tsx, TodosTable.tsx, EcosystemView.tsx.

Always:
- Read existing files before editing them
- Preserve existing functionality — only add or improve
- Follow the existing design system (dark bg, cyan/yellow accents, font-mono)
- Use web_search when you need React/Next.js/Tailwind docs, component patterns, or TypeScript help
- When done, call task_complete with a summary of what changed`

// ── Active agents map ─────────────────────────────────────────────────────
const activeAgents = new Map()

async function addComment(taskId, text) {
  const { data } = await supabase.from('todos').select('comments').eq('id', taskId).single()
  const comments = [...(data?.comments ?? []), { agent: AGENT_NAME, text, at: new Date().toISOString() }]
  await supabase.from('todos').update({ comments }).eq('id', taskId)
}

async function updateTask(id, status) {
  await supabase.from('todos').update({ status, assigned_agent: AGENT_NAME }).eq('id', id)
}

async function runSpecialistLoop(todo) {
  const memory = loadMemory()
  const memBlock = memory.lessons.length > 0
    ? `\nMY MEMORY (${memory.taskCount} tasks):\n${memory.lessons.slice(-6).join('\n')}\n`
    : ''

  const messages = [{ role: 'user', content: `Please implement this task: ${todo.title}` }]
  let summary = ''
  const filesChanged = []
  let totalIn = 0, totalOut = 0
  let iterations = 0

  while (iterations < 20) {
    iterations++
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SPECIALIST_SYSTEM + memBlock,
      tools: ALL_TOOLS,
      messages,
    })

    if (response.usage) {
      totalIn  += response.usage.input_tokens  ?? 0
      totalOut += response.usage.output_tokens ?? 0
    }

    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason === 'end_turn') {
      summary = response.content.find(b => b.type === 'text')?.text?.slice(0, 300) ?? 'Done.'
      break
    }
    if (response.stop_reason !== 'tool_use') break

    const results = []
    let done = false
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue
      console.log(`[${AGENT_NAME}] → ${block.name}(${JSON.stringify(block.input).slice(0, 80)})`)
      const result = await executeTool(block.name, block.input)
      if (result === '__DONE__') {
        summary = block.input.summary ?? 'Done.'
        if (block.input.files_changed) filesChanged.push(...block.input.files_changed)
        done = true
        results.push({ type: 'tool_result', tool_use_id: block.id, content: 'Done.' })
      } else {
        if (block.name === 'write_file' && !result.startsWith('Error')) filesChanged.push(block.input.path)
        results.push({ type: 'tool_result', tool_use_id: block.id, content: result })
      }
    }
    messages.push({ role: 'user', content: results })
    if (done) break
  }

  const cost = recordCost(totalIn, totalOut)
  return { summary, filesChanged, cost }
}

async function runTask(todo) {
  if (activeAgents.has(todo.id)) return
  activeAgents.set(todo.id, true)

  await updateTask(todo.id, 'in_progress')
  await addComment(todo.id, `${AGENT_NAME} started`)

  try {
    console.log(`[${AGENT_NAME}] Starting: "${todo.title}"`)
    const { summary, filesChanged, cost } = await runSpecialistLoop(todo)
    const comment = [
      summary,
      filesChanged.length > 0 ? `Files: ${filesChanged.join(', ')}` : null,
      cost > 0 ? `Cost: $${cost.toFixed(5)}` : null,
    ].filter(Boolean).join('\n')

    await addComment(todo.id, comment)
    await updateTask(todo.id, 'completed')
    saveMemory(`"${todo.title.slice(0, 60)}" succeeded — ${summary.slice(0, 100)}`)
    console.log(`[${AGENT_NAME}] Done: ${summary}`)
  } catch (err) {
    const msg = err.message?.slice(0, 200) ?? 'unknown'
    await addComment(todo.id, `Failed: ${msg}`)
    await updateTask(todo.id, 'failed')
    saveMemory(`FAILED: "${todo.title.slice(0, 60)}" — ${msg.slice(0, 80)}`)
    console.error(`[${AGENT_NAME}] Failed:`, msg)
  } finally {
    activeAgents.delete(todo.id)
  }
}

function taskMatchesMe(todo) {
  return MY_KEYWORDS.test(todo.title)
}

async function pollPending() {
  if (activeAgents.size >= 1) return

  const { data } = await supabase
    .from('todos')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10)

  if (!data?.length) return

  // Only take tasks that match our domain AND aren't already claimed by the other runner
  const mine = data.find(t => taskMatchesMe(t) && !t.assigned_agent?.startsWith('ruflo'))
  if (mine) runTask(mine)
}

supabase
  .channel(`${AGENT_NAME}-watch`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todos' }, ({ new: todo }) => {
    if (todo.status === 'pending' && taskMatchesMe(todo) && !activeAgents.has(todo.id)) {
      runTask(todo)
    }
  })
  .subscribe()

pollPending()
setInterval(pollPending, 20_000)
