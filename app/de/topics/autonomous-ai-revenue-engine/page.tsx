import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/autonomous-ai-revenue-engine'

export const metadata: Metadata = {
  title:       'Aufbau einer autonomen KI-Einnahmemaschine',
  description: 'Erfahren Sie, wie Sie selbstgesteuerte KI-Agenten mit Claude erstellen, die Umsatz generieren. Echte Muster für Indie-Entwickler mit Next.js, Supabase und auton',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/autonomous-ai-revenue-engine',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/autonomous-ai-revenue-engine',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/autonomous-ai-revenue-engine',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
    },
  },
  openGraph: {
    title:       'Aufbau einer autonomen KI-Einnahmemaschine',
    description: 'Erfahren Sie, wie Sie selbstgesteuerte KI-Agenten mit Claude erstellen, die Umsatz generieren. Echte Muster für Indie-Entwickler mit Next.js, Supabase und auton',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Aufbau einer autonomen KI-Einnahmemaschine', description: 'Erfahren Sie, wie Sie selbstgesteuerte KI-Agenten mit Claude erstellen, die Umsatz generieren. Echte Muster für Indie-Entwickler mit Next.js, Supabase und auton' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Aufbau einer autonomen KI-Einnahmemaschine"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Hören Sie auf, KI-Chatbots zu bauen, die bei jedem Schritt menschliche Eingaben benötigen – bauen Sie stattdessen autonome Agenten, die Chancen erkennen, Transaktionen ausführen und ohne Eingriff Umsatz generieren.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Die Kernschleife: Wahrnehmung, Entscheidung, Ausführung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Eine umsatzgenerierende KI-Engine benötigt drei eng gekoppelte Systeme. Erstens Wahrnehmung: Ihr Agent nimmt kontinuierlich Marktdaten, Benutzerverhalten oder Geschäftsmetriken über APIs oder Datenbankabfragen auf. Zweitens Entscheidung: Claude evaluiert, was passiert ist, wendet Ihre Geschäftslogik an und entscheidet über die nächste Aktion. Drittens Ausführung: Der Agent führt diese Aktion tatsächlich aus – erstellt eine Anzeige, belastet eine Karte, aktualisiert den Bestand oder triggert einen Workflow.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die meisten Indie-Projekte scheitern, weil sie diese lose verdrahten. Ihre Wahrnehmungsebene wird einmal pro Tag aktualisiert. Ihre Entscheidungslogik folgt drei verschiedenen Codepfaden mit inkonsistenten Ergebnissen. Ihre Ausführung ruft die falsche API auf. Autonome Umsatzgenerierung bedeutet, diese Schleife als eine einzige, deterministische Maschine zu behandeln, die kontinuierlich läuft.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Verbindung von Claude mit Ihrer Datenschicht"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude benötigt Echtzugriff auf Ihren Geschäftszustand. Verwenden Sie tool_use, um Claude Abfragen an Supabase durchführen zu lassen, Ihre APIs aufzurufen oder den Live-Bestand zu überprüfen. Definieren Sie Tools, die strukturierte JSON zurückgeben – nicht rohe Datenbankabzüge. Ein Tool namens \`check_inventory\` sollte \`{sku: string, quantity: number, reorder_threshold: number}\` zurückgeben, nicht eine Tabelle mit 500 Zeilen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Halten Sie die Latenz unter 2 Sekunden pro Agent-Entscheidungszyklus. Speichern Sie Tools und Datenbankabfragen aggressiv. Wenn Ihr Agent entscheidet, ob ein Artikel zum Verkauf gekennzeichnet werden soll, benötigt er keine historischen Kundendaten aus dem Jahr 2019.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const tools = [
  {
    name: 'check_inventory',
    description: 'Query current stock levels for a SKU',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' }
      },
      required: ['sku']
    }
  },
  {
    name: 'create_listing',
    description: 'Publish a product to marketplace',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'integer' }
      },
      required: ['sku', 'price', 'quantity']
    }
  }
];`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Aufbau zuverlässiger Entscheidungslogik"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lassen Sie Claude nicht frei laufen. Geben Sie ihm ein klares Ziel, Einschränkungen und Fallback-Regeln. Statt "Umsatz optimieren" sagen Sie "wenn Bestand > 500 Einheiten und Lieferantenkosten < \$12, listen Sie zu \$29,99; wenn < 100 Einheiten, aus dem Verkauf nehmen; immer 20% Marge halten."`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Claudes erweitertes Denken für komplexe Entscheidungen. Lassen Sie es mehrstufige Szenarien durchdenken – sollten wir den Preis senken, um Bestand zu räumen, oder warten auf Saisonnachfrage? Wickeln Sie dieses Denken aber in einer State Machine ein: ausstehende Entscheidung → Claude evaluiert → Denken protokollieren → Aktion ausführen → Ergebnis überprüfen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Überwachung und Schaltkreisunterbrecher"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ein autonomer Agent, der kaputt geht, kostet Sie Geld in Echtzeit. Implementieren Sie harte Limits: maximale Transaktionsgröße, maximale Preisänderung pro Zyklus, maximale API-Aufrufe pro Minute. Protokollieren Sie jede Entscheidung und Ausführung. Verwenden Sie Supabase, um Agent-Traces zu speichern – was hat der Agent beobachtet, was hat er entschieden, was war das Ergebnis?`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Richten Sie Warnungen für Anomalien ein. Wenn Ihr Agent plötzlich 100 Anzeigen erstellt, wenn er normalerweise 3 erstellt, stimmt etwas nicht. Beenden Sie die Schleife, untersuchen Sie, beheben Sie.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Skalierung über einen einzelnen Agent hinaus"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beginnen Sie mit einer autonomen Schleife. Sobald sie stabil ist und Umsatz generiert, fügen Sie mehr hinzu. Ein Agent verwaltet Bestand, ein anderer Preise, ein anderer Kundensupport. Verwenden Sie Next.js API-Routes als Koordinator – sie rufen Claude parallel auf, aggregieren Entscheidungen, führen sicher aus.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase-Warteschlangen und Edge Functions ermöglichen es Ihnen, Agenten mit der richtigen Häufigkeit für jede Aufgabe auszuführen. Preaktualisierungen könnten alle 10 Minuten ausgeführt werden. Bestandsprüfungen jede Stunde. Erkennung neuer Gelegenheiten jeden Tag.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt unter github.com/lewisallena17/pantheon demonstriert ein produktionsreifes autonomes Agent-System, das mit Claude, Next.js und Supabase erstellt wurde. Es enthält Entscheidungsprotokollierung, Tool-Calling-Muster, State Management und Multi-Agent-Koordination. Verwenden Sie es als Referenz oder forken Sie es direkt – es ist genau für diesen Anwendungsfall gebaut.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Erstellen Sie Ihre erste autonome Umsatzschleife, indem Sie Claude mit Ihren Daten verbinden, klare Entscheidungsregeln definieren und Überwachung hinzufügen – beginnen Sie mit dem Pantheon-Starter-Kit und versenden Sie diese Woche.`}</p>
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
