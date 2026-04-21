import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Task Inbox Approval Workflow for AI Agents',
  description: 'Add human-in-the-loop task approvals to Claude AI agents. Build secure approval workflows with Next.js, Supabase, and real-time notifications.',
  openGraph: {
    title:       'Task Inbox Approval Workflow for AI Agents',
    description: 'Add human-in-the-loop task approvals to Claude AI agents. Build secure approval workflows with Next.js, Supabase, and real-time notifications.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/task-inbox-approval-workflow-ai-agents',
  },
  twitter: { card: 'summary_large_image', title: 'Task Inbox Approval Workflow for AI Agents', description: 'Add human-in-the-loop task approvals to Claude AI agents. Build secure approval workflows with Next.js, Supabase, and real-time notifications.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Adding a Task Inbox Approval Workflow to AI Agents"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stop letting your AI agents run unsupervised—implement a task inbox approval workflow that keeps critical decisions under human control while maintaining automation speed.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Your AI Agents Need Approval Workflows"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude agents can execute complex tasks autonomously, but some decisions shouldn't bypass human judgment. Approval workflows let you define which agent actions require sign-off before execution, catching edge cases and preventing costly mistakes without killing productivity.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A task inbox system sits between agent decision-making and action execution. The agent identifies what needs doing, submits it to your approval interface, and waits for a human to review context and approve (or reject) before proceeding. This pattern works for payment processing, customer communications, data deletions, or any high-stakes operation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Agent → Inbox → Action"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your workflow splits into three layers. First, your Claude agent runs tool calls and detects tasks requiring approval. Second, those tasks land in a Supabase database table with full context—what the agent wants to do, why, and what data it's operating on. Third, your Next.js dashboard queries that inbox, displays pending tasks with rich context, and provides approve/reject buttons that trigger the next agent step.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store tasks in Supabase with fields for agent_id, task_type, payload (the actual work), context (reasoning), status, and reviewer metadata. Use real-time subscriptions so your UI updates instantly when new tasks arrive or when approvers take action.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the Approval Endpoint"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Next.js API route handles both fetching pending tasks and processing approvals. When an approver clicks 'approve', send the decision back to your agent system with the original task payload. The agent resumes with that decision and either executes the action or moves to a fallback branch.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Make your endpoint idempotent—if an approval request retries, it shouldn't double-execute. Use Supabase transactions to atomically update task status and trigger downstream logic.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/tasks/[id]/approve.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { id } = req.query;
  const { approved } = req.body;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  
  const { error } = await supabase
    .from('agent_tasks')
    .update({ status: approved ? 'approved' : 'rejected', reviewed_at: new Date() })
    .eq('id', id);
  
  if (error) return res.status(500).json({ error });
  res.status(200).json({ success: true });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-Time Task Notifications"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase's real-time subscriptions to push new tasks to reviewers instantly. In your Next.js component, subscribe to changes on the agent_tasks table and update local state when new approvals arrive. This keeps your inbox UI fresh without polling.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Filter subscriptions by status='pending' to avoid noise from completed tasks. Include task context in the subscription payload so reviewers see full decision-making rationale without extra API calls.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Rejections and Fallbacks"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When an approver rejects a task, your agent needs to know. Pass rejection reasons back to Claude with context about why the human said no. The agent can then try an alternative approach, escalate to a supervisor, or log the decision for audit trails.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store rejection metadata—who rejected it, timestamp, reason—in the same tasks table. This creates a complete audit log of all agent decisions and human interventions, which is critical for compliance and debugging.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project at github.com/lewisallena17/pantheon provides a complete reference implementation of agent task approval workflows. It includes a working Claude agent system, a Supabase schema for task storage, and a Next.js dashboard with real-time inbox updates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork or reference the repo to bootstrap your own approval system. The codebase demonstrates how to structure agent tool calls that trigger approvals, how to query the inbox, and how to close the loop when humans make decisions. All code is TypeScript and production-ready.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Add a task inbox approval workflow to keep your Claude agents fast while maintaining human control—use Pantheon as your reference implementation and launch a secure approval system in hours, not weeks.`}</p>
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
