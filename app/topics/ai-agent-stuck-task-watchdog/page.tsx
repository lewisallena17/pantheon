import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Build a Stuck-Task Watchdog for AI Agent Pools',
  description: 'Learn to detect and recover stuck tasks in AI agent pools using Claude, Next.js, and Supabase. Prevent silent failures in production systems.',
  openGraph: {
    title:       'Build a Stuck-Task Watchdog for AI Agent Pools',
    description: 'Learn to detect and recover stuck tasks in AI agent pools using Claude, Next.js, and Supabase. Prevent silent failures in production systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-stuck-task-watchdog',
  },
  twitter: { card: 'summary_large_image', title: 'Build a Stuck-Task Watchdog for AI Agent Pools', description: 'Learn to detect and recover stuck tasks in AI agent pools using Claude, Next.js, and Supabase. Prevent silent failures in production systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building a Stuck-Task Watchdog for AI Agent Pools"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`When you're running a pool of AI agents processing tasks asynchronously, silent failures and stuck tasks will eventually cost you—a watchdog system that detects hangs and auto-recovers can save hours of debugging and lost revenue.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Stuck Tasks Happen in Agent Pools"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agent tasks can hang for several reasons: Claude API timeouts, network interruptions, infinite loops in agent logic, or database locks that block state updates. In a pool of concurrent agents, one stuck task is invisible until your monitoring gaps it.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Without visibility, a task marked 'processing' never moves to 'completed' or 'failed'. Your queue stays dirty. New agents skip over it. Users never hear back. The cost compounds.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Detecting Task Hangs with Heartbeat Intervals"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The simplest reliable pattern: record a \`last_activity_at\` timestamp every time an agent updates task state, and run a scheduled check every 2–5 minutes. If a task hasn't moved in longer than your timeout threshold (e.g., 10 minutes for long-running inference), flag it.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This requires minimal overhead—a single Postgres query checking \`NOW() - last_activity_at > interval '10 minutes'\` and \`status = 'processing'\`. No complex distributed tracing needed for indie-scale systems.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`SELECT id, agent_id, created_at, last_activity_at FROM tasks WHERE status = 'processing' AND (NOW() - last_activity_at) > interval '10 minutes' ORDER BY last_activity_at ASC;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Recovery with Exponential Backoff"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Once you detect a stuck task, you have three safe moves: reset it to 'pending' for retry, escalate it to a higher-priority queue, or move it to a 'stuck' status with manual intervention required.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Track retry count in your schema. Increment it on recovery. After 3 retries, stop auto-recovery and send an alert. This prevents runaway loops while giving the task reasonable chances to succeed.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the Watchdog Service in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Implement the watchdog as a Next.js API route that runs on a cron schedule (using a service like EasyCron or Vercel Crons). The route queries Supabase for stuck tasks, updates their status, and fires webhook notifications to your agent pool coordinator.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Keep the watchdog idempotent: if it runs twice in 30 seconds, it should not double-recover the same task. Use database-level locks or add a \`recovered_at\` timestamp check to prevent duplicates.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Alerting Setup"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every watchdog run and recovery attempt. Track metrics: tasks recovered per hour, retry success rate, and time-to-recovery. Spike in stuck tasks often signals a deeper issue (API rate limits, database performance).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Send Slack or email alerts when recovery count exceeds a threshold. This early warning system gives you time to fix root causes before they cascade.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pantheon repository (github.com/lewisallena17/pantheon) provides a production-ready reference implementation of task pooling and watchdog systems for Claude-powered agents. It includes Supabase schema templates, Next.js API handlers, and retry logic you can fork and customize.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The repo demonstrates real error handling patterns and shows how to integrate task state machines with Claude's API lifecycle. Use it as a starting point rather than a black box.`}</p>

        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>

        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Build a heartbeat-based watchdog into your agent pool now—it takes a few hours and will prevent silent failures that cost you later. Start with the Pantheon reference implementation and customize for your stack.`}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://lewisallena17.gumroad.com" target="_blank" rel="noopener noreferrer"
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
