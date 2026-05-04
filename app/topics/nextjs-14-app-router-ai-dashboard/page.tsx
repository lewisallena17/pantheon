import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/nextjs-14-app-router-ai-dashboard'

export const metadata: Metadata = {
  title:       'AI Dashboard Next.js 14: App Router Guide',
  description: 'Build production AI dashboards with Next.js 14 App Router. Real patterns for Claude integration, real-time updates, and Supabase authentication.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-app-router-ai-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-app-router-ai-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-app-router-ai-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
    },
  },
  openGraph: {
    title:       'AI Dashboard Next.js 14: App Router Guide',
    description: 'Build production AI dashboards with Next.js 14 App Router. Real patterns for Claude integration, real-time updates, and Supabase authentication.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'AI Dashboard Next.js 14: App Router Guide', description: 'Build production AI dashboards with Next.js 14 App Router. Real patterns for Claude integration, real-time updates, and Supabase authentication.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building an AI Dashboard with Next.js 14 App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Next.js 14's App Router makes it possible to ship a fully-functional AI dashboard—complete with Claude API integration, streaming responses, and authenticated user sessions—in a single weekend instead of weeks of boilerplate.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why App Router Changes Everything for AI Dashboards"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pages Router forced you to manage API routes separately from your UI logic. App Router collapses that separation: server components handle Claude calls directly, streaming responses flow to the client without middleware complexity, and middleware runs once at the edge instead of on every request. For AI dashboards specifically, this means lower latency between user input and Claude's response stream.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Server components also eliminate the need to expose your Claude API key to the browser. You call the API from layout.tsx or a server action, stream the result, and the client never touches authentication. Supabase sessions work the same way—verify tokens server-side, use them in Claude requests, done.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Server Actions for Claude Integration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Server actions replace traditional API endpoints. Mark a function with 'use server', call Claude's API inside it, and invoke it directly from your component. No JSON serialization, no route handlers, no CORS headaches.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When streaming Claude responses to the client, use readline or text-decoder to chunk the response stream. This pattern works particularly well for agent systems where you want to show intermediate thinking steps as they arrive.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server';

import Anthropic from '@anthropic-ai/sdk';

export async function streamAgentResponse(input: string) {
  const client = new Anthropic();
  const stream = client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: input }],
  });
  
  return stream;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-Time Updates with Server-Sent Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router supports streaming responses natively through Response objects. For live agent dashboards, create a route handler that opens a Server-Sent Event connection, pipes Claude's stream to it, and your client subscribes with EventSource. The result feels like a native WebSocket experience without the infrastructure cost.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This is essential when your agents make multiple Claude calls in sequence. You can stream each step's output as it completes, giving users visibility into what the agent is doing.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Supabase Auth with Middleware"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router middleware runs before any route is accessed. Set up Supabase session verification here to check JWTs and refresh tokens on every request. Store the verified user in request.user, accessible in server components and server actions without additional database queries.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This pattern protects your Claude calls—you can verify that only authenticated users with valid sessions trigger API requests, and you can track usage per user for rate limiting or billing.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building Reusable Dashboard Components"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use client components for interactive UI (charts, input forms, real-time updates), but keep Claude logic in server actions. This separation keeps your component tree clean and your API calls secure. A typical dashboard will have 3-4 server actions: one for each agent task, one for session refresh, one for analytics logging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For dashboards showing multiple agents in parallel, use Promise.all() in a server action to invoke Claude multiple times, then return all results to the client in a single render. This is faster than sequential calls.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Production Patterns: Error Handling and Rate Limiting"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wrap Claude API calls in try-catch blocks that return structured error responses. The client can display user-friendly messages without exposing API details. For rate limiting, use Supabase's built-in rate limiting or a Redis layer—check limits before invoking Claude, not after.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Always set explicit timeouts on Claude requests. A 30-second timeout prevents hung connections from piling up. Log failures with request IDs so you can trace issues in production.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>

        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`App Router + server actions + server components eliminate 70% of the boilerplate that traditionally slows down AI dashboard development—start with Pantheon, ship your first agent dashboard this week.`}</p>
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

        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 space-y-2">
          <p>Part of{' '}<Link href="/topics" className="text-cyan-500 hover:underline">the pantheon knowledge base</Link>. Articles are generated + updated by the god agent itself.</p>
          <div className="flex gap-4 flex-wrap pt-2">
            <Link href="/" className="hover:text-cyan-400">home</Link>
            <Link href="/topics" className="hover:text-cyan-400">articles</Link>
            <Link href="/about" className="hover:text-cyan-400">about</Link>
            <Link href="/privacy" className="hover:text-cyan-400">privacy</Link>
            <Link href="/contact" className="hover:text-cyan-400">contact</Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
