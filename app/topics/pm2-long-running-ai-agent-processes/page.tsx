import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Running AI Agents 24/7 with PM2 | Production Guide',
  description: 'Keep Claude-powered agents running non-stop. Learn PM2 process management for AI agents with Next.js, real code examples, and open-source starter kit.',
  openGraph: {
    title:       'Running AI Agents 24/7 with PM2 | Production Guide',
    description: 'Keep Claude-powered agents running non-stop. Learn PM2 process management for AI agents with Next.js, real code examples, and open-source starter kit.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/pm2-long-running-ai-agent-processes',
  },
  twitter: { card: 'summary_large_image', title: 'Running AI Agents 24/7 with PM2 | Production Guide', description: 'Keep Claude-powered agents running non-stop. Learn PM2 process management for AI agents with Next.js, real code examples, and open-source starter kit.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Running AI Agents 24/7 with PM2"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`PM2 keeps your AI agents alive through restarts, crashes, and deployments—so your Claude-powered automation runs reliably 24/7 without manual intervention.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why PM2 for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents built with Claude often run background jobs: data processing, webhook handlers, scheduled tasks, agentic loops. Unlike stateless APIs, these agents maintain state, manage queues, and need to survive server restarts. PM2 handles process resurrection, clustering, and log management out of the box.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Without process management, a single crash means dead agents until you manually redeploy. With PM2, your agent restarts automatically, picks up where it left off from your database, and logs everything for debugging.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up PM2 for Your Agent Process"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create an \`ecosystem.config.js\` file at your project root. This tells PM2 how to run your Next.js API route or background worker, how many instances to spawn, and restart behavior.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Point PM2 at your Node.js entry point—typically a custom server or an API route running as a standalone process. Set \`max_memory_restart\` to prevent memory leaks from halting your agent mid-task.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`module.exports = {
  apps: [{
    name: 'claude-agent',
    script: './pages/api/agent.js',
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '500M',
    env: { NODE_ENV: 'production' },
    error_file: './logs/agent-error.log',
    out_file: './logs/agent-out.log',
    merge_logs: true
  }]
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"State Persistence in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents aren't stateless. When PM2 restarts your process, it must resume from the last checkpoint. Store agent state—current task, queue position, conversation history—in Supabase. On restart, query the last state and continue.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a \`tasks\` table with status ('pending', 'running', 'completed') and timestamps. Before your agent picks a new task, it updates the record. If the process dies, the next restart reads an incomplete task and resumes it.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Auto-Recovery"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`PM2 includes a built-in monitoring dashboard. Run \`pm2 monit\` to watch CPU, memory, and uptime in real time. Enable \`pm2-auto-pull\` for zero-downtime restarts when you deploy new code.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set \`listen_timeout: 3000\` to give your agent time to gracefully shut down and save state before PM2 force-kills it. Pair this with a shutdown handler in your code that commits pending state to Supabase.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Long-Running Tasks"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude API calls can take 10–30 seconds. Long-running agents need timeout buffers. In your PM2 config, set \`kill_timeout: 5000\` to allow graceful shutdown. In your agent code, use a heartbeat mechanism—every 30 seconds, touch a \`last_seen\` timestamp in Supabase so you know the process is alive.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`If your agent is truly slow, consider breaking work into smaller steps and saving progress between steps. This makes restarts more granular and reduces lost work.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) is a production-ready reference implementation. It combines Next.js API routes, Claude integration, Supabase for state, and a full PM2 ecosystem config. Clone it, swap in your API keys, and run \`pm2 start ecosystem.config.js\` to spin up a self-healing AI agent.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon also includes log aggregation, error alerting, and a dashboard for monitoring multiple agents. Study how it structures task queues and state recovery—it's designed for the patterns you'll face in production.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with PM2's ecosystem config, persist agent state in Supabase, and monitor with PM2's built-in tools—then grab the Pantheon starter kit to deploy a production-grade AI agent today.`}</p>
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
