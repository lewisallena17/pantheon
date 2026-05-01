import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Claude Citations for AI Agent Fact-Checking',
  description: 'Enable your Claude AI agents to cite sources and verify facts. Learn how to implement citations in Next.js with Supabase for production-grade fact-checking.',
  openGraph: {
    title:       'Claude Citations for AI Agent Fact-Checking',
    description: 'Enable your Claude AI agents to cite sources and verify facts. Learn how to implement citations in Next.js with Supabase for production-grade fact-checking.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-citation-fact-checking',
  },
  twitter: { card: 'summary_large_image', title: 'Claude Citations for AI Agent Fact-Checking', description: 'Enable your Claude AI agents to cite sources and verify facts. Learn how to implement citations in Next.js with Supabase for production-grade fact-checking.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Citations for AI Agent Fact-Checking"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Citations transform Claude from a conversational AI into a fact-checkable system—your agents can now point to exact sources, letting end-users verify claims and you build trustworthy products faster.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Citations Matter for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you deploy Claude agents into production, users won't trust unsourced answers. Citations let your agent say 'I found this fact in document X, section Y' rather than just stating claims. This becomes critical for customer support bots, research assistants, and compliance-heavy workflows.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Without citations, you're debugging hallucinations blind. With them, you can trace every claim back to its origin, making it trivial to catch when Claude pulls from the wrong knowledge base or misinterprets a document.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:claude-citation-fact-checking`} />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How Claude's Citation API Works"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude accepts citations through the \`citations\` parameter in your prompt. You pass structured references—URLs, document IDs, page numbers—and Claude returns not just text but metadata pointing back to those sources. The model is trained to cite when it uses external knowledge.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In practice: you send Claude a document chunk with \`{source_id: 'doc_123', text: '...'}\`, ask a question, and Claude's response includes \`citations: [{source_id: 'doc_123', quote: '...relevant text...'}]\`. Your agent then validates these citations against your source database before responding to users.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing Citations in Next.js + Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store your source documents in Supabase with vector embeddings for semantic search. When a user query arrives, retrieve relevant chunks using similarity search, then pass them to Claude with citation metadata.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Here's the core flow:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await claude.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'text',
        text: \`Answer this question using only the provided sources: \${userQuestion}\`
      },
      ...sourceChunks.map(chunk => ({
        type: 'text',
        text: chunk.text,
        source_id: chunk.id
      }))
    ]
  }]
});

const citations = response.content[0].citations || [];
const verified = citations.map(c => ({
  sourceId: c.source_id,
  quote: c.quote,
  documentUrl: sourceMap[c.source_id]
}));`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Fact-Checking Your Agent's Responses"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`After Claude returns a response with citations, validate them. Query Supabase to confirm the cited source actually contains the quoted text. If a citation doesn't match, flag it and retry with stricter instructions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This two-step validation—citation extraction plus source verification—catches both hallucinations and misattributions. Log failed validations to identify patterns in your knowledge base that confuse the model, then refine your chunks.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lewis Allen's Pantheon repo (github.com/lewisallena17/pantheon) provides a production-ready example of Claude citations in a multi-agent system. It demonstrates chunking strategies, embedding pipelines with Supabase pgvector, and citation validation loops.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, adapt the prompt templates to your domain, and use the citation validation code as a starting point. The repo includes example queries showing how citations surface in real agent responses.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Common Pitfalls and Fixes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`**Chunks too large**: Claude citations work best with 200–500 token chunks. Large documents create ambiguous citations. **Stale sources**: If your knowledge base updates but embeddings don't, citations point to outdated info. Rebuild vectors on each update. **Missing source metadata**: Always store document URL, update date, and authority level alongside chunks so users can assess credibility.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Test your citation system against adversarial queries—ask for facts from sources you didn't provide. A robust system should either cite correctly or decline to answer.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with Pantheon, implement citations in your Next.js agent today, and turn user doubt into trust through verifiable sources—get the full starter kit below.`}</p>
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
