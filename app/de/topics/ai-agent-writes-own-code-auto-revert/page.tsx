import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-writes-own-code-auto-revert'

export const metadata: Metadata = {
  title:       'KI-Agenten, die ihren eigenen Code sicher bearbeiten',
  description: 'Erfahren Sie, wie Sie KI-Agenten mit Claude erstellen, die ihren eigenen Code sicher ändern. Enthält Sandboxing, Validierung und Next.js-Implementierungsmuster.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-writes-own-code-auto-revert',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-writes-own-code-auto-revert',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-writes-own-code-auto-revert',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
    },
  },
  openGraph: {
    title:       'KI-Agenten, die ihren eigenen Code sicher bearbeiten',
    description: 'Erfahren Sie, wie Sie KI-Agenten mit Claude erstellen, die ihren eigenen Code sicher ändern. Enthält Sandboxing, Validierung und Next.js-Implementierungsmuster.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'KI-Agenten, die ihren eigenen Code sicher bearbeiten', description: 'Erfahren Sie, wie Sie KI-Agenten mit Claude erstellen, die ihren eigenen Code sicher ändern. Enthält Sandboxing, Validierung und Next.js-Implementierungsmuster.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"KI-Agenten, die ihren eigenen Code sicher bearbeiten"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Lassen Sie Claude seinen Code sicher ändern, testen und bereitstellen, ohne Ihr Produktionssystem zu beschädigen – mit Validierungsgates, sandboxierter Ausführung und Rollback-Mechanismen, die mit echten KI-Agent-Frameworks funktionieren.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum selbstmodifizierender Code Schutzvorrichtungen benötigt"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`KI-Agenten, die ihren eigenen Code bearbeiten können, stoßen jedes Mal auf das gleiche Problem: unbegrenzte Mutation. Claude könnte eine Lösung generieren, die isoliert funktioniert, aber nachgelagerte Abhängigkeiten bricht. Es könnte Fehlerbehandlung optimieren. Es könnte SQL-Injection-Sicherheitslücken einführen, während es ein Leistungsproblem löst.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die Lösung besteht nicht darin, die Selbstmodifikation zu deaktivieren – sondern Validierungsebenen hinzuzufügen, bevor Code jemals ausgeführt wird. Sie benötigen Syntaxprüfung, Typ-Validierung, Testausführung in einer Sandbox und Genehmigungsgates für Produktionsänderungen. Bauen Sie diese richtig auf, und Sie erhalten ein System, das sich selbst lernt und verbessert, ohne katastrophale Ausfallmodi.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Sandboxing-Codeausführung mit Docker oder VM-Isolation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Bevor ein KI-Agent Code-Änderungen committet, muss er sie isoliert ausführen. Verwenden Sie Docker-Container oder isolierte Node.js-VMs, um den generierten Code auszuführen. Erstellen Sie einen temporären Datenbank-Klon, starten Sie den modifizierten Service in einem Container, führen Sie Ihre Test-Suite aus und überprüfen Sie, dass keine Regressionen auftreten.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dieser Ansatz funktioniert besonders gut mit Next.js API-Routen: Generieren Sie einen modifizierten Endpoint, testen Sie ihn gegen bekannte Anfragen, messen Sie Latenz und Fehlerquoten, genehmigen oder lehnen Sie dann basierend auf Metriken ab. Halten Sie die Sandbox eng – kein Netzwerkzugriff, begrenzte Speicher, strenge Timeouts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn der Agent Datenbankschemas modifiziert, verwenden Sie Transaktionen mit automatischem Rollback. Testen Sie Migrationen auf einer Kopie von Produktionsdaten, bevor Sie das Originalsystem anfassen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Validierungsgates: AST-Parsing und Typ-Prüfung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Nicht jeder generierte Code ist ausführbarer Code. Validieren Sie die Struktur vor dem Sandboxing. Parsen Sie TypeScript mit einem Tool wie TypeScripts compiler API oder Babel, prüfen Sie auf unzulässige Muster (eval, gefährliche Node APIs, hart codierte Anmeldedaten) und überprüfen Sie die Typ-Sicherheit.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Datenbankänderungen validieren Sie SQL-Syntax und Schema-Einschränkungen. Verwenden Sie einen SQL-Parser, um Injection-Muster zu erfassen. Für API-Routen stellen Sie sicher, dass die Funktionssignatur Ihrem Vertrag entspricht.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ein einfacher Ansatz: Lehnen Sie jeden Code ab, der eval, require() außerhalb einer Whitelist oder process.env-Zugriff in generierten Methoden enthält. Lehnen Sie jedes SQL ab, das Tabellen ohne ein explizites Admin-Flag löscht.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const code = \`
const handler = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [req.query.id]
  );
  return res.json(result);
};
\`;
const hasEval = /\beval\s*\(/.test(code);
const hasDrop = /\bDROP\s+TABLE/i.test(code);
if (hasEval || hasDrop) throw new Error('Pattern blocked');
`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Test-gesteuerte Code-Generierung mit Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fordern Sie Claude auf, Code mit Tests zu generieren. Verwenden Sie die Extended-Thinking-Funktion, damit Claude Grenzfälle durchdenkt, bevor er schreibt. Strukturieren Sie Prompts, um Unit-Tests zusammen mit der Implementierung anzufordern.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Geben Sie Claude Ihre vorhandene Test-Suite und bitten Sie ihn, sicherzustellen, dass alle Tests bestanden werden. Geben Sie ihm ein Schema-Dokument und bitten Sie ihn, zu überprüfen, dass Migrationen abwärtskompatibel sind. Je mehr Einschränkungen Sie in den Prompt codieren, desto weniger Regressionen sehen Sie in Sandbox-Läufen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Genehmigungsworkflows und Audit-Protokolle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Selbst validierter Code sollte vor der Produktion einer menschlichen Genehmigung bedürfen. Speichern Sie jede generierte Änderung in einer Supabase-Tabelle mit dem ursprünglichen Prompt, Claudes Überlegungen, Testergebnissen und Genehmigungsstatus. Erstellen Sie ein Dashboard mit ausstehenden Agent-Änderungen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Protokollieren Sie jede Ausführung. Wer hat es genehmigt, wann hat es ausgeführt, welche Metriken haben sich geändert, alle nachfolgenden Fehler. Dies schafft Rechenschaftspflicht und macht es einfach, Bugs auf eine spezifische Agent-Änderung zurückzuverfolgen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Projekt unter github.com/lewisallena17/pantheon bietet eine funktionierende Referenzimplementierung für KI-Agenten, die Code sicher modifizieren. Es enthält sandboxierte Ausführungsmuster, Supabase-Schema zur Verfolgung von Änderungen, Next.js API-Endpoints für die Bereitstellung und Claude-Integration mit Validierungsgates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Studieren Sie, wie Pantheon seine Prompts strukturiert, um Testgenerations-Anweisungen einzubeziehen, wie es Sandbox-Läufe vor der Genehmigung orchestriert und wie es Änderungen in einem persistenten Audit-Trail protokolliert. Sie können diese Muster in Ihr eigenes System anpassen oder Pantheon als Ausgangspunkt forken.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Erstellen Sie selbstverbessernde KI-Agenten durch Validierung, Sandboxing und Genehmigungsworkflows – laden Sie das Pantheon Starter Kit herunter, um funktionierende Code-Muster für Claude-gesteuerte Selbstmodifikation mit Sicherheitsschutzvorrichtungen zu sehen.`}</p>
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
