import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Cost Controls for AI Agents: Daily Cap + Circuit Breaker',
  description: 'Implement daily spending caps and circuit breakers for Claude AI agents. Protect your inference costs with practical Next.js + Supabase patterns.',
  openGraph: {
    title:       'Cost Controls for AI Agents: Daily Cap + Circuit Breaker',
    description: 'Implement daily spending caps and circuit breakers for Claude AI agents. Protect your inference costs with practical Next.js + Supabase patterns.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-cost-controls-daily-cap-circuit-breaker',
  },
  twitter: { card: 'summary_large_image', title: 'Cost Controls for AI Agents: Daily Cap + Circuit Breaker', description: 'Implement daily spending caps and circuit breakers for Claude AI agents. Protect your inference costs with practical Next.js + Supabase patterns.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Cost Controls for AI Agents — Daily Cap + Circuit Breaker"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop runaway API bills from autonomous AI agents by implementing a two-layer cost control system: daily spending caps that enforce hard limits, and circuit breakers that pause agent execution when costs spike unexpectedly.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Cost Controls Matter for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude API calls scale with token usage, and agents make multiple sequential calls to complete tasks. A single malformed prompt or infinite loop can cost \$50–\$500 before you notice. Daily caps and circuit breakers prevent surprise bills by enforcing spending boundaries at runtime.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`These controls are essential if you're running agents on a schedule, handling user-generated inputs, or deploying to production without constant supervision. They're not optional guardrails—they're infrastructure.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:ai-agent-cost-controls-daily-cap-circuit-breaker`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Daily Spending Cap Pattern"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A daily cap tracks cumulative token costs from the start of your billing period (usually UTC midnight) and rejects new agent invocations once the limit is reached. Store this in Supabase as a simple row per agent with a \`daily_limit\` and \`spent_today\` field.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Query the spending at request time, add the estimated cost of the next call, and compare against the cap. If exceeded, return early with a cost-exceeded error instead of calling Claude.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const checkDailyLimit = async (agentId: string, estimatedTokens: number) => {
  const { data } = await supabase
    .from('agent_costs')
    .select('spent_today, daily_limit')
    .eq('agent_id', agentId)
    .single();
  
  const projectedCost = data.spent_today + (estimatedTokens * 0.003);
  if (projectedCost > data.daily_limit) {
    throw new Error(\`Daily limit of \$\${data.daily_limit} exceeded\`);
  }
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Circuit Breaker for Spike Detection"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A circuit breaker monitors the *rate* of cost increases, not just totals. If spending jumps 10x in a single request or 3x within an hour, the breaker trips and halts agent execution for a cooling-off period (30 minutes to 2 hours).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This catches runaway loops or prompt injection attacks faster than a daily cap alone. Store the last 10 request costs and compute a rolling mean; trip the breaker if any new cost exceeds \`mean * threshold\`.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Storing Costs in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a \`cost_logs\` table with columns: \`id\`, \`agent_id\`, \`request_id\`, \`tokens_used\`, \`cost_usd\`, \`created_at\`, \`breaker_tripped\` (boolean). Log every API call, even failed ones. This gives you exact audit trails and makes debugging cost spikes trivial.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Add a trigger or cron job (Supabase Edge Functions or Next.js API route) to reset \`spent_today\` each UTC midnight. Query cost_logs grouped by date to report weekly spend trends.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating with Claude Agent Loops"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Call \`checkDailyLimit()\` and \`checkCircuitBreaker()\` before each \`anthropic.messages.create()\`. Wrap your agent loop in a try–catch that logs costs immediately after each response. Use \`response.usage\` fields (\`input_tokens\`, \`output_tokens\`) to compute real costs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pass the \`request_id\` to both Claude (via system prompt context) and your cost log so you can correlate slow/expensive requests with specific agent runs.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) provides a production-ready reference implementation of daily caps and circuit breakers for multi-tenant AI agent systems. It includes Supabase schema migrations, Next.js middleware for cost checks, and a dashboard for real-time spend visualization.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork or clone the repo to see cost tracking, alerting, and recovery strategies in action. The code is designed for indie teams and small startups running Claude agents at scale.`}</p>

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
            <li><a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Anthropic</a> <span className="text-slate-500">— Claude API</span></li>
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Implement daily caps and circuit breakers now—download the Pantheon starter kit and deploy production-grade cost controls in under an hour.`}</p>
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
