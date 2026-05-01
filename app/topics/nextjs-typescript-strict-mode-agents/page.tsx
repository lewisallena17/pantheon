import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import KitCTA from '@/components/KitCTA'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

export const metadata: Metadata = {
  title:       'Strict-Mode TypeScript for AI Agent Projects',
  description: 'Enable strict mode in TypeScript for AI agents. Catch runtime errors before deployment, improve Claude integration reliability, and ship production-ready systems.',
  openGraph: {
    title:       'Strict-Mode TypeScript for AI Agent Projects',
    description: 'Enable strict mode in TypeScript for AI agents. Catch runtime errors before deployment, improve Claude integration reliability, and ship production-ready systems.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-typescript-strict-mode-agents',
  },
  twitter: { card: 'summary_large_image', title: 'Strict-Mode TypeScript for AI Agent Projects', description: 'Enable strict mode in TypeScript for AI agents. Catch runtime errors before deployment, improve Claude integration reliability, and ship production-ready systems.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Strict-Mode TypeScript for AI Agent Projects"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Strict-mode TypeScript catches the type errors that crash AI agents in production—unknown property access, null dereferences, implicit any—before they hit your Claude API calls or Supabase queries.`}</p>


        {/* Above-fold display ad — placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <KitCTA variant="banner" />
        <DisplayAd slot="topic-top" format="auto" className="my-6" />
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Strict Mode Matters for AI Agent Systems"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI agents make decisions based on function outputs and database state. A single type error—like accessing \`response.data.user_id\` when \`data\` might be undefined—silently breaks your agent's reasoning loop. Strict mode forces you to handle these cases explicitly.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When your agent integrates with Claude via tool_use, malformed payloads get rejected. When querying Supabase for agent memory or context, missing fields cause deserialization failures. Strict TypeScript prevents both.`}</p>

        </section>

        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <KitCTA variant="inline" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Core Strict Flags for Agent Development"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Set these in tsconfig.json: noImplicitAny (all variables need explicit types), strictNullChecks (null and undefined are tracked separately), strictFunctionTypes (function parameter types must match exactly), and noImplicitThis (this context must be explicit).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For AI agents, strictNullChecks is non-negotiable. Your agent receives data from Claude's response, an LLM call might return null for optional fields, and your code must handle it. noImplicitAny prevents silent bugs when parsing agent prompts or tool definitions.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true
  }
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Typing Claude Tool Definitions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude agents need precise tool schemas. With strict TypeScript, you define a tool interface once and ensure your handler function matches exactly. If you add a required parameter to the schema but forget the handler, the compiler catches it.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Create discriminated unions for different tool types (e.g., SearchTool vs DatabaseTool). This forces your agent's dispatcher to handle every tool type, preventing unhandled cases that silently fail.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Type-Safe Supabase Queries in Agent Context"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent stores memory and context in Supabase. Strict TypeScript with generated types from Supabase ensures that when you fetch agent_state or conversation_history, the result shape is guaranteed.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use generated types from supabase-js or create explicit interfaces. If your schema adds a column, regenerate types and your agent code won't compile until you handle the new field. Zero surprise nulls at runtime.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`type Agent = Database['public']['Tables']['agents']['Row'];

const fetchAgentState = async (agentId: string): Promise<Agent> => {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();
  
  if (error || !data) throw new Error('Agent not found');
  return data; // typed as Agent
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Next.js API Routes with Strict Types"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent runs behind Next.js API routes that receive requests from Claude's message loop or external triggers. Strict TypeScript ensures request bodies are validated before processing.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Define request/response types for each endpoint. When your agent receives tool results from the client, strict types ensure you're not accessing missing fields or mismatched types.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo (github.com/lewisallena17/pantheon) demonstrates strict TypeScript in a production AI agent system. It includes Claude integration, Next.js API handlers, and Supabase schema with full type safety.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clone it as a reference or fork it as your starter kit. The tsconfig enforces strict mode globally, and every tool handler is typed against its schema definition.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Enable strict mode now, catch agent-breaking type errors at compile time, and deploy AI systems with confidence—get the starter kit and type definitions from Pantheon today.`}</p>
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
