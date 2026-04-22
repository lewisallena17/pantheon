import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Rate Limiting & Circuit Breakers for AI Agents',
  description: 'Prevent cascade failures in Claude AI agent systems. Learn rate limiting and circuit breaker patterns for reliable Next.js + Supabase applications.',
  openGraph: {
    title:       'Rate Limiting & Circuit Breakers for AI Agents',
    description: 'Prevent cascade failures in Claude AI agent systems. Learn rate limiting and circuit breaker patterns for reliable Next.js + Supabase applications.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-rate-limiting-circuit-breakers',
  },
  twitter: { card: 'summary_large_image', title: 'Rate Limiting & Circuit Breakers for AI Agents', description: 'Prevent cascade failures in Claude AI agent systems. Learn rate limiting and circuit breaker patterns for reliable Next.js + Supabase applications.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Rate Limiting and Circuit Breakers for AI Agents"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Without rate limiting and circuit breakers, a single API spike or downstream service failure will crash your entire AI agent system—learn the exact patterns to build resilience into Claude integrations before production.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Your AI Agents Need Rate Limiting"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's API enforces rate limits (RPM and TPM), but that's just one layer. Your agent might spawn parallel requests, retry failures exponentially, or loop indefinitely on token limits. Without client-side rate limiting, you'll hit 429 errors, waste API credits, and degrade user experience.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rate limiting buys you time to queue requests intelligently, prioritize critical agent tasks, and observe actual usage patterns before hitting hard limits. It's the difference between graceful degradation and outages.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Rate Limiting in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a sliding window or token bucket approach. For Claude agents, track requests per user and per agent type separately. Store counters in Supabase or Redis; Supabase works well for indie scale.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's a minimal TypeScript rate limiter for Next.js API routes:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function checkRateLimit(userId: string, limit: number = 10, window: number = 60) {
  const key = \`ratelimit:\${userId}\`;
  const count = await supabase.from('rate_limits')
    .select('count')
    .eq('user_id', userId)
    .gt('created_at', new Date(Date.now() - window * 1000))
    .single();
  
  if (count?.data?.count >= limit) throw new Error('Rate limit exceeded');
  
  await supabase.from('rate_limits')
    .insert({ user_id: userId, count: (count?.data?.count || 0) + 1 });
  
  return true;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Circuit Breaker Pattern for Resilience"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A circuit breaker monitors downstream service health (Claude API, external tools, your database). When failure rate exceeds a threshold, it 'opens' and stops sending requests, failing fast instead of hanging. After a cooldown, it tries again.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agents, implement three states: Closed (normal), Open (stop requests, return cached/fallback response), Half-Open (test if service recovered). This prevents cascading failures when Claude API is slow or your vector database is overloaded.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combining Rate Limits with Exponential Backoff"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rate limiting and backoff are complementary. Rate limiting prevents you from hitting the limit; exponential backoff handles it gracefully when you do. When Claude returns 429, wait 2^n seconds before retry, with jitter to avoid thundering herd.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For agent chains with multiple Claude calls, combine per-request backoff with system-wide rate limit queues. This ensures individual agent steps don't starve the rest of your application.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Observability"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every rate limit hit and circuit breaker state change. Use Supabase's vector similarity on logs to detect patterns—are specific users or agents causing bottlenecks? Track latency percentiles to catch slow Claude responses before they trigger circuit breakers.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set up alerts for sustained rate limiting or open circuits. For production agents, this is your first warning sign of scaling issues.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon provides production-ready rate limiting and circuit breaker middleware for Next.js + Claude + Supabase stacks. It includes metrics collection, graceful degradation, and fallback handling out of the box. Clone it, adapt the schemas to your agent types, and deploy.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon handles the boilerplate so you focus on agent logic, not infrastructure reliability.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Rate limiting and circuit breakers aren't optional—they're the difference between a prototype and a production AI agent system. Grab the Pantheon starter kit and ship resilient agents today.`}</p>
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
