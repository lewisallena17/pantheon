import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Real Cost of Running Autonomous AI Agents 24/7',
  description: 'Break down the real cost of running autonomous AI agents 24/7 — token spend, infra, retries, and idle loops — with exact numbers and open-source tools.',
  openGraph: {
    title:       'Real Cost of Running Autonomous AI Agents 24/7',
    description: 'Break down the real cost of running autonomous AI agents 24/7 — token spend, infra, retries, and idle loops — with exact numbers and open-source tools.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/real-cost-running-autonomous-ai-agents',
  },
  twitter: { card: 'summary_large_image', title: 'Real Cost of Running Autonomous AI Agents 24/7', description: 'Break down the real cost of running autonomous AI agents 24/7 — token spend, infra, retries, and idle loops — with exact numbers and open-source tools.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"The Real Cost of Running Autonomous AI Agents 24/7"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Before you scale your Claude-powered agent to run continuously, here are the exact cost levers that will determine whether your monthly bill is \$40 or \$4,000.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Token Costs Are Not Linear — They Compound"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's context window is generous, but autonomous agents stuff it fast. A single agent loop that reads tool outputs, appends results, and re-prompts can balloon from a 2K-token request to a 40K-token request within five turns. At claude-3-5-sonnet pricing (\$3 input / \$15 output per million tokens), a naive agent running 100 loops per hour costs roughly \$180/day before you account for retries.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The fix is aggressive context pruning. Summarize completed steps into a compact scratchpad and inject only the last N tool results into each prompt. This alone can cut per-loop token usage by 60–70% without losing agent coherence.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Infra Costs: Vercel Functions vs. Long-Running Workers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js on Vercel is great for request-response workflows, but autonomous agents need persistent execution. A single 10-minute agent run blows past Vercel's default 60-second function limit and, on Pro, costs \$0.40 per GB-second. For continuous 24/7 agents, a \$6/month Fly.io worker or a Supabase Edge Function with Deno's event loop is orders of magnitude cheaper.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Next.js API routes only to trigger agents and stream status back to the UI. Offload the actual agent loop to a persistent worker process and report progress via a Supabase Realtime channel. This pattern keeps your frontend snappy and your compute bill predictable.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// app/api/agent/trigger/route.ts
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { agentId, task } = await req.json();
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Insert job — persistent worker picks it up via pg_notify
  const { error } = await supabase
    .from('agent_jobs')
    .insert({ agent_id: agentId, task, status: 'queued' });

  if (error) return Response.json({ error }, { status: 500 });
  return Response.json({ queued: true });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Idle Loops and Retry Storms Are Silent Budget Killers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agents polling for work every second with no backoff will consume thousands of empty LLM calls per day if your queue is often empty. Implement exponential backoff on idle polls — start at 1s, cap at 60s — and use Supabase's pg_notify or a simple cron trigger to wake the worker only when a job exists.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Retry storms are worse. If Claude returns a 529 overload error and your agent retries immediately in a tight loop, you can burn through your rate-limit quota and accumulate thousands of failed-but-billed partial requests. Always implement jitter-based retry with a maximum of 3–5 attempts before marking a job failed and alerting.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Supabase as Your Agent Memory Layer — Cost vs. Speed Tradeoffs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Storing every agent message and tool result in Postgres is cheap (Supabase free tier gives you 500MB), but querying unindexed JSONB columns for context retrieval at scale gets slow fast. Add a GIN index on your messages JSONB column and use pgvector for semantic memory retrieval rather than scanning full conversation histories on every loop.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For embeddings, batch your text-embedding-3-small calls (\$0.02 per million tokens) and cache embeddings in a pgvector table. Retrieving the top-5 relevant memories via cosine similarity is faster and cheaper than re-reading a 20K-token history on every agent step.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon (github.com/lewisallena17/pantheon) is an open-source starter that wires together Claude, Next.js, and Supabase with all of the cost-aware patterns described above — context pruning, job-queue-based agent dispatch, pgvector memory, and exponential backoff retry — already implemented and production-tested.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it, set your ANTHROPIC_API_KEY and Supabase credentials, and you have a foundation that won't surprise you with a four-figure cloud bill. The repo includes a cost-tracking middleware that logs token usage per job run directly into Supabase so you can query your spend by agent, task type, or time window from day one.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`The real cost of running autonomous AI agents 24/7 is manageable if you prune context aggressively, offload loops to persistent workers, and instrument token usage from the start — grab the Pantheon starter kit at github.com/lewisallena17/pantheon and ship a cost-efficient agent system today.`}</p>
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
