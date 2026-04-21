import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Context Compression for Long-Running AI Agents',
  description: 'Reduce token costs and latency in Claude-powered agents. Learn compression strategies to keep long-running systems efficient and affordable.',
  openGraph: {
    title:       'Context Compression for Long-Running AI Agents',
    description: 'Reduce token costs and latency in Claude-powered agents. Learn compression strategies to keep long-running systems efficient and affordable.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-context-compression-techniques',
  },
  twitter: { card: 'summary_large_image', title: 'Context Compression for Long-Running AI Agents', description: 'Reduce token costs and latency in Claude-powered agents. Learn compression strategies to keep long-running systems efficient and affordable.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Context Compression for Long-Running AI Agents"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Long-running AI agents hit a hard wall: every message adds context, token costs spiral, and response latency becomes unbearable—but strategic context compression keeps your Claude agents fast and cheap.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Context Grows Into a Problem"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents that run for hours, days, or across multiple conversations accumulate memory. Each new interaction includes all previous context: system prompts, conversation history, retrieved documents, tool outputs. With Claude, this means tokens multiply fast.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`At \$3 per 1M input tokens, a 100k-token conversation costs \$0.30. Scale to 10 concurrent agents running daily, and you're burning budget on redundant context. Worse: larger context windows increase latency by 200-400ms, breaking the responsiveness users expect.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Selective History Retention"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Not all history matters equally. Recent exchanges inform the agent's current task; old interactions become noise. Implement a sliding window: keep only the last N turns, or retain messages within the last M hours.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Supabase, store conversations with timestamps and mark 'active' messages. Query only active messages when building the context window. For a customer support agent, you might keep the last 8 turns but summarize anything older than 24 hours into a single brief recap.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const activeMessages = await supabase
  .from('messages')
  .select('role, content')
  .eq('agent_id', agentId)
  .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .order('created_at', { ascending: false })
  .limit(8);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Summarization at Conversation Boundaries"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When an agent completes a task or workflow, summarize the entire exchange into a single 'session summary' message. This becomes the new context seed for future conversations with the same user.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Call Claude to generate a 200-300 token summary: goals achieved, decisions made, relevant facts. Replace the full history with one summary line. A data analysis agent might summarize: 'User analyzed Q3 sales data, identified a 12% decline in region 4, recommended inventory reduction.'`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Semantic Deduplication"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agents often re-state the same facts or constraints. If the system prompt already covers a rule, don't repeat it in context. Use embedding-based similarity checks to detect near-duplicate information and remove lower-confidence versions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Before adding a retrieved document or user clarification to context, compare its embedding against existing context. If similarity exceeds 0.92, skip it. This is especially useful for agents that query knowledge bases repeatedly.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tool Output Caching"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agents call tools (APIs, databases, searches) constantly. Tool outputs don't need to live forever in context. Cache results with a TTL: keep a database query result for 10 minutes, a web search for 1 hour. If the agent asks the same question within the TTL, return the cached result without bloating context.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Next.js, use Redis or a simple Supabase table to store hash(tool_input) → output. Check the cache before calling the actual tool. This cuts both API calls and token usage.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Progressive Context Building"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't load full context upfront. Build messages incrementally: system prompt → last 2 turns → relevant docs → tool results. Stop adding context once you hit 80% of your target token budget. Claude works fine with less context if it's high-signal.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This requires tuning per use case, but the payoff is real: less latency, lower cost, and often better outputs because the agent isn't distracted by noise.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with selective history retention and summarization—most agents save 30-50% tokens immediately. Use the open-source Pantheon implementation to integrate these patterns into your Next.js + Supabase stack today.`}</p>
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
