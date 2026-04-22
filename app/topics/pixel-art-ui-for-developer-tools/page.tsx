import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Pixel-Art UI for Developer Dashboards | Claude + Next.js',
  description: 'Build retro pixel-art dashboards for AI agent systems. Learn component patterns, state management, and real implementation examples for indie developers.',
  openGraph: {
    title:       'Pixel-Art UI for Developer Dashboards | Claude + Next.js',
    description: 'Build retro pixel-art dashboards for AI agent systems. Learn component patterns, state management, and real implementation examples for indie developers.',
    type:        'article',
    url:         'https://task-dashboard-sigma-three.vercel.app/topics/pixel-art-ui-for-developer-tools',
  },
  twitter: { card: 'summary_large_image', title: 'Pixel-Art UI for Developer Dashboards | Claude + Next.js', description: 'Build retro pixel-art dashboards for AI agent systems. Learn component patterns, state management, and real implementation examples for indie developers.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Pixel-Art UI for Developer Dashboards"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Pixel-art UI cuts through dashboard bloat—faster load times, lower complexity, and a visual style that actually scales with your indie product as it grows.`}</p>

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Pixel-Art Works for Agent Dashboards"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agent systems generate a lot of noise: logs, token counts, branching decision trees, vector embeddings. Pixel-art constraints force you to display only what matters. Each pixel must earn its place. This isn't nostalgia—it's information design.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Claude agent dashboard needs to show LLM state, memory chunks, tool invocation chains, and cost metrics without overwhelming the operator. Pixel grids naturally organize these into readable layers. Compare that to shadcn dropdowns and charts: beautiful, but they bloat bundle size and cognitive load.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Indie developers shipping fast win with simpler styling systems. CSS grid snaps to pixel units. Sprites load once. Accessibility is explicit—no hover states hiding critical data.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Component Patterns for Agent Monitoring"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`A pixel-art dashboard typically uses 4–5 core components: status tiles (agent state: idle/running/error), metric bars (token usage, cost), log viewers (scrollable monospace grids), and tool cards (which functions fired, their inputs/outputs).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Each component should be a single-responsibility React component. Status tiles are fixed-size squares with a background color and a single label. Metric bars are horizontal fills with a max value. Log viewers are virtual lists (use react-window if you have 1000+ entries) with fixed-width fonts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use CSS classes for theming rather than inline styles. A single .pixel-dashboard class controls all children, making it trivial to swap between retro green-screen, monochrome, or neon skins.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export const AgentStatusTile = ({ status, label }: { status: 'idle' | 'running' | 'error'; label: string }) => {
  const bgColor = status === 'running' ? 'bg-yellow-300' : status === 'error' ? 'bg-red-400' : 'bg-green-400';
  return (
    <div className={\`w-24 h-24 \${bgColor} border-2 border-black flex items-center justify-center text-xs font-bold\`}>
      {label}
    </div>
  );
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"State Management with Supabase Real-Time"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pixel-art dashboards work best with Supabase subscriptions. Your Claude agent logs events to a Supabase table: agent_runs (id, status, tokens_used, created_at, output). The Next.js dashboard subscribes to changes and re-renders only affected rows.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This keeps your frontend simple: one useEffect sets up the subscription, state updates flow automatically. No polling, no stale data. Your 50 indie users see live agent behavior without hammering your API.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Structure your schema for pixel-art simplicity: avoid nested JSON where possible. Flat tables are easier to visualize as grids.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Performance: Why Pixel-Art Scales"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pixel art sprites are inherently small: a 32×32 icon as PNG is <2KB. No SVG parsing overhead. A full icon set (50 icons) fits in <100KB. Compare that to a single icon font or a Figma export suite.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`CSS for pixel alignment uses \`image-rendering: pixelated\` and \`transform: scale(2)\` to avoid blur. No JavaScript animation libraries needed. Transitions use plain CSS transforms.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dashboard bundle size stays under 50KB (gzipped) when you skip animations, shadows, and rounded corners. Your agent system can focus on compute, not UI rendering.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating with Claude Agent Loops"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent makes tool calls → logs them → dashboard displays them in real-time. Each tool invocation is a row in your pixel grid: tool name, input parameters, output, latency.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use Claude's native tool_use block to structure outputs your dashboard can parse. A TypeScript interface matching your tool response schema means type-safe rendering.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Display token usage per-step so you can audit cost. A running total bar fills as your agent thinks. Visual feedback keeps users confident the system is working.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo (github.com/lewisallena17/pantheon) is a production-ready pixel-art dashboard template built for Claude agent systems. It includes Next.js components, Supabase schema, and example integrations with the Anthropic SDK.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pantheon gives you: pre-built tiles for agent state, a log viewer with syntax highlighting for JSON, cost tracking, and a tool inspector. Fork it, swap in your Supabase project credentials, and ship.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Start with Pantheon, ship your pixel-art dashboard in a weekend, and keep your agent system dashboard maintainable as you scale.`}</p>
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
