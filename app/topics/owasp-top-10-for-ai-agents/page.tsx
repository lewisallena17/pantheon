import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import NewsletterSignup from '@/components/NewsletterSignup'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'OWASP Top 10 for AI Agent Systems | Security Guide',
  description: 'Secure your Claude AI agents against injection, data leakage, and model manipulation. OWASP Top 10 applied to Next.js agent architectures.',
  openGraph: {
    title:       'OWASP Top 10 for AI Agent Systems | Security Guide',
    description: 'Secure your Claude AI agents against injection, data leakage, and model manipulation. OWASP Top 10 applied to Next.js agent architectures.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/owasp-top-10-for-ai-agents',
  },
  twitter: { card: 'summary_large_image', title: 'OWASP Top 10 for AI Agent Systems | Security Guide', description: 'Secure your Claude AI agents against injection, data leakage, and model manipulation. OWASP Top 10 applied to Next.js agent architectures.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"OWASP Top 10 Applied to AI Agent Systems"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`AI agents built with Claude and Next.js face unique security risks that traditional web app frameworks don't catch—learn how to apply OWASP Top 10 principles to prevent prompt injection, unauthorized model access, and data exposure in production agent systems.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Prompt Injection: The New SQL Injection"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Prompt injection attacks manipulate Claude's behavior by injecting malicious instructions into user-controlled input. Unlike SQL injection, the 'syntax' is natural language, making detection harder. An attacker can override your system prompt, extract training data references, or trigger unintended model behaviors.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Mitigation: Never concatenate user input directly into prompts. Use Claude's native system vs. user message separation, validate input length, and implement output filtering. Consider using function calling exclusively for sensitive operations—Claude respects tool boundaries better than free-form text constraints.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Bad: vulnerable to injection
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: \`Analyze: \${userInput}\` // Attacker controls this
  }]
});

// Good: structured, bounded
const response = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  system: 'You are a data analyst. Only use provided tools.',
  messages: [{
    role: 'user',
    content: userInput.slice(0, 500) // Bounded input
  }],
  tools: [{ name: 'analyze_data', ... }] // Constrained outputs
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Sensitive Data Exposure in Agent Memory"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents maintain conversation history and retrieved context. If stored in Supabase without encryption, API keys, user PII, or proprietary data can leak. Claude itself doesn't 'remember' between API calls—your backend does. That's your attack surface.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Encrypt sensitive fields at rest using Supabase's pgcrypto or application-level encryption. Log what the agent sees; use row-level security (RLS) policies. Never log full API responses containing credentials. Implement automatic redaction of PII before storing conversation context.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Model Denial of Service & Token Exhaustion"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Attackers can craft inputs designed to maximize token consumption, draining your API budget or causing timeouts. Agents with web search or document retrieval can be manipulated into processing enormous contexts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set hard limits: max_tokens parameter capped in code (not configurable), rate limiting per user, and input size checks before calling Claude. Monitor token spend via Anthropic's dashboard. Use Claude's caching feature for repetitive contexts to reduce costs and improve latency.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Broken Access Control in Agent Tooling"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agents call external tools (databases, APIs, file systems). If the agent runs with over-privileged credentials or tools lack caller authentication, an attacker can leverage the agent to access restricted resources.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Principle of least privilege: each agent should connect to resources with minimal scopes. Use separate Supabase service roles, API keys, or database users for different agent workflows. Validate that the end user requesting an action has authorization before the agent executes the tool. Audit tool calls server-side, not just client-side.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Insecure Deserialization & Code Injection via Model Output"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`If you parse Claude's output as code (eval, JSON.parse without validation, or direct template rendering), malicious or confused model outputs can execute arbitrary code or SQL.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Always validate model output structure before use. Parse JSON with strict schemas (zod, ajv). For code generation, use sandboxed runtimes or static analysis. Never eval() model output. Treat Claude's responses as untrusted user input—because in the attack model, an attacker controls the prompt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Using Components & Reference Implementations"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository (github.com/lewisallena17/pantheon) provides production-ready patterns for secure AI agent architectures on Next.js and Supabase. It demonstrates safe prompt templating, tool integration guardrails, memory encryption, and audit logging—all aligned with OWASP principles for AI systems.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork Pantheon as your starter kit. It handles the boilerplate of secure agent scaffolding so you can focus on your business logic without reinventing security controls.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <NewsletterSignup source={`topic:owasp-top-10-for-ai-agents`} />

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
          <p className="text-slate-300 mb-4 text-sm">{`Secure your AI agent system today by applying OWASP Top 10 patterns—use bounded prompts, encrypted agent memory, least-privilege tooling, and strict output validation. Start with Pantheon and adapt it to your Claude agent architecture.`}</p>
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
