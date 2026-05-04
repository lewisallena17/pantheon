import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/meta-reflection-ai-agent-self-improvement'

export const metadata: Metadata = {
  title:       'Meta-Reflection for AI Agents | Self-Improvement Primitives',
  description: 'Implement meta-reflection in Claude agents to enable autonomous self-improvement. Build better AI systems with structured introspection loops.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/meta-reflection-ai-agent-self-improvement',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/meta-reflection-ai-agent-self-improvement',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/meta-reflection-ai-agent-self-improvement',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
    },
  },
  openGraph: {
    title:       'Meta-Reflection for AI Agents | Self-Improvement Primitives',
    description: 'Implement meta-reflection in Claude agents to enable autonomous self-improvement. Build better AI systems with structured introspection loops.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Meta-Reflection for AI Agents | Self-Improvement Primitives', description: 'Implement meta-reflection in Claude agents to enable autonomous self-improvement. Build better AI systems with structured introspection loops.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Meta-Reflection as an AI Agent Self-Improvement Primitive"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Meta-reflection—the ability of an AI agent to observe and critique its own reasoning—is the difference between agents that plateau and agents that improve with every interaction.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"What Meta-Reflection Actually Does"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Meta-reflection isn't prompt engineering or fine-tuning. It's a runtime primitive: after your agent completes a task, it examines its reasoning process, identifies failure modes, and adjusts future behavior within the same session or across deployments.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For Claude-based agents, this means capturing intermediate outputs—tool calls, reasoning chains, outcomes—then asking Claude to evaluate what worked and what didn't. The result is structured feedback that accumulates into measurable performance gains.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Core Architecture: Capture, Reflect, Update"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pattern is three-stage: (1) Execute the primary task and log all decision points, (2) Pass execution trace to Claude with a reflection prompt that asks for failure analysis and improvement suggestions, (3) Store the reflection in your agent's context or database so future runs incorporate the insight.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This creates a feedback loop without retraining. Each agent instance becomes smarter as it encounters new cases. In production, this means your Supabase instance stores not just results, but the reasoning improvements that generated them.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// TypeScript: Basic reflection loop in a Next.js API route
const executeWithReflection = async (task: string, history: Reflection[]) => {
  const execution = await claude.runAgent(task, history);
  const reflection = await claude.reflect(execution.trace);
  await supabase.from('reflections').insert({ task, execution, reflection });
  return { execution, reflection };
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Where Meta-Reflection Wins"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Multi-step reasoning tasks: SQL generation, API orchestration, content planning. Agents often take suboptimal paths early; reflection catches this and corrects the pattern.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rare edge cases: When an agent encounters a case it hasn't seen, meta-reflection can synthesize a response and immediately encode why that response worked, avoiding the same mistake later.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cost optimization: Instead of prompt engineering cycles, reflection naturally discovers better instruction formats, reducing token spend over time.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Reflection Prompts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your reflection prompt should ask: What assumptions did I make? Which steps were unnecessary? Did I use the right tool? What signal would tell me I was wrong earlier? Claude handles this introspection natively—it's designed to reason about its own outputs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store reflections as structured JSON in Supabase: { taskType, failureMode, correction, confidence }. Over time, you'll see patterns: certain task types have recurring issues that point to systemic gaps in your agent's knowledge or capabilities.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Scaling Reflection Across Agent Fleets"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In production systems with many concurrent agents, reflection becomes a shared knowledge layer. When Agent A discovers an improvement, Agent B learns it without redeployment. Use a Supabase trigger to propagate high-confidence reflections to a shared context vector or instruction set.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This approach works because meta-reflection is stateless: any agent can read and apply learnings from any other agent's reflections, creating an emergent collective improvement.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon implements meta-reflection as a reusable primitive for Claude agents. It includes runnable examples for Next.js, Supabase schema migrations for storing reflections, and scaffolding for reflection prompt templates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it as a starter: it's built for indie teams and includes configuration for local development and production deployments on Vercel + Supabase.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Meta-reflection transforms agent systems from static pipelines into learning entities—build it into your next Claude agent and watch performance compound with every task.`}</p>
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
