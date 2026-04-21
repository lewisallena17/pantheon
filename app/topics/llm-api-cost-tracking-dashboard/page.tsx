import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Build an LLM API Cost Tracker Dashboard | Claude + Next.js',
  description: 'Track Claude API costs in real-time with a Next.js dashboard. Learn to build cost monitoring for AI agents, integrate Supabase, and control spending.',
  openGraph: {
    title:       'Build an LLM API Cost Tracker Dashboard | Claude + Next.js',
    description: 'Track Claude API costs in real-time with a Next.js dashboard. Learn to build cost monitoring for AI agents, integrate Supabase, and control spending.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/llm-api-cost-tracking-dashboard',
  },
  twitter: { card: 'summary_large_image', title: 'Build an LLM API Cost Tracker Dashboard | Claude + Next.js', description: 'Track Claude API costs in real-time with a Next.js dashboard. Learn to build cost monitoring for AI agents, integrate Supabase, and control spending.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building an LLM API Cost Tracker Dashboard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop guessing at your Claude API bills—build a real-time cost tracker dashboard that monitors token usage, calculates expenses per feature, and alerts you before budget overruns.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why You Need Cost Visibility Into LLM APIs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude API calls scale unpredictably. A single poorly-optimized agent loop can drain \$500 in hours. Most indie developers only see final charges in their Anthropic dashboard—weeks after the damage is done.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A dedicated cost tracker gives you per-request visibility. You'll spot which features, users, or agent workflows are expensive. You'll catch runaway loops immediately. You'll make confident decisions about which AI features to ship versus deprecate.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Logging Requests and Calculating Costs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your tracker needs three layers: (1) middleware that intercepts Claude API calls and logs metadata, (2) a Supabase table storing tokens used + timestamps, (3) a Next.js dashboard querying and visualizing costs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For each request, capture model, input tokens, output tokens, and user/feature identifier. Calculate cost using Anthropic's published pricing (e.g., Claude 3.5 Sonnet: \$3/M input, \$15/M output). Aggregate by day, user, or feature to find cost drivers.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Middleware logging Claude calls
export async function logClaudeUsage(
  userId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
) {
  const costUSD = (inputTokens * 3 + outputTokens * 15) / 1_000_000;
  await supabase.from('claude_usage').insert({
    user_id: userId,
    feature,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: costUSD,
    created_at: new Date(),
  });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the Dashboard Query Layer"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Next.js API routes will query Supabase to aggregate costs. Build endpoints for total spend, spend-by-feature, spend-by-user, and daily trends. Use SQL window functions to calculate running totals and month-over-month changes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`On the frontend, display metrics that matter: total spend this month, daily average, top 5 expensive features, projected month-end cost. Add filtering by date range and user segment.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Alerting and Budget Controls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set soft and hard thresholds. Send Slack or email alerts when daily spend exceeds a target, or when projected monthly spend hits 80% of your budget. Consider implementing feature-level kill switches: if a specific feature's cost_per_request exceeds a threshold, disable it automatically.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store budget limits in a config table. Query current spend against limits on each request. This prevents one runaway feature from tanking your month.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rather than building from scratch, use Pantheon—a battle-tested starter kit for LLM cost tracking. It includes pre-built Supabase migrations, Next.js dashboard components, and middleware for Claude API logging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Find it at github.com/lewisallena17/pantheon. The repo includes TypeScript types for token logging, a sample alerting integration, and documentation for deploying to Vercel + Supabase. Pantheon handles the scaffolding; you customize dashboards for your specific features.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Common Pitfalls to Avoid"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't log at the response level only—log at request initiation too, so you catch retries and failures. Don't forget to account for context window reuse in multi-turn conversations. Don't set thresholds too tight or you'll spam your own alerts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Test your logging in staging. Verify that cost calculations match Anthropic's usage dashboard before shipping to production. Set up a monthly reconciliation process to catch discrepancies early.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Get your LLM costs under control today—clone Pantheon, wire up Supabase, and ship a cost tracker dashboard within an hour.`}</p>
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
