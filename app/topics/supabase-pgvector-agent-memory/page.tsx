import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/supabase-pgvector-agent-memory'

export const metadata: Metadata = {
  title:       'pgvector for AI Agent Semantic Memory | Guide',
  description: 'Learn how to use pgvector in Supabase for persistent semantic memory in Claude-powered AI agents. Technical guide with Next.js examples.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-pgvector-agent-memory',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-pgvector-agent-memory',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-pgvector-agent-memory',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
    },
  },
  openGraph: {
    title:       'pgvector for AI Agent Semantic Memory | Guide',
    description: 'Learn how to use pgvector in Supabase for persistent semantic memory in Claude-powered AI agents. Technical guide with Next.js examples.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'pgvector for AI Agent Semantic Memory | Guide', description: 'Learn how to use pgvector in Supabase for persistent semantic memory in Claude-powered AI agents. Technical guide with Next.js examples.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Using pgvector for AI Agent Semantic Memory"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Store and retrieve AI agent memories with vector embeddings in Postgres using pgvector, letting your Claude agents maintain context across sessions without token bloat.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why pgvector for Agent Memory"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents need to remember conversation context, user preferences, and learned behaviors—but context windows are finite and expensive. Vector embeddings solve this: you convert conversations and facts into semantic vectors, store them in Postgres with pgvector, and retrieve only the most relevant memories for each request.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`pgvector is a Postgres extension that handles similarity search natively. With Supabase, you get pgvector enabled out of the box. This means your agent can query a database of memories using cosine similarity (or other distance metrics) and inject the top-k most relevant snippets into Claude's context, keeping token usage low while maintaining long-term memory.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up pgvector in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enable the pgvector extension in your Supabase project via the dashboard (Extensions tab), or run: \`CREATE EXTENSION IF NOT EXISTS vector;\` in your SQL editor. Then create a memories table with an embeddings column of type vector(1536) to store OpenAI embeddings.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your schema should include: id, agent_id (to scope memories per agent), content (the actual memory text), embedding (the vector), and created_at (for temporal filtering). Add an index: \`CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);\` for fast similarity searches at scale.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamp DEFAULT now()
);

CREATE INDEX memories_embedding_idx 
  ON memories USING ivfflat (embedding vector_cosine_ops);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Embedding Conversations with Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When Claude responds, extract key facts or summaries and embed them using the OpenAI embeddings API. In your Next.js API route, send the memory text to OpenAI, receive the vector, and store it in Supabase alongside the agent ID and original content.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This happens asynchronously after the agent responds to the user—no added latency to the chat interaction. You're building a searchable knowledge base that grows as your agent learns.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/agent/store-memory.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI();

export default async function handler(req, res) {
  const { agentId, content } = req.body;
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });
  
  await supabase.from('memories').insert({
    agent_id: agentId,
    content,
    embedding: embedding.data[0].embedding,
  });
  
  res.status(200).json({ ok: true });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Retrieving Relevant Memories for Context"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Before sending a user message to Claude, embed the incoming query and perform a similarity search: \`SELECT content FROM memories WHERE agent_id = \$1 ORDER BY embedding <-> \$2 LIMIT 5;\`. The \`<->\` operator is pgvector's cosine distance metric.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Inject the top-5 results into Claude's system prompt or as retrieval-augmented context. This gives your agent instant access to relevant past conversations without cluttering the token budget.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pruning and Temporal Decay"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Memory tables grow indefinitely. Implement a cleanup job (via a cron function in Supabase or a scheduled Next.js endpoint) to delete memories older than 90 days, or periodically re-embed and consolidate similar memories into summaries.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`You can also weight recent memories higher by adjusting your retrieval query: \`ORDER BY embedding <-> \$2 + (EXTRACT(EPOCH FROM (now() - created_at)) / 86400 * 0.01)\` to add a small penalty for age.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) provides a production-ready reference implementation of multi-agent systems with semantic memory. It demonstrates agent-to-agent communication, pgvector integration, and memory consolidation patterns—ideal for understanding how to architect agentic systems that scale beyond single-turn interactions.`}</p>

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
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Start with a simple memories table, embed your agent's key interactions, and retrieve relevant context before each API call—get a working starter kit to implement this today.`}</p>
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
