import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/command-palette-ctrl-k-dashboard'

export const metadata: Metadata = {
  title:       'Command Palette (Ctrl+K) for Your Dashboard',
  description: 'Add a keyboard-driven command palette to your Next.js dashboard. Speed up navigation for AI agent systems built with Claude and Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/command-palette-ctrl-k-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/command-palette-ctrl-k-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/command-palette-ctrl-k-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
    },
  },
  openGraph: {
    title:       'Command Palette (Ctrl+K) for Your Dashboard',
    description: 'Add a keyboard-driven command palette to your Next.js dashboard. Speed up navigation for AI agent systems built with Claude and Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Command Palette (Ctrl+K) for Your Dashboard', description: 'Add a keyboard-driven command palette to your Next.js dashboard. Speed up navigation for AI agent systems built with Claude and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Adding a Command Palette (Ctrl+K) to Your Dashboard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`A command palette lets your users instantly navigate, execute actions, and search without touching the mouse—turning your dashboard into a power-user tool that feels native and responsive.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Command Palettes Matter for Agent Dashboards"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Command palettes (Cmd+K or Ctrl+K) have become table stakes in modern software. They reduce friction: instead of hunting through nested menus, users type what they want and hit enter. For AI agent dashboards, this is critical—your users need to quickly trigger agent runs, switch between models, adjust parameters, or navigate to specific logs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pattern works especially well for indie builders because it scales. Add one new feature? Add one new command. No UI redesign needed. Your dashboard grows without bloating the interface.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Core Architecture: Command Registry Pattern"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The cleanest approach is a command registry—a centralized object that maps command IDs to handlers. Each command has a label, description, category, and optional keyboard shortcut.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your command palette component queries this registry, filters by user input, and executes the selected handler. Separate your data layer from UI: this makes testing simple and reusing commands across features (keyboard shortcuts, context menus, automation rules) trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const commands = {
  'agent.run': {
    label: 'Run Agent',
    category: 'Agent',
    handler: (agentId) => triggerAgentRun(agentId),
  },
  'model.switch': {
    label: 'Switch Model',
    category: 'Settings',
    handler: (modelId) => updateModel(modelId),
  },
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"UI Implementation: Search, Filter, Execute"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a modal overlay with a search input. On each keystroke, filter your command registry by label and description using fuzzy matching (libraries like \`fuse.js\` work well). Display results with keyboard navigation—arrow keys to move, Enter to execute, Esc to close.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`For Supabase-backed dashboards, commands can fetch real-time data: 'Switch to agent' might query your agents table, letting users pick from live records. Bind Ctrl+K globally using a library like \`cmdk\` or \`command-palette\`.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integration with Claude and Agent Workflows"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Commands become especially powerful when wired to Claude. Map commands to prompt templates: 'Debug agent run' could open a modal that generates a Claude-powered analysis of the last failure. 'Generate test case' might call Claude to produce test inputs based on your agent's schema.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store command history in Supabase for audit trails and analytics. Track which commands your users invoke most—this signals which features matter and guides your roadmap.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Keyboard Navigation and Accessibility"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Make navigation feel instant. Debounce search at 100-150ms. Pre-render top results. Use WAI-ARIA roles (\`role="listbox"\`, \`aria-selected\`) so screen readers understand the palette. Support arrow keys, Enter, and Escape.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Offer command aliases ('ra' for 'Run Agent') and remember recently used commands. Show shortcuts inline so users discover keyboard bindings without documentation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project on GitHub (github.com/lewisallena17/pantheon) provides a full command palette implementation for AI agent dashboards. It includes a Next.js component, Supabase schema for storing commands and logs, and integration examples with Claude API calls. Fork it, customize commands for your agent system, and deploy.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`A command palette transforms your dashboard from clickable to powerful—adopt the pattern now, and your users will thank you with faster workflows and better retention.`}</p>
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
