import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Claude Opus vs Sonnet vs Haiku: Model Routing Guide',
  description: 'Smart model routing for Claude AI agents. Compare Opus, Sonnet, Haiku on speed, cost, and accuracy. Build efficient agent systems with practical routing strategies.',
  openGraph: {
    title:       'Claude Opus vs Sonnet vs Haiku: Model Routing Guide',
    description: 'Smart model routing for Claude AI agents. Compare Opus, Sonnet, Haiku on speed, cost, and accuracy. Build efficient agent systems with practical routing strategies.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-opus-vs-sonnet-vs-haiku-routing',
  },
  twitter: { card: 'summary_large_image', title: 'Claude Opus vs Sonnet vs Haiku: Model Routing Guide', description: 'Smart model routing for Claude AI agents. Compare Opus, Sonnet, Haiku on speed, cost, and accuracy. Build efficient agent systems with practical routing strategies.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Opus vs Sonnet vs Haiku — Smart Model Routing"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Route Claude requests to the right model—Opus for reasoning, Sonnet for balance, Haiku for speed—and cut your API costs by 60% while keeping response quality where it matters.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Model Routing Matters for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Not every Claude request needs Opus. Simple classifications, formatting, and retrieval tasks run fine on Haiku at 1/10 the cost. Complex reasoning, code generation, and multi-step planning benefit from Opus's reasoning depth. Smart routing means you pay only for the capability you actually need.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie developers and founders, this isn't premature optimization—it's the difference between a \$500/month API bill and \$50/month at scale. Agents that make dozens of API calls per user interaction need intentional model selection from the start.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude Opus: Deep Reasoning and Complex Planning"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Opus is your heavyweight. It excels at multi-step reasoning, analyzing ambiguous requirements, debugging complex code, and solving novel problems. Use it for tasks that genuinely require step-by-step logic.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Typical routes: architectural decisions, bug analysis across large codebases, writing detailed specifications, evaluating tradeoffs. Response time: 2–5 seconds. Cost: \$15 per 1M input tokens.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In an agent system, route to Opus when your task classifier detects low-confidence requests or when previous Sonnet attempts failed to meet quality thresholds.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude Sonnet: The Smart Default"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Sonnet sits in the sweet spot: fast enough for real-time chat, smart enough for most technical tasks. It handles code reviews, documentation generation, structured data extraction, and multi-turn conversations without breaking speed budgets.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Typical routes: customer support responses, API schema generation, refactoring suggestions, content moderation. Response time: 500–1000ms. Cost: \$3 per 1M input tokens.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Make Sonnet your default fallback. If you're unsure which model to use, start here—you'll only bump to Opus when task complexity actually demands it.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude Haiku: Fast Filtering and Triage"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Haiku is your lightweight. It's fast (typically <200ms), cheap (\$0.80 per 1M input tokens), and surprisingly capable at classification, entity extraction, and simple transformations.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Typical routes: determining if a support ticket needs human escalation, classifying user intent before routing to specialized agents, extracting structured data from unstructured text, content safety checks.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In a multi-step agent workflow, use Haiku for the first decision layer. Only pass complex reasoning or final content generation upstream to Sonnet or Opus.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Practical Routing Strategy for Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Layer your routing decisions: start with Haiku for lightweight triage, escalate to Sonnet for moderate complexity, reserve Opus for genuinely difficult reasoning. The key is building a confidence score or task classifier that sits before model selection.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Example pattern: Haiku extracts intent and validates input format → Sonnet handles main logic and generation → Opus only runs on edge cases or when Sonnet confidence drops below threshold. This three-tier approach typically reduces Opus usage to 5–10% of total requests while maintaining output quality.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function routeMessage(userInput: string): Promise<string> {
  const intent = await claude(userInput, 'haiku', 'classify_intent');
  
  if (intent.requiresReasoning) {
    return await claude(userInput, 'opus', 'detailed_analysis');
  }
  if (intent.complexity === 'high') {
    return await claude(userInput, 'sonnet', 'standard_response');
  }
  return await claude(userInput, 'haiku', 'simple_response');
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo (github.com/lewisallena17/pantheon) provides a production-ready reference implementation for smart Claude model routing in Next.js. It includes task classification, cost tracking, latency monitoring, and fallback chains.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to get: TypeScript routing layer, Supabase cost logging, A/B testing framework, and example agent workflows. The starter already integrates model selection with your API routes—extend the classifier logic for your specific use case.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with a Haiku → Sonnet → Opus routing chain, measure where your requests actually land, and you'll cut API costs while keeping quality high—clone Pantheon to get started today.`}</p>
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
