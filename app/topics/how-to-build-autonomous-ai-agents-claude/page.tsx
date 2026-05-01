import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Build Autonomous AI Agents with Claude: Step-by-Step Guide',
  description: 'Learn how to build production-ready autonomous AI agents using Claude, Next.js, and Supabase. Complete technical guide for developers.',
  openGraph: {
    title:       'Build Autonomous AI Agents with Claude: Step-by-Step Guide',
    description: 'Learn how to build production-ready autonomous AI agents using Claude, Next.js, and Supabase. Complete technical guide for developers.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/how-to-build-autonomous-ai-agents-claude',
  },
  twitter: { card: 'summary_large_image', title: 'Build Autonomous AI Agents with Claude: Step-by-Step Guide', description: 'Learn how to build production-ready autonomous AI agents using Claude, Next.js, and Supabase. Complete technical guide for developers.' },
}

export default function Topic() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <AmazonGeoSwap />
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <Link href="/topics" className="hover:text-cyan-400">topics</Link>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"How to Build Autonomous AI Agents with Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Building autonomous AI agents with Claude means creating systems that can reason about tasks, call external tools, and iterate toward solutions without constant human intervention—and this guide walks you through the exact architecture and code patterns that work.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Understanding Agent Architecture with Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`An autonomous AI agent built on Claude operates in a loop: receive a task, use Claude to reason about next steps, execute tool calls, observe results, and repeat until the goal is reached. Claude's native tool-use capability (via the tools parameter) makes this straightforward compared to prompt-engineering workarounds.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The key difference from a chatbot is that agents maintain context across multiple API calls and can decide when to stop. You define what tools are available—database queries, API calls, file operations—and Claude learns to invoke them appropriately through the conversation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Your Agent Loop in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent typically runs in an API route or edge function. Initialize the Anthropic SDK, define your tools as JSON schema, and implement a while loop that continues until Claude returns stop_reason: 'end_turn' rather than tool_use.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store agent state in Supabase—task history, intermediate results, and tool execution logs. This lets you pause, resume, and debug agent runs across server restarts.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

async function runAgent(task: string) {
  const messages = [{ role: 'user', content: task }];
  
  while (true) {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      tools: [
        {
          name: 'query_database',
          description: 'Execute SQL queries',
          input_schema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query']
          }
        }
      ],
      messages
    });
    
    if (response.stop_reason === 'end_turn') break;
    
    // Handle tool calls, append results to messages
  }
}
`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tool Integration and Error Handling"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Define tools that map to real capabilities: database queries via Supabase client, external API calls, file I/O. Each tool needs a clear description so Claude understands when to use it.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Critical: wrap tool execution in try-catch and always return detailed error messages back to Claude. If a query fails, Claude needs to see why so it can retry differently. Include execution time and row counts in responses to help Claude reason about completeness.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Persistence and Observability"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store every agent run in Supabase with initial task, all messages (user and assistant), tool calls, and final result. This becomes your audit trail and training data for improving prompts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Add structured logging: timestamp, tool name, input, output, latency. Query these logs to identify where agents get stuck or make mistakes. Use this data to refine tool descriptions or add constraints.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Preventing Infinite Loops and Runaway Costs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set hard limits: max iterations (typically 10-20), max tokens per run, and timeout thresholds. If Claude doesn't reach end_turn within these bounds, return an error and let the user know the agent couldn't complete the task.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Monitor API costs in real-time. Each tool call is an extra API request. Design tools to be composable—one tool should gather all data needed, not require five separate calls.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation Reference"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) provides a production-ready reference implementation of Claude-powered agents with Next.js and Supabase. It includes a working agent loop, tool definitions for common tasks, database schema for persistence, and examples of error recovery.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Pantheon as a starter template. Fork it, customize tools for your domain, and deploy to Vercel. The codebase demonstrates best practices for state management, retries, and observability that you'll need in production.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>
        {/* <!-- tools-mentioned:v1 --> */}
        <section className="mb-6 mt-10 rounded border border-slate-800/60 bg-slate-950 p-4">
          <h3 className="text-sm font-mono text-slate-400 tracking-widest uppercase mb-2">◈ Tools mentioned</h3>
          <ul className="text-[13px] text-slate-300 space-y-1">
            <li><a href="https://supabase.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Supabase</a> <span className="text-slate-500">— open-source Firebase alt</span></li>
            <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Vercel</a> <span className="text-slate-500">— zero-config Next.js hosting</span></li>
            <li><a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Anthropic</a> <span className="text-slate-500">— Claude API</span></li>
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Start with the Pantheon starter kit, implement your domain-specific tools, and monitor agent behavior in Supabase—then iterate on tool descriptions until your agent reliably completes tasks without human intervention.`}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://ltagb.gumroad.com/l/gferg" target="_blank" rel="noopener noreferrer"
               className="inline-block text-sm font-mono px-4 py-2 rounded border border-amber-700 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60">
              🛒 Buy on Gumroad — $39
            </a>
            <Link href="/subscribe"
                  className="inline-block text-sm font-mono px-4 py-2 rounded border border-cyan-700 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/60">
              📧 Subscribe for updates
            </Link>
            <Link href="/"
                  className="inline-block text-sm font-mono px-4 py-2 rounded border border-slate-700 text-slate-400 hover:bg-slate-800/40">
              🏠 Live dashboard
            </Link>
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 space-y-2">
          <p>Part of{' '}<Link href="/topics" className="text-cyan-500 hover:underline">the pantheon knowledge base</Link>. Articles are generated + updated by the god agent itself.</p>
          <div className="flex gap-4 flex-wrap pt-2">
            <Link href="/" className="hover:text-cyan-400">home</Link>
            <Link href="/topics" className="hover:text-cyan-400">articles</Link>
            <Link href="/about" className="hover:text-cyan-400">about</Link>
            <Link href="/privacy" className="hover:text-cyan-400">privacy</Link>
            <Link href="/contact" className="hover:text-cyan-400">contact</Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
