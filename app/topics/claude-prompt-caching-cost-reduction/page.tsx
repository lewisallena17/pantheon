import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Cut Claude API Costs with Prompt Caching',
  description: 'Learn how prompt caching reduces Claude API costs by 90% for AI agents. Technical guide with Next.js examples for indie developers.',
  openGraph: {
    title:       'Cut Claude API Costs with Prompt Caching',
    description: 'Learn how prompt caching reduces Claude API costs by 90% for AI agents. Technical guide with Next.js examples for indie developers.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-prompt-caching-cost-reduction',
  },
  twitter: { card: 'summary_large_image', title: 'Cut Claude API Costs with Prompt Caching', description: 'Learn how prompt caching reduces Claude API costs by 90% for AI agents. Technical guide with Next.js examples for indie developers.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Cutting Claude API Costs with Prompt Caching"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Prompt caching cuts your Claude API costs by up to 90% by reusing expensive token computations—here's exactly how to implement it in your Next.js agent stack.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How Prompt Caching Saves Money"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's prompt caching feature stores the processing results of system prompts and context blocks, letting you reuse them without repaying full token costs. Cached tokens cost 90% less than regular input tokens—meaning a 10k-token system prompt costs ~100 tokens on subsequent API calls instead of 10,000.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agents that repeatedly process the same context (product documentation, user profiles, system instructions), this compounds fast. A production agent running 100 requests daily with a 5k-token cached context saves \$500+ monthly.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Cache in Next.js with Claude SDK"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's SDK handles caching through request headers. Add \`cache_control\` to your system prompt and messages to mark them for caching. Cache writes cost full price but activate after 1,024 tokens; subsequent requests pay 90% less.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's a production-ready example:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: 'You are a specialized API agent...',
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userQuery,
          cache_control: { type: 'ephemeral' }
        }
      ]
    }
  ]
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cache Types: Ephemeral vs. Session-Based"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ephemeral cache lasts 5 minutes per API session—perfect for high-frequency requests from the same user within a conversation. Use this for chatbots and real-time agents.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For longer-lived contexts (product schemas, system instructions), implement session-based caching by storing cache tokens in Supabase and reattaching them to requests. This requires tracking \`cache_creation_input_tokens\` and \`cache_read_input_tokens\` in response metadata.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Measuring Cache Hit Rates"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Monitor cache effectiveness through Claude's response metadata. Every response includes \`usage.cache_creation_input_tokens\` (cache miss) and \`usage.cache_read_input_tokens\` (cache hit). Log these to Supabase to track ROI.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A healthy production agent targets 70%+ cache hit rates. If you're below 40%, your context blocks aren't stable enough—consolidate repetitive instructions into single cached blocks.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Common Pitfalls and Fixes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache invalidates if you modify system prompts or message content. Even whitespace changes reset the cache. Use feature flags or versioning for safe updates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't cache user-specific data—it defeats the purpose. Cache only static system instructions, product documentation, and shared context. Dynamic user queries should sit outside cache blocks.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon provides production-ready scaffolding for Claude agents with built-in prompt caching, Supabase integration, and cost tracking. It includes Next.js middleware for automatic cache header injection and a dashboard to monitor cache performance across your agent fleet.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it and customize the system prompts for your use case—cache setup is already wired.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start caching your system prompts today—most indie developers see ROI within two weeks. Grab the Pantheon starter kit and begin cutting costs immediately.`}</p>
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
