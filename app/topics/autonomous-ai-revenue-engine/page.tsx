import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/autonomous-ai-revenue-engine'

export const metadata: Metadata = {
  title:       'Building an Autonomous AI Revenue Engine',
  description: 'Learn how to build self-operating AI agents with Claude that generate revenue. Real patterns for indie developers using Next.js, Supabase, and autonomous workflows.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/autonomous-ai-revenue-engine',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/autonomous-ai-revenue-engine',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/autonomous-ai-revenue-engine',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
    },
  },
  openGraph: {
    title:       'Building an Autonomous AI Revenue Engine',
    description: 'Learn how to build self-operating AI agents with Claude that generate revenue. Real patterns for indie developers using Next.js, Supabase, and autonomous workflows.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Building an Autonomous AI Revenue Engine', description: 'Learn how to build self-operating AI agents with Claude that generate revenue. Real patterns for indie developers using Next.js, Supabase, and autonomous workflows.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building an Autonomous AI Revenue Engine"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop building AI chatbots that need human input at every step—instead, build autonomous agents that identify opportunities, execute transactions, and generate revenue without intervention.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Core Loop: Perception, Decision, Execution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A revenue-generating AI engine needs three tightly coupled systems. First, perception: your agent continuously ingests market data, user behavior, or business metrics via APIs or database queries. Second, decision: Claude evaluates what happened, applies your business logic, and decides on the next action. Third, execution: the agent actually performs that action—creating a listing, charging a card, updating inventory, or triggering a workflow.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Most indie projects fail because they wire these loosely. Your perception layer updates once per day. Your decision logic takes three different code paths with inconsistent outcomes. Your execution calls the wrong API. Autonomous revenue means treating this loop as a single, deterministic machine that runs continuously.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecting Claude to Your Data Layer"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude needs real-time access to your business state. Use tool_use to let Claude query Supabase, call your APIs, or check live inventory. Define tools that return structured JSON—not raw database dumps. A tool called \`check_inventory\` should return \`{sku: string, quantity: number, reorder_threshold: number}\`, not a 500-row table.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Keep latency under 2 seconds per agent decision cycle. Cache tools and database queries aggressively. If your agent is deciding whether to mark an item for sale, it doesn't need historical customer data from 2019.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const tools = [
  {
    name: 'check_inventory',
    description: 'Query current stock levels for a SKU',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' }
      },
      required: ['sku']
    }
  },
  {
    name: 'create_listing',
    description: 'Publish a product to marketplace',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'integer' }
      },
      required: ['sku', 'price', 'quantity']
    }
  }
];`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building Reliable Decision Logic"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't let Claude freewheel. Give it a clear objective, constraints, and fallback rules. Instead of 'optimize revenue,' say 'if inventory > 500 units and supplier cost < \$12, list at \$29.99; if < 100 units, remove from sale; always maintain 20% margin.'`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's extended thinking for complex decisions. Let it reason through multi-step scenarios—should we drop price to clear inventory or hold for seasonal demand? But wrap that reasoning in a state machine: pending decision → Claude evaluates → log reasoning → execute action → verify outcome.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Circuit Breakers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`An autonomous agent that breaks costs you money in real time. Implement hard limits: maximum transaction size, maximum price change per cycle, maximum API calls per minute. Log every decision and execution. Use Supabase to store agent traces—what did the agent observe, what did it decide, what was the outcome?`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set up alerts for anomalies. If your agent suddenly creates 100 listings when it normally creates 3, something is wrong. Kill the loop, investigate, fix.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Scaling Beyond a Single Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start with one autonomous loop. Once it's stable and generating revenue, add more. One agent managing inventory, another managing pricing, another handling customer support. Use Next.js API routes as coordinator—they call Claude in parallel, aggregate decisions, execute safely.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase queues and edge functions let you run agents at the right frequency for each task. Pricing updates might run every 10 minutes. Inventory checks every hour. New opportunity detection every day.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project at github.com/lewisallena17/pantheon demonstrates a production-ready autonomous agent system built with Claude, Next.js, and Supabase. It includes decision logging, tool calling patterns, state management, and multi-agent coordination. Use it as a reference or fork it directly—it's built exactly for this use case.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Build your first autonomous revenue loop by connecting Claude to your data, defining clear decision rules, and adding monitoring—start with the Pantheon starter kit and ship this week.`}</p>
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
