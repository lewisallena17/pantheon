import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-self-directed-goals'

export const metadata: Metadata = {
  title:       'Self-Directed Goals for AI Agents | Claude + Next.js',
  description: 'Give your Claude AI agents the ability to set and pursue their own goals. Learn how to implement autonomous goal-setting with Next.js and Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-self-directed-goals',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-self-directed-goals',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-self-directed-goals',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
    },
  },
  openGraph: {
    title:       'Self-Directed Goals for AI Agents | Claude + Next.js',
    description: 'Give your Claude AI agents the ability to set and pursue their own goals. Learn how to implement autonomous goal-setting with Next.js and Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Self-Directed Goals for AI Agents | Claude + Next.js', description: 'Give your Claude AI agents the ability to set and pursue their own goals. Learn how to implement autonomous goal-setting with Next.js and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Giving AI Agents Self-Directed Goals"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Most AI agents execute tasks you define upfront—but self-directed goals let your agents identify what matters, prioritize autonomously, and adapt their strategy without constant human intervention, turning them from task runners into decision-makers.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Self-Directed Goals Matter for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditional agentic workflows require you to specify the goal, break it into steps, and monitor completion. This works for well-defined tasks but breaks down when your agent faces open-ended problems, shifting priorities, or missing context. Self-directed goals flip the model: your agent observes its environment, identifies what needs doing, and commits to measurable outcomes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie builders, this means fewer prompt revisions, less scaffolding code, and agents that actually adapt to real-world complexity. A customer service agent with self-directed goals notices ticket backlogs and escalates without being told. A data processing agent identifies data quality issues and flags them proactively.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Core Pattern: Observe, Reflect, Commit"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Self-directed goals follow a three-step loop. First, your agent observes its current state—what tasks exist, what constraints apply, what metrics matter. Second, it reflects using Claude's extended thinking or tool use to decide which goal is worth committing to. Third, it commits to that goal in your database, creating an audit trail and preventing conflicting objectives.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This pattern prevents hallucination (agents can't claim they're working toward goals that don't exist) and keeps your system transparent. You can always query what your agent decided and why.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Goal State in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store goals as structured records with clear lifecycle states. A goal should track creation timestamp, the reasoning behind it, current status (active, blocked, completed), and any child tasks it generated. Use a simple enum for status and always log the agent's reasoning in a metadata field for debugging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This schema lets you query active goals by agent, filter blocked goals for human intervention, and audit why your agent chose goal A over goal B. It's the source of truth your Claude calls can reference to avoid contradictions.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Supabase goal table
CREATE TABLE agent_goals (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  reasoning TEXT,
  status TEXT CHECK (status IN ('active', 'blocked', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_agent_active ON agent_goals(agent_id, status);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude's Role: Goal Proposal and Reasoning"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude as your goal-deliberation layer. Pass it the current state (open tasks, metrics, constraints) and ask it to propose a single self-directed goal with explicit reasoning. Use tools to fetch context from Supabase, then save the proposed goal back using your Next.js API.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's native ability to reason through competing priorities makes it ideal for this decision point. You're not asking it to execute the goal—you're asking it to decide what goal is worth pursuing, which is a deliberation task it handles well.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecting Goals to Actions in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Once a goal is committed, your agent's action layer references it. In Next.js API routes, check the active goal before deciding which tools to call. This prevents your agent from drifting: every action should ladder up to the current goal or explicitly re-propose a new one.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use middleware or a wrapper hook to fetch the active goal at the start of each agent cycle. If the goal becomes impossible (a resource disappears, a deadline passes), your agent should reflect and either commit to a backup goal or escalate.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Goal Conflicts and Replanning"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When your agent discovers a goal is blocked or obsolete, it shouldn't silently retry. Instead, trigger a reflection cycle: query why the goal failed, propose alternatives, and commit to a new direction. This keeps logs clean and prevents agent thrashing.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use your database status flags to separate active goals from blocked ones, and log the blocking reason. If a human needs to intervene, they see exactly why the agent got stuck.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) demonstrates self-directed goal patterns for multi-agent systems. It includes a goal proposal layer, Supabase schema, and Next.js endpoints for goal management. Clone it, adapt the goal reasoning prompt for your domain, and integrate it into your existing Claude + Supabase stack.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Self-directed goals transform your AI agents from task executors into autonomous decision-makers—start by storing goals in Supabase, using Claude to reason about priorities, and connecting every action back to a committed objective. Get the full starter kit and schema from Pantheon.`}</p>
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
