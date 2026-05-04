import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/claude-tool-use-best-practices'

export const metadata: Metadata = {
  title:       'Claude Tool Use Production Best Practices',
  description: 'Master Claude tool use patterns for production AI agents. Learn error handling, concurrency, and cost optimization for Next.js + Supabase systems.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-tool-use-best-practices',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-tool-use-best-practices',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-tool-use-best-practices',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
    },
  },
  openGraph: {
    title:       'Claude Tool Use Production Best Practices',
    description: 'Master Claude tool use patterns for production AI agents. Learn error handling, concurrency, and cost optimization for Next.js + Supabase systems.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Claude Tool Use Production Best Practices', description: 'Master Claude tool use patterns for production AI agents. Learn error handling, concurrency, and cost optimization for Next.js + Supabase systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Tool Use — Production Best Practices"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Building reliable Claude tool integrations at scale requires more than prompt engineering—you need robust error handling, smart concurrency management, and clear cost visibility.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Design Tool Definitions for Resilience"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's tool_use feature works best when schemas are explicit and forgiving. Over-constrained parameters fail silently; under-specified ones cause hallucinations. Define clear enum values for expected inputs, use description fields to guide Claude's reasoning, and include examples of valid vs. invalid calls.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In production, treat tool definitions as contracts. Version them separately from your agent logic. If you need to change a tool's behavior, create a new tool_version rather than mutating the original—this prevents Claude from mixing old and new semantics mid-conversation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implement Exponential Backoff for Tool Calls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tool execution can fail for transient reasons: database locks, rate limits, or brief service outages. Naive retry logic hammers these problems. Instead, use exponential backoff with jitter to spread retries across time.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pattern: wait 100ms before retry 1, 200ms before retry 2, 400ms before retry 3, each with ±20% random jitter. This gives transient failures breathing room without overwhelming your infrastructure. Set a maximum of 3–4 retries; beyond that, the failure is likely structural.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const executeWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 100 * (0.8 + Math.random() * 0.4);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Validate Tool Outputs Before Returning to Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude trusts the tool results you pass back. If a tool returns malformed or unexpected data, Claude may make incorrect decisions downstream. Always validate outputs against a schema before feeding them back into the conversation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a lightweight validator (Zod, io-ts, or simple TypeScript guards). Log validation failures separately so you can spot tool bugs early. If validation fails, return a human-readable error to Claude rather than letting bad data propagate.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Track Tool Costs and Token Usage"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every Claude API call has a cost, and tool use adds friction: extra tokens for tool definitions, tokens for results, and potentially multiple rounds of Claude reasoning. Monitor your spending per agent, per user, and per tool.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log input_tokens, output_tokens, and cache_read_tokens from each API response. Wire this to a Supabase table so you can query cost trends. Set alerts if a single user session exceeds a budget (e.g., \$0.50), and implement rate limits for high-cost agents.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Serialize and Persist Tool State"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`If your agent makes multiple tool calls across a session, persist the conversation and tool results. This lets you resume interrupted jobs, audit decisions, and detect loops where Claude calls the same tool repeatedly with identical inputs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store messages, tool_results, and invocation metadata in Supabase as JSONB columns. Index on user_id and session_id so recovery is fast. Include timestamps and outcome flags (success, validation_failed, timeout) for post-mortem analysis.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Use Structured Outputs for Deterministic Results"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tool use works best when paired with Claude's structured output mode. Define a JSON schema for what Claude should return after using tools—this prevents freestyle text and ensures your downstream code always gets predictable shape.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Combine tools and structured outputs: Claude calls tools to gather data, then formats its response into your schema. This gives you both flexibility (Claude can reason about what tools to call) and determinism (you know exactly what shape you're getting).`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>

        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Apply these six practices—resilient tool design, backoff logic, output validation, cost tracking, state persistence, and structured outputs—to ship reliable Claude agents that scale without surprise costs or silent failures. Get started with the Pantheon starter kit.`}</p>
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
