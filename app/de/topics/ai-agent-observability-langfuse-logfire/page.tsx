import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-observability-langfuse-logfire'

export const metadata: Metadata = {
  title:       'KI-Agent-Observabilität: Langfuse + Logfire-Leitfaden',
  description: 'Überwachen Sie Claude-Agenten in der Produktion mit Langfuse und Logfire. Echtzeittraces, Kostenverfolgung und Debugging für Next.js KI-Systeme.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-observability-langfuse-logfire',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-observability-langfuse-logfire',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-observability-langfuse-logfire',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
    },
  },
  openGraph: {
    title:       'KI-Agent-Observabilität: Langfuse + Logfire-Leitfaden',
    description: 'Überwachen Sie Claude-Agenten in der Produktion mit Langfuse und Logfire. Echtzeittraces, Kostenverfolgung und Debugging für Next.js KI-Systeme.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'KI-Agent-Observabilität: Langfuse + Logfire-Leitfaden', description: 'Überwachen Sie Claude-Agenten in der Produktion mit Langfuse und Logfire. Echtzeittraces, Kostenverfolgung und Debugging für Next.js KI-Systeme.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"KI-Agent-Observabilität: Langfuse + Logfire-Leitfaden"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Hören Sie auf, blind mit Ihren Claude-Agenten zu fliegen—Langfuse und Logfire geben Ihnen vollständige Transparenz über Token-Nutzung, Latenz und Fehlermodi, damit Sie in der Produktion debuggen können, anstatt zu raten.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Agent-Observabilität wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`KI-Agenten sind standardmäßig Black Boxes. Sie stellen ein Claude-betriebenes System bereit, Benutzer interagieren damit, und wenn etwas kaputtgeht, haben Sie keine Ahnung, ob es ein Prompt-Problem, Token-Limit, Tool-Halluzination oder Latenzspitze ist. Observabilität dreht das um: Sie erhalten strukturierte Traces von jedem LLM-Aufruf, jeder Tool-Ausführung und jedem Entscheidungszweig.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für kleine Teams ist dies entscheidend. Sie können sich keine DevOps-Person zur Untersuchung von Produktionsproblemen leisten. Sie brauchen Tools, die Ihnen genau zeigen, was passiert ist, wie viel es gekostet hat und warum es fehlgeschlagen ist—in einem Dashboard.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Langfuse für LLM-Traces und Kostenverfolgung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Langfuse erfasst jede Interaktion mit Claude: Prompt-Token, Completion-Token, Latenz und strukturierte Ausgaben. Es integriert sich direkt mit dem Anthropic SDK und verfolgt Agent-Runs hierarchisch—jeder Tool-Aufruf, Abruf und jede Entscheidung wird zu einem abfragbaren Span.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die Kostenaufschlüsselung erfolgt in Echtzeit. Sie sehen genau, welche Agent-Verhaltensweisen oder Benutzeraktionen Ausgaben verursachen. Für ein RAG-System, bei dem einige Abfragen 10 Tool-Aufrufe auslösen und andere nur 1, erkennen Sie das Muster sofort. Der Open-Source-Kern von Langfuse läuft selbst gehostet; ihre Cloud-Stufe fügt reibungslose Integrationen hinzu.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Logfire für strukturierte Protokollierung und Leistung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Logfire (Pydantics Observability-Plattform) zeichnet sich darin aus, strukturierte Protokolle von Ihrem Next.js-Backend zu erfassen. Jeder Agent-Schritt, jede Datenbankabfrage und jeder externe API-Aufruf wird mit Kontext getaggt—user_id, session_id, agent_version—damit Sie Protokolle nach jeder Dimension segmentieren können.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Im Gegensatz zur traditionellen Protokollierung versteht Logfire Ihre TypeScript-Typen. Sie protokollieren strukturierte Daten, keine Zeichenketten, und führen Abfragen mit SQL-ähnlicher Syntax durch. Dies ist wichtig beim Debugging: Sie können fragen: "Zeige mir alle Agent-Runs, bei denen Tool X fehlgeschlagen ist und die Latenz 2 Sekunden überschritten hat" und erhalten die Antwort in Sekunden.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrationsmuster: Next.js + Claude + Langfuse + Logfire"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der typische Stack: Next.js API-Route ruft einen Agent-Service auf, der Claude über Anthropic SDK verwendet (Langfuse fängt dies automatisch ab), Tool-Aufrufe an Supabase durchführt und strukturierte Ereignisse an Logfire protokolliert.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Hier ist das Kernmuster:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';
import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const logger = pino();

export async function runAgent(input: string, userId: string) {
  logger.info({ userId, input, event: 'agent_start' });
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: input }],
  });
  
  logger.info({ userId, tokens: response.usage, event: 'agent_complete' });
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Was in der Produktion zu beobachten ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Konzentrieren Sie sich auf vier Metriken: (1) Token-Nutzung pro Agent-Run—erkennen Sie Endlosschleifen, in denen der Agent immer wieder wiederholt; (2) Tool-Call-Ausfälle—sehen Sie, welche Integrationen anfällig sind; (3) Latenz pro Schritt—identifizieren Sie Engpässe in der Reasoning-Kette; (4) Kosten pro Benutzerkohorte—wissen Sie, welche Funktionen teuer zu unterstützen sind.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Setzen Sie Warnungen in Langfuse, wenn die Token-Nutzung um das 3-fache des Normalwerts ansteigt oder ein Tool 5 Mal hintereinander ausfällt. In Logfire warnen Sie, wenn die Agent-Latenz Ihre SLA überschreitet. Dies verhindert stille Ausfälle, bei denen ein Agent stundenlang in einer Schleife steckenbleibt, bevor jemand es bemerkt.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository unter github.com/lewisallena17/pantheon demonstriert diesen Stack end-to-end: ein Next.js-Agent-Starter-Kit mit integriertem Langfuse und Logfire, Supabase für Persistierung und Claude als Kernmodul. Es ist produktionsreife Boilerplate—klonen Sie es, setzen Sie Ihre API-Schlüssel und stellen Sie bereit. Jeder Tool-Aufruf und jede Agent-Entscheidung wird automatisch verfolgt und protokolliert.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Beginnen Sie noch heute mit der Überwachung Ihrer KI-Agenten—schnappen Sie sich das Pantheon-Starter-Kit und integrieren Sie Langfuse + Logfire in einer Bereitstellung.`}</p>
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
