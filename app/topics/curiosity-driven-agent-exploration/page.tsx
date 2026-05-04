import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/curiosity-driven-agent-exploration'

export const metadata: Metadata = {
  title:       'Curiosity-Driven Exploration in AI Agents',
  description: 'Build AI agents that autonomously explore problem spaces. Learn how to implement curiosity mechanisms in Claude-powered systems with Next.js and Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/curiosity-driven-agent-exploration',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/curiosity-driven-agent-exploration',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/curiosity-driven-agent-exploration',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
    },
  },
  openGraph: {
    title:       'Curiosity-Driven Exploration in AI Agents',
    description: 'Build AI agents that autonomously explore problem spaces. Learn how to implement curiosity mechanisms in Claude-powered systems with Next.js and Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Curiosity-Driven Exploration in AI Agents', description: 'Build AI agents that autonomously explore problem spaces. Learn how to implement curiosity mechanisms in Claude-powered systems with Next.js and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Curiosity-Driven Exploration in AI Agents"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Curiosity-driven exploration lets your AI agents autonomously discover solutions instead of following rigid paths—cutting development time and unlocking emergent behaviors you didn't explicitly program.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Curiosity Matters in Agent Design"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditional AI agents execute predefined workflows. Curiosity-driven agents maintain intrinsic motivation—they explore uncertain states, test hypotheses, and refine their own understanding. This matters because your indie product can handle edge cases and user patterns without hardcoding every scenario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For Claude-powered systems, curiosity mechanisms reduce prompt engineering overhead. Instead of writing exhaustive instructions, you define reward signals and let the agent explore the solution space. The agent learns what questions to ask, what data to prioritize, and when it's confused enough to ask for help.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Uncertainty Sampling"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The core of curiosity is quantifying uncertainty. One practical approach: track confidence scores on agent decisions, then prioritize high-uncertainty states for deeper exploration.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In your Next.js API routes, store agent decision histories in Supabase with confidence metadata. When an agent encounters a decision with <0.6 confidence, trigger extended reasoning or human review loops. This prevents confident hallucinations while enabling autonomous growth.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function evaluateAgentUncertainty(agentId: string, decision: string, confidence: number) {
  const { data } = await supabase
    .from('agent_decisions')
    .insert([
      { agent_id: agentId, decision, confidence, explored_at: new Date() }
    ])
    .select();
  
  if (confidence < 0.6) {
    return { action: 'explore', flagForReview: true };
  }
  return { action: 'execute' };
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Reward Signals for Autonomous Learning"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Curiosity agents optimize for information gain, not just task completion. Define rewards for: discovering novel solution patterns, reducing prediction error on held-out test cases, and resolving ambiguous inputs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In your Claude agent loop, embed feedback from each exploration attempt. Supabase becomes your agent's memory—store outcomes, reasoning chains, and what-worked/what-didn't. Claude's context window lets you feed recent successful explorations back as in-context examples, accelerating learning without retraining.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structuring Exploration State"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Curiosity without structure becomes chaos. Use a bounded exploration space: define which domains the agent can investigate, set iteration limits, and maintain a priority queue of unexplored hypotheses.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Supabase schema should include: exploration_targets (problems to solve), hypothesis_log (theories tested), and outcome_metrics (success/failure data). This lets you visualize agent behavior, debug weird exploration patterns, and identify where the agent gets stuck in loops.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating Human-in-the-Loop Feedback"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The most powerful curiosity-driven systems aren't fully autonomous—they know when to ask. Design checkpoints where agents present findings to founders/users, get external validation, and adjust their exploration based on feedback.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Next.js, create a dashboard that surfaces high-uncertainty decisions. Users provide labels or corrections; feed those back to the agent as strong reward signals. This closes the loop: curiosity + human judgment = rapid, grounded learning.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon framework (github.com/lewisallena17/pantheon) provides a production-ready template for curiosity-driven Claude agents. It includes uncertainty quantification, exploration logging, and a Next.js dashboard for monitoring agent behavior.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone the repo, wire your Supabase credentials, and you'll have a working agent that explores, learns, and reports back. The codebase demonstrates state management patterns, reward calculation, and integration with Claude's API in real TypeScript examples you can adapt immediately.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Curiosity-driven exploration transforms your AI agents from rigid task executors into adaptive learners—grab the Pantheon starter kit and ship autonomous systems that get smarter with every user interaction.`}</p>
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
