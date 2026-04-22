import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Rate Limiting API Routes in Next.js Middleware',
  description: 'Protect your Next.js API routes from abuse with middleware-based rate limiting. Essential for AI agents, Claude integrations, and production systems.',
  openGraph: {
    title:       'Rate Limiting API Routes in Next.js Middleware',
    description: 'Protect your Next.js API routes from abuse with middleware-based rate limiting. Essential for AI agents, Claude integrations, and production systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-middleware-rate-limiting',
  },
  twitter: { card: 'summary_large_image', title: 'Rate Limiting API Routes in Next.js Middleware', description: 'Protect your Next.js API routes from abuse with middleware-based rate limiting. Essential for AI agents, Claude integrations, and production systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Rate Limiting API Routes in Next.js Middleware"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Rate limiting your Next.js API routes in middleware prevents abuse, protects your Claude API quota, and keeps your indie app running predictably under load—without burning through infrastructure costs or getting blocked by third-party services.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Middleware Rate Limiting Matters for AI Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you're building AI agent systems with Claude, every API call has a cost. A single malicious user or buggy client can exhaust your rate limits in minutes, blocking legitimate requests. Middleware-based rate limiting catches abuse before it reaches your business logic.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie founders, this is existential: your Claude API key is a shared resource. One runaway agent or unintended loop can trigger rate limit errors across your entire system. Enforcing limits at the middleware layer is your first line of defense.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Token-Bucket Algorithm in Next.js Middleware"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The token-bucket algorithm is the industry standard for rate limiting. Each user gets a bucket that refills at a fixed rate. Requests consume tokens; when the bucket is empty, requests are rejected. It handles bursts gracefully while enforcing long-term limits.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js middleware executes on every request before route handlers, making it the perfect place to implement this. You can track tokens per user, IP, or API key—whatever makes sense for your multi-tenant or agent-based system.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { NextRequest, NextResponse } from 'next/server';

const rateLimitStore = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT = 100; // requests per minute
const REFILL_RATE = RATE_LIMIT / 60; // tokens per second

export function middleware(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || request.ip || 'anonymous';
  const now = Date.now();
  const bucket = rateLimitStore.get(userId) || { tokens: RATE_LIMIT, lastRefill: now };
  
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(RATE_LIMIT, bucket.tokens + elapsed * REFILL_RATE);
  bucket.lastRefill = now;
  
  if (bucket.tokens < 1) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  bucket.tokens -= 1;
  rateLimitStore.set(userId, bucket);
  return NextResponse.next();
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Storing Rate Limit State with Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In-memory storage works for single-instance deployments, but distributed systems need persistent state. Supabase PostgreSQL is perfect for tracking rate limit buckets across serverless functions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store user_id, tokens, and last_refill_time in a simple table. On each request, query and update atomically using PostgreSQL's transaction isolation. This ensures accurate counts even under concurrent load from multiple serverless containers.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Claude API Rate Limits Upstream"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rate limiting your own endpoints is step one. Step two is respecting Claude's rate limits and avoiding cascading failures. When Claude returns a 429, implement exponential backoff in your middleware or queue system.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agent systems, consider adding Claude-specific headers to your rate limit response, so agents know whether the limit is yours or Anthropic's. This prevents agents from retrying when they shouldn't.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Testing Rate Limits in Development"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Test rate limiting with a simple load generator: send 150 requests in rapid succession to your /api/chat endpoint. The first 100 should succeed; requests 101+ should return 429 with a Retry-After header.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use libraries like Apache Bench or autocannon to simulate realistic traffic patterns. For AI systems, test with concurrent agent requests—the real chaos you'll face in production.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation Reference"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) includes a production-ready rate limiting middleware designed for Claude-integrated systems. It combines token-bucket logic with Supabase state management, handles distributed deployments, and includes monitoring hooks.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork or reference Pantheon's middleware patterns directly into your Next.js project. It's built specifically for the indie founder stack: Next.js, Supabase, and Claude APIs.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implement middleware rate limiting now using token-bucket logic and Supabase persistence—protect your Claude quota, stabilize your API, and build systems that scale predictably. Start with Pantheon's open-source patterns and deploy production-grade protection today.`}</p>
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
