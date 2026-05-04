import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/curiosity-driven-agent-exploration'

export const metadata: Metadata = {
  title:       'Neugiergetriebene Exploration in KI-Agenten',
  description: 'Erstellen Sie KI-Agenten, die Problemräume autonomen erkunden. Erfahren Sie, wie Sie Neugier-Mechanismen in Claude-gestützten Systemen mit Next.js und Supabase ',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/curiosity-driven-agent-exploration',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/curiosity-driven-agent-exploration',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/curiosity-driven-agent-exploration',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
    },
  },
  openGraph: {
    title:       'Neugiergetriebene Exploration in KI-Agenten',
    description: 'Erstellen Sie KI-Agenten, die Problemräume autonomen erkunden. Erfahren Sie, wie Sie Neugier-Mechanismen in Claude-gestützten Systemen mit Next.js und Supabase ',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Neugiergetriebene Exploration in KI-Agenten', description: 'Erstellen Sie KI-Agenten, die Problemräume autonomen erkunden. Erfahren Sie, wie Sie Neugier-Mechanismen in Claude-gestützten Systemen mit Next.js und Supabase ' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Neugiergetriebene Exploration in KI-Agenten"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Neugiergetriebene Exploration ermöglicht es Ihren KI-Agenten, autonomen Lösungen zu entdecken, anstatt starren Pfaden zu folgen – und spart Entwicklungszeit sowie erschließt emergente Verhaltensweisen, die Sie nicht explizit programmiert haben.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Neugier im Agent-Design wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditionelle KI-Agenten führen vordefinierte Workflows aus. Neugiergetriebene Agenten bewahren intrinsische Motivation – sie erkunden unsichere Zustände, testen Hypothesen und verfeinern ihr eigenes Verständnis. Das ist wichtig, da Ihr Indie-Produkt Edge Cases und Benutzermuster ohne Hardcoding jedes Szenarios handhaben kann.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Claude-gestützte Systeme reduzieren Neugier-Mechanismen den Prompt-Engineering-Overhead. Anstatt erschöpfende Anweisungen zu schreiben, definieren Sie Reward-Signale und lassen den Agenten den Lösungsraum erkunden. Der Agent lernt, welche Fragen zu stellen sind, welche Daten Priorität haben, und wann er verwirrt genug ist, um um Hilfe zu bitten.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Uncertainty Sampling implementieren"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der Kern von Neugier ist die Quantifizierung von Unsicherheit. Ein praktischer Ansatz: Verfolgen Sie Konfidenzwerte bei Agent-Entscheidungen und priorisieren Sie Zustände mit hoher Unsicherheit für tiefere Erkundung.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Ihren Next.js API-Routes speichern Sie Agent-Entscheidungshistorien in Supabase mit Konfidenz-Metadaten. Wenn ein Agent auf eine Entscheidung mit <0,6 Konfidenz trifft, lösen Sie erweiterte Überlegungen oder Human-Review-Schleifen aus. Das verhindert zuverlässliche Halluzinationen und ermöglicht autonomes Wachstum.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function evaluateAgentUncertainty(agentId: string, decision: string, confidence: number) {
  const { data } = await supabase
    .from('agent_decisions')
    .insert([
      { agent_id: agentId, decision, confidence, explored_at: new Date() }
    ])
    .select();
  
  if (confidence < 0.6) {
    return { action: 'explore', flagForReview: true };
  }
  return { action: 'execute' };
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Reward Signals für autonomes Lernen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Neugier-Agenten optimieren auf Informationsgewinn, nicht nur Aufgabenvollendung. Definieren Sie Rewards für: Entdeckung neuer Lösungsmuster, Reduktion von Vorhersagefehlern bei gehaltenen Testfällen und Auflösung mehrdeutiger Eingaben.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Ihrer Claude Agent-Schleife betten Sie Feedback von jedem Explorationsversuch ein. Supabase wird zum Gedächtnis Ihres Agenten – speichern Sie Ergebnisse, Argumentationsketten und Was-funktioniert/Was-nicht. Claudes Kontextfenster ermöglicht es Ihnen, kürzliche erfolgreiche Explorationen als In-Context-Beispiele zurückzuführen und das Lernen ohne Umschulung zu beschleunigen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Explorationszustand strukturieren"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Neugier ohne Struktur wird zum Chaos. Verwenden Sie einen begrenzten Explorationsraum: Definieren Sie, welche Domänen der Agent untersuchen kann, setzen Sie Iterationsgrenzen und verwalten Sie eine Prioritätswarteschlange unentdeckter Hypothesen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihr Supabase-Schema sollte enthalten: exploration_targets (zu lösende Probleme), hypothesis_log (getestete Theorien) und outcome_metrics (Erfolgs-/Fehlerdaten). Dies ermöglicht es Ihnen, das Agent-Verhalten zu visualisieren, seltsame Explorationsmuster zu debuggen und zu identifizieren, wo der Agent in Schleifen steckenbleibt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Human-in-the-Loop Feedback integrieren"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die leistungsstärksten neugiergetriebenen Systeme sind nicht vollständig autonom – sie wissen, wann sie fragen sollen. Entwerfen Sie Kontrollpunkte, an denen Agenten Ergebnisse Gründern/Benutzern präsentieren, externe Validierung erhalten und ihre Erkundung basierend auf Feedback anpassen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Next.js erstellen Sie ein Dashboard, das Entscheidungen mit hoher Unsicherheit anzeigt. Benutzer geben Labels oder Korrektionen ein; führen Sie diese als starke Reward-Signale an den Agenten zurück. Dies schließt die Schleife: Neugier + menschliches Urteilsvermögen = schnelles, begründetes Lernen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon Framework (github.com/lewisallena17/pantheon) bietet eine produktionsreife Vorlage für neugiergetriebene Claude-Agenten. Es enthält Unsicherheitsquantifizierung, Explorations-Logging und ein Next.js Dashboard zur Überwachung des Agent-Verhaltens.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Klonen Sie das Repo, verbinden Sie Ihre Supabase-Anmeldedaten, und Sie haben einen funktionierenden Agenten, der erkundet, lernt und bericht erstattet. Die Codebasis zeigt Zustandsverwaltungsmuster, Reward-Berechnung und Integration mit Claudes API in echten TypeScript-Beispielen, die Sie sofort anpassen können.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Neugiergetriebene Exploration verwandelt Ihre KI-Agenten von starren Task-Executorn in adaptive Lerner – schnappen Sie sich das Pantheon Starter Kit und deployen Sie autonome Systeme, die mit jeder Benutzerinteraktion intelligenter werden.`}</p>
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
