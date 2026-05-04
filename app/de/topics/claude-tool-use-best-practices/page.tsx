import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/claude-tool-use-best-practices'

export const metadata: Metadata = {
  title:       'Claude Tool Use Production Best Practices',
  description: 'Master Claude tool use patterns für Production AI Agents. Learn error handling, concurrency und cost optimization für Next.js + Supabase Systeme.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-tool-use-best-practices',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-tool-use-best-practices',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-tool-use-best-practices',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
    },
  },
  openGraph: {
    title:       'Claude Tool Use Production Best Practices',
    description: 'Master Claude tool use patterns für Production AI Agents. Learn error handling, concurrency und cost optimization für Next.js + Supabase Systeme.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Claude Tool Use Production Best Practices', description: 'Master Claude tool use patterns für Production AI Agents. Learn error handling, concurrency und cost optimization für Next.js + Supabase Systeme.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Tool Use Production Best Practices"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Der Aufbau zuverlässiger Claude Tool-Integrationen im großen Maßstab erfordert mehr als Prompt Engineering—Sie benötigen robuste Fehlerbehandlung, intelligentes Concurrency Management und klare Kostenübersicht.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestaltung von Tool-Definitionen für Resilienz"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claudes tool_use Feature funktioniert am besten, wenn Schemas explizit und nachsichtig sind. Über-eingeschränkte Parameter schlagen stillschweigend fehl; unter-spezifizierte verursachen Halluzinationen. Definieren Sie klare Enum-Werte für erwartete Eingaben, verwenden Sie description Felder, um Claudes Reasoning zu lenken, und fügen Sie Beispiele für gültige und ungültige Aufrufe ein.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`In der Produktion sollten Sie Tool-Definitionen als Verträge behandeln. Versionieren Sie sie separat von Ihrer Agent-Logik. Wenn Sie das Verhalten eines Tools ändern müssen, erstellen Sie eine neue tool_version, anstatt das Original zu verändern—dies verhindert, dass Claude alte und neue Semantiken mitten in einem Gespräch vermischt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementieren Sie exponentielles Backoff für Tool Calls"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die Tool-Ausführung kann aus vorübergehenden Gründen fehlschlagen: Datenbanksperren, Rate Limits oder kurze Service-Ausfälle. Naive Wiederholungslogik verschärft diese Probleme. Verwenden Sie stattdessen exponentielles Backoff mit Jitter, um Wiederholungen zeitlich zu verteilen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Muster: Warten Sie 100 ms vor Wiederholung 1, 200 ms vor Wiederholung 2, 400 ms vor Wiederholung 3, jeweils mit ±20% zufälligem Jitter. Dies gibt vorübergehenden Fehlern Raum zum Atmen, ohne Ihre Infrastruktur zu überlasten. Setzen Sie ein Maximum von 3–4 Wiederholungen; darüber hinaus ist der Fehler wahrscheinlich strukturell.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const executeWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 100 * (0.8 + Math.random() * 0.4);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Validieren Sie Tool-Outputs, bevor Sie sie an Claude zurückgeben"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude vertraut den Tool-Ergebnissen, die Sie zurückgeben. Wenn ein Tool fehlerhafte oder unerwartete Daten zurückgibt, kann Claude nachgelagert falsche Entscheidungen treffen. Validieren Sie Outputs immer gegen ein Schema, bevor Sie sie in die Konversation einspeisen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie einen leichtgewichtigen Validator (Zod, io-ts oder einfache TypeScript Guards). Protokollieren Sie Validierungsfehlschläge separat, damit Sie Tool-Bugs früh erkennen können. Falls die Validierung fehlschlägt, geben Sie Claude eine menschenlesbare Fehlermeldung zurück, anstatt schlechte Daten ausbreiten zu lassen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Überwachen Sie Tool-Kosten und Token-Nutzung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jeder Claude API Aufruf hat Kosten, und Tool Use erhöht die Reibung: zusätzliche Tokens für Tool-Definitionen, Tokens für Ergebnisse und möglicherweise mehrere Runden von Claudes Reasoning. Überwachen Sie Ihre Ausgaben pro Agent, pro Benutzer und pro Tool.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Protokollieren Sie input_tokens, output_tokens und cache_read_tokens aus jeder API Antwort. Verbinden Sie dies mit einer Supabase Tabelle, damit Sie Kostentrends abfragen können. Setzen Sie Warnungen, wenn eine einzelne Benutzersitzung ein Budget überschreitet (z. B. \$0,50), und implementieren Sie Rate Limits für High-Cost Agents.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Serialisieren und persistieren Sie Tool-Status"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn Ihr Agent mehrere Tool Calls über eine Sitzung hinweg tätigt, persistieren Sie die Konversation und Tool-Ergebnisse. Dies ermöglicht es Ihnen, unterbrochene Jobs fortzusetzen, Entscheidungen zu überprüfen und Schleifen zu erkennen, in denen Claude das gleiche Tool wiederholt mit identischen Eingaben aufruft.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie messages, tool_results und invocation Metadaten in Supabase als JSONB Spalten. Indexieren Sie nach user_id und session_id, um schnelle Wiederherstellung zu ermöglichen. Fügen Sie Zeitstempel und Outcome Flags (success, validation_failed, timeout) für Post-Mortem Analysen ein.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Verwenden Sie strukturierte Outputs für deterministische Ergebnisse"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tool Use funktioniert am besten in Kombination mit Claudes structured output Mode. Definieren Sie ein JSON Schema für das, was Claude nach der Verwendung von Tools zurückgeben soll—dies verhindert freien Text und stellt sicher, dass Ihr nachgelagerter Code immer eine vorhersehbare Form erhält.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Kombinieren Sie Tools und strukturierte Outputs: Claude ruft Tools auf, um Daten zu sammeln, und formatiert seine Antwort dann in Ihr Schema. Dies gibt Ihnen sowohl Flexibilität (Claude kann darüber nachdenken, welche Tools aufgerufen werden sollen) als auch Determinismus (Sie wissen genau, welche Form Sie erhalten).`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Wenden Sie diese sechs Praktiken an—resiliente Tool-Gestaltung, Backoff-Logik, Output-Validierung, Kostenüberwachung, State Persistence und strukturierte Outputs—um zuverlässige Claude Agents zu versenden, die ohne überraschende Kosten oder stille Ausfälle skalieren. Beginnen Sie mit dem Pantheon Starter Kit.`}</p>
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
