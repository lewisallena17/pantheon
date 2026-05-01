import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Parallel Tool Execution Patterns in Claude | AI Agents',
  description: 'Learn how to execute Claude tools in parallel for faster AI agent workflows. Pattern guide for Next.js + Supabase builders with real code examples.',
  openGraph: {
    title:       'Parallel Tool Execution Patterns in Claude | AI Agents',
    description: 'Learn how to execute Claude tools in parallel for faster AI agent workflows. Pattern guide for Next.js + Supabase builders with real code examples.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-parallel-execution',
  },
  twitter: { card: 'summary_large_image', title: 'Parallel Tool Execution Patterns in Claude | AI Agents', description: 'Learn how to execute Claude tools in parallel for faster AI agent workflows. Pattern guide for Next.js + Supabase builders with real code examples.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Parallel Tool Execution Patterns in Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Running Claude tool calls sequentially tanks your agent's throughput—learn the parallel execution patterns that let you invoke multiple tools simultaneously and reduce latency by 60-80%.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Sequential Tool Calls Kill Agent Performance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When Claude needs to fetch a user's profile, check inventory, and validate payment in sequence, each call waits for the previous one to finish. On a 200ms network, three calls become 600ms of wasted time. For production agents handling high-volume requests, this compounds across thousands of concurrent users.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Parallel execution means Claude decides which tools can run together (they have no dependencies), and your backend fires them all at once. The difference: 600ms becomes 200ms. That's the gap between a snappy agent and one that feels sluggish.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:claude-tool-use-parallel-execution`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude's Tool Use Response Format for Parallel Calls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude returns tool_use blocks in a single response when multiple tools are independent. Your handler receives an array of tool calls—not one at a time, but all together. This is key: you're not waiting for Claude to ask for the first result before it asks for the second.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Messages API gives you \`content\` with multiple ToolUseBlock objects in one response. Each has a unique \`id\` that you'll reference when returning results. Group by dependency: tools with no shared inputs run in parallel; tools that need another tool's output go in the next batch.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  tools: [getUser, checkInventory, validatePayment],
  messages: [{ role: 'user', content: 'Process order #123' }]
});

const toolCalls = response.content.filter(b => b.type === 'tool_use');
// toolCalls is an array—execute all at once, not one by one`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Parallel Execution in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In your Next.js API route, collect all tool calls, execute them with Promise.all(), and return results in a single follow-up message. This pattern avoids round-trips and keeps Claude's context intact.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Map each tool call to its handler, run them concurrently, then assemble the results array with matching tool IDs. Claude then processes all results in one step and decides next actions—or if the task is complete.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Tool Dependencies and Batch Ordering"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Not all tools are independent. If tool B needs output from tool A, you can't run them together. Build a dependency graph: tools with no predecessors run first, their results feed into the next layer.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For most agent workflows (fetch user, fetch orders, fetch recommendations), the first batch is usually independent. Second batch often depends on IDs from the first. This two-or-three-layer approach captures 80% of real-world gains without complexity.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Avoiding Common Pitfalls: Rate Limits and State"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Parallel execution multiplies your tool invocation rate. If you're hitting a third-party API, you'll hit rate limits faster. Respect backpressure: queue tools if needed, or use exponential backoff per external API.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`State mutations are another trap—if two parallel tools both write to the same Supabase row, you need transactions or optimistic locking. Use Supabase's row-level security and transactions (BEGIN/COMMIT) to prevent conflicts. Test with concurrent agents to catch race conditions early.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo (github.com/lewisallena17/pantheon) implements production-ready parallel tool execution for Claude agents. It includes dependency resolution, batching logic, Next.js middleware, and Supabase integration patterns.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The codebase shows real examples: parallel database queries, external API calls grouped by rate limits, and error handling per tool. Fork it, adapt it to your agent's tools, and ship 60% faster.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Parallel tool execution transforms Claude agents from sequential bots into responsive systems—start with independent tools in your first batch, use Pantheon as your reference, and ship.`}</p>
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
