import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-self-directed-goals'

export const metadata: Metadata = {
  title:       'Selbstgesteuerte Ziele für KI-Agenten | Claude + Next.js',
  description: 'Geben Sie Ihren Claude-KI-Agenten die Fähigkeit, ihre eigenen Ziele zu setzen und zu verfolgen. Erfahren Sie, wie Sie autonome Zielsetzung mit Next.js und Supab',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-self-directed-goals',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-self-directed-goals',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-self-directed-goals',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
    },
  },
  openGraph: {
    title:       'Selbstgesteuerte Ziele für KI-Agenten | Claude + Next.js',
    description: 'Geben Sie Ihren Claude-KI-Agenten die Fähigkeit, ihre eigenen Ziele zu setzen und zu verfolgen. Erfahren Sie, wie Sie autonome Zielsetzung mit Next.js und Supab',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Selbstgesteuerte Ziele für KI-Agenten | Claude + Next.js', description: 'Geben Sie Ihren Claude-KI-Agenten die Fähigkeit, ihre eigenen Ziele zu setzen und zu verfolgen. Erfahren Sie, wie Sie autonome Zielsetzung mit Next.js und Supab' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Selbstgesteuerte Ziele für KI-Agenten | Claude + Next.js"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Die meisten KI-Agenten führen Aufgaben aus, die Sie im Voraus definieren – aber selbstgesteuerte Ziele ermöglichen es Ihren Agenten, zu erkennen, was wichtig ist, autonome Prioritäten zu setzen und ihre Strategie ohne ständige menschliche Intervention anzupassen und verwandeln sie von Aufgabenausführern in Entscheidungsträger.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum selbstgesteuerte Ziele für KI-Agenten wichtig sind"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditionelle Agentur-Workflows erfordern, dass Sie das Ziel angeben, es in Schritte unterteilen und den Abschluss überwachen. Dies funktioniert bei gut definierten Aufgaben, scheitert aber, wenn Ihr Agent mit offenen Problemen, sich ändernden Prioritäten oder fehlendem Kontext konfrontiert wird. Selbstgesteuerte Ziele kehren das Modell um: Ihr Agent beobachtet seine Umgebung, erkennt, was getan werden muss, und bekennt sich zu messbaren Ergebnissen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Indie-Builder bedeutet dies weniger Prompt-Überarbeitungen, weniger Gerüst-Code und Agenten, die sich tatsächlich an reale Komplexität anpassen. Ein Kundendienst-Agent mit selbstgesteuerten Zielen bemerkt Ticket-Rückstände und eskaliert, ohne dass man es ihm sagen muss. Ein Datenverarbeitungs-Agent identifiziert Datenqualitätsprobleme und kennzeichnet sie proaktiv.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Das Kernmuster: Beobachten, Reflektieren, Festlegen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Selbstgesteuerte Ziele folgen einer dreistufigen Schleife. Erstens beobachtet Ihr Agent seinen aktuellen Zustand – welche Aufgaben existieren, welche Beschränkungen gelten, welche Metriken wichtig sind. Zweitens reflektiert es unter Verwendung von Claudes erweitertem Denken oder Tool-Nutzung, um zu entscheiden, welches Ziel sich lohnt zu verfolgen. Drittens bekennt es sich in Ihrer Datenbank zu diesem Ziel, erstellt eine Audit-Spur und verhindert widersprüchliche Ziele.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dieses Muster verhindert Halluzinationen (Agenten können nicht behaupten, sie arbeiten an Zielen, die nicht existieren) und hält Ihr System transparent. Sie können immer abfragen, welches Ziel Ihr Agent entschieden hat und warum.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementierung des Zielzustands in Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie Ziele als strukturierte Datensätze mit klaren Lebenszyklen-Zuständen. Ein Ziel sollte Erstellungs-Zeitstempel, die Begründung dahinter, aktuellen Status (aktiv, blockiert, abgeschlossen) und alle Kinderaufgaben, die es generiert hat, verfolgen. Verwenden Sie ein einfaches Enum für den Status und protokollieren Sie immer die Begründung des Agenten in einem Metadaten-Feld zum Debuggen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dieses Schema ermöglicht es Ihnen, aktive Ziele nach Agent abzufragen, blockierte Ziele für menschliche Eingriffe zu filtern und zu prüfen, warum Ihr Agent Ziel A gegenüber Ziel B gewählt hat. Es ist die Quelle der Wahrheit, auf die Ihre Claude-Aufrufe verweisen können, um Widersprüche zu vermeiden.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Supabase goal table
CREATE TABLE agent_goals (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  reasoning TEXT,
  status TEXT CHECK (status IN ('active', 'blocked', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_agent_active ON agent_goals(agent_id, status);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claudes Rolle: Zielvorschlag und Begründung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Claude als Ihre Ziel-Deliberations-Schicht. Übergeben Sie ihm den aktuellen Zustand (offene Aufgaben, Metriken, Beschränkungen) und bitten Sie ihn, ein einzelnes selbstgesteuertes Ziel mit expliziter Begründung vorzuschlagen. Verwenden Sie Tools, um Kontext aus Supabase zu holen, und speichern Sie dann das vorgeschlagene Ziel über Ihre Next.js-API zurück.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claudes native Fähigkeit, konkurrierende Prioritäten durchzudenken, macht es ideal für diesen Entscheidungspunkt. Sie bitten es nicht, das Ziel auszuführen – Sie bitten es zu entscheiden, welches Ziel es lohnt zu verfolgen, was eine Deliberationsaufgabe ist, die es gut bewältigt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Ziele mit Aktionen in Next.js verbinden"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Sobald ein Ziel festgelegt ist, verweist die Aktionsschicht Ihres Agenten darauf. In Next.js-API-Routes prüfen Sie das aktive Ziel, bevor Sie entscheiden, welche Tools aufgerufen werden. Dies verhindert, dass Ihr Agent abweicht: Jede Aktion sollte zum aktuellen Ziel führen oder explizit ein neues Ziel neu vorschlagen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Middleware oder einen Wrapper-Hook, um das aktive Ziel am Anfang jedes Agent-Zyklus zu holen. Wenn das Ziel unmöglich wird (eine Ressource verschwindet, eine Frist verstreicht), sollte Ihr Agent reflektieren und entweder sich zu einem Backup-Ziel bekennen oder eskalieren.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Umgang mit Zielkonflikten und Neuplanung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn Ihr Agent entdeckt, dass ein Ziel blockiert oder veraltet ist, sollte er nicht stillschweigend erneut versuchen. Stattdessen lösen Sie einen Reflexionszyklus aus: Fragen Sie ab, warum das Ziel fehlgeschlagen ist, schlagen Sie Alternativen vor und bekennen Sie sich zu einer neuen Richtung. Dies hält Protokolle sauber und verhindert Agent-Durcheinander.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Ihre Datenbank-Status-Flags, um aktive Ziele von blockierten zu unterscheiden, und protokollieren Sie den Blockierungsgrund. Wenn ein Mensch eingreifen muss, sieht er genau, warum der Agent steckengeblieben ist.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt (github.com/lewisallena17/pantheon) demonstriert selbstgesteuerte Zielmuster für Multi-Agent-Systeme. Es enthält eine Zielvorschlagsschicht, Supabase-Schema und Next.js-Endpunkte für Zielmanagement. Klonen Sie es, passen Sie den Ziel-Reasoning-Prompt an Ihre Domäne an und integrieren Sie es in Ihren bestehenden Claude + Supabase-Stack.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Selbstgesteuerte Ziele verwandeln Ihre KI-Agenten von Aufgabenausführern in autonome Entscheidungsträger – beginnen Sie, indem Sie Ziele in Supabase speichern, Claude verwenden, um über Prioritäten nachzudenken, und jede Aktion an ein festgelegtes Ziel zurückbinden. Holen Sie sich das vollständige Starter-Kit und Schema von Pantheon.`}</p>
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
