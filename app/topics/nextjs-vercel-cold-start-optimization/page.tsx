import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Reducing Next.js Cold Starts on Vercel',
  description: 'Cut Next.js cold start latency from 5s+ to under 500ms on Vercel. Practical techniques for AI agents, edge functions, and serverless optimization.',
  openGraph: {
    title:       'Reducing Next.js Cold Starts on Vercel',
    description: 'Cut Next.js cold start latency from 5s+ to under 500ms on Vercel. Practical techniques for AI agents, edge functions, and serverless optimization.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-vercel-cold-start-optimization',
  },
  twitter: { card: 'summary_large_image', title: 'Reducing Next.js Cold Starts on Vercel', description: 'Cut Next.js cold start latency from 5s+ to under 500ms on Vercel. Practical techniques for AI agents, edge functions, and serverless optimization.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Reducing Next.js Cold Starts on Vercel"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Cold starts destroy user experience in production—a 5-second delay before your Claude AI agent responds costs you conversions and trust. This guide walks you through the exact techniques that reduce Next.js cold starts on Vercel from multiple seconds to under 500ms, with code you can implement today.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Next.js Cold Starts Matter for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you deploy an AI agent system on Vercel's serverless functions, every request to Claude through your Next.js API route triggers a cold start. Your function container spins up, Node.js initializes, dependencies load, and database connections establish. For users, this feels like your app is broken.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Indie teams building with Claude can't afford to lose users to timeout errors or perception of slowness. A 3-second cold start on a streaming response makes your agent feel unresponsive even if Claude replies instantly. The fix isn't about raw speed—it's about smart bundling, dependency management, and architecture choices.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:nextjs-vercel-cold-start-optimization`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Bundle Size: Your Biggest Lever"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js API routes ship your entire node_modules tree by default. If you're pulling in heavy dependencies (axios, moment, lodash), each cold start re-parses megabytes of JavaScript. The Vercel platform measures cold start time in seconds per 100MB of bundle size.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Audit your imports ruthlessly. Replace axios with fetch (built-in since Node 18). Use date-fns instead of moment. Import only what you need: \`import { debounce } from 'lodash-es'\` instead of the full lodash library. In Supabase integrations, use the lightweight '@supabase/supabase-js' client, not additional auth libraries.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Target: Keep your API route bundle under 5MB. Use \`next/bundle-analyzer\` to visualize what's bloating your functions.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connection Pooling for Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every cold start creates a fresh Supabase client and establishes a new database connection. With dozens of concurrent requests, your Supabase connection pool exhausts instantly, and subsequent requests queue or fail.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use PgBouncer connection pooling (included free with Supabase Pro) and reuse client instances across invocations via global scope. Initialize your Supabase client outside your API handler so it persists across warm invocations.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  const { data } = await supabase.from('messages').insert({ content: 'test' });
  return Response.json(data);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Serverless Function Optimization"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vercel's Edge Functions (running Cloudflare Workers runtime) have 50MB limits but initialize in milliseconds instead of seconds. Move lightweight auth checks, request filtering, and response transformation to Edge Middleware. Keep Claude API calls in serverless functions where you have full Node.js runtime.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use \`maxDuration\` sparingly—the longer your function timeout, the longer Vercel keeps resources allocated. Set it to the minimum needed (e.g., 30s for streaming Claude responses, not 60s).`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Measuring Cold Starts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`You can't optimize what you don't measure. Vercel's Analytics dashboard shows cold start distribution, but add custom logging to pinpoint bottlenecks. Log the timestamp at function entry and after each critical section (imports, DB connection, Claude API call).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Expect 300-800ms for a well-optimized cold start on Vercel's standard tier. Anything under 500ms is production-ready for AI agents where users expect streaming responses.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) is a reference implementation combining Next.js, Supabase, and Claude API with cold start optimization built in from the ground up. It includes bundling config, connection pooling setup, and Edge Middleware examples you can fork and customize for your AI agent system.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with bundle analysis and connection pooling—these two changes alone drop cold starts by 60-70%. Use the Pantheon starter kit to ship production-ready AI agents on Vercel without the latency penalty.`}</p>
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
