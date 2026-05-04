import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/command-palette-ctrl-k-dashboard'

export const metadata: Metadata = {
  title:       'Befehlspalette (Ctrl+K) für Ihr Dashboard',
  description: 'Fügen Sie eine tastaturgesteuerte Befehlspalette zu Ihrem Next.js-Dashboard hinzu. Beschleunigen Sie die Navigation für KI-Agent-Systeme, die mit Claude und Sup',
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
    title:       'Befehlspalette (Ctrl+K) für Ihr Dashboard',
    description: 'Fügen Sie eine tastaturgesteuerte Befehlspalette zu Ihrem Next.js-Dashboard hinzu. Beschleunigen Sie die Navigation für KI-Agent-Systeme, die mit Claude und Sup',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Befehlspalette (Ctrl+K) für Ihr Dashboard', description: 'Fügen Sie eine tastaturgesteuerte Befehlspalette zu Ihrem Next.js-Dashboard hinzu. Beschleunigen Sie die Navigation für KI-Agent-Systeme, die mit Claude und Sup' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Befehlspalette (Ctrl+K) für Ihr Dashboard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Eine Befehlspalette ermöglicht es Ihren Benutzern, sofort zu navigieren, Aktionen auszuführen und zu suchen, ohne die Maus zu berühren – und verwandelt Ihr Dashboard in ein Werkzeug für Poweruser, das sich nativ und reaktionsschnell anfühlt.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Befehlspaletten für Agent-Dashboards wichtig sind"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Befehlspaletten (Cmd+K oder Ctrl+K) sind in moderner Software zum Standard geworden. Sie reduzieren Reibung: Statt durch verschachtelte Menüs zu suchen, tippen Benutzer das ein, was sie wollen, und drücken Enter. Für KI-Agent-Dashboards ist dies kritisch – Ihre Benutzer müssen schnell Agent-Läufe auslösen, zwischen Modellen wechseln, Parameter anpassen oder zu spezifischen Logs navigieren können.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Muster funktioniert besonders gut für unabhängige Entwickler, weil es skaliert. Eine neue Funktion hinzufügen? Einen neuen Befehl hinzufügen. Kein UI-Redesign nötig. Ihr Dashboard wächst, ohne die Schnittstelle zu überlasten.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Kernarchitektur: Command-Registry-Muster"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der sauberer Ansatz ist eine Command-Registry – ein zentrales Objekt, das Befehls-IDs auf Handler abbildet. Jeder Befehl hat ein Label, eine Beschreibung, eine Kategorie und optional eine Tastenkombination.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihre Befehlspaletten-Komponente fragt diese Registry ab, filtert nach Benutzereingabe und führt den ausgewählten Handler aus. Trennen Sie Ihre Datenschicht von der UI: Dies macht Tests einfach und ermöglicht es, Befehle über Funktionen hinweg (Tastenkombinationen, Kontextmenüs, Automatisierungsregeln) zu wiederverwenden.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"UI-Implementierung: Suchen, Filtern, Ausführen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie eine modale Überlagerung mit einem Sucheingabefeld. Bei jedem Tastenanschlag filtern Sie Ihre Command-Registry nach Label und Beschreibung mithilfe von Fuzzy Matching – Bibliotheken wie \`fuse.js\` funktionieren gut. Zeigen Sie Ergebnisse mit Tastaturnavigation an – Pfeiltasten zum Verschieben, Enter zum Ausführen, Esc zum Schließen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Supabase-gestützte Dashboards können Befehle Echtzeitdaten abrufen: 'Zu Agent wechseln' könnte Ihre Agents-Tabelle abfragen und Benutzern ermöglichen, aus Live-Datensätzen auszuwählen. Binden Sie Ctrl+K global ein, indem Sie eine Bibliothek wie \`cmdk\` oder \`command-palette\` verwenden.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integration mit Claude und Agent-Workflows"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Befehle werden besonders kraftvoll, wenn sie mit Claude verdrahtet sind. Befehle auf Prompt-Vorlagen abbilden: 'Agent-Lauf debuggen' könnte ein Modal öffnen, das eine Claude-gestützte Analyse des letzten Fehlers generiert. 'Testfall generieren' könnte Claude aufrufen, um Testeingaben basierend auf dem Schema Ihres Agents zu erstellen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie Befehlsverlauf in Supabase für Audit-Trails und Analysen. Verfolgen Sie, welche Befehle Ihre Benutzer am meisten aufrufen – dies signalisiert, welche Funktionen wichtig sind, und leitet Ihre Roadmap.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Tastaturnavigation und Barrierefreiheit"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Gestalten Sie die Navigation sofort. Debounce-Suche bei 100–150ms. Pre-rendern Sie die Top-Ergebnisse. Verwenden Sie WAI-ARIA-Rollen (\`role="listbox"\`, \`aria-selected\`), damit Bildschirmleser die Palette verstehen. Unterstützen Sie Pfeiltasten, Enter und Escape.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Bieten Sie Befehls-Aliase ('ra' für 'Run Agent') und merken Sie sich zuletzt verwendete Befehle. Zeigen Sie Tastenkombinationen inline an, damit Benutzer Tastaturkürzel ohne Dokumentation entdecken.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt auf GitHub (github.com/lewisallena17/pantheon) bietet eine vollständige Befehlspaletten-Implementierung für KI-Agent-Dashboards. Es enthält eine Next.js-Komponente, ein Supabase-Schema zum Speichern von Befehlen und Logs sowie Integrationsbeispiele mit Claude-API-Aufrufen. Forken Sie es, passen Sie Befehle für Ihr Agent-System an und stellen Sie es bereit.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Eine Befehlspalette verwandelt Ihr Dashboard von anklickbar in kraftvoll – übernehmen Sie das Muster jetzt, und Ihre Benutzer werden sich mit schnelleren Workflows und besserer Retention bedanken.`}</p>
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
