import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'The Indie Dev Playbook for Autonomous AI Side Projects',
  description: 'Learn how to build production AI agents with Claude, Next.js, and Supabase. Real patterns for indie developers shipping autonomous systems.',
  openGraph: {
    title:       'The Indie Dev Playbook for Autonomous AI Side Projects',
    description: 'Learn how to build production AI agents with Claude, Next.js, and Supabase. Real patterns for indie developers shipping autonomous systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/indie-dev-autonomous-ai-side-project',
  },
  twitter: { card: 'summary_large_image', title: 'The Indie Dev Playbook for Autonomous AI Side Projects', description: 'Learn how to build production AI agents with Claude, Next.js, and Supabase. Real patterns for indie developers shipping autonomous systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"The Indie Dev Playbook for Autonomous AI Side Projects"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Building autonomous AI agents as a solo developer means making smart architectural choices upfront—this playbook gives you the specific patterns, database schemas, and API integrations that let you ship faster without burning out on infrastructure.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Agent-Server Communication Pattern"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your AI agent needs a reliable message queue and state store. The proven indie pattern is a Next.js API route that acts as a broker between your Claude agent and Supabase. Each agent run gets a session ID; messages are stored as immutable logs; tool calls are queued and processed asynchronously.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This decoupling means you can restart agents mid-execution, replay conversations for debugging, and scale to multiple concurrent agents without rewriting core logic. Use Supabase's real-time subscriptions to push updates to your frontend—no polling.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function POST(req: Request) {
  const { sessionId, messages, model } = await req.json();
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages,
    tools: AGENT_TOOLS,
  });
  await supabase
    .from('agent_runs')
    .insert({ session_id: sessionId, messages: response, status: 'pending' });
  return Response.json(response);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tool Use: Keep Agents Scoped and Testable"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Define your Claude tools narrowly. Instead of a generic 'database' tool, create fetch_user, update_user, list_tasks. This forces you to think through exactly what your agent can do and makes unit testing trivial—just mock the tool implementations.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Each tool should be a pure function that validates input, executes one operation, and returns structured output. Use TypeScript to enforce contracts. This prevents agents from accidentally cascading writes or getting into infinite loops.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cost Control: Tokens, Batching, and Caching"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's prompt caching to reduce token spend on repeated context (system prompts, long instructions). For side projects, caching often cuts API costs by 40–60% after a few runs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Batch non-urgent agent tasks. If your agent is generating reports or processing backlog items, queue them and run 5–10 together in a cron job rather than on-demand. Set reasonable max_tokens (2048–4096) and use stop sequences to prevent rambling.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"State Management: What the Database Needs to Store"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`You need: session metadata (created_at, user_id, status), message history (role, content, tokens_used), tool calls (name, input, output, latency), and error logs. Start with Supabase's JSON column for message content—it's faster to iterate than strict schemas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Index on (user_id, created_at) for your dashboard. Add a status enum (pending, running, completed, failed) so you can retry or audit failed runs. Don't over-normalize early; a single agents table with JSONB columns beats a dozen junction tables for a solo project.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Error Handling and Retry Logic"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's API is reliable, but your agent will fail—bad tool inputs, timeouts, rate limits. Build retry logic into your message loop: exponential backoff for rate limits, structured error recovery for tool failures.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every tool call's latency and error. After 10 failed runs, human review stops bleeding money. Use Supabase's pg_cron to auto-cleanup old sessions, and set up simple Slack alerts for agent errors that cross a threshold.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Frontend: Real-Time Visibility Without Polling"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase real-time subscriptions to watch agent_runs in real-time. Build a simple React component that streams tokens and tool calls as they happen. This gives users confidence the system is working and catches edge cases you'll miss in testing.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Display the full message history and tool outputs. When an agent gets stuck, you need visibility into exactly what it was thinking.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with the Pantheon reference implementation at github.com/lewisallena17/pantheon to see these patterns in production code—then grab the full starter kit below to ship your first autonomous AI side project.`}</p>
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
