import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-debugging-trace-replay'

export const metadata: Metadata = {
  title:       'Debugging von KI-Agenten mit Trace Replay | Claude',
  description: 'Lernen Sie, KI-Agenten Schritt für Schritt mit Trace Replay zu debuggen. Erfassen Sie Agent-Entscheidungen, spielen Sie Fehler ab und beheben Sie Produktionspro',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-debugging-trace-replay',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-debugging-trace-replay',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-debugging-trace-replay',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
    },
  },
  openGraph: {
    title:       'Debugging von KI-Agenten mit Trace Replay | Claude',
    description: 'Lernen Sie, KI-Agenten Schritt für Schritt mit Trace Replay zu debuggen. Erfassen Sie Agent-Entscheidungen, spielen Sie Fehler ab und beheben Sie Produktionspro',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Debugging von KI-Agenten mit Trace Replay | Claude', description: 'Lernen Sie, KI-Agenten Schritt für Schritt mit Trace Replay zu debuggen. Erfassen Sie Agent-Entscheidungen, spielen Sie Fehler ab und beheben Sie Produktionspro' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Debugging von KI-Agenten mit Trace Replay | Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Trace Replay ermöglicht es Ihnen, jede Entscheidung Ihres KI-Agenten aufzuzeichnen und dann rückwärts durch Fehler zu gehen, um genau herauszufinden, wo das Reasoning fehlgeschlagen ist – wodurch sich die Debugging-Zeit von Stunden auf Minuten verkürzt.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Standard-Logging für KI-Agenten versagt"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditionelle Logs zeigen Ihnen, *was* passiert ist, nicht *warum* Ihr Agent eine bestimmte Aktion gewählt hat. Wenn Claudes Tool Calls schiefgehen oder eine mehrstufige Reasoning-Kette abweicht, müssen Sie den Kontext manuell rekonstruieren.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Debuggen von KI-Agenten erfordert Sichtbarkeit in: Token-Zählungen an Entscheidungspunkten, exakte Prompt-Kontexte für jeden Schritt, Tool-Ausgaben, die einen Branch auslösten, und die Konfidenz des Modells an jedem Knoten. Eine einzelne print-Anweisung wird Ihnen das nicht geben.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Wie Trace Replay den Agent-Status erfasst"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace Replay zeichnet den vollständigen Execution Graph Ihres Agenten auf: an Claude gesendete Nachrichten, verfügbare Tool-Definitionen, empfangene Tool-Ergebnisse und verbrauchte Tokens. Jeder Knoten ist mit Zeitstempel versehen und indiziert.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Anstatt einen fehlgeschlagenen Agent von vorne auszuführen (teuer und nicht-deterministisch mit Claude), spielen Sie ab einem beliebigen Checkpoint ab. Sie springen zu Schritt 7 von 12, inspizieren den exakten Kontext, den Claude sah, ändern eine Tool-Antwort und spulen vor, um zu sehen, wie sich das Reasoning ändert.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies ist besonders leistungsstark für Agenten, die externe APIs aufrufen – Sie erfassen die Live-API-Antwort und spielen sie ab, ohne Rate Limits oder Nebenwirkungen zu treffen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Trace-Erfassung in Next.js + Claude aufbauen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Erfassen Sie Traces, indem Sie Ihre Claude-Client-Aufrufe umhüllen. Speichern Sie Message-Verlauf, Tool Calls, Tool-Ergebnisse und Timing-Metadaten in Supabase. Fragen Sie nach Agent-Session-ID für sofortiges Replay ab.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Hier ist ein minimales Muster:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function executeAgentStep(messages: Message[]) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages
  });
  
  const trace = {
    sessionId: currentSession.id,
    stepNumber: messages.length,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
    messageContent: response.content,
    timestamp: new Date()
  };
  
  await supabase
    .from('agent_traces')
    .insert([trace]);
  
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Agent-Entscheidungen abspielen und ändern"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Laden Sie eine Trace-Sitzung aus Supabase und spielen Sie sie deterministisch ab. Wenn der Tool Call von Schritt 5 falsche Daten zurückgab, ändern Sie dieses Ergebnis im Speicher und führen Sie Schritte 6–12 erneut gegen den korrigierten Status aus.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies ist besser als erneutes Ausführen, da: keine API-Kosten für wiederholte Schritte, Sie kontrollieren genau, welche Eingaben sich ändern, und Sie können verschiedene Tool-Ausgaben sofort A/B-testen. Für Agenten, die 50+ API-Aufrufe in einer einzigen Aufgabe tätigen, spart dies echtes Geld.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Prompt Injection und Reasoning Drift identifizieren"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace Replay macht unsichtbare Fehler sichtbar. Vergleichen Sie den exakten Prompt-Kontext zwischen einem funktionierenden Trace und einem fehlgeschlagenen. Sie werden bemerken, wenn ein Tool-Ergebnis unerwartete Formatierung enthielt, oder wenn Token-Limits Claude zwangen, Reasoning zu kürzen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Achten Sie auf Reasoning Drift: Ein Agent, der gestern 95% erreichte, aber heute nur 60%, sah wahrscheinlich eine subtile Eingabeänderung. Trace Replay macht dies sofort sichtbar, anstatt zu warten, bis sich die Metriken weiter verschlechtern.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt (github.com/lewisallena17/pantheon) bietet ein vollständiges Trace-Replay-System, das für Claude-Agenten entwickelt wurde. Es enthält Datenbankschemas für Supabase, eine Next.js UI zum Navigieren in Trace-Bäumen und TypeScript-Utilities für Erfassung und Replay.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forken Sie es, um domänenspezifische Erweiterungen hinzuzufügen: Kostenanalyse, Latenz-Profiling oder benutzerdefinierte Visualisierungen für den Decision Tree Ihres Agenten.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Beginnen Sie noch heute, Agent-Traces zu erfassen – klonen Sie Pantheon, fügen Sie Trace-Logging zu Ihren Claude-Aufrufen hinzu und ersetzen Sie Stunden voller Vermutungen durch Debugging auf Minutenebene.`}</p>
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
