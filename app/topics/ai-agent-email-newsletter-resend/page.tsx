import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-email-newsletter-resend'

export const metadata: Metadata = {
  title:       'Autonomous Email Newsletters with Resend and AI',
  description: 'Build self-generating newsletters using Claude AI, Resend, and Next.js. Schedule autonomous email agents that write, format, and send without manual work.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-email-newsletter-resend',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-email-newsletter-resend',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-email-newsletter-resend',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
    },
  },
  openGraph: {
    title:       'Autonomous Email Newsletters with Resend and AI',
    description: 'Build self-generating newsletters using Claude AI, Resend, and Next.js. Schedule autonomous email agents that write, format, and send without manual work.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Autonomous Email Newsletters with Resend and AI', description: 'Build self-generating newsletters using Claude AI, Resend, and Next.js. Schedule autonomous email agents that write, format, and send without manual work.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Autonomous Email Newsletters with Resend and AI"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop writing newsletters manually—build an autonomous agent that generates, personalizes, and sends emails on a schedule using Claude, Resend, and serverless functions.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Autonomous Email Matters for Indie Developers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`As a founder, every hour spent writing and formatting emails is an hour not spent building product. Autonomous email agents solve this by delegating content generation to Claude while Resend handles reliable delivery at scale.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Unlike generic email tools, Claude understands context—your product updates, user behavior, newsletter tone—and generates authentic content that doesn't read like templates. Combined with Resend's transactional email infrastructure, you get a system that scales from 100 to 100K subscribers without overhead.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Claude + Resend + Next.js Functions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pattern is straightforward: a scheduled Next.js API route triggers Claude to generate newsletter content, then pipes the output directly to Resend for sending. Use Supabase to store subscriber lists and track which newsletters were sent to whom.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude handles the creative work—summarizing your latest features, writing subject lines, formatting in HTML. Resend manages authentication, bounce tracking, and compliance. Your Next.js route acts as the orchestrator, calling both APIs in sequence and logging results to your database.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function POST(req: Request) {
  const claude = new Anthropic();
  const msg = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'Write a brief product update email for our SaaS tool. Tone: friendly, technical.'
    }]
  });
  
  const emailContent = msg.content[0].type === 'text' ? msg.content[0].text : '';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'newsletter@yourdomain.com',
    to: subscriber.email,
    subject: 'Your Weekly Update',
    html: emailContent
  });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Scheduling with Vercel Cron or External Triggers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Vercel Cron Jobs (cron field in vercel.json) to trigger your newsletter function on a schedule—daily, weekly, or custom intervals. Alternatively, use a service like Trigger.dev or n8n for more complex workflows that might involve fetching data from your analytics or CRM first.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For multi-step workflows (fetch data → generate email → A/B test subject lines → send), orchestration tools prevent timeouts and add retry logic automatically. Keep the actual send operation within your Next.js function for simplicity.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Personalization Without Manual Segmentation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude can read subscriber metadata from Supabase (signup source, plan type, feature usage) and inject personalized details into each email. Instead of sending identical newsletters to everyone, each recipient gets content tailored to their context.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Query your Supabase table for subscriber cohorts, pass relevant user data to Claude's prompt, and have it adjust tone and content accordingly. This takes 30 seconds to set up and dramatically improves engagement rates.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Failures and Compliance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every send attempt to Supabase with timestamps and response codes. Resend returns detailed bounce and complaint data; query it regularly to maintain a clean list. Claude's outputs are deterministic given the same input, so you can safely regenerate content if needed.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For GDPR/CAN-SPAM: store explicit consent in your database, include unsubscribe links in every email (Resend has built-in support), and never send without a user's permission in the database.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) is a production-ready starter kit that wires together Claude, Resend, and Next.js with Supabase for subscriber management. It includes environment setup, cron configuration, error handling, and example prompts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it, add your API keys, and deploy to Vercel. Within minutes, you'll have a fully autonomous newsletter system generating and sending emails without touching a dashboard.`}</p>

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
            <li><a href="https://resend.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Resend</a> <span className="text-slate-500">— email API for developers</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Build your autonomous newsletter in an afternoon using Claude, Resend, and Pantheon—get the starter kit at github.com/lewisallena17/pantheon and start shipping.`}</p>
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
