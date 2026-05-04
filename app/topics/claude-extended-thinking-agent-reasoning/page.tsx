import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/claude-extended-thinking-agent-reasoning'

export const metadata: Metadata = {
  title:       'Claude Extended Thinking for Agent Reasoning',
  description: 'Enable complex multi-step reasoning in AI agents with Claude\'s extended thinking. Build smarter autonomous systems with Next.js and Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-extended-thinking-agent-reasoning',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-extended-thinking-agent-reasoning',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-extended-thinking-agent-reasoning',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
    },
  },
  openGraph: {
    title:       'Claude Extended Thinking for Agent Reasoning',
    description: 'Enable complex multi-step reasoning in AI agents with Claude\'s extended thinking. Build smarter autonomous systems with Next.js and Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Claude Extended Thinking for Agent Reasoning', description: 'Enable complex multi-step reasoning in AI agents with Claude\'s extended thinking. Build smarter autonomous systems with Next.js and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Extended Thinking for Agent Reasoning"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Extended thinking lets Claude agents reason through multi-step problems before acting, dramatically improving decision quality in production systems—here's how to implement it for your indie project.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Extended Thinking Matters for Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Standard Claude responses happen in one pass. For agents handling real business logic—database queries, multi-step workflows, financial calculations—that's not enough. Extended thinking forces the model to reason through the problem, catch edge cases, and validate its own logic before responding.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When your agent controls data mutations or calls external APIs, a single-pass response can propagate errors downstream. Extended thinking acts as an internal rubber duck, reducing hallucinations and improving accuracy by 15-40% on complex reasoning tasks.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How Extended Thinking Works in Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Extended thinking uses the \`thinking\` block parameter in Claude's API. You send a request with \`budgetTokens\` set to the thinking limit (typically 5000-10000), and Claude allocates tokens for internal reasoning before generating the final response.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The model's thinking process is hidden from your output—you only see the final conclusion. This means you get better reasoning without bloating your response tokens or confusing your users with internal monologue.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await anthropic.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000
  },
  messages: [{
    role: 'user',
    content: 'Validate this database schema and suggest optimizations'
  }]
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating Extended Thinking in Next.js Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In your Next.js API route, wrap the Anthropic client call and handle the thinking response type. Pass tool definitions for database queries or external API calls—the extended thinking will reason through which tools to call and in what order.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache the thinking tokens if you're processing similar agent tasks repeatedly. This reduces latency and cost, especially useful for high-volume indie SaaS applications where every millisecond counts.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Use Extended Thinking vs. Standard Calls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use extended thinking for: multi-step decision logic, data validation before mutations, complex schema analysis, and agent agentic loops with tool use. Skip it for simple lookups, real-time chat, or classification tasks—you'll waste tokens and latency.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A practical rule: if your agent needs to reason about consequences before acting, enable thinking. If it's just reformatting or retrieving data, save the budget tokens.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-World Example: Database Schema Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Imagine an agent that validates incoming database schema changes in Supabase. Extended thinking lets it reason through: whether columns conflict, if indexes are necessary, whether migrations could lock tables, and what the optimal order is. Without thinking, it might suggest dangerous changes in parallel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The agent uses tools to query your existing schema, then reasons through constraints before returning a migration script. Extended thinking catches edge cases your unit tests might miss.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo (github.com/lewisallena17/pantheon) provides a production-ready agent framework with extended thinking pre-configured. It includes Next.js API handlers, Supabase integration patterns, and example tool definitions for common indie developer tasks.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it to skip boilerplate: tool registry, error handling, token budgeting, and thinking response parsing are already wired. Add your own business logic and deploy on Vercel.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Enable Claude's extended thinking in your agent system today—fork Pantheon, integrate the thinking parameter, and ship smarter autonomous workflows that reason before they act.`}</p>
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
