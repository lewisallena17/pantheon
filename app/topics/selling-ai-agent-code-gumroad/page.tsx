import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Selling AI Agent Code on Gumroad — A Playbook',
  description: 'Learn how to package and sell Claude-powered AI agents on Gumroad. Step-by-step guide for indie developers building Next.js + Supabase systems.',
  openGraph: {
    title:       'Selling AI Agent Code on Gumroad — A Playbook',
    description: 'Learn how to package and sell Claude-powered AI agents on Gumroad. Step-by-step guide for indie developers building Next.js + Supabase systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/selling-ai-agent-code-gumroad',
  },
  twitter: { card: 'summary_large_image', title: 'Selling AI Agent Code on Gumroad — A Playbook', description: 'Learn how to package and sell Claude-powered AI agents on Gumroad. Step-by-step guide for indie developers building Next.js + Supabase systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Selling AI Agent Code on Gumroad — A Playbook"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Most indie developers build AI agents in isolation—but the real opportunity is packaging your agent architecture, prompts, and integrations as a reusable product that other builders will pay for, and this playbook shows you exactly how to structure, price, and launch on Gumroad.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why AI Agent Code Sells on Gumroad"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents are expensive to build from scratch. A developer looking to add Claude-powered automation to their SaaS stack doesn't want to start from zero—they want a battle-tested agent template with working integrations, prompt chains, and error handling already solved.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Gumroad's creator economy pricing model (\$10–\$99 per license) maps perfectly to agent code. You're not competing on volume; you're competing on specificity and quality. A well-built agent that solves one problem deeply outperforms generic boilerplate.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structuring Your Agent Package for Sale"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Successful agent products on Gumroad follow a consistent structure: a production-ready Next.js API route that orchestrates Claude calls, a Supabase schema for state and memory, prompt templates organized by use case, and clear documentation on customization.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Package your agent as a monorepo. Include \`/lib/agent\` (core orchestration logic), \`/pages/api/agent\` (HTTP endpoint), \`/migrations\` (Supabase SQL setup), and \`/prompts\` (versioned system and user prompts). This makes it immediately fork-able.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/agent.ts - Standard entry point buyers expect
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  const { userMessage } = req.body;
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: 'You are a research assistant.',
    messages: [{ role: 'user', content: userMessage }]
  });
  res.status(200).json({ message: response.content[0].text });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pricing and Packaging Tiers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't charge per-seat or per-API-call. Charge per license—usually \$29 for a single-developer license, \$79 for small teams. Gumroad handles licensing enforcement; you just document what each tier includes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tier 1 (\$29): Base agent code + setup guide. Tier 2 (\$79): Agent + advanced prompts + Supabase schema + video walkthrough. Tier 3 (\$199+): Agent + source code + commercial license + email support. This structure captures different buyer segments without complexity.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Documentation That Converts Buyers"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your README is your sales page. Include: what the agent does (one sentence), what problems it solves (three bullets), a working example (screenshot or gif), setup time (should be <5 min), required keys (API key links), and one customization example.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Add a CUSTOMIZATION.md explaining how to swap system prompts, change the Claude model, or add tool integrations. Buyers want to know they can adapt it—show them they can without rewriting half the code.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation Reference"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`If you want to study a real production agent architecture before building for sale, the Pantheon repo at github.com/lewisallena17/pantheon contains a fully working Claude agent system with Next.js routing, Supabase integrations, and prompt versioning. Fork it, study the \`/lib/agent\` structure, and adapt the patterns for your own product.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon codebase demonstrates how to handle multi-turn conversations, tool calls, and memory persistence—all critical for an agent product that buyers will integrate into production systems.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Launch Mechanics: Email List First"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't launch silently. Build a 200-person email list before you submit to Gumroad. Post in Claude Discord communities, AI subreddits, and indie hacker spaces with a 48-hour early-access link. First buyers seed your Gumroad review score.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Price the first 20 licenses at 40% off as 'founder pricing.' This creates urgency and locks in testimonials. Then revert to full price. Gumroad's algorithm surfaces products with recent sales velocity, so that first week matters.`}</p>

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
            <li><a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Anthropic</a> <span className="text-slate-500">— Claude API</span></li>
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Package your agent as a documented, production-ready monorepo, price it clearly in Gumroad's creator tiers, and launch with an email list—then watch indie developers pay for code that would take them weeks to build from scratch.`}</p>
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
