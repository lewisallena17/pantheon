import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Supabase Realtime for AI Agent Dashboards',
  description: 'Build live-updating AI agent dashboards with Supabase Realtime, Next.js, and Claude. See agent decisions and metrics update instantly.',
  openGraph: {
    title:       'Supabase Realtime for AI Agent Dashboards',
    description: 'Build live-updating AI agent dashboards with Supabase Realtime, Next.js, and Claude. See agent decisions and metrics update instantly.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-agent-dashboards',
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Realtime for AI Agent Dashboards', description: 'Build live-updating AI agent dashboards with Supabase Realtime, Next.js, and Claude. See agent decisions and metrics update instantly.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Realtime for AI Agent Dashboards"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Supabase Realtime lets you stream agent state changes directly to your dashboard without polling, so you see Claude's decisions, token usage, and task progress update instantly as they happen.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Polling Kills AI Agent Dashboards"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you build an AI agent system, you need visibility into what's happening right now. Claude processes tasks, makes decisions, and your dashboard needs to reflect that in real-time. Polling every 2–5 seconds creates lag, wastes database queries, and makes the interface feel stale.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime solves this with WebSocket subscriptions. Instead of asking your database 'has anything changed?', you listen for changes as they happen. Your dashboard updates within milliseconds, not seconds. For agent systems, this means seeing task completions, token consumption, and decision branches the moment they occur.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Realtime Subscriptions for Agent Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a simple agent_events table and subscribe to changes in your Next.js dashboard component. Supabase broadcast channels work perfectly for high-frequency updates—token counts, status changes, and reasoning traces.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's how to listen for agent task completions:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

export function AgentDashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const subscription = supabase
      .channel('agent-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_tasks' },
        (payload) => {
          setTasks((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return <div>{tasks.map(t => <TaskCard key={t.id} task={t} />)}</div>;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structuring Your Agent Event Schema"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent_events table should track the full lifecycle: task creation, Claude's reasoning steps, tool calls, results, and completion. Include timestamps, token counts, and the agent's trace for debugging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A minimal schema includes id, agent_id, task_id, event_type ('reasoning' | 'tool_call' | 'complete'), payload (JSON), tokens_used, and created_at. This gives your dashboard everything needed to show live progress bars, token budgets, and decision trees.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Broadcasting Agent State Without Database Writes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`For ultra-high-frequency updates (token counts changing every millisecond), skip the database and use Supabase broadcast channels. Send updates from your Claude-running backend directly to the dashboard via WebSocket.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This keeps your database write load low while keeping the UI perfectly in sync. Use broadcast for live metrics, reserve database inserts for immutable audit trails.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Backpressure and Connection Recovery"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Realtime subscriptions can drop. Always implement reconnection logic and debounce rapid updates if your agent fires thousands of events per minute. Supabase clients handle reconnection automatically, but wrap your subscription handler to gracefully handle stale data.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache the last known state client-side so your dashboard doesn't blank out during a reconnect. For mission-critical dashboards, maintain a fallback polling strategy at 10–30 second intervals.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) is a production-ready example of Supabase Realtime integrated with Claude-powered agents. It demonstrates the full stack: agent task orchestration, Realtime event streaming, and a Next.js dashboard that updates sub-second.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to see how to structure your agent_events table, implement Realtime subscriptions, and build live task traces. The repo includes retry logic, error boundaries, and performance-tuned database indexes.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Use Supabase Realtime instead of polling to build AI agent dashboards that feel instant—watch your Claude agents decide and act in real-time. Start with the Pantheon starter kit and deploy your live dashboard today.`}</p>
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
