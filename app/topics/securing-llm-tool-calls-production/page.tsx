import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Securing LLM Tool Calls in Production',
  description: 'Learn how to safely execute tool calls in Claude-powered agents. Permission models, input validation, and audit logging for production systems.',
  openGraph: {
    title:       'Securing LLM Tool Calls in Production',
    description: 'Learn how to safely execute tool calls in Claude-powered agents. Permission models, input validation, and audit logging for production systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/securing-llm-tool-calls-production',
  },
  twitter: { card: 'summary_large_image', title: 'Securing LLM Tool Calls in Production', description: 'Learn how to safely execute tool calls in Claude-powered agents. Permission models, input validation, and audit logging for production systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Securing LLM Tool Calls in Production"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Tool calls are where your LLM agent actually changes things—and that's exactly where security breaks down in production. This guide shows you how to validate, authorize, and log every tool execution so your AI system can't be exploited by malicious prompts or user manipulation.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Tool Call Security Matters"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When Claude has access to tools—database writes, API calls, file operations—you're giving it execution privileges. A crafted prompt or compromised user input can trick the model into running unauthorized operations. Unlike traditional applications where code paths are fixed, LLM agents can be steered toward unintended tool combinations by prompt injection.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Production systems need three layers: permission checking (does this user own this resource?), input validation (is the data safe to execute?), and audit trails (what actually ran and why?). Skipping any one creates exploitable gaps.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Permission Models for Tool Execution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Every tool call should check user context before executing. Store user permissions in your database (Supabase works well here) and enforce them at the tool handler level, not just the UI.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your tool handlers should receive user_id and check ownership before acting. For example, a 'write_memo' tool shouldn't let user A modify user B's data just because the prompt says to.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function writeMemo(userId: string, memoId: string, content: string) {
  const { data: memo } = await supabase
    .from('memos')
    .select('owner_id')
    .eq('id', memoId)
    .single();
  
  if (memo.owner_id !== userId) throw new Error('Unauthorized');
  
  return supabase
    .from('memos')
    .update({ content, updated_at: new Date() })
    .eq('id', memoId);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Input Validation at Tool Boundaries"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's tool use includes structured arguments, but the model can still generate invalid or malicious payloads. Validate every input: type check, bounds check, pattern match. Use Zod or similar schema validators before passing data to your backend.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Common exploits include oversized strings (DoS), negative numbers in quantity fields, or SQL-like patterns in text. Validate early, reject strictly.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Audit Logging Every Tool Call"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log what ran, who triggered it, what inputs it received, and what happened. Store these immutably in Supabase. This is your forensic record for debugging unexpected behavior and proving compliance.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Include: timestamp, user_id, tool_name, input_arguments, result status, and error messages (but not sensitive data from results). Query logs when a user reports something strange.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Rate Limiting and Quota Enforcement"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tool calls can be expensive—database mutations, third-party API calls, computational work. Without quotas, a malicious prompt loop can drain your budget or degrade service. Implement per-user rate limits on sensitive tools.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Track cumulative tool usage per user per period, and reject calls that exceed limits. Store these counters in Redis or a simple Supabase table with TTL logic.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) provides a real-world reference for securing tool calls in Claude agents. It includes permission middleware, Zod schema validation, and Supabase audit logging built into Next.js route handlers.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Study how Pantheon structures tool handlers, enforces user context, and logs execution. You can adapt its patterns to your own agent system.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:securing-llm-tool-calls-production`} />

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with permission checks and input validation today—audit logging and rate limits follow. Get the full starter kit and secure your first production agent.`}</p>
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
