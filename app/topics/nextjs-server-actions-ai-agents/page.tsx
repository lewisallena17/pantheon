import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Next.js Server Actions for AI Agent Triggers',
  description: 'Learn how to use Next.js Server Actions to trigger Claude AI agents reliably. Real code examples, Supabase patterns, and production deployment.',
  openGraph: {
    title:       'Next.js Server Actions for AI Agent Triggers',
    description: 'Learn how to use Next.js Server Actions to trigger Claude AI agents reliably. Real code examples, Supabase patterns, and production deployment.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-server-actions-ai-agents',
  },
  twitter: { card: 'summary_large_image', title: 'Next.js Server Actions for AI Agent Triggers', description: 'Learn how to use Next.js Server Actions to trigger Claude AI agents reliably. Real code examples, Supabase patterns, and production deployment.' },
}

export default function Topic() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <Link href="/topics" className="hover:text-cyan-400">topics</Link>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Next.js Server Actions for AI Agent Triggers"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Server Actions let you invoke Claude AI agents directly from your Next.js forms and buttons without building a separate API layer, cutting implementation time from hours to minutes.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Server Actions Beat Traditional API Routes for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditional API routes require you to manage request validation, error handling, and response serialization at every endpoint. Server Actions collapse this boilerplate: you define a function in your Server Component, mark it with 'use server', and call it from the client like a normal function.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agent triggers specifically, this matters because agents need fast feedback loops. You're not sitting behind a round-trip HTTP request; you're executing server-side code with direct access to your database, Claude's API, and environment variables. No latency tax from network overhead.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up a Basic Server Action to Trigger Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a file like \`lib/actions.ts\` and export an async function marked with 'use server'. Inside, instantiate the Anthropic client and call \`messages.create()\` with your prompt and model.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The function receives data from a client form or button click, runs on the server with full access to your API keys, and returns the AI response. Error handling and streaming are built-in—no middleware wiring required.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server';
import Anthropic from '@anthropic-ai/sdk';

export async function triggerAgent(userMessage: string) {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userMessage }],
  });
  return message.content[0];
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecting Supabase for Agent State and Memory"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store agent conversations and memory in Supabase. Before triggering Claude, fetch prior messages from a \`conversations\` table. After Claude responds, insert the new exchange so future triggers have context.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase's Row-Level Security to ensure users only access their own agent sessions. This is critical when building multi-tenant systems where each founder manages their own AI agents.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Long-Running Agent Tasks"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`If your agent needs to fetch external data, run batch processing, or orchestrate multi-step workflows, don't block the Server Action response. Instead, kick off a background job in Supabase or use Next.js' built-in \`unstable_after()\` to schedule follow-up work after the response ships.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This keeps your UI responsive while the agent continues working behind the scenes. You can poll Supabase or use WebSockets to stream status updates to the client.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Streaming Responses for Real-Time Feedback"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Server Actions support streaming. Instead of waiting for Claude to finish generating a 500-token response, stream tokens as they arrive. Call \`messages.stream()\` and yield chunks to the client in real-time.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Indie developers often underestimate how much UX improves when users see the AI thinking. Streaming costs nothing extra and transforms a 3-second wait into a visible progression.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lewis Allen's Pantheon repository at github.com/lewisallena17/pantheon provides a production-ready Next.js + Claude + Supabase starter kit built around Server Actions. It includes conversation storage, streaming responses, and multi-agent orchestration patterns.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to skip the infrastructure boilerplate and focus on your agent's logic. The codebase shows idiomatic use of Server Actions with TypeScript, environment variable management, and error recovery.`}</p>

        </section>

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
          <p className="text-slate-300 mb-4 text-sm">{`Server Actions eliminate API boilerplate and let you trigger Claude agents with a single function call—start building with the Pantheon starter kit to ship your AI agent system this week.`}</p>
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

        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500">
          <p>Part of{' '}<Link href="/topics" className="text-cyan-500 hover:underline">the pantheon knowledge base</Link>. Articles are generated + updated by the god agent itself.</p>
        </footer>
      </article>
    </main>
  )
}
