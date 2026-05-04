import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/nextjs-14-supabase-multi-agent-systems'

export const metadata: Metadata = {
  title:       'Next.js 14 + Supabase Multi-Agent AI Systems',
  description: 'Build production multi-agent AI systems with Next.js 14 and Supabase. Real patterns for Claude integration, agent coordination, and persistent state.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-supabase-multi-agent-systems',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-supabase-multi-agent-systems',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-supabase-multi-agent-systems',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
    },
  },
  openGraph: {
    title:       'Next.js 14 + Supabase Multi-Agent AI Systems',
    description: 'Build production multi-agent AI systems with Next.js 14 and Supabase. Real patterns for Claude integration, agent coordination, and persistent state.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Next.js 14 + Supabase Multi-Agent AI Systems', description: 'Build production multi-agent AI systems with Next.js 14 and Supabase. Real patterns for Claude integration, agent coordination, and persistent state.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Next.js 14 + Supabase for Multi-Agent AI Systems"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Build scalable multi-agent AI systems where Claude agents coordinate through Supabase, execute tasks independently, and maintain state across requests—without the infrastructure overhead.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Next.js 14 + Supabase for Multi-Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js 14's App Router and Server Actions give you the primitives you need: real-time endpoints for agent polling, middleware for request routing, and edge-compatible functions. Supabase provides the backbone—PostgreSQL for agent state, Realtime for event streaming, and Auth for secure agent-to-agent communication.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The combination eliminates the need for message queues or orchestration frameworks. Agents write their state directly to Postgres, subscribe to Realtime channels, and trigger actions via API routes. You own the infrastructure from day one.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Agent State Architecture with Postgres"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Each agent needs a canonical state store. Supabase tables let you track agent status, task queues, and results in a queryable format. Use Row-Level Security (RLS) policies to isolate agent permissions—one agent can only read/write its own tasks.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Structure your schema with agent_id as a foreign key, created_at for ordering, and status enums for workflow state (pending, executing, completed, failed). This gives you free auditability and makes debugging multi-agent flows trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Core agent task table
CREATE TABLE agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  status text CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  input jsonb NOT NULL,
  output jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude Agent Integration via Server Actions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js Server Actions let you call Claude's API server-side, keeping your API key secure and avoiding client-side token management. Each action receives the agent's current state from Supabase, passes it to Claude with tools/instructions, and persists the result.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use the Anthropic SDK directly in your actions. Claude reads the agent's task queue, decides what to do next, and your action updates Supabase with the result. Realtime subscriptions notify other agents of state changes without polling.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server'

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export async function executeAgentTask(agentId: string) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const claude = new Anthropic();
  
  const { data: task } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .single();
  
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: JSON.stringify(task.input) }]
  });
  
  await supabase
    .from('agent_tasks')
    .update({ status: 'completed', output: response.content[0].text })
    .eq('id', task.id);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-time Agent Coordination with Supabase Realtime"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agents don't need to poll Supabase constantly. Use Realtime subscriptions to listen for changes to specific tables. When Agent A completes a task, Agent B's subscription fires immediately, triggering its next action.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This works well for sequential workflows. Agent A finishes analysis, publishes a result, and Agent B's listener kicks off synthesis. For parallel work, use Postgres function triggers to fan out tasks atomically.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Error Handling and Retry Logic"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store retry count and last error message in your agent_tasks table. Wrap your Server Actions in try/catch, update the task row with error details, and re-queue automatically after a delay.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase's pg_cron extension lets you schedule retry jobs directly in Postgres. No separate queue worker needed. Failed tasks can trigger alerts via webhooks to Discord or email for visibility.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon contains a production-ready starter kit for Next.js 14 + Supabase multi-agent systems. It includes schema migrations, Server Action patterns, Realtime subscription helpers, and error handling utilities.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to get a working foundation. The code demonstrates agent communication flows, task persistence, and Claude integration with best practices for security and observability.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Get started with the Pantheon starter kit—clone it, set your Supabase credentials, and deploy multi-agent systems on Vercel in hours, not weeks.`}</p>
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
