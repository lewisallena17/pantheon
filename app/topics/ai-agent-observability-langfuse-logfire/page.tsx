import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-observability-langfuse-logfire'

export const metadata: Metadata = {
  title:       'AI Agent Observability: Langfuse + Logfire Guide',
  description: 'Monitor Claude agents in production with Langfuse and Logfire. Real-time traces, cost tracking, and debugging for Next.js AI systems.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-observability-langfuse-logfire',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-observability-langfuse-logfire',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-observability-langfuse-logfire',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
    },
  },
  openGraph: {
    title:       'AI Agent Observability: Langfuse + Logfire Guide',
    description: 'Monitor Claude agents in production with Langfuse and Logfire. Real-time traces, cost tracking, and debugging for Next.js AI systems.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'AI Agent Observability: Langfuse + Logfire Guide', description: 'Monitor Claude agents in production with Langfuse and Logfire. Real-time traces, cost tracking, and debugging for Next.js AI systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"AI Agent Observability with Langfuse and Logfire"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop flying blind with your Claude agents—Langfuse and Logfire give you complete visibility into token usage, latency, and failure modes so you can debug in production instead of guessing.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Agent Observability Matters"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents are black boxes by default. You deploy a Claude-powered system, users interact with it, and when something breaks, you have no idea if it's a prompt issue, token limit, tool hallucination, or latency spike. Observability flips this: you get structured traces of every LLM call, tool execution, and decision branch.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie teams, this is critical. You can't hire a DevOps person to investigate production issues. You need tools that show you exactly what happened, how much it cost, and why it failed—in one dashboard.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Langfuse for LLM Traces and Cost Tracking"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Langfuse captures every interaction with Claude: prompt tokens, completion tokens, latency, and structured outputs. It integrates directly with the Anthropic SDK and tracks agent runs hierarchically—each tool call, retrieval, and decision becomes a queryable span.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The cost breakdown is real-time. You see exactly which agent behaviors or user actions drive spending. For a RAG system where some queries trigger 10 tool calls and others trigger 1, you'll spot the pattern instantly. Langfuse's open-source core runs self-hosted; their cloud tier adds no-friction integrations.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Logfire for Structured Logging and Performance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Logfire (Pydantic's observability platform) excels at capturing structured logs from your Next.js backend. Every agent step, database query, and external API call gets tagged with context—user_id, session_id, agent_version—so you can slice logs by any dimension.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Unlike traditional logging, Logfire understands your TypeScript types. You log structured data, not strings, and query with SQL-like syntax. This matters when debugging: you can ask 'show me all agent runs where tool X failed and latency exceeded 2s' and get the answer in seconds.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integration Pattern: Next.js + Claude + Langfuse + Logfire"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The typical stack: Next.js API route calls an agent service, which uses Claude via Anthropic SDK (Langfuse auto-intercepts this), makes tool calls to Supabase, and logs structured events to Logfire.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's the core pattern:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';
import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const logger = pino();

export async function runAgent(input: string, userId: string) {
  logger.info({ userId, input, event: 'agent_start' });
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: input }],
  });
  
  logger.info({ userId, tokens: response.usage, event: 'agent_complete' });
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"What to Observe in Production"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Focus on four metrics: (1) token usage per agent run—catch runaway loops where the agent keeps retrying; (2) tool call failures—see which integrations are flaky; (3) latency by step—identify bottlenecks in the reasoning chain; (4) cost per user cohort—know which features are expensive to support.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set alerts in Langfuse when token usage spikes 3x normal or a tool fails 5 times in a row. In Logfire, alert when agent latency exceeds your SLA. This prevents silent failures where an agent gets stuck in a loop for hours before anyone notices.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo at github.com/lewisallena17/pantheon demonstrates this stack end-to-end: a Next.js agent starter kit with Langfuse and Logfire wired in, Supabase for persistence, and Claude as the core engine. It's production-ready boilerplate—clone it, set your API keys, and deploy. Every tool call and agent decision is traced and logged automatically.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start observing your AI agents today—grab the Pantheon starter kit and get Langfuse + Logfire integrated in one deployment.`}</p>
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
