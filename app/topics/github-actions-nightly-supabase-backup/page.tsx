import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Nightly Supabase Backups via GitHub Actions',
  description: 'Automate nightly Supabase backups using GitHub Actions. Protect your AI agent data with zero-cost scheduled backups for Next.js apps.',
  openGraph: {
    title:       'Nightly Supabase Backups via GitHub Actions',
    description: 'Automate nightly Supabase backups using GitHub Actions. Protect your AI agent data with zero-cost scheduled backups for Next.js apps.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/github-actions-nightly-supabase-backup',
  },
  twitter: { card: 'summary_large_image', title: 'Nightly Supabase Backups via GitHub Actions', description: 'Automate nightly Supabase backups using GitHub Actions. Protect your AI agent data with zero-cost scheduled backups for Next.js apps.' },
}

export default function Topic() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <Link href="/topics" className="hover:text-cyan-400">topics</Link>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Nightly Supabase Backups via GitHub Actions"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop worrying about Supabase data loss—set up nightly backups in under 30 minutes using GitHub Actions, no third-party services required.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why GitHub Actions for Supabase Backups"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`GitHub Actions gives you 2,000 free minutes per month on private repos. For indie developers, that's unlimited nightly backups at zero marginal cost. Unlike manual exports or paid backup services, Actions integrates directly into your existing workflow without new infrastructure.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you're running Claude-powered agents that depend on Supabase as the source of truth, data loss isn't just inconvenient—it breaks your system. Nightly backups mean you can recover in hours, not days.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up the GitHub Actions Workflow"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create a \`.github/workflows/backup-supabase.yml\` file in your repository. The workflow should trigger on a schedule (cron expression for 2 AM UTC works well for most teams), authenticate to Supabase via API key, export your database, and commit the backup to a separate branch or cloud storage.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`You'll need two secrets in your GitHub repo: \`SUPABASE_URL\` and \`SUPABASE_SERVICE_KEY\`. The service key has full database access and should only be used in Actions—never commit it to your repo.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`name: Nightly Supabase Backup
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup Supabase
        env:
          SUPABASE_URL: \${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: \${{ secrets.SUPABASE_SERVICE_KEY }}
        run: |
          npm install @supabase/supabase-js
          node backup.js`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Exporting Data with the Supabase API"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use the Supabase management API to export your database as SQL or JSON. A Node.js script can fetch all tables, transform them into backup-friendly formats, and commit them to Git. This approach works for databases under 1GB; larger databases may need PostgreSQL's native pg_dump tool.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store backups in a dedicated \`backups/\` folder on a separate branch, or push them to an S3 bucket if you prefer cloud storage over Git history.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Restoring from Backups"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When disaster strikes, restoration is one SQL query away. Run your backup file against your Supabase database using the SQL editor in the dashboard, or pipe it through \`psql\` if you have direct PostgreSQL access. Test restore procedures quarterly—backups are only useful if they actually work.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agent systems, ensure your backup includes all vector embeddings, agent state tables, and conversation history. Missing a single critical table defeats the purpose.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoring and Alerting"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`GitHub Actions logs tell you if backups succeeded or failed, but add a slack notification step so you see failures immediately. A failed backup that goes unnoticed is worse than no backup at all.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Track backup file sizes over time to catch runaway growth early. If your backup suddenly jumps from 50MB to 500MB, something's probably wrong with your cleanup jobs.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project on GitHub (github.com/lewisallena17/pantheon) provides a complete, production-ready implementation of Supabase backups via GitHub Actions. It includes the workflow YAML, backup script, restore utilities, and monitoring setup. Fork it as a starter template for your Next.js + Supabase project.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon handles vector embeddings, handles large tables efficiently, and includes retry logic for flaky network conditions—all the edge cases you'll hit in production.`}</p>

        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>

        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Set up nightly Supabase backups in 30 minutes using GitHub Actions—grab the Pantheon starter kit to automate data protection for your AI agent systems.`}</p>
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
