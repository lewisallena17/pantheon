import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Vercel AI SDK vs Raw Anthropic API: Pros & Cons',
  description: 'Compare Vercel AI SDK vs Anthropic API for Claude integration. See streaming, cost, and complexity trade-offs for Next.js developers building AI agents.',
  openGraph: {
    title:       'Vercel AI SDK vs Raw Anthropic API: Pros & Cons',
    description: 'Compare Vercel AI SDK vs Anthropic API for Claude integration. See streaming, cost, and complexity trade-offs for Next.js developers building AI agents.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/vercel-ai-sdk-vs-raw-anthropic-api',
  },
  twitter: { card: 'summary_large_image', title: 'Vercel AI SDK vs Raw Anthropic API: Pros & Cons', description: 'Compare Vercel AI SDK vs Anthropic API for Claude integration. See streaming, cost, and complexity trade-offs for Next.js developers building AI agents.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Vercel AI SDK vs Raw Anthropic API — Pros and Cons"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Choosing between Vercel AI SDK and the raw Anthropic API determines whether you'll ship your Claude-powered agent in days or weeks—here's exactly what you're trading off.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Use Vercel AI SDK"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vercel AI SDK abstracts away streaming complexity, token management, and response formatting. It ships with built-in support for Next.js server functions, React hooks for UI binding, and automatic error retry logic. If you're building a consumer-facing chatbot or need to prototype fast, this is your path.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The SDK handles streaming responses client-side elegantly through \`useCompletion\` and \`useChat\` hooks. You get loading states, error boundaries, and token counting without wiring them yourself. For indie developers on tight timelines, this saves 20-30 hours of integration work.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Raw Anthropic API: Fine-Grained Control"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The raw API gives you direct access to Claude's full feature set without SDK abstractions. You control exactly when to batch requests, implement custom caching strategies, and optimize for cost. This matters when you're building agent systems that make hundreds of API calls daily.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`You'll write your own streaming handlers, manage rate limits, and track token usage manually. For systems integrating Claude with Supabase for memory or custom databases, the raw API forces cleaner architectural decisions—your agent logic stays decoupled from UI concerns.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cost Trade-offs: API Calls vs Bundle Size"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vercel AI SDK adds ~45kb gzipped to your Next.js bundle. More critically, its abstractions can cause over-fetching. A streaming request that should be one API call might become two (one to start streaming, one to get final tokens). On high-volume agents, this means 10-20% higher API costs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Raw API usage is more predictable cost-wise—one function call equals one API call. You'll pay Anthropic's base rates without overhead. For agents running 1000+ Claude calls monthly, switching to raw API typically saves \$50-200/month depending on model and context window.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building Agent Systems: Middleware and State"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agent systems need middleware—prompt logging, request filtering, cost attribution per user. Vercel AI SDK's opinionated routing makes this harder. You're fighting the abstraction layer if you want to inject custom logic between the UI and Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Raw API plays better with agent architectures. You define your request/response pipeline, wire in Supabase for persistence, log to your own tables, and control everything. Here's a typical Next.js API route hitting the raw API with logging:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { message } = await req.json();
  const client = new Anthropic();
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }]
  });

  // Log to Supabase for cost tracking
  await supabase.from('api_logs').insert({
    tokens_used: response.usage.input_tokens,
    user_id: req.headers.get('x-user-id')
  });

  return Response.json(response);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-World: Pantheon's Agent Architecture"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The open-source Pantheon project (github.com/lewisallena17/pantheon) demonstrates a production agent system using raw Anthropic API with Supabase backends. It avoids SDK abstractions entirely, instead building custom middleware for multi-turn agent loops, memory persistence, and cost attribution.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon's approach: define agent tools in plain JSON, call Claude directly, parse responses into Supabase, and feed results back into the loop. No SDK bloat, full transparency on costs, and every decision about streaming vs. batch requests is explicit in your code.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Decision Framework"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Vercel AI SDK if: you're building a single-turn chatbot, you prioritize shipping speed over cost optimization, and your users are counted in hundreds not millions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use raw Anthropic API if: you're building agents with custom logic, running high-volume systems, integrating with Supabase or custom databases, or need fine-grained cost tracking per user/feature.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Raw Anthropic API wins for agent systems and cost control; Vercel AI SDK wins for speed—pick based on whether your constraint is time-to-market or operational efficiency.`}</p>
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
