import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Auto-Commit & Auto-Revert for AI-Generated Code',
  description: 'Safely deploy AI-generated code with automatic commit and rollback. Learn how to build reliable AI agent systems with Claude, Next.js, and Supabase.',
  openGraph: {
    title:       'Auto-Commit & Auto-Revert for AI-Generated Code',
    description: 'Safely deploy AI-generated code with automatic commit and rollback. Learn how to build reliable AI agent systems with Claude, Next.js, and Supabase.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/auto-commit-auto-revert-ai-code',
  },
  twitter: { card: 'summary_large_image', title: 'Auto-Commit & Auto-Revert for AI-Generated Code', description: 'Safely deploy AI-generated code with automatic commit and rollback. Learn how to build reliable AI agent systems with Claude, Next.js, and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Auto-Commit and Auto-Revert for AI-Generated Code"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Auto-commit and auto-revert patterns let you ship AI-generated code safely—Claude writes, your system commits atomically, and rolls back on errors without manual intervention.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Auto-Commit Matters for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When Claude generates code for your agent system, you need confidence it won't break production. Manual code review bottlenecks scale poorly. Auto-commit solves this by making AI output atomic and reversible—each generation either fully lands or fully reverts, never partial.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This is critical for indie teams. You can't afford to wake up at 3am debugging a half-applied migration. Auto-commit + auto-revert gives you the safety of a database transaction for your entire codebase.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"The Auto-Commit Pipeline"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A working pipeline has four stages: prompt Claude for code, validate syntax and lint, execute the change (git commit, database migration, file write), then monitor for errors in the next 30–60 seconds.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The validation step catches ~80% of issues before commit. Use TypeScript strict mode, ESLint with your house rules, and SQL type-checking via Supabase's pg_trgm or a Postgres schema validator.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Only proceed to commit if all checks pass. This prevents garbage code from landing in your main branch and triggering cascading rollbacks.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Validate before commit
const { data, error } = await supabase
  .from('code_generations')
  .insert({
    code: aiOutput,
    validated: await validateTypescript(aiOutput),
    committed_at: null
  });

if (!error && data[0].validated) {
  await execSync(\`git add . && git commit -m 'AI: \${description}'\`);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Auto-Revert Triggers and Thresholds"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set clear revert triggers: uncaught exceptions in the first minute, response time spikes >500ms, database query failures, or failed health checks. Each trigger should map to a rollback action.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Don't revert on every error—distinguish between transient failures (retry) and genuine bugs (revert). A single 503 shouldn't nuke your last 5 commits. Three consecutive 500s should.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementing with Claude, Next.js, and Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's API to generate code as a Next.js API route. Store pending generations in a Supabase table with status flags (pending, validated, committed, reverted). This gives you an audit trail and lets you pause the pipeline if needed.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your monitoring layer watches Supabase real-time subscriptions for error signals. On revert, run \`git revert <commit-hash>\` and update the database row to \`status: 'reverted'\` with a reason column for debugging.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling State Consistency"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The hardest part isn't code—it's keeping your git history, database schema, and runtime state in sync. After a revert, you must also roll back any migrations or data mutations that commit triggered.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store migration metadata in Supabase: which commit introduced which migration, timestamp, status. On revert, check if the commit included a migration, and if so, run the corresponding down() function before deleting the git commit.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project at github.com/lewisallena17/pantheon provides a production-ready starter kit for this exact workflow. It includes a Next.js orchestrator, Supabase schema migrations, Claude prompt templates, and example revert handlers.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, configure your API keys, and you have auto-commit + auto-revert running in your own CI/CD pipeline within an hour. The repo also includes a monitor dashboard to visualize which commits succeeded, reverted, or are pending validation.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Auto-commit and auto-revert transform AI code generation from risky to reliable—start with the Pantheon starter kit and deploy your first self-healing AI agent system today.`}</p>
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
