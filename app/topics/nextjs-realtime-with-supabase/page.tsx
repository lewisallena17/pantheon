import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Real-Time Features in Next.js with Supabase Realtime',
  description: 'Build live AI agent dashboards with Next.js and Supabase Realtime. See real-time database changes, presence, and broadcasts instantly.',
  openGraph: {
    title:       'Real-Time Features in Next.js with Supabase Realtime',
    description: 'Build live AI agent dashboards with Next.js and Supabase Realtime. See real-time database changes, presence, and broadcasts instantly.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-realtime-with-supabase',
  },
  twitter: { card: 'summary_large_image', title: 'Real-Time Features in Next.js with Supabase Realtime', description: 'Build live AI agent dashboards with Next.js and Supabase Realtime. See real-time database changes, presence, and broadcasts instantly.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Real-Time Features in Next.js with Supabase Realtime"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Real-time features in Next.js with Supabase Realtime let you push database changes, user presence, and custom broadcasts to the client instantly—essential for AI agent systems where latency kills user experience.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Real-Time Matters for AI Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents running in the background need to communicate status updates, task completions, and error states back to your frontend without polling. Polling adds lag, wastes database queries, and feels broken to users. Supabase Realtime solves this with PostgreSQL's built-in replication system.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie developers building Claude-powered systems, real-time features compress the feedback loop: users see agent reasoning, token usage, and final outputs the moment they're available. This is the difference between a prototype and a product.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:nextjs-realtime-with-supabase`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Supabase Realtime in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enable Realtime on your Supabase table, install the client library, and subscribe to database changes in a server component or hook. Supabase handles WebSocket connection pooling and reconnection logic for you.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a typed subscriber that listens for INSERT, UPDATE, and DELETE events on your agents table. Filter by user_id to ensure clients only see their own data. The connection stays open across page navigations—critical for keeping agent status live.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const channel = supabase
  .channel('agents')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'agents', filter: \`user_id=eq.\${userId}\` },
    (payload) => {
      console.log('Agent updated:', payload.new);
      setAgentStatus(payload.new.status);
    }
  )
  .subscribe();`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Presence for Multi-User Agent Dashboards"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Presence lets you broadcast which users are viewing which agents without hitting your database. Each client sends a lightweight presence event; the server syncs state across all subscribers in real-time.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use this to show 'Agent running—watched by 3 users' or disable concurrent edits. For team-based AI agent platforms, presence prevents the chaos of multiple founders tweaking the same agent prompt simultaneously.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Broadcasting Custom Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beyond database changes, use Supabase Broadcast to push arbitrary events: agent logs, token usage metrics, or Claude API errors. Send a message from your backend (e.g., when your AI agent completes a task) and all connected clients receive it instantly.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This decouples real-time notifications from your database schema. Your agent service can emit 'task_completed' with metadata without creating a new table or column.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Connection Dropouts and Reconnection"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime auto-reconnects on network loss, but you should still track connection state in your UI. Show a 'live' or 'reconnecting' indicator so users know whether they're seeing fresh data or stale snapshots.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For critical agent workflows, queue mutations locally and sync when the connection re-establishes. Use React Query or SWR to manage both real-time subscriptions and fallback REST calls if WebSocket fails.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`See a full production-ready example at github.com/lewisallena17/pantheon. Pantheon is an open-source AI agent control panel built with Next.js, Supabase Realtime, and Claude. It shows real-time agent status, token tracking, and task logs—exactly the patterns you need.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, study how subscriptions are managed in custom hooks, and adapt the presence layer for your own multi-user workflows. Pantheon includes TypeScript types, error boundaries, and connection state management out of the box.`}</p>

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
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Get the full starter kit with real-time setup, type definitions, and a working Next.js example—start building live AI agent dashboards in under an hour.`}</p>
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
