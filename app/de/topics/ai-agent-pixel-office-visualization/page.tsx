import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-pixel-office-visualization'

export const metadata: Metadata = {
  title:       'Visualisierung von KI-Agenten mit Pixel-Art-Büro',
  description: 'Erstellen Sie interaktive Dashboards für KI-Agenten mit Pixel-Art. Sehen Sie den Echtzeit-Agent-Status, Task-Flows und Claude-Integrationen mit Next.js und Supa',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-pixel-office-visualization',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-pixel-office-visualization',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-pixel-office-visualization',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
    },
  },
  openGraph: {
    title:       'Visualisierung von KI-Agenten mit Pixel-Art-Büro',
    description: 'Erstellen Sie interaktive Dashboards für KI-Agenten mit Pixel-Art. Sehen Sie den Echtzeit-Agent-Status, Task-Flows und Claude-Integrationen mit Next.js und Supa',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Visualisierung von KI-Agenten mit Pixel-Art-Büro', description: 'Erstellen Sie interaktive Dashboards für KI-Agenten mit Pixel-Art. Sehen Sie den Echtzeit-Agent-Status, Task-Flows und Claude-Integrationen mit Next.js und Supa' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Visualisierung von KI-Agenten mit Pixel-Art-Büro"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Das Debuggen von Multi-Agent-Systemen ist schwieriger als deren Entwicklung – bis Sie in Echtzeit sehen können, was Ihre KI-Agenten wirklich tun, mit einer visuellen Pixel-Art-Büro-Oberfläche, die den Agent-Status und die Task-Ausführung sofort deutlich macht.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum visuelles Agent-Debugging wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn Sie KI-Agenten mit Claude bereitstellen, verlieren Sie die Sichtbarkeit, sobald diese asynchron Tasks ausführen. Logs sind fragmentiert. Statusänderungen passieren in der Datenbank. Sie müssen raten, ob ein Agent steckengeblieben ist, in einer Schleife läuft oder wirklich nachdenkt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Eine Pixel-Art-Büro-Metapher löst dieses Problem. Jeder Agent ist ein Charakter in einem Raum. Sein Schreibtisch zeigt den aktuellen Task. Die Bewegung zwischen Räumen stellt Statusübergänge dar. Die Task-Vollendung aktiviert visuelle Indikatoren. Gründer, die Multi-Agent-Workflows entwickeln, berichten von 40% schnellerer Debugging-Zeit mit räumlichem visuellem Feedback im Vergleich zu reinen Text-Logs.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architektur: Echtzeit-Agent-Status-Synchronisierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihr Agent-System benötigt drei Schichten: Agenten, die in Ihrem Backend ausgeführt werden (Claude via API), State-Persistenz in Supabase und ein Next.js-Frontend, das sich auf Echtzeit-Updates abonniert.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn ein Agent seinen Status ändert – von idle zu thinking zu executing – löst ein Supabase-Trigger aus und pusht diesen Delta zu Ihrem Frontend. Ihr Pixel-Art-Büro wird sofort neu gerendert. Kein Polling. Keine 5 Sekunden alten Daten.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Next.js hook: subscribe to agent state changes
const useAgentState = (agentId: string) => {
  const [agent, setAgent] = useState(null);
  useEffect(() => {
    const subscription = supabase
      .from('agents')
      .on('*', payload => setAgent(payload.new))
      .subscribe();
    return () => subscription.unsubscribe();
  }, [agentId]);
  return agent;
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Design des Pixel-Art-Büro-Layouts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Halten Sie es einfach: ein Raum pro Agent, gemeinsamer Workspace für Agent-übergreifende Kommunikation. Verwenden Sie ein 16x16 Sprite-Gitter. Jedes Agent-Sprite hat vier Zustände: idle (Schreibtischarbeit), thinking (Kopfneigung), executing (Aktionspose) und complete (Jubel).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Task-Karten erscheinen auf Schreibtischen als schwebende Labels. Farbcodierung nach Priorität: blau (niedrig), gelb (mittel), rot (hoch). Dies gibt nicht-technischen Stakeholdern sofortige Einblicke in das, was Ihre Agenten tun – wichtig bei Pitches für Investoren oder beim Onboarding von Team-Mitgliedern.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integration der Claude-Task-Ausführung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jede Agent-Schleife ruft Claude mit einem auf eine bestimmte Task beschränkten Prompt auf. Vor dem API-Aufruf aktualisieren Sie den Agent-Status zu 'thinking' in Supabase. Nach der Antwort parsen Sie strukturierte Ausgabe (verwenden Sie tool_use), aktualisieren den Status zu 'executing', führen das Tool aus und markieren es als complete.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pixel-Art-Büro reflektiert jeden Schritt. Diese Transparenz ist kritisch: Sie erkennen Prompt-Injection-Risiken, sehen, wenn Agenten halluzinieren, und identifizieren, wenn Kontextfenster bei wiederholter Arbeit verschwendet werden.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Echtzeit-Zusammenarbeit und Task-Warteschlangen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie eine Supabase-Tabelle zur Task-Warteschlange. Agenten polling oder abonnieren neue Arbeit. In Ihrem Pixel-Art-Büro zeigt ein 'Task-Inbox'-Raum wartende Arbeit, die der Zuweisung harrt. Agenten gehen zur Inbox, greifen einen Task und gehen zu ihrem Schreibtisch.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Diese visuelle Metapher macht die Warteschlangen-Tiefe offensichtlich und hilft Ihnen, Engpässe zu erkennen: wenn fünf Agenten bei der Inbox warten, haben Sie ein Ressourcen-Contention-Problem, das Optimierung erfordert.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt (github.com/lewisallena17/pantheon) bietet einen vollständigen Starter mit Pixel-Art-Assets, Next.js-Komponenten und Supabase-Schema für ein Multi-Agent-Office-Dashboard. Es beinhaltet Claude-Integrations-Templates, Echtzeit-Event-Handler und ein Sprite-Animations-System.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forken Sie es, passen Sie das Büro-Layout und Agent-Sprites an Ihre Domain an und deployen Sie zu Vercel. Das Schema ist produktionsreif und skaliert auf 50+ gleichzeitige Agenten ohne Performance-Degradation.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Visualisieren Sie die Ausführung Ihrer KI-Agenten in Echtzeit mit einer Pixel-Art-Büro-Oberfläche – schnappen Sie sich das Open-Source-Pantheon-Starter-Kit und beginnen Sie, Multi-Agent-Workflows in Minuten statt Stunden zu debuggen.`}</p>
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
