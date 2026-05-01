import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'AI Agent Monitoring: Alert When Your Claude Agent Breaks',
  description: 'Set up real-time notifications when your Claude AI agent fails. Learn error tracking, logging strategies, and monitoring for Next.js + Supabase agents.',
  openGraph: {
    title:       'AI Agent Monitoring: Alert When Your Claude Agent Breaks',
    description: 'Set up real-time notifications when your Claude AI agent fails. Learn error tracking, logging strategies, and monitoring for Next.js + Supabase agents.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/discord-slack-telegram-ai-agent-notifications',
  },
  twitter: { card: 'summary_large_image', title: 'AI Agent Monitoring: Alert When Your Claude Agent Breaks', description: 'Set up real-time notifications when your Claude AI agent fails. Learn error tracking, logging strategies, and monitoring for Next.js + Supabase agents.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Notifying Yourself When Your AI Agent Breaks"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Your AI agent is running smoothly until 3 AM when it silently fails on an edge case, and you don't find out until your users complain—learn the monitoring patterns that catch failures instantly instead.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Silent Failures Destroy AI Agent Reliability"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents built with Claude often handle variable inputs and make decision trees that are hard to predict. When they fail, they fail quietly. An agent might hit rate limits, receive malformed tool responses, or encounter logic branches you didn't anticipate during testing. Without proactive monitoring, you're flying blind.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The cost of discovery matters: learning about failures from user reports means lost trust, wasted API calls, and hours of debugging without context. Monitoring flips this—you own the failure narrative and fix issues before they spread.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:discord-slack-telegram-ai-agent-notifications`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implement Structured Error Logging in Your Agent Loop"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start by wrapping your Claude agent calls in try-catch blocks that capture not just the error, but the state: which tool failed, what was the input, what was the agent thinking. This context is gold when debugging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store logs in Supabase with timestamps and severity levels. Schema: agent_id, run_id, error_type, tool_name, input_snapshot, error_message, created_at. This lets you query failure patterns across runs.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function runAgentWithLogging(messages, agentId) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 2048,
      messages,
      tools: yourTools
    });
    return response;
  } catch (error) {
    await supabase.from('agent_logs').insert({
      agent_id: agentId,
      error_type: error.code,
      error_message: error.message,
      input_snapshot: JSON.stringify(messages),
      severity: 'error',
      created_at: new Date().toISOString()
    });
    throw error;
  }
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Set Up Real-Time Alerts via Webhooks"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime can trigger webhooks when error rows are inserted. Use this to immediately notify Slack, Discord, or email. A critical error (rate limit, API failure) should hit your channel within seconds.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Keep alert logic simple: errors get a base notification, but spike detection (more than 5 errors in 5 minutes) gets an escalated alert. This prevents alert fatigue while catching systemic issues fast.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitor Tool Execution and Response Validation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Failures often originate in tool integrations, not the agent itself. Log every tool call: request, response, latency, and validation result. If a tool returns unexpected data, your agent might proceed anyway, leading to downstream failures.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Add a validation layer that checks tool responses against expected schemas. If validation fails, log it as a warning before the agent consumes it. This catches integration drift early.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Track Agent Performance Metrics Beyond Errors"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Error logs are reactive. Pair them with proactive metrics: average token usage per run, tool call success rate, mean response time. Degradation in these metrics often precedes visible failures.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a simple dashboard (Supabase + Grafana or a Next.js page) showing last 24 hours of agent health. Green means running, yellow means slow degradation, red means active failures.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon provides a production-ready starter kit for Claude agent monitoring with Next.js and Supabase. It includes structured logging, Slack webhook integration, performance dashboards, and a full agent loop implementation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Pantheon to avoid rebuilding monitoring from scratch. It's designed for indie developers and scales as your agent workloads grow.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Stop discovering agent failures through user complaints—implement error logging, real-time notifications, and performance tracking today using Pantheon to catch issues instantly.`}</p>
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
