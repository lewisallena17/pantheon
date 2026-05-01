import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Supabase Migrations: Numbering and Ordering Guide',
  description: 'Master Supabase migration numbering and ordering to prevent schema conflicts in multi-developer AI agent projects. Learn best practices for reliable deployments.',
  openGraph: {
    title:       'Supabase Migrations: Numbering and Ordering Guide',
    description: 'Master Supabase migration numbering and ordering to prevent schema conflicts in multi-developer AI agent projects. Learn best practices for reliable deployments.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/supabase-migrations-best-practices',
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Migrations: Numbering and Ordering Guide', description: 'Master Supabase migration numbering and ordering to prevent schema conflicts in multi-developer AI agent projects. Learn best practices for reliable deployments.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Migrations — Numbering and Ordering"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Migration ordering in Supabase determines whether your schema deploys correctly or fails silently—and getting it wrong breaks production databases when multiple developers ship changes simultaneously.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Migration Order Matters in Team Development"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase migrations run sequentially by timestamp. If two developers create migrations at nearly the same time, Postgres executes them in lexicographic order by filename, not creation order. This causes foreign key violations, missing columns, and index failures when migration A depends on a table created in migration B.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In AI agent systems with Claude and Next.js, your database schema often changes weekly—adding vector columns, audit tables, or embedding storage. Without strict ordering conventions, your staging and production environments diverge, and deployments fail at 2 AM.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Timestamp-Based Numbering: The Standard Approach"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase uses the format \`YYYYMMDDHHMMSS_descriptive_name.sql\`. The timestamp prefix ensures chronological execution. Generate this in your migration script: \`date +%Y%m%d%H%M%S\` on Unix, or use your migration tool's built-in generator.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Example filenames: \`20250115143022_create_agents_table.sql\`, \`20250115143045_add_embeddings_column.sql\`. The second migration runs after the first, every time, across every environment.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Migration: 20250115143022_create_agents_table.sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT DEFAULT 'claude-opus',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: 20250115143045_add_embeddings_column.sql
ALTER TABLE agents ADD COLUMN embeddings vector(1536);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Preventing Conflicts with Strict Ordering Rules"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Never manually edit timestamps. Always generate new ones via your migration CLI. In Next.js projects using Supabase, use \`supabase migration new <name>\` to auto-timestamp.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`If migrations are created seconds apart, their timestamps naturally order correctly. If a developer creates two migrations offline, timestamps may collide—use a unique suffix: \`20250115143022_01_schema.sql\`, \`20250115143022_02_permissions.sql\`.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Out-of-Order Execution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`If you discover a migration ran in the wrong order (rare, but possible with version control conflicts), don't re-order—create a new migration that fixes the schema state. Supabase tracks executed migrations in \`schema_migrations\` table; re-running old migrations causes errors.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agent databases, this means if migration A adds a permissions table and migration B references it, never swap their order retroactively. Write migration C to handle the dependency cleanup if needed.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Testing Migrations Locally Before Deployment"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use \`supabase start\` to spin up a local Postgres instance and run migrations in real order. This catches dependency issues before they hit staging or production. Reset and re-run migrations during development with \`supabase db reset\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In CI/CD pipelines for Claude-powered systems, validate migration syntax and ordering before merging to main: \`supabase migration list\` shows execution order, \`supabase db push\` applies them safely.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon Repo"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repository at github.com/lewisallena17/pantheon demonstrates production-grade migration structuring for AI agent backends. It enforces timestamp-based ordering, includes rollback strategies, and shows how to version schema alongside Claude integrations.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it to see real migrations for agent state tables, vector storage, and audit logging—complete with Next.js API routes that depend on specific schema versions.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Use auto-generated timestamps for every migration, never manually edit order, and validate locally before deploying—start with the Pantheon template to ship reliable AI agent systems without schema conflicts.`}</p>
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
