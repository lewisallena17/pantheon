import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Build an Autonomous Dev.to Article Writer with Claude',
  description: 'Learn how to build a self-publishing AI agent using Claude, Next.js, and Supabase. Complete technical guide for indie developers.',
  openGraph: {
    title:       'Build an Autonomous Dev.to Article Writer with Claude',
    description: 'Learn how to build a self-publishing AI agent using Claude, Next.js, and Supabase. Complete technical guide for indie developers.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-dev-to-article-writer',
  },
  twitter: { card: 'summary_large_image', title: 'Build an Autonomous Dev.to Article Writer with Claude', description: 'Learn how to build a self-publishing AI agent using Claude, Next.js, and Supabase. Complete technical guide for indie developers.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building an Autonomous Dev.to Article Writer"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Building an autonomous Dev.to article writer means connecting Claude's reasoning to your publishing infrastructure—letting you generate, refine, and publish content without manual intervention.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Claude + Dev.to API Is the Right Stack"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude excels at sustained reasoning across long contexts, making it ideal for researching topics, drafting multi-section articles, and iterating on quality. The Dev.to API accepts markdown and handles formatting, so you're not fighting platform constraints.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Unlike GPT-4, Claude's extended thinking capabilities let you trace the reasoning behind article structure decisions, which matters when you're automating content that represents your brand. You get transparency into what the model is actually doing.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up the Claude + Supabase Pipeline"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store article requests, drafts, and publication history in Supabase. Use a simple schema: requests table (topic, tone, target_audience, status), drafts table (content, version, created_at), and published table (dev_to_id, url, metrics).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Next.js backend calls Claude's API with the article request, streams the response to Supabase, then polls the Dev.to API to verify publication. This async flow prevents timeouts and gives you audit trails.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function generateArticle(topic: string, audience: string) {
  const message = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: \`Write a Dev.to article about \${topic} for \${audience}. Include frontmatter with title and tags.\`
    }]
  });
  
  const markdown = message.content[0].type === 'text' ? message.content[0].text : '';
  await supabase.from('drafts').insert([{ content: markdown, status: 'draft' }]);
  return markdown;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling the Dev.to API Integration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dev.to's API is straightforward: POST to /api/articles with your API key and markdown body. The response includes the article ID and canonical URL, which you store immediately for tracking and analytics.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set retry logic for rate limits and use idempotency keys to prevent duplicate publishes if your worker crashes mid-upload. A simple exponential backoff handles temporary API hiccups.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Feedback Loops and Iteration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Real autonomy requires feedback. Use Dev.to's analytics API to fetch view counts and reactions 24 hours after publication. Feed successful patterns back into your next Claude request as examples.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log what works: certain opening hooks, code examples, call-to-action placement. Claude learns context from your best performers, gradually improving without manual tuning of the system prompt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Avoiding Hallucination and Brand Risk"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't let Claude invent facts about tools or libraries you don't use. Provide a curated knowledge base: your best past articles, a list of approved tools, and any brand guidelines.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Implement a human review step before publication in production. Route drafts to a queue where you can skim them in 2–3 minutes and approve, reject, or request revisions. This catches tone drift and factual errors without killing automation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon provides a production-ready starter for autonomous agent systems. It includes Next.js handlers, Supabase migrations, Claude integration patterns, and Dev.to API wrappers.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, customize the prompts to your niche, and deploy to Vercel with Supabase in the background. The codebase is built for indie developers who want real autonomy without reinventing the wheel.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with a single article request, validate your pipeline, then scale to weekly autonomous publishing—grab the Pantheon starter kit to ship in hours instead of weeks.`}</p>
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
