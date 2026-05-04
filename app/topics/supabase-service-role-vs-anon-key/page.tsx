import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/supabase-service-role-vs-anon-key'

export const metadata: Metadata = {
  title:       'Supabase Service Role vs Anon Key: When to Use Each',
  description: 'Learn when to use Supabase service role keys vs anonymous keys in your AI agent systems. Security guide for Next.js developers.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-service-role-vs-anon-key',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-service-role-vs-anon-key',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-service-role-vs-anon-key',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-service-role-vs-anon-key',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-service-role-vs-anon-key',
    },
  },
  openGraph: {
    title:       'Supabase Service Role vs Anon Key: When to Use Each',
    description: 'Learn when to use Supabase service role keys vs anonymous keys in your AI agent systems. Security guide for Next.js developers.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Service Role vs Anon Key: When to Use Each', description: 'Learn when to use Supabase service role keys vs anonymous keys in your AI agent systems. Security guide for Next.js developers.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"When to Use Supabase Service Role vs Anon Key"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Choosing between Supabase's service role and anonymous keys determines whether your AI agents can safely write to your database—here's exactly when to use each one.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Core Difference: Permissions and Risk"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The anonymous (anon) key has restricted permissions—it can only read and write to tables where Row Level Security (RLS) policies explicitly allow it. The service role key bypasses RLS entirely, giving full database access. This isn't a flaw; it's intentional design.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use anon keys for client-side operations where you don't fully trust the environment. Use service role keys only on your server, where you control the code and execution context. Leaking a service role key is catastrophic; leaking an anon key is manageable because RLS policies protect you.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Use the Anonymous Key"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The anonymous key belongs in your Next.js client components, browser-exposed environment variables, and mobile apps. It's designed for end-user interactions where RLS policies enforce data isolation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Example: A user viewing their own AI agent conversations. Your RLS policy checks if auth.uid() matches the conversation's user_id. The anon key can't bypass this. Even if someone steals the key from their browser, they can only access data their authenticated user owns.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Use the Service Role Key"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The service role key runs on your backend only—in Next.js API routes, server actions, or scheduled jobs. It's required when you need to write data on behalf of users without explicit authentication, or when performing admin operations.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In AI agent systems, you'll use the service role key when your Claude-powered agent needs to create records, update analytics, or trigger downstream processes without the user actively requesting it. Store it only in .env.local or a secrets manager, never in version control.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Practical Example: AI Agent Message Storage"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When a user starts a chat with your Claude agent in the browser, the frontend uses the anon key to insert a message record (RLS policy checks auth.uid()). The agent's response comes back from your Next.js API route, which uses the service role key to store the agent's reply with special metadata—because the agent isn't an authenticated user.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's the pattern:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/agent.ts - Backend only
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ← Never expose this
);

export default async function handler(req, res) {
  const { message, conversationId } = req.body;
  
  // Agent processes message with Claude
  const response = await callClaudeAPI(message);
  
  // Store agent response with service role (bypasses RLS)
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    content: response,
    role: 'assistant',
    created_at: new Date()
  });
  
  res.json({ response });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Security Checklist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`✓ Anon key: safe in NEXT_PUBLIC_* environment variables, browser-readable
✓ Service role key: NEVER in NEXT_PUBLIC_*, only in .env.local or secrets manager
✓ Always enable RLS on every table, even if you only use service role
✓ Test RLS policies with anon key before deploying
✓ Rotate service role keys regularly in production
✓ Use separate Supabase projects for dev/prod, with different keys`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) demonstrates this pattern in production. It shows a multi-agent system where Claude agents read conversation history with the anon key (via RLS policies) and write responses with the service role key from a Next.js backend. The repo includes pre-built RLS policies for common patterns—reusable starting point for your own AI agent backend.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Study how they separate client initialization (anon key) from server initialization (service role key). That's the template you should follow.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Anon keys protect user data through RLS policies; service role keys handle server-side agent logic. Get the Pantheon starter kit to see both in action and launch your AI agent system faster.`}</p>
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
