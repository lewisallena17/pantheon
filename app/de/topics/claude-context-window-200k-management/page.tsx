import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/claude-context-window-200k-management'

export const metadata: Metadata = {
  title:       'Verwaltung von Claudes 200k-Kontextfenster in großem Maßstab',
  description: 'Erfahren Sie, wie Sie Prompts strukturieren, effizient cachen und produktive KI-Agenten mit Claudes 200k-Kontext erstellen. Reale Muster für Next.js + Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-context-window-200k-management',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-context-window-200k-management',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-context-window-200k-management',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
    },
  },
  openGraph: {
    title:       'Verwaltung von Claudes 200k-Kontextfenster in großem Maßstab',
    description: 'Erfahren Sie, wie Sie Prompts strukturieren, effizient cachen und produktive KI-Agenten mit Claudes 200k-Kontext erstellen. Reale Muster für Next.js + Supabase.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Verwaltung von Claudes 200k-Kontextfenster in großem Maßstab', description: 'Erfahren Sie, wie Sie Prompts strukturieren, effizient cachen und produktive KI-Agenten mit Claudes 200k-Kontext erstellen. Reale Muster für Next.js + Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Verwaltung von Claudes 200k-Kontextfenster in großem Maßstab"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Claudes 200k-Kontextfenster ist leistungsstark—aber nur, wenn Sie Ihr System so gestalten, dass es verwendet wird, ohne Token zu verschwenden oder auf Latenz-Grenzen zu treffen—so machen es produktive Teams.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum die Skalierung des Kontextfensters für KI-Agenten wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ein 200k-Kontextfenster bedeutet, dass Sie ~150 Seiten Dokumentation, Gesprächsverlauf und Systeminstruktionen in einer einzigen Anfrage passen können. Für unabhängige Entwickler, die Agenten erstellen, entfällt bei vielen Anwendungsfällen die Notwendigkeit für komplexe Retrieval-Augmented-Generation-Ketten (RAG). Sie können ganze Codebasen, Benutzerdatenbanken oder Wissensdatenbanken direkt in den Prompt laden.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der Kompromiss: Jedes Token kostet Geld und Latenz verschärft sich. Wenn Sie alle 200k Token in jede Anfrage dumpen, zahlen Sie für Kontext, den Sie nicht verwenden, und verlangsamen die Antwortzeiten. Die echte Fertigkeit besteht darin zu wissen, welcher Kontext ins Fenster gehört und welcher in eine Vektordatenbank gehört.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Strukturierung von Prompts für Skalierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beginnen Sie mit einer dreilagigen Prompt-Architektur: Systeminstruktionen (500–1000 Token), anfragespezifischer Kontext (variabel) und Benutzereingabe. Systeminstruktionen sollten unveränderlich sein—die Persönlichkeit, Fähigkeiten und Beschränkungen Ihres Agenten. Anfragkontext ist dynamisch: API-Schemas, relevante Dokumente, Benutzerhistorie.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Claudes system-Parameter separat von der Nachricht, nicht verkettetet in einen riesigen Prompt. Dies hält Cache-Treffer stabil und macht Prompt-Engineering testbar. Für mehrteilige Gespräche, fügen Sie verwandte Anfragen zusammen, um Cache-Blöcke wiederzuverwenden.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: [
      { type: 'text', text: 'You are a code generation agent.' },
      { type: 'text', text: systemDocs, cache_control: { type: 'ephemeral' } }
    ],
    messages: [
      { role: 'user', content: userQuery }
    ]
  })
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Prompt-Caching für Token-Effizienz"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude unterstützt Prompt-Caching—die gleichen Systeminstruktionen oder Dokumentationen, auf die wiederholt zugegriffen wird, werden zwischengespeichert und nach der ersten Anfrage zu 10% der normalen Token-Kosten berechnet. Für Agenten, die Hunderte von Anfragen ausführen, ist dies entscheidend.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cachen Sie wiederverwendbare Blöcke: API-Dokumentation, Framework-Leitfäden, Benutzerkontext. Setzen Sie cache_control: { type: 'ephemeral' } auf Textblöcke, die sich zwischen Anfragen nicht ändern. Überwachen Sie die Cache-Hit-Raten in Ihrer Analyse; eine Hit-Rate von 50%+ bedeutet, dass Sie den Kontext richtig strukturieren.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Zuordnungsstrategie für Kontextfenster"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Reservieren Sie ~50k Token für die Antwort und interne Überlegungen des Modells. Das lässt ~150k für Input. Zuordnung: 10% für Systeminstruktionen, 30% für anfragespezifischen Kontext (API-Schemas, relevante Dokumente), 60% für dynamische Benutzerdaten (Gesprächsverlauf, Dateiinhalte, Datenbankdatensätze). Passen Sie diese Verhältnisse basierend auf der Aufgabe Ihres Agenten an.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Erstellen Sie einen Token-Counter in Ihre Anfrage-Pipeline. Wenn dynamischer Kontext Ihr Budget übersteigt, kürzen Sie nach Aktualität für Gespräche oder nach Relevanz-Score für Dokumente. Lassen Sie eine Anfrage niemals aufgrund der Länge fehlschlagen; anmutige Verkürzung hält den Agenten betriebsbereit.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Datenbankdesign für Agentenkontext"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Supabase strukturieren Sie eine conversations-Tabelle mit user_id, agent_id, message_history (JSONB) und Metadaten-Spalten. Speichern Sie den vollständigen Gesprächsverlauf, aber fügen Sie nur die letzten 20–50 Runden in jede API-Anfrage ein. Verwenden Sie JSONBs PostgreSQL für flexibles Schema und Window-Funktionen, um den neuesten Kontext zu holen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Erstellen Sie eine separate documents-Tabelle (content, embedding, tokens) für langformatige Inhalte. Fragen Sie nach semantischer Ähnlichkeit ab (mit pgvector) oder nach explizitem context_tag. Dieser Hybrid-Ansatz vermeidet es, die gesamte Wissensdatenbank in jede Anfrage zu laden, während Hot-Daten unmittelbar verfügbar bleiben.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Überwachung und Kostenkontrolle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Protokollieren Sie jeden API-Aufruf mit tokens_input, tokens_cache_creation, tokens_cache_read und tokens_output. Diese Telemetrie ist wesentlich für die Optimierung der Kontextzuordnung. Legen Sie Warnungen fest, wenn durchschnittliche tokens_input Ihr Ziel überschreiten—dies signalisiert normalerweise, dass Sie zu ausführlich mit Kontext sind.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Berechnen Sie die echte Kosten pro Anfrage: (input_tokens + cache_creation_tokens) / 1M * \$3 + (cache_read_tokens / 1M * \$0,30) + Ausgabenkosten. Wenn Sie Cache-Vorteil sehen (cache_read >> cache_creation), wissen Sie, dass Ihre Prompt-Struktur funktioniert.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Beginnen Sie mit Prompt-Caching und einer dreilagigen Kontextstruktur—messen Sie die Token-Nutzung rücksichtslos—und Sie bauen Agenten, die skalieren, ohne Kosten oder Reaktionsfähigkeit zu verlieren. Holen Sie sich das vollständige Starter Kit und beginnen Sie mit der Verwaltung Ihres 200k-Fensters heute.`}</p>
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
