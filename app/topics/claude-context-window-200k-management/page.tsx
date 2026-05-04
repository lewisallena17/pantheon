import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/claude-context-window-200k-management'

export const metadata: Metadata = {
  title:       'Managing Claude\'s 200k Context Window at Scale',
  description: 'Learn how to structure prompts, cache efficiently, and build production AI agents using Claude\'s 200k context. Real patterns for Next.js + Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-context-window-200k-management',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-context-window-200k-management',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-context-window-200k-management',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
    },
  },
  openGraph: {
    title:       'Managing Claude\'s 200k Context Window at Scale',
    description: 'Learn how to structure prompts, cache efficiently, and build production AI agents using Claude\'s 200k context. Real patterns for Next.js + Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Managing Claude\'s 200k Context Window at Scale', description: 'Learn how to structure prompts, cache efficiently, and build production AI agents using Claude\'s 200k context. Real patterns for Next.js + Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Managing Claude's 200k Context Window at Scale"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Claude's 200k context window is powerful—but only if you architect your system to use it without wasting tokens or hitting latency walls—here's exactly how production teams do it.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Context Window Scale Matters for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A 200k context window means you can fit ~150 pages of documentation, conversation history, and system instructions in a single request. For indie developers building agents, this eliminates the need for complex retrieval-augmented generation (RAG) chains for many use cases. You can load entire codebases, user databases, or knowledge bases directly into the prompt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The tradeoff: every token costs money and latency compounds. If you dump all 200k tokens into every request, you're paying for context you don't use and slowing down response times. The real skill is knowing what context belongs in the window and what belongs in a vector database.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structuring Prompts for Scale"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start with a three-layer prompt architecture: system instructions (500–1000 tokens), request-specific context (variable), and user input. System instructions should be immutable—your agent's personality, capabilities, constraints. Request context is dynamic: API schemas, relevant docs, user history.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's system parameter separately from the message, not concatenated into one megaprompt. This keeps cache hits stable and makes prompt engineering testable. For multi-turn conversations, batch related requests to reuse cache blocks.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: [
      { type: 'text', text: 'You are a code generation agent.' },
      { type: 'text', text: systemDocs, cache_control: { type: 'ephemeral' } }
    ],
    messages: [
      { role: 'user', content: userQuery }
    ]
  })
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Prompt Caching for Token Efficiency"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude supports prompt caching—the same system instructions or documentation accessed repeatedly are cached and charged at 10% the normal token cost after the first request. For agents running hundreds of requests, this is critical.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache reusable blocks: API documentation, framework guides, user context. Set cache_control: { type: 'ephemeral' } on text blocks that don't change between requests. Monitor cache hit rates in your analytics; a 50%+ hit rate means you're structuring context correctly.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Context Window Allocation Strategy"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Reserve ~50k tokens for the model's response and internal reasoning. That leaves ~150k for input. Allocate: 10% to system instructions, 30% to request-specific context (API schemas, relevant docs), 60% to dynamic user data (conversation history, file contents, database records). Adjust these ratios based on your agent's task.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Build a token counter into your request pipeline. If dynamic context exceeds your budget, truncate by recency for conversations or by relevance score for documents. Never let a request fail due to length; graceful truncation keeps the agent operational.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Database Design for Agent Context"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Supabase, structure a conversations table with user_id, agent_id, message_history (JSONB), and metadata columns. Store full conversation history, but only include the last 20–50 turns in each API request. Use PostgreSQL's JSONB for flexible schema and window functions to fetch the most recent context.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a separate documents table (content, embedding, tokens) for long-form context. Query by semantic similarity (using pgvector) or by explicit context_tag. This hybrid approach avoids loading the entire knowledge base into every request while keeping hot data immediately available.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Cost Control"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every API call with tokens_input, tokens_cache_creation, tokens_cache_read, and tokens_output. This telemetry is essential for optimizing context allocation. Set alerts if average tokens_input exceeds your target—it usually signals that you're being too verbose with context.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Calculate true cost per request: (input_tokens + cache_creation_tokens) / 1M * \$3 + (cache_read_tokens / 1M * \$0.30) + output cost. When you see cache payoff (cache_read >> cache_creation), you know your prompt structure is working.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with prompt caching and a three-layer context structure—measure token usage relentlessly—and you'll build agents that scale without hemorrhaging costs or responsiveness. Get the full starter kit and begin managing your 200k window today.`}</p>
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
