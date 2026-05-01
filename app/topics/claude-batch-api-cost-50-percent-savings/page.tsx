import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Claude Batch API: 50% Cost Reduction for Async Work',
  description: 'Cut Claude API costs in half with Batch API for async tasks. Perfect for AI agents, Next.js apps, and bulk processing. See real examples.',
  openGraph: {
    title:       'Claude Batch API: 50% Cost Reduction for Async Work',
    description: 'Cut Claude API costs in half with Batch API for async tasks. Perfect for AI agents, Next.js apps, and bulk processing. See real examples.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/claude-batch-api-cost-50-percent-savings',
  },
  twitter: { card: 'summary_large_image', title: 'Claude Batch API: 50% Cost Reduction for Async Work', description: 'Cut Claude API costs in half with Batch API for async tasks. Perfect for AI agents, Next.js apps, and bulk processing. See real examples.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Batch API — 50% Cost Reduction for Async Work"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`The Claude Batch API processes requests asynchronously at half the cost of real-time calls—ideal for indie developers building AI agents, ETL pipelines, or background jobs that don't need instant responses.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"How Batch API Cuts Costs by 50%"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Anthropic charges \$3 per million input tokens and \$15 per million output tokens for standard requests. Batch API costs exactly 50% less: \$1.50 and \$7.50 respectively. The trade-off is processing delay—batch jobs typically complete within 24 hours, sometimes faster.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For agents processing thousands of documents, generating training data, or analyzing logs, the cost savings compound quickly. A \$100/month Claude bill drops to \$50 using batches for non-urgent tasks.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"When to Use Batch API vs Real-Time"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Real-time API: user-facing features, chat interfaces, synchronous agent decisions, live streaming.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Batch API: background jobs, bulk data processing, daily reports, agent fine-tuning datasets, compliance audits, historical data enrichment, email summarization at scale.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Smart architectures combine both—use real-time for interactive features and batch for everything else.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building a Next.js Agent with Batch Processing"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Queue async tasks in Supabase, submit them as a batch via the Batch API, poll for completion, and webhook results back to your app. This pattern works for any async agent workflow: data extraction, sentiment analysis, code review, or content generation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The flow: user triggers action → task stored in database → background job submits batch → database polled for status → results processed and returned.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Next.js API route: submit batch job
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req) {
  const requests = req.body.tasks.map(task => ({
    custom_id: task.id,
    params: {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: task.prompt }]
    }
  }));

  const batch = await client.batches.create({ requests });
  
  // Store batch ID in Supabase
  await supabase.from('batches').insert({
    id: batch.id,
    status: batch.processing_status
  });

  return { batchId: batch.id };
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring Batch Status and Results"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`After submission, poll the batch endpoint or wait for webhook notifications. Once complete, retrieve results and store them back in your database. For agents that depend on batch outputs, queue follow-up tasks only after results arrive.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase real-time subscriptions keep your Next.js frontend in sync without constant polling.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-World Cost Example"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Processing 10,000 customer support tickets monthly for sentiment analysis and categorization. Each prompt: ~500 input tokens, ~200 output tokens.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Real-time: (10,000 × 500 × \$3/1M) + (10,000 × 200 × \$15/1M) = \$45 + \$30 = \$75/month.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Batch API: same tokens, 50% discount = \$37.50/month. Over a year, you save \$450 on one workflow alone.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) provides a production-ready starter kit for batch processing with Claude, Next.js, and Supabase. It includes batch job management, status polling, result webhooks, and error retry logic.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use it as a foundation for your agent system—remove the boilerplate and focus on your business logic.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

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
          <p className="text-slate-300 mb-4 text-sm">{`Batch API halves your Claude costs for non-urgent tasks—start with the Pantheon starter kit and reclaim \$50+ monthly per AI workflow.`}</p>
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
