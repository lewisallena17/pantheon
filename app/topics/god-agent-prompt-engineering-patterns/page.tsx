import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Prompt Engineering Patterns for Orchestrator Agents',
  description: 'Master prompt patterns for multi-step Claude agent orchestration. Learn routing, context management, and decision trees for production AI systems.',
  openGraph: {
    title:       'Prompt Engineering Patterns for Orchestrator Agents',
    description: 'Master prompt patterns for multi-step Claude agent orchestration. Learn routing, context management, and decision trees for production AI systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/god-agent-prompt-engineering-patterns',
  },
  twitter: { card: 'summary_large_image', title: 'Prompt Engineering Patterns for Orchestrator Agents', description: 'Master prompt patterns for multi-step Claude agent orchestration. Learn routing, context management, and decision trees for production AI systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Prompt Engineering Patterns for Orchestrator Agents"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Building multi-step AI agents requires more than chaining API calls—you need proven prompt patterns that handle routing, fallbacks, and context management at scale, and this guide shows you exactly which patterns work in production systems.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Routing Pattern: Directing Agent Behavior"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Orchestrator agents often need to decide between multiple execution paths. Rather than building complex conditional logic in your application layer, embed routing decisions directly into your prompt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a structured prompt that asks Claude to classify incoming requests into predefined categories, then return a JSON decision object. This keeps agent logic auditable and reduces backend branching.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The key is providing clear category definitions with examples. Give Claude 2-3 real examples of what each route looks like, and it will generalize accurately to new inputs.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const routingPrompt = \`You are an agent router. Classify the user request into ONE category.

Categories:
- search: factual queries requiring real-time data
- database: questions answerable from stored data
- analysis: requests needing computation or synthesis

Respond with JSON: {"route": "search|database|analysis", "confidence": 0.0-1.0, "reasoning": "brief explanation"}

User request: \${userMessage}\`;`}</code></pre>
        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Context Window Management for Long Workflows"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Long agent workflows consume tokens rapidly. Instead of accumulating full conversation history, implement a summarization pattern where completed steps are condensed into structured summaries.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`After each agent step, generate a one-sentence JSON summary of what was accomplished. Pass only recent context (last 2-3 steps) plus the full summaries forward.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This pattern keeps token usage predictable and prevents context thrashing. For a typical 10-step workflow, you'll use 30-40% fewer tokens than naive history accumulation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Decision Trees via Nested Prompts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Complex decisions don't fit in a single prompt. Instead, structure agent logic as a sequence of focused, single-responsibility prompts where each one handles a discrete decision.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Have the first prompt classify the scenario, the second prompt evaluate constraints based on that classification, and the third prompt synthesize a decision. Each prompt can be optimized independently.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This pattern is easier to test, debug, and monitor than monolithic prompts. You can inject different models at different decision points based on cost/latency requirements.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Error Handling and Fallback Patterns"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Production agents fail. Rather than letting failures propagate, build explicit fallback prompts into your workflow. If a search step fails, immediately route to a fallback step that uses cached or approximate data.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Include a 'confidence' field in all Claude responses. If confidence falls below your threshold (0.6-0.7 depending on context), trigger a fallback path automatically.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use structured error states: each fallback should return the same JSON shape as the primary path, so downstream steps don't need to handle conditional logic.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Function Calling for Deterministic Outputs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't rely on Claude's natural language when you need deterministic structured data. Use the function calling API to force Claude into specific schemas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Define tools for each meaningful action: search, database_query, update_record, send_notification. Claude treats these as constrained outputs rather than suggestions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This is especially critical in orchestrator agents where downstream steps depend on consistent, parseable responses. A malformed JSON response can derail an entire workflow.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Observability Patterns"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every prompt in your orchestrator should include internal logging signals. Ask Claude to include a 'reasoning' field explaining its decision, even when it's not part of the final output.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log these reasoning traces alongside token counts and latency metrics. Over time, you'll identify which patterns are reliable and which need refinement.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use structured logging (JSON events, not strings) so you can aggregate patterns across your agent fleet and catch systemic issues early.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Master these six patterns and you'll build orchestrator agents that scale reliably—start with routing and context management, then layer in fallbacks and monitoring to create systems your users trust.`}</p>
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
