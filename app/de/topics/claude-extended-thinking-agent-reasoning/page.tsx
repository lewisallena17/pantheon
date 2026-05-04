import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/claude-extended-thinking-agent-reasoning'

export const metadata: Metadata = {
  title:       'Claude Extended Thinking für Agent-Reasoning',
  description: 'Ermögliche komplexes mehrstufiges Reasoning in KI-Agenten mit Claudes Extended Thinking. Baue intelligentere autonome Systeme mit Next.js und Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-extended-thinking-agent-reasoning',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-extended-thinking-agent-reasoning',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-extended-thinking-agent-reasoning',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
    },
  },
  openGraph: {
    title:       'Claude Extended Thinking für Agent-Reasoning',
    description: 'Ermögliche komplexes mehrstufiges Reasoning in KI-Agenten mit Claudes Extended Thinking. Baue intelligentere autonome Systeme mit Next.js und Supabase.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Claude Extended Thinking für Agent-Reasoning', description: 'Ermögliche komplexes mehrstufiges Reasoning in KI-Agenten mit Claudes Extended Thinking. Baue intelligentere autonome Systeme mit Next.js und Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Extended Thinking für Agent-Reasoning"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Extended Thinking ermöglicht es Claude-Agenten, mehrstufige Probleme vor der Handlung zu durchdenken, was die Entscheidungsqualität in Produktionssystemen dramatisch verbessert—hier erfährst du, wie du es für dein Indie-Projekt implementierst.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Extended Thinking für Agent-Systeme wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Standard Claude-Responses erfolgen in einem Durchgang. Für Agenten, die echte Business-Logik verarbeiten—Datenbankabfragen, mehrstufige Workflows, Finanzberechnungen—reicht das nicht aus. Extended Thinking zwingt das Modell, das Problem durchzudenken, Edge Cases zu erfassen und seine eigene Logik zu validieren, bevor es antwortet.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn dein Agent Datenmutationen kontrolliert oder externe APIs aufruft, kann eine Single-Pass-Response Fehler downstream propagieren. Extended Thinking fungiert als interner Sparring-Partner und reduziert Halluzinationen, wobei die Genauigkeit bei komplexen Reasoning-Aufgaben um 15-40% verbessert wird.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Wie Extended Thinking in Claude funktioniert"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Extended Thinking verwendet den \`thinking\` Block-Parameter in Claudes API. Du sendest eine Anfrage mit \`budgetTokens\`, das auf das Thinking-Limit gesetzt ist (typischerweise 5000-10000), und Claude teilt Tokens für internes Reasoning zu, bevor es die endgültige Response generiert.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der Denkprozess des Modells ist in deiner Output verborgen—du siehst nur die endgültige Schlussfolgerung. Das bedeutet, dass du besseres Reasoning erhältst, ohne deine Response Tokens zu vergrößern oder deine Benutzer mit innerem Monolog zu verwirren.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await anthropic.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000
  },
  messages: [{
    role: 'user',
    content: 'Validate this database schema and suggest optimizations'
  }]
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integration von Extended Thinking in Next.js Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In deiner Next.js API Route wickelst du den Anthropic Client-Aufruf ein und handhabst den Thinking-Response-Typ. Übergebe Tool-Definitionen für Datenbankabfragen oder externe API-Aufrufe—das Extended Thinking wird durchdenken, welche Tools aufgerufen werden sollen und in welcher Reihenfolge.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cache die Thinking Tokens, wenn du ähnliche Agent-Aufgaben wiederholt verarbeitest. Dies reduziert Latenz und Kosten, besonders nützlich für High-Volume Indie-SaaS-Anwendungen, wo jede Millisekunde zählt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Wann Extended Thinking vs. Standard Calls verwendet werden"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwende Extended Thinking für: mehrstufige Entscheidungslogik, Datenvalidierung vor Mutationen, komplexe Schema-Analyse und Agent-Schleifen mit Tool-Nutzung. Überspringe es für einfache Lookups, Echtzeit-Chat oder Klassifizierungsaufgaben—du verschwendest nur Tokens und Latenz.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Eine praktische Regel: Wenn dein Agent über Konsequenzen nachdenken muss, bevor er handelt, aktiviere Thinking. Wenn es nur um Umformatierung oder Datenabruf geht, spare die Budget Tokens.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Reales Beispiel: Database Schema Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stell dir einen Agent vor, der eingehende Datenbankschema-Änderungen in Supabase validiert. Extended Thinking ermöglicht es ihm, durchzudenken: ob Spalten in Konflikt stehen, ob Indizes notwendig sind, ob Migrationen Tabellen sperren könnten, und welche optimale Reihenfolge ist. Ohne Thinking könnte es gefährliche Änderungen parallel vorschlagen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der Agent verwendet Tools zum Abfragen deines bestehenden Schemas, denkt dann Einschränkungen durch, bevor er ein Migrationsskript zurückgibt. Extended Thinking erfasst Edge Cases, die deine Unit Tests möglicherweise übersehen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon Repo (github.com/lewisallena17/pantheon) bietet ein produktionsreifes Agent-Framework mit vorkonfiguriertem Extended Thinking. Es beinhaltet Next.js API Handler, Supabase Integration Patterns und Beispiel-Tool-Definitionen für häufige Indie-Developer-Aufgaben.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forke es, um Boilerplate zu überspringen: Tool Registry, Fehlerbehandlung, Token Budgeting und Thinking Response Parsing sind bereits verdrahtet. Füge deine eigene Business-Logik hinzu und deploye auf Vercel.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Aktiviere Claudes Extended Thinking in deinem Agent-System noch heute—forke Pantheon, integriere den Thinking Parameter und versende intelligentere autonome Workflows, die nachdenken, bevor sie handeln.`}</p>
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
