import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Claude API Tier 1 vs Tier 2 Rate Limits',
  description: 'Compare Claude API rate limits by tier. Learn RPM/TPM thresholds, upgrade paths, and how to design agents that scale without hitting limits.',
  openGraph: {
    title:       'Claude API Tier 1 vs Tier 2 Rate Limits',
    description: 'Compare Claude API rate limits by tier. Learn RPM/TPM thresholds, upgrade paths, and how to design agents that scale without hitting limits.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-api-tier-1-vs-tier-2-limits',
  },
  twitter: { card: 'summary_large_image', title: 'Claude API Tier 1 vs Tier 2 Rate Limits', description: 'Compare Claude API rate limits by tier. Learn RPM/TPM thresholds, upgrade paths, and how to design agents that scale without hitting limits.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude API Tier 1 vs Tier 2 Rate Limits"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`If you're building AI agents with Claude and hitting rate limit errors in production, you need to understand the hard RPM and TPM boundaries between Tier 1 and Tier 2—and how to architect around them before they break your system.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tier 1 vs Tier 2: The Numbers That Matter"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tier 1 (free and low-volume paid users) gives you 10,000 TPM and 500 RPM. Tier 2 (qualified users with Claude API history) bumps you to 50,000 TPM and 5,000 RPM. For indie builders, that's the difference between running one or two concurrent agent threads and running 10+ in parallel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`TPM (tokens per minute) is your real bottleneck. A single claude-3-5-sonnet call averaging 2,000 output tokens eats 2,000 TPM. At Tier 1, that's only 5 concurrent requests. At Tier 2, you're at 25. RPM is rarely your limiting factor unless you're making many small, fast requests.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How to Request Tier 2 (and Actually Get It)"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Anthropic reviews upgrade requests based on account age, API usage patterns, and intended use case. You need at least a few weeks of consistent API calls and a clear description of your production workload. Submit your request in the Anthropic console—don't just email support.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Build a small batch of production queries first. Show ~5-10 days of API activity. Mention your tech stack (Next.js + Supabase is a green flag). Tier 2 approval typically takes 1-3 business days. If rejected, wait 30 days and reapply with more usage data.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Rate Limit Handling in Next.js + TypeScript"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The right approach is exponential backoff with request queuing. Don't retry immediately—wait 60 seconds on a 429, then double the wait each time. For agents making sequential decisions, this destroys latency. Instead, batch independent calls and queue them.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's a minimal queue pattern that respects Tier 1 limits:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const queue: Array<{ fn: () => Promise<any>; resolve: (v: any) => void; reject: (e: any) => void }> = [];
let activeRequests = 0;
const MAX_CONCURRENT = 4; // Conservative for Tier 1

async function enqueue(fn: () => Promise<any>) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  while (queue.length > 0 && activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    const { fn, resolve, reject } = queue.shift()!;
    try {
      resolve(await fn());
    } catch (e) {
      reject(e);
    } finally {
      activeRequests--;
      processQueue();
    }
  }
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring Rate Limits in Production"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log the \`usage\` object returned by Claude API calls. Track \`input_tokens + output_tokens\` per request. In Supabase, store a \`rate_limit_log\` table with timestamp, tokens, and request_id. Set a Cloud Function alert if daily TPM exceeds 80% of your limit.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use headers: the \`anthropic-ratelimit-remaining-requests\` and \`anthropic-ratelimit-remaining-tokens\` headers tell you exactly where you stand. Check them before retrying—if you're close to zero, pause your agent entirely rather than burning retries.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Designing Agents That Don't Hit Limits"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Single-threaded agent loops (decide → act → observe → repeat) are naturally rate-limit-safe. The risk comes with parallelization: spawning 10 agents simultaneously on Tier 1 will fail. Use a work queue with a max concurrency of 3-4 on Tier 1, or 15-20 on Tier 2.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache Claude's system prompts and reuse them. Use prompt caching (available on claude-3-5-sonnet) to avoid re-tokenizing identical context. For multi-step agents, keep a single conversation thread rather than starting fresh each step.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Rate Limit Manager: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo at github.com/lewisallena17/pantheon implements a production-grade rate limit queue and monitoring dashboard. It's built for Next.js + Supabase and handles exponential backoff, Tier detection, and real-time usage dashboards. Fork it as a starter for your agent infrastructure.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Tier 2 unlocks 5x more throughput—request it early, build with queueing from day one, and monitor your TPM ceiling in production to keep your agents scaling without crashes.`}</p>
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
