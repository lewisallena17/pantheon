import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       '5 Techniques for Reducing AI Agent Token Spend',
  description: 'Cut your Claude API costs by 40-60%. Learn prompt caching, batch processing, and token optimization strategies for indie developers building AI agents.',
  openGraph: {
    title:       '5 Techniques for Reducing AI Agent Token Spend',
    description: 'Cut your Claude API costs by 40-60%. Learn prompt caching, batch processing, and token optimization strategies for indie developers building AI agents.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/reducing-ai-agent-token-spend',
  },
  twitter: { card: 'summary_large_image', title: '5 Techniques for Reducing AI Agent Token Spend', description: 'Cut your Claude API costs by 40-60%. Learn prompt caching, batch processing, and token optimization strategies for indie developers building AI agents.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Five Techniques for Reducing AI Agent Token Spend"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Token costs can spiral quickly when building AI agents—but with the right techniques, you can reduce spending by 40-60% without sacrificing performance or response quality.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"1. Implement Prompt Caching for Repeated Context"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's prompt caching feature stores large system prompts and context blocks, charging only 10% of the cache creation cost for cache hits. If your agent loads the same 10KB system prompt 100 times monthly, you're reusing ~1M tokens at 90% discount.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enable caching by setting \`cache_control: {"type": "ephemeral"}\` on your system prompt. This works best for agents with stable instructions, lengthy examples, or documentation that doesn't change per-request.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"2. Batch Non-Urgent Requests with the Batch API"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Batch API processes requests at 50% discount if you can wait 1 minute to 24 hours for results. For async workflows—report generation, data enrichment, background analysis—batching is nearly free savings.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Group 100 requests into a single batch job instead of making individual API calls. You'll pay ~3-4K tokens per 1000-token job instead of the standard rate.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const batchRequests = [
  {
    custom_id: "task-1",
    params: {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 256,
      messages: [{role: "user", content: "Analyze this data..."}]
    }
  }
];

const batch = await client.beta.messages.batches.create({
  requests: batchRequests
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"3. Use Vision Token Optimization for Image Inputs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Images in Claude consume tokens proportional to their resolution and format. A 1080p image costs ~770 tokens; resize to 512p and you're at ~168 tokens—an 78% reduction with minimal quality loss for most agent tasks.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For screenshots, invoices, or diagrams, compress to max 768px width and JPEG quality 75-80 before sending. Your agent still reads content accurately while cutting image token spend dramatically.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"4. Limit Output Length with Max Tokens Parameter"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every token generated costs you money. Set \`max_tokens\` to the minimum your agent actually needs—if you're extracting structured data, cap output at 500 tokens instead of defaulting to 4096. This prevents verbose rambling and forces concise responses.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pair this with stricter prompts: instead of "explain thoroughly," ask for "a 1-sentence summary and 3 bullet points."`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"5. Route Requests by Complexity with Smart Model Selection"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude 3.5 Haiku handles 80% of lightweight tasks (classification, extraction, formatting) at 1/3 the cost of Sonnet. Route simple queries to Haiku, reserve Sonnet for complex reasoning, research, or code generation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Implement a router that checks request complexity (token count, instruction length) and selects the cheapest model that meets quality thresholds. This hybrid approach cuts spend 30-40% across your agent fleet.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon framework (github.com/lewisallena17/pantheon) provides production-ready Next.js + Supabase templates with token optimization built in. It includes prompt caching middleware, batch job orchestration, and per-agent cost tracking.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Deploy a multi-agent system with cost monitoring in minutes—Pantheon handles caching headers, request batching, and expense dashboards so you focus on agent logic, not infrastructure.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Combine prompt caching, batch processing, vision optimization, output limits, and smart model routing to cut token spend 40-60%—start with Pantheon or apply these techniques incrementally to your existing Claude agents.`}</p>
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
