import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/supabase-realtime-subscriptions-nextjs'

export const metadata: Metadata = {
  title:       'Supabase Realtime Subscriptions in Next.js App Router',
  description: 'Build live-updating AI agents with Supabase Realtime and Next.js App Router. Real-time subscriptions, server components, and Claude integration patterns.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-realtime-subscriptions-nextjs',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-realtime-subscriptions-nextjs',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-realtime-subscriptions-nextjs',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
    },
  },
  openGraph: {
    title:       'Supabase Realtime Subscriptions in Next.js App Router',
    description: 'Build live-updating AI agents with Supabase Realtime and Next.js App Router. Real-time subscriptions, server components, and Claude integration patterns.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Realtime Subscriptions in Next.js App Router', description: 'Build live-updating AI agents with Supabase Realtime and Next.js App Router. Real-time subscriptions, server components, and Claude integration patterns.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Realtime Subscriptions in Next.js App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Supabase Realtime subscriptions let you push live database changes directly to your Next.js App Router components, eliminating polling and enabling instant AI agent state updates—essential when building multi-agent systems that need to sync across users and Claude API calls.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Realtime Matters for AI Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When building AI agents with Claude, you need agents that react instantly to state changes. A user edits a prompt, another agent picks it up immediately. A tool execution completes, the UI updates without refetch. Supabase Realtime subscriptions make this possible without building your own WebSocket infrastructure.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditional polling wastes bandwidth and creates lag. Realtime subscriptions push changes the moment they hit your Postgres database, which is especially critical when multiple Claude instances or agents coordinate through a shared knowledge base.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Realtime in Next.js App Router"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a React hook that manages Supabase subscriptions in a Server Component context. Next.js App Router supports 'use client' boundaries, which is where your subscription logic lives—Server Components can't use useEffect, but they can stream data via Server Components with a Client Component child that handles subscriptions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Initialize your Supabase client with the realtime channel config. Filter by table and conditions (like agent_id or user_id) to avoid unnecessary updates. Unsubscribe on unmount to prevent memory leaks and duplicate listeners.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAgentUpdates(agentId: string) {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const subscription = supabase
      .channel(\`agent:\${agentId}\`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agents', filter: \`id=eq.\${agentId}\` },
        (payload) => setAgent(payload.new)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [agentId]);

  return agent;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Filtering Subscriptions by User and Agent Context"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Not every change in your agents table matters to every client. Use Supabase's filter syntax to subscribe only to rows matching your criteria—typically the current user's agents or agents in a shared workspace.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This reduces noise and keeps your component re-renders focused. For multi-tenant AI systems, filtering is non-negotiable for performance and isolation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combining Realtime with Claude API Responses"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your pattern: (1) User triggers a Claude API call via Server Action, (2) Claude response writes to database via Postgres trigger or direct insert, (3) Realtime subscription fires, (4) UI updates. This creates seamless agent state flow without polling.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use database triggers to atomically log Claude invocations and responses. Subscribe to those logs in your UI layer. This keeps your data source of truth in Postgres and your real-time propagation automatic.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Connection and Reconnection"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime handles WebSocket reconnection automatically, but you should surface connection status to users building AI systems. A disconnected realtime subscription means agents can't sync—show a warning banner.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Monitor the subscription state and implement retry logic with exponential backoff. For critical agent coordination, consider a fallback polling mechanism on connection loss.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lewis Allen's Pantheon repo (github.com/lewisallena17/pantheon) demonstrates production-ready Supabase Realtime patterns in a Next.js App Router + Claude AI agent framework. The codebase shows real filtering strategies, subscription cleanup, and integration with Claude tool use.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Reference Pantheon's agent state management and message streaming logic if you're building a multi-agent system. It's a working example of the patterns described here.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implement Supabase Realtime subscriptions today to eliminate polling latency and sync your AI agents across users instantly—grab the starter kit and reference implementation below.`}</p>
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
