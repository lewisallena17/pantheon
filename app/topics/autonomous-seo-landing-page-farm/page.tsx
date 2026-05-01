import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Build an Autonomous SEO Landing Page Farm',
  description: 'Learn how to build an autonomous SEO landing page farm using Claude AI, Next.js, and Supabase. Generate, deploy, and rank hundreds of pages automatically.',
  openGraph: {
    title:       'Build an Autonomous SEO Landing Page Farm',
    description: 'Learn how to build an autonomous SEO landing page farm using Claude AI, Next.js, and Supabase. Generate, deploy, and rank hundreds of pages automatically.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-seo-landing-page-farm',
  },
  twitter: { card: 'summary_large_image', title: 'Build an Autonomous SEO Landing Page Farm', description: 'Learn how to build an autonomous SEO landing page farm using Claude AI, Next.js, and Supabase. Generate, deploy, and rank hundreds of pages automatically.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Building an Autonomous SEO Landing Page Farm"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop manually writing landing pages—build a system that generates, deploys, and optimizes hundreds of SEO-targeted pages autonomously using Claude, Next.js, and Supabase.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Manual Landing Page Creation Doesn't Scale"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Creating landing pages for every keyword variation, product variant, or market segment is a bottleneck. You spend weeks on copy, design, and deployment when you could automate 80% of the work.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`An autonomous page farm treats landing pages as data-driven outputs. Instead of writing pages one by one, you define templates, content strategies, and deployment rules. Claude generates the copy, Next.js renders the pages, and Supabase tracks performance metrics. This approach lets you test 50 variations in the time it takes to write one manually.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Claude → Next.js → Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The system works in three layers. Claude acts as your content engine—given a keyword, target audience, and brand voice, it generates SEO-optimized copy, meta tags, and structured data. Next.js serves as your rendering and deployment layer, consuming Claude outputs and building static or dynamic pages with built-in image optimization and fast page delivery.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase stores page metadata, keyword performance data, and A/B test results. A cron job queries Supabase daily, identifies underperforming pages, triggers Claude to regenerate copy, and deploys updates. This feedback loop continuously improves your ranking positions without manual intervention.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function generateLandingPage(keyword: string) {
  const content = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: \`Generate SEO landing page copy for keyword: "\${keyword}".\nInclude H1, meta description, 3 body sections, CTA. Output as JSON.\`
    }]
  });
  
  const parsed = JSON.parse(content.content[0].text);
  await supabase.from('pages').insert({
    keyword,
    h1: parsed.h1,
    meta_description: parsed.meta_description,
    body: parsed.body,
    created_at: new Date()
  });
  
  return parsed;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Keyword Strategy & Batch Generation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start with a seed keyword list—50 to 500 related terms depending on your niche. Feed them into Claude with your target audience and brand positioning. Claude generates copy tailored to search intent: informational queries get educational content, transactional queries get conversion-focused copy.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase to store keyword clusters and performance tiers. High-intent keywords get more aggressive CTAs; awareness-stage keywords focus on value education. Batch generation through the Claude API is cost-effective—a few dollars generates pages worth months of SEO work.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Deployment & Performance Tracking"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js static site generation creates fast, cacheable pages. Deploy to Vercel for automatic CDN distribution and built-in analytics. Each page includes structured data (JSON-LD) for rich snippets, Open Graph tags for social sharing, and canonical tags to avoid duplicate content penalties.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log keyword rankings, CTR, and conversion data back to Supabase. After 4 weeks, identify pages ranking in positions 4–8. Trigger Claude to regenerate copy with stronger CTAs and improved keyword placement, then redeploy. This iterative process naturally pushes pages toward top-3 rankings.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Avoiding Common Pitfalls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't generate pages without keyword research—ensure search volume and low competition. Avoid exact-match keyword stuffing; Claude naturally balances SEO and readability if prompted correctly.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Monitor Google Search Console and Ahrefs for indexation and ranking changes. Set up alerts for sudden drops. Most importantly, ensure pages provide real value—Google's systems now heavily reward helpful, user-centric content. Pages that convert visitors into customers rank better long-term than thin affiliate or filler content.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-World Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lewis Allen's Pantheon repository demonstrates a production-ready SEO page farm built with exactly this stack. It includes Claude integration for content generation, Next.js page routing, Supabase schema design, and automated deployment triggers.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Reference the implementation at github.com/lewisallena17/pantheon to see how pagination, canonical tags, and performance tracking are handled at scale. Fork it, adapt it for your niche, and launch your first batch of pages this week.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Build your autonomous page farm using Claude, Next.js, and Supabase—get the full starter kit and implementation guide now.`}</p>
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
