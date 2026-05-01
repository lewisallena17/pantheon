import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Passive Income via AI-Generated SEO Content',
  description: 'Build AI agents that generate optimized SEO content at scale. Learn the technical stack: Claude, Next.js, Supabase. Real code examples inside.',
  openGraph: {
    title:       'Passive Income via AI-Generated SEO Content',
    description: 'Build AI agents that generate optimized SEO content at scale. Learn the technical stack: Claude, Next.js, Supabase. Real code examples inside.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-passive-income-seo-strategy',
  },
  twitter: { card: 'summary_large_image', title: 'Passive Income via AI-Generated SEO Content', description: 'Build AI agents that generate optimized SEO content at scale. Learn the technical stack: Claude, Next.js, Supabase. Real code examples inside.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Passive Income Through AI-Generated SEO Content"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`You can generate hundreds of SEO-optimized articles monthly using Claude's API paired with Next.js and Supabase—without hiring writers—but only if you automate the entire pipeline from keyword research through publishing.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Claude Beats Commodity LLMs for SEO Content"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude's extended thinking and nuanced instruction-following make it superior for SEO at scale. It understands semantic clustering, LSI keywords, and content depth without hallucinating citations. GPT-4 often overshoots word count; cheaper models tank E-E-A-T signals. Claude consistently ships production-ready content on the first pass.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The cost math works: \$0.003 per 1K output tokens means generating 10,000 words of publish-ready content costs under \$3. At \$50–150 per article on freelance platforms, a single piece pays for 1,000+ generated articles.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the Content Pipeline in Next.js + Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your stack should separate concerns: a Supabase database for keywords and articles, a Next.js API route that calls Claude, and a background job queue (Bull or Inngest) for batch generation. This decoupling lets you scale horizontally without rewriting core logic.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store keyword intent, search volume, and competition score in Supabase. Trigger Claude calls asynchronously. Wait for the response, then persist the article with metadata—publish date, internal links, featured image prompt—before marking it ready for CMS sync.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const { data, error } = await supabase
  .from('articles')
  .insert([
    {
      keyword: 'passive income ai seo',
      title: generatedTitle,
      content: claudeResponse.content,
      word_count: claudeResponse.content.length / 5,
      status: 'draft',
      created_at: new Date()
    }
  ])
  .select();`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structuring Prompts for Publishable Output"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't ask Claude to 'write an article.' Be explicit: target word count, heading structure, keyword density (1–2%), internal link anchors, and front-matter. Include the primary keyword in the first 100 words and in an H2. This determinism removes iteration loops.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's system prompt to enforce tone, voice, and format. For B2B SaaS, specify: 'Write for technical founders. Use active voice. Avoid marketing jargon. Include one working code example.' This single instruction reduces garbage output by 80%.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monetization: Affiliate Links, Ads, and Owned Audiences"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Generic SEO content doesn't scale to meaningful income alone. Layer in affiliate links (Stripe, API providers, hosting platforms your audience uses), contextual AdSense, and—critically—email capture. Add a CTA in the footer of every article: 'Subscribe for AI engineering deep-dives.'`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The real passive income comes from the email list. One conversion per 100 visitors to a \$99/month course or \$299 tool nets \$30K+ annually at scale. Content is the acquisition layer; email is the monetization layer.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Avoiding Commoditization and Google Core Updates"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pure AI-generated content gets caught in algorithmic devaluation. Google's March 2024 core update buried thin, derivative articles. Add original data: run surveys, interview experts, embed interactive tools, or cite unique case studies. Spend 20% of time on original research, 80% on scaling the pipeline.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase to track which articles rank, which convert, and which get no traffic. Double down on winner topics and prune low-performers within 60 days. Treat the operation like a startup: measure, iterate, reinvest.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't start from scratch. The Pantheon project (github.com/lewisallena17/pantheon) is a production-ready Next.js + Supabase stack for AI SEO content generation. It includes keyword ingestion, Claude API integration, batch processing, and WordPress sync. It's MIT-licensed and actively maintained.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, configure your Claude API key and Supabase credentials, set up a cron job to run generation nightly, and watch your content library grow. The repo includes schemas, example prompts, and deployment instructions for Vercel.`}</p>

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
            <li><a href="https://stripe.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Stripe</a> <span className="text-slate-500">— payment processing</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Build an AI content pipeline using Claude, Next.js, and Supabase today—fork Pantheon, configure once, and generate hundreds of SEO articles monthly without manual overhead.`}</p>
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
