import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Zero-to-One Multi-Agent AI System in TypeScript',
  description: 'Build a production-ready multi-agent AI system in TypeScript from scratch. Real patterns for Claude, Next.js, and Supabase — no hand-waving.',
  openGraph: {
    title:       'Zero-to-One Multi-Agent AI System in TypeScript',
    description: 'Build a production-ready multi-agent AI system in TypeScript from scratch. Real patterns for Claude, Next.js, and Supabase — no hand-waving.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/multi-agent-system-typescript-zero-to-one',
  },
  twitter: { card: 'summary_large_image', title: 'Zero-to-One Multi-Agent AI System in TypeScript', description: 'Build a production-ready multi-agent AI system in TypeScript from scratch. Real patterns for Claude, Next.js, and Supabase — no hand-waving.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Zero-to-One Multi-Agent AI System in TypeScript"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`This guide gives you a concrete, working architecture for a zero-to-one multi-agent AI system in TypeScript — covering agent orchestration, tool registration, memory persistence with Supabase, and a streaming Next.js frontend, so you ship something real instead of another demo.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"What 'Multi-Agent' Actually Means in Practice"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A multi-agent system is not just multiple API calls. It is a set of specialized agents — each with a defined role, tool access, and context window — coordinated by an orchestrator that routes tasks, aggregates results, and decides when the job is done.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For indie builders, the practical split is: one Orchestrator agent that breaks down the user goal, two or three Worker agents that execute discrete subtasks (web search, code execution, data retrieval), and a Critic agent that validates outputs before they surface to the user. This pattern keeps each agent's prompt focused and its failure surface small.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Defining Agent Roles and Tool Schemas in TypeScript"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Start by defining each agent as a typed object with a system prompt, an allowed tool list, and a max-token budget. TypeScript interfaces enforce this contract across your codebase and make it trivial to add agents later without breaking existing ones.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tools follow Claude's tool-use schema: a name, a description the model reads at inference time, and a Zod-validated input schema. Keeping tool definitions co-located with their implementation functions prevents the common bug where the schema drifts from the actual handler.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// agent.types.ts
import { z } from 'zod';

export interface AgentTool<T extends z.ZodTypeAny> {
  name: string;
  description: string;
  inputSchema: T;
  handler: (input: z.infer<T>) => Promise<string>;
}

export interface AgentConfig {
  id: string;
  systemPrompt: string;
  tools: AgentTool<z.ZodTypeAny>[];
  maxTokens: number;
}

// Example worker agent
const searchAgent: AgentConfig = {
  id: 'search-worker',
  systemPrompt: 'You retrieve and summarize web content. Return only facts.',
  tools: [webSearchTool],
  maxTokens: 1024,
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Orchestrator Loop and Claude API Integration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The orchestrator runs a loop: it calls Claude with the current task and tool list, checks whether Claude returned a tool_use block or a final text response, executes the tool if needed, appends the result to the message history, and loops until Claude returns a stop reason of 'end_turn'.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`One critical detail: pass the full message history on every turn, not just the last message. Claude's tool-use reliability drops sharply when it loses context about what it already tried. Cap history at a rolling window of the last 20 messages to stay within token limits.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Persisting Agent Memory with Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Short-term memory lives in the in-process message array. Long-term memory — summaries, user preferences, completed task records — lives in Supabase. A simple agent_runs table with a JSONB messages column and pgvector embeddings for semantic recall covers most indie-scale use cases.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Supabase Row Level Security from day one. Each agent run is scoped to a user_id, so you never accidentally leak one user's agent history to another. Adding RLS after the fact on a populated table is painful.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- supabase/migrations/001_agent_runs.sql
create table agent_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  goal        text not null,
  messages    jsonb not null default '[]',
  embedding   vector(1536),
  status      text check (status in ('running','complete','failed')),
  created_at  timestamptz default now()
);

alter table agent_runs enable row level security;

create policy "Users see own runs"
  on agent_runs for all
  using (auth.uid() = user_id);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Streaming Agent Output in a Next.js App Router Route"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wrap your orchestrator loop in a Next.js Route Handler that returns a ReadableStream. On the client, consume it with the Vercel AI SDK's useCompletion hook or a plain EventSource — both work. Stream each agent's intermediate reasoning steps, not just the final answer, so users see progress and trust the system.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Avoid the common mistake of awaiting the entire orchestrator run before responding. On long tasks, Vercel's 60-second function timeout will kill you. Stream early, flush often, and store the final result to Supabase so the client can poll for completion if the stream drops.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon is an open-source multi-agent starter kit built on exactly this stack — TypeScript, Claude, Next.js App Router, and Supabase. It ships with a working orchestrator loop, typed tool registration, Supabase migrations, and a streaming chat UI. You can clone it and have a running agent system in under an hour.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Find the repo, setup guide, and architecture notes at github.com/lewisallena17/pantheon. Issues and PRs are open — it is built for indie developers who want a real foundation, not a toy example.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Clone the Pantheon starter kit at github.com/lewisallena17/pantheon, follow the README to wire up your Claude API key and Supabase project, and ship your first zero-to-one multi-agent AI system in TypeScript this week — not this quarter.`}</p>
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
