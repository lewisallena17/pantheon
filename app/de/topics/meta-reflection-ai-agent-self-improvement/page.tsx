import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/meta-reflection-ai-agent-self-improvement'

export const metadata: Metadata = {
  title:       'Meta-Reflexion für KI-Agenten | Self-Improvement Primitives',
  description: 'Implementieren Sie Meta-Reflexion in Claude-Agenten, um autonome Selbstverbesserung zu ermöglichen. Bauen Sie bessere KI-Systeme mit strukturierten Introspektio',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/meta-reflection-ai-agent-self-improvement',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/meta-reflection-ai-agent-self-improvement',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/meta-reflection-ai-agent-self-improvement',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
    },
  },
  openGraph: {
    title:       'Meta-Reflexion für KI-Agenten | Self-Improvement Primitives',
    description: 'Implementieren Sie Meta-Reflexion in Claude-Agenten, um autonome Selbstverbesserung zu ermöglichen. Bauen Sie bessere KI-Systeme mit strukturierten Introspektio',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Meta-Reflexion für KI-Agenten | Self-Improvement Primitives', description: 'Implementieren Sie Meta-Reflexion in Claude-Agenten, um autonome Selbstverbesserung zu ermöglichen. Bauen Sie bessere KI-Systeme mit strukturierten Introspektio' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Meta-Reflexion für KI-Agenten | Self-Improvement Primitives"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Meta-Reflexion—die Fähigkeit eines KI-Agenten, sein eigenes Denken zu beobachten und zu kritisieren—ist der Unterschied zwischen Agenten, die stagnieren, und Agenten, die sich mit jeder Interaktion verbessern.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Was Meta-Reflexion wirklich bewirkt"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Meta-Reflexion ist weder Prompt Engineering noch Fine-Tuning. Es ist ein Runtime Primitive: Nachdem Ihr Agent eine Aufgabe abgeschlossen hat, untersucht er seinen Denkprozess, identifiziert Fehlermodi und passt zukünftiges Verhalten in derselben Sitzung oder über Deployments hinweg an.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Claude-basierte Agenten bedeutet dies, Zwischenausgaben zu erfassen—Tool-Aufrufe, Argumentationsketten, Ergebnisse—und Claude dann zu bitten, zu bewerten, was funktioniert hat und was nicht. Das Ergebnis ist strukturiertes Feedback, das sich in messbare Leistungssteigerungen ansammelt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Kernarchitektur: Erfassen, Reflektieren, Aktualisieren"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Muster hat drei Stufen: (1) Führen Sie die Primäraufgabe aus und protokollieren Sie alle Entscheidungspunkte, (2) Übergeben Sie die Ausführungs-Trace an Claude mit einem Reflexions-Prompt, der Fehleranalyse und Verbesserungsvorschläge anfordert, (3) Speichern Sie die Reflexion im Kontext oder in der Datenbank Ihres Agenten, damit zukünftige Läufe diese Erkenntnisse einbeziehen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies erzeugt eine Rückkopplungsschleife ohne Retraining. Jede Agent-Instanz wird intelligenter, wenn sie auf neue Fälle trifft. In der Produktion bedeutet dies, dass Ihre Supabase-Instanz nicht nur Ergebnisse speichert, sondern auch die Denk-Verbesserungen, die sie generiert haben.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// TypeScript: Basic reflection loop in a Next.js API route
const executeWithReflection = async (task: string, history: Reflection[]) => {
  const execution = await claude.runAgent(task, history);
  const reflection = await claude.reflect(execution.trace);
  await supabase.from('reflections').insert({ task, execution, reflection });
  return { execution, reflection };
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Wo Meta-Reflexion glänzt"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Multi-Step-Reasoning-Aufgaben: SQL-Generierung, API-Orchestrierung, Content-Planung. Agenten gehen oft früh suboptimale Wege; Reflexion erkennt dies und korrigiert das Muster.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Seltene Grenzfälle: Wenn ein Agent auf einen Fall trifft, den er noch nicht gesehen hat, kann Meta-Reflexion eine Antwort synthetisieren und sofort kodieren, warum diese Antwort funktioniert hat, um denselben Fehler später zu vermeiden.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Kostenoptimierung: Anstatt Prompt-Engineering-Zyklen durchzulaufen, entdeckt Reflexion natürlich bessere Instruktionsformate und reduziert so Token-Ausgaben über die Zeit.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementierung von Reflexions-Prompts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihr Reflexions-Prompt sollte fragen: Welche Annahmen habe ich gemacht? Welche Schritte waren unnötig? Habe ich das richtige Tool verwendet? Welches Signal würde mir früher sagen, dass ich falsch lag? Claude beherrscht diese Introspection nativ—es ist dafür ausgelegt, über seine eigenen Ausgaben nachzudenken.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie Reflexionen als strukturiertes JSON in Supabase: { taskType, failureMode, correction, confidence }. Im Laufe der Zeit werden Sie Muster sehen: bestimmte Task-Typen haben wiederkehrende Probleme, die auf systematische Lücken im Wissen oder in den Fähigkeiten Ihres Agenten hinweisen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Skalierung von Reflexion über Agent-Flotten"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`In Produktionssystemen mit vielen gleichzeitigen Agenten wird Reflexion zu einer gemeinsamen Wissensschicht. Wenn Agent A eine Verbesserung entdeckt, lernt Agent B diese ohne erneute Bereitstellung. Verwenden Sie einen Supabase Trigger, um hochgradig vertrauenswürdige Reflexionen an einen gemeinsamen Context-Vector oder einen Instruction-Set zu propagieren.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dieser Ansatz funktioniert, weil Meta-Reflexion zustandslos ist: Jeder Agent kann Erkenntnisse von den Reflexionen eines anderen Agenten lesen und anwenden, was zu einer emergenten kollektiven Verbesserung führt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository unter github.com/lewisallena17/pantheon implementiert Meta-Reflexion als wiederverwendbares Primitive für Claude-Agenten. Es enthält ausführbare Beispiele für Next.js, Supabase-Schema-Migrationen zum Speichern von Reflexionen und Gerüste für Reflexions-Prompt-Templates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Klonen Sie es als Starter: Es ist für unabhängige Teams konzipiert und enthält Konfiguration für lokale Entwicklung und Produktionsbereitstellungen auf Vercel + Supabase.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Meta-Reflexion wandelt Agent-Systeme von statischen Pipelines in lernende Entitäten um—integrieren Sie es in Ihren nächsten Claude-Agent und beobachten Sie, wie die Leistung mit jeder Aufgabe exponentiell wächst.`}</p>
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
