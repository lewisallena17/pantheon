import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-writes-own-code-auto-revert'

export const metadata: Metadata = {
  title:       'AI Agents That Edit Their Own Code Safely',
  description: 'Learn how to build AI agents using Claude that safely modify their own code. Includes sandboxing, validation, and Next.js implementation patterns.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-writes-own-code-auto-revert',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-writes-own-code-auto-revert',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-writes-own-code-auto-revert',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
    },
  },
  openGraph: {
    title:       'AI Agents That Edit Their Own Code Safely',
    description: 'Learn how to build AI agents using Claude that safely modify their own code. Includes sandboxing, validation, and Next.js implementation patterns.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'AI Agents That Edit Their Own Code Safely', description: 'Learn how to build AI agents using Claude that safely modify their own code. Includes sandboxing, validation, and Next.js implementation patterns.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"AI Agents That Edit Their Own Code Safely"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Let Claude safely modify, test, and deploy its own code changes without breaking your production system—using validation gates, sandboxed execution, and rollback mechanisms that work with real AI agent frameworks.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Self-Modifying Code Needs Guardrails"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents that can edit their own code run into the same problem every time: unbounded mutation. Claude might generate a fix that works in isolation but breaks downstream dependencies. It might optimize away error handling. It might introduce SQL injection vulnerabilities while solving a performance problem.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The solution isn't to disable self-modification—it's to add validation layers before code ever runs. You need syntax checking, type validation, test execution in a sandbox, and human approval gates for production changes. Build these right, and you get a system that learns and improves itself without catastrophic failure modes.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Sandboxing Code Execution with Docker or VM Isolation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Before an AI agent commits code changes, it must execute them in isolation. Use Docker containers or isolated Node.js VMs to run the generated code. Create a temporary database clone, spin up the modified service in a container, run your test suite, and verify no regressions occur.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This approach works especially well with Next.js API routes: generate a modified endpoint, test it against known requests, measure latency and error rates, then approve or reject based on metrics. Keep the sandbox tight—no network access, limited memory, strict timeouts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`If the agent is modifying database schemas, use transactions with automatic rollback. Test migrations on a copy of production data before touching the real thing.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Validation Gates: AST Parsing and Type Checking"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Not all generated code is executable code. Before sandboxing, validate the structure. Parse TypeScript with a tool like TypeScript's compiler API or Babel, check for disallowed patterns (eval, dangerous Node APIs, hardcoded credentials), and verify type safety.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For database changes, validate SQL syntax and schema constraints. Use a SQL parser to catch injection patterns. For API routes, ensure the function signature matches your contract.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A simple approach: reject any code containing eval, require() outside a whitelist, or process.env access in generated methods. Reject any SQL that drops tables without an explicit admin flag.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const code = \`
const handler = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [req.query.id]
  );
  return res.json(result);
};
\`;
const hasEval = /\beval\s*\(/.test(code);
const hasDrop = /\bDROP\s+TABLE/i.test(code);
if (hasEval || hasDrop) throw new Error('Pattern blocked');
`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Test-Driven Code Generation with Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Prompt Claude to generate code with tests. Use the extended thinking feature to have Claude reason through edge cases before writing. Structure prompts to request unit tests alongside implementation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Provide Claude with your existing test suite and ask it to ensure all tests pass. Give it a schema document and ask it to verify migrations are backward-compatible. The more constraints you encode in the prompt, the fewer regressions you see in sandbox runs.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Approval Workflows and Audit Logs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Even validated code should require human approval before reaching production. Store each generated change in a Supabase table with the original prompt, Claude's reasoning, test results, and approval status. Build a dashboard showing pending agent changes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Log every execution. Who approved it, when it ran, what metrics changed, any errors that followed. This creates accountability and makes it easy to trace bugs back to a specific agent modification.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project at github.com/lewisallena17/pantheon provides a working reference implementation for AI agents that safely modify code. It includes sandboxed execution patterns, Supabase schema for tracking changes, Next.js API endpoints for deployment, and Claude integration with validation gates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Study how Pantheon structures its prompts to include test-generation instructions, how it orchestrates sandbox runs before approval, and how it logs changes to a persistent audit trail. You can adapt these patterns into your own system or fork Pantheon as a starting point.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Build self-improving AI agents by layering validation, sandboxing, and approval workflows—download the Pantheon starter kit to see working code patterns for Claude-powered self-modification with safety guardrails.`}</p>
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
