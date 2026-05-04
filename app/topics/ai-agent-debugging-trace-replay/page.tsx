import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-debugging-trace-replay'

export const metadata: Metadata = {
  title:       'Debugging AI Agents with Trace Replay | Claude',
  description: 'Learn to debug AI agents step-by-step using trace replay. Capture agent decisions, replay failures, and fix production issues faster with Claude.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-debugging-trace-replay',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-debugging-trace-replay',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-debugging-trace-replay',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
    },
  },
  openGraph: {
    title:       'Debugging AI Agents with Trace Replay | Claude',
    description: 'Learn to debug AI agents step-by-step using trace replay. Capture agent decisions, replay failures, and fix production issues faster with Claude.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Debugging AI Agents with Trace Replay | Claude', description: 'Learn to debug AI agents step-by-step using trace replay. Capture agent decisions, replay failures, and fix production issues faster with Claude.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Debugging AI Agents with Trace Replay"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Trace replay lets you record every decision your AI agent makes, then step backward through failures to find exactly where reasoning broke—cutting debugging time from hours to minutes.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Standard Logging Fails for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditional logs show you *what* happened, not *why* your agent chose a specific action. When Claude's tool calls go sideways or a multi-step reasoning chain diverges, you're left reconstructing context manually.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agent debugging requires visibility into: token counts at decision points, exact prompt context for each step, tool output that triggered a branch, and the model's confidence at each node. A single print statement won't give you this.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How Trace Replay Captures Agent State"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace replay records the complete execution graph of your agent: messages sent to Claude, tool definitions available, tool results received, and tokens consumed. Each node is timestamped and indexed.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Instead of re-running a failed agent from scratch (expensive and non-deterministic with Claude), you replay from any checkpoint. You jump to step 7 of 12, inspect the exact context Claude saw, modify a tool response, and fast-forward to see how reasoning changes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This is especially powerful for agents that call external APIs—you capture the live API response and replay against it without hitting rate limits or side effects.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building Trace Capture in Next.js + Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Capture traces by wrapping your Claude client calls. Store message history, tool calls, tool results, and timing metadata in Supabase. Query by agent session ID for instant replay.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's a minimal pattern:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function executeAgentStep(messages: Message[]) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages
  });
  
  const trace = {
    sessionId: currentSession.id,
    stepNumber: messages.length,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
    messageContent: response.content,
    timestamp: new Date()
  };
  
  await supabase
    .from('agent_traces')
    .insert([trace]);
  
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Replaying and Modifying Agent Decisions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Load a trace session from Supabase and replay it deterministically. If step 5's tool call returned incorrect data, modify that result in memory and re-execute steps 6–12 against the corrected state.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This beats re-running because: no API costs for repeated steps, you control exactly which inputs change, and you can A/B test different tool outputs instantly. For agents making 50+ API calls in a single task, this saves real money.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Identifying Prompt Injection and Reasoning Drift"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace replay makes invisible failures visible. Compare the exact prompt context between a working trace and a failed one. You'll spot when a tool result contained unexpected formatting, or when token limits forced Claude to cut reasoning short.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Watch for reasoning drift: an agent that scored 95% yesterday but 60% today likely saw a subtle input change. Trace replay surfaces this immediately instead of waiting for metrics to degrade further.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) provides a complete trace replay system built for Claude agents. It includes database schemas for Supabase, a Next.js UI for navigating trace trees, and TypeScript utilities for capture and replay.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to add domain-specific extensions: cost analysis, latency profiling, or custom visualizations for your agent's decision tree.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start capturing agent traces today—clone Pantheon, add trace logging to your Claude calls, and replace hours of guesswork with minute-level debugging.`}</p>
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
