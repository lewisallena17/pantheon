import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-memory-jaccard-dedup'

export const metadata: Metadata = {
  title:       'AI Agent Memory Dedup with Jaccard Similarity',
  description: 'Stop storing duplicate memories in your AI agents. Learn Jaccard similarity for memory deduplication in Claude + Next.js systems.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-memory-jaccard-dedup',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-memory-jaccard-dedup',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-memory-jaccard-dedup',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-memory-jaccard-dedup',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-memory-jaccard-dedup',
    },
  },
  openGraph: {
    title:       'AI Agent Memory Dedup with Jaccard Similarity',
    description: 'Stop storing duplicate memories in your AI agents. Learn Jaccard similarity for memory deduplication in Claude + Next.js systems.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'AI Agent Memory Dedup with Jaccard Similarity', description: 'Stop storing duplicate memories in your AI agents. Learn Jaccard similarity for memory deduplication in Claude + Next.js systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"AI Agent Memory — Dedup Lessons with Jaccard Similarity"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`When your AI agent stores every conversation turn as a memory, you'll quickly drown in redundant data—wasting tokens, increasing latency, and polluting semantic search. Jaccard similarity gives you a lightweight way to identify and merge duplicate memories before they bloat your vector database.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Duplicate Memories Kill Agent Performance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Each time your Claude agent reflects on a conversation, it may store similar insights multiple times. A user asking "How do I auth?" and then "What's the auth flow?" produces two nearly-identical memories. Over thousands of interactions, this bloat compounds: slower retrieval, higher embedding costs, and noise in semantic search results.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Deduplication isn't optional—it's foundational to building agents that scale. Without it, your memory system becomes a liability.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Understanding Jaccard Similarity for Memory Dedup"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jaccard similarity measures overlap between two sets. For memory dedup, you tokenize each memory into words, compute the intersection and union, then calculate: \`|intersection| / |union|\`. A score of 0.8+ typically means two memories are near-duplicates worth merging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Unlike semantic similarity (which requires embeddings and is slower), Jaccard runs in milliseconds and requires zero ML overhead. It's deterministic, debuggable, and works well for exact and near-exact matches—exactly what you need for memory cleanup.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Jaccard Similarity in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`You'll typically run dedup in a Supabase background job or API route before inserting memories. Tokenize, compute the Jaccard score, and flag high-similarity pairs for merge or deletion.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`function jaccardSimilarity(text1: string, text2: string): number {
  const normalize = (t: string) => new Set(t.toLowerCase().split(/\s+/));
  const set1 = normalize(text1);
  const set2 = normalize(text2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 1 : intersection.size / union.size;
}

const threshold = 0.75;
if (jaccardSimilarity(newMemory, existingMemory) > threshold) {
  console.log('Duplicate detected—merge or skip storage');
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating with Supabase Memory Tables"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store memories in Supabase with a \`memory_text\` column. Before inserting a new memory, query recent memories for the same agent and run Jaccard checks in application logic (or via a Postgres function if you prefer). Update a \`deduped_at\` timestamp to track which memories have been processed, preventing recalculation waste.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combining Jaccard with Vector Search"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`For best results, use Jaccard as a pre-filter before semantic search. Deduplicate stored memories every 24 hours or after N new inserts. Then, when your agent queries memories, search the cleaned set. This dual approach catches both word-level dupes (Jaccard) and semantic near-misses (embedding similarity).`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project at github.com/lewisallena17/pantheon includes a production-ready memory dedup pipeline using Jaccard similarity. It integrates Claude, Next.js, and Supabase with built-in monitoring for memory bloat. Fork it, adapt the dedup threshold to your use case, and deploy to Vercel with one click.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Deduplicate your agent memories with Jaccard similarity to cut storage costs, speed up retrieval, and keep your vector database clean—start with the Pantheon starter kit today.`}</p>
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
