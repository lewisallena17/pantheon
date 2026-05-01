import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'The Self-Improving AI Orchestrator Pattern Explained',
  description: 'Learn the Self-Improving AI Orchestrator Pattern: architecture, code, and open-source tools for indie devs building agent systems with Claude, Next.js, Supabase.',
  openGraph: {
    title:       'The Self-Improving AI Orchestrator Pattern Explained',
    description: 'Learn the Self-Improving AI Orchestrator Pattern: architecture, code, and open-source tools for indie devs building agent systems with Claude, Next.js, Supabase.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/self-improving-ai-orchestrator-pattern',
  },
  twitter: { card: 'summary_large_image', title: 'The Self-Improving AI Orchestrator Pattern Explained', description: 'Learn the Self-Improving AI Orchestrator Pattern: architecture, code, and open-source tools for indie devs building agent systems with Claude, Next.js, Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"The Self-Improving AI Orchestrator Pattern"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`The Self-Improving AI Orchestrator Pattern lets your agent system evaluate its own outputs, log failures to a database, and automatically refine its prompts and routing logic — so your product gets smarter every time it runs, without you manually tuning it.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"What the Pattern Actually Does"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`At its core, the pattern wraps every agent execution in an eval loop. After each task completes, a critic agent scores the output against a rubric, writes a structured feedback record to Supabase, and optionally triggers a prompt-rewrite agent that patches the system prompt for the next run.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This is different from simple retry logic. The orchestrator isn't just re-running failed tasks — it's accumulating a ground-truth dataset of what worked, what didn't, and why. Over dozens of runs you get a self-correcting system without manually reviewing logs.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:self-improving-ai-orchestrator-pattern`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Core Architecture: Orchestrator, Worker, Critic"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Split your agent graph into three roles. The Orchestrator decomposes the goal and routes subtasks. Workers execute discrete tasks using Claude tool-use calls. The Critic is a separate Claude call that receives the worker's output plus the original intent and returns a JSON score object with a pass/fail flag and a reason string.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Keep the Critic prompt stateless and deterministic. Give it a fixed rubric so scores are comparable across runs. The Orchestrator reads the score and decides whether to mark the task complete, retry with a modified prompt, or escalate to a human review queue.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Storing Feedback in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every critic evaluation gets written to an agent_runs table. Querying this table later lets you find which prompt variants produced the highest pass rates, which task types fail most often, and what time-of-day patterns exist in failures.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here is the minimal table schema and a TypeScript insert you can drop into a Next.js API route:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Supabase migration
create table agent_runs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  task_type   text not null,
  prompt_hash text not null,
  passed      boolean not null,
  score       numeric(4,2),
  reason      text,
  raw_output  jsonb
);

// app/api/agent/route.ts (Next.js App Router)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function logRun(run: {
  taskType: string;
  promptHash: string;
  passed: boolean;
  score: number;
  reason: string;
  rawOutput: object;
}) {
  const { error } = await supabase.from('agent_runs').insert({
    task_type:   run.taskType,
    prompt_hash: run.promptHash,
    passed:      run.passed,
    score:       run.score,
    reason:      run.reason,
    raw_output:  run.rawOutput,
  });
  if (error) throw new Error(\`Supabase insert failed: \${error.message}\`);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Prompt Mutation: Closing the Loop"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Once you have 20+ runs for a given task type, you can run a nightly prompt-optimizer job. Feed Claude the top 5 failed runs (reason + raw_output), the current system prompt, and ask it to produce a revised prompt that addresses the failure pattern. Store the new prompt with an incremented version number and A/B test it against the old one.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use the prompt_hash column to track which version produced which result. This gives you a reproducible improvement cycle: collect, analyze, mutate, measure.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Avoiding Common Failure Modes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The two biggest pitfalls are reward hacking and runaway mutation. If your critic rubric is loose, the rewrite agent will find prompt phrasings that score well without actually improving output quality. Write rubric criteria against observable, concrete properties of the output — not vibes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cap mutation depth. Store a parent_prompt_id foreign key and refuse to apply a rewrite if the chain depth exceeds a threshold (5 is a safe default). This prevents the system from drifting so far from the original intent that outputs become unrecognizable.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A working reference implementation of the Self-Improving AI Orchestrator Pattern is available in the Pantheon repo at github.com/lewisallena17/pantheon. It ships with the Supabase schema, a Next.js orchestrator API route, pre-built Critic and Worker prompt templates for Claude, and a prompt-version management utility.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, point it at your own Supabase project, add your Anthropic API key, and you have a running self-improving agent pipeline in under 30 minutes. The repo is MIT-licensed and accepts PRs for new task-type templates.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implement the Self-Improving AI Orchestrator Pattern today by forking the Pantheon starter kit at github.com/lewisallena17/pantheon — ship a Claude agent system that measurably improves itself on every run.`}</p>
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
