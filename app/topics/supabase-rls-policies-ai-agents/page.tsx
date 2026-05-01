import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Supabase RLS Policies for AI Agent Writes',
  description: 'Secure AI agent database writes with Supabase RLS policies. Learn how to set permissions for Claude agents in Next.js without exposing secrets.',
  openGraph: {
    title:       'Supabase RLS Policies for AI Agent Writes',
    description: 'Secure AI agent database writes with Supabase RLS policies. Learn how to set permissions for Claude agents in Next.js without exposing secrets.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/supabase-rls-policies-ai-agents',
  },
  twitter: { card: 'summary_large_image', title: 'Supabase RLS Policies for AI Agent Writes', description: 'Secure AI agent database writes with Supabase RLS policies. Learn how to set permissions for Claude agents in Next.js without exposing secrets.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase RLS Policies for AI Agent Writes"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`AI agents writing directly to your database sounds risky—until you lock it down with Supabase RLS policies that enforce row-level security based on agent identity and request context.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why RLS Matters for AI Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you give Claude or another AI agent database write permissions, you're essentially granting code execution privileges. RLS (Row-Level Security) is your safety net: it ensures agents can only modify rows they're explicitly allowed to touch, regardless of the connection's raw database credentials.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Without RLS, a prompt injection or model hallucination could expose or corrupt unrelated data. With it, each agent operates within a confined scope—similar to user roles, but for autonomous systems.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Agent Identity in Postgres"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase RLS uses Postgres's built-in role system. Create a dedicated role for your AI agent, then use JWT claims to dynamically set the active role for each request.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In your Supabase project, define a role like \`ai_agent_user\` and configure your JWT to include a \`role\` claim. When the agent makes a request, Supabase automatically applies that role's RLS policies.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Create agent role and enable RLS
CREATE ROLE ai_agent_user;
ALTER ROLE ai_agent_user SET search_path = 'public';

-- Example: agent can only insert/update rows where agent_id = current_user_id()
CREATE POLICY agent_write_policy ON tasks
  FOR UPDATE
  USING (agent_id = (current_setting('request.jwt.claims')::jsonb->>'sub'))
  WITH CHECK (agent_id = (current_setting('request.jwt.claims')::jsonb->>'sub'));`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecting Claude to Supabase via Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a Next.js API route as a proxy. The route validates the agent request, generates a scoped Supabase client with the agent's JWT, and hands off database operations to Claude via the Anthropic SDK.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This keeps your \`SUPABASE_SERVICE_ROLE_KEY\` server-only and ensures Claude operates under agent-specific RLS constraints, not unrestricted admin access.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Practical Policy Examples"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A task-management agent might have RLS policies that restrict writes to tasks where \`agent_id\` matches the agent's identity. A document indexing agent could only insert rows into an \`indexed_docs\` table if the \`owner_id\` matches.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The key is defining the scope in your policy's \`USING\` and \`WITH CHECK\` clauses. Keep policies simple and auditable—complex logic belongs in application code, not Postgres.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Debugging RLS Policy Issues"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When an agent's write fails silently, check whether the JWT claim is correctly included in the request. Use Supabase's dashboard to inspect the role and policy definitions, then test manually with \`psql\` using the agent role.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enable query logging in Postgres to see exactly which policies are blocking requests. Most issues stem from mismatched claim names or incorrect policy conditions.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon demonstrates a production-ready setup: a Next.js app with Claude agent integration, Supabase RLS policies pre-configured, and TypeScript utilities for token generation and role management.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it to see how agents authenticate, how policies are structured, and how to test the full flow locally.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Lock down your AI agent database writes with Supabase RLS policies—get started with the Pantheon starter kit today.`}</p>
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
