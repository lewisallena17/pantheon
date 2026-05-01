import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Jaccard Similarity for AI Agent Lesson Retrieval',
  description: 'Use Jaccard Similarity to build accurate lesson retrieval systems for AI agents. Learn implementation patterns for Claude, Next.js, and Supabase.',
  openGraph: {
    title:       'Jaccard Similarity for AI Agent Lesson Retrieval',
    description: 'Use Jaccard Similarity to build accurate lesson retrieval systems for AI agents. Learn implementation patterns for Claude, Next.js, and Supabase.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/jaccard-similarity-ai-agent-retrieval',
  },
  twitter: { card: 'summary_large_image', title: 'Jaccard Similarity for AI Agent Lesson Retrieval', description: 'Use Jaccard Similarity to build accurate lesson retrieval systems for AI agents. Learn implementation patterns for Claude, Next.js, and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Jaccard Similarity for AI Agent Lesson Retrieval"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Jaccard Similarity gives you a fast, interpretable way to find the right training lessons for your AI agent to retrieve and apply—without the computational overhead of embeddings or the brittleness of keyword matching.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Jaccard Similarity Beats Keyword Matching for Lesson Retrieval"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When building agentic systems, you need your AI to pull the right lessons from a knowledge base to inform its next action. Keyword matching fails because it ignores semantic relationships. Embedding similarity works but adds latency and cost.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jaccard Similarity—the ratio of intersection to union of two sets—bridges this gap. It's set-based, so it naturally captures what lessons and contexts have in common, requires zero ML infrastructure, and runs in milliseconds on Supabase with a simple SQL query.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Math: How Jaccard Works for Your Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jaccard(A, B) = |A ∩ B| / |A ∪ B|. For lesson retrieval, convert your agent's current context into a set of tokens or concepts, then compare it against stored lesson prerequisite sets.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A score of 1.0 means perfect overlap. A score of 0 means no common ground. In practice, lessons scoring 0.3–0.7 are often your signal that an agent should retrieve and apply them. You control the threshold based on your domain's specificity.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the Retrieval Pipeline in Next.js and Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start by storing lessons in Supabase with a \`lesson_concepts\` column (array of strings: tags, skills, or domain tokens). When your Claude-powered agent hits a decision point, send its current state as a set of relevant concepts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Query Supabase to compute Jaccard scores server-side, then rank and return the top N lessons. The agent can then use those lessons as context in its next Claude call to make a more informed decision.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Supabase SQL: compute Jaccard similarity
SELECT 
  id, title,
  (array_length(array_intersect(lesson_concepts, \$1::text[]), 1)::float / 
   array_length(array_union(lesson_concepts, \$1::text[]), 1)::float) as jaccard_score
FROM lessons
WHERE array_length(array_intersect(lesson_concepts, \$1::text[]), 1) > 0
ORDER BY jaccard_score DESC
LIMIT 5;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tuning Concept Sets for Your Domain"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The quality of your retrieval depends on how you define concepts. For a coding tutor, use function names, error types, and algorithms. For customer support, use intent categories and issue patterns.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start coarse, then refine based on what lessons your agent actually needs. A lesson with concepts ['array-iteration', 'performance', 'javascript'] will only match agents working in that space—which is exactly what you want.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Combine Jaccard with Embeddings"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jaccard alone excels when your lesson concepts are well-defined and your agent's context is structured. If you're working with free-form text queries or need fuzzy matching, layer a two-stage retrieval: use Jaccard for fast pre-filtering, then re-rank with embeddings.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This hybrid approach keeps latency low while improving recall. For most indie founders, Jaccard alone is the right starting point—simpler, cheaper, and easier to debug.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) provides a production-ready reference implementation of Jaccard-based lesson retrieval for Claude agents. It includes Next.js API routes, Supabase schema and queries, and a lesson storage pattern that scales.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, adapt the concept taxonomy to your domain, and integrate it into your agent loop. It's built specifically for indie developers who want proven patterns without the overhead of a full LMS framework.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start implementing Jaccard Similarity today to give your AI agents access to the right lessons at the right time—check out Pantheon on GitHub to see a working example you can fork and adapt.`}</p>
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
