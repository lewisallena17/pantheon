import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/nextjs-14-supabase-multi-agent-systems'

export const metadata: Metadata = {
  title:       'Next.js 14 + Supabase Multi-Agent AI-Systeme',
  description: 'Erstellen Sie produktive Multi-Agent AI-Systeme mit Next.js 14 und Supabase. Echte Muster für Claude-Integration, Agent-Koordination und persistente Zustandsver',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-supabase-multi-agent-systems',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-supabase-multi-agent-systems',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-supabase-multi-agent-systems',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
    },
  },
  openGraph: {
    title:       'Next.js 14 + Supabase Multi-Agent AI-Systeme',
    description: 'Erstellen Sie produktive Multi-Agent AI-Systeme mit Next.js 14 und Supabase. Echte Muster für Claude-Integration, Agent-Koordination und persistente Zustandsver',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Next.js 14 + Supabase Multi-Agent AI-Systeme', description: 'Erstellen Sie produktive Multi-Agent AI-Systeme mit Next.js 14 und Supabase. Echte Muster für Claude-Integration, Agent-Koordination und persistente Zustandsver' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Next.js 14 + Supabase Multi-Agent AI-Systeme"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Erstellen Sie skalierbare Multi-Agent AI-Systeme, in denen Claude-Agenten sich über Supabase koordinieren, Aufgaben unabhängig ausführen und ihren Zustand über Anfragen hinweg beibehalten – ohne Infrastruktur-Overhead.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Next.js 14 + Supabase für Multi-Agent-Systeme"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der App Router von Next.js 14 und Server Actions geben Ihnen die notwendigen Primitives: Echtzeit-Endpunkte für Agent-Polling, Middleware für Request-Routing und Edge-kompatible Funktionen. Supabase bietet das Fundament – PostgreSQL für Agent-Zustand, Realtime für Event-Streaming und Auth für sichere Agent-zu-Agent-Kommunikation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die Kombination eliminiert die Notwendigkeit von Message Queues oder Orchestrierungs-Frameworks. Agenten schreiben ihren Zustand direkt in Postgres, abonnieren Realtime-Kanäle und triggern Aktionen über API-Routes. Sie besitzen die Infrastruktur von Anfang an.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Agent-Zustandsarchitektur mit Postgres"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Jeder Agent benötigt einen kanonischen State Store. Supabase-Tabellen ermöglichen es Ihnen, Agent-Status, Task-Warteschlangen und Ergebnisse in einem abfragbaren Format zu verfolgen. Verwenden Sie Row-Level Security (RLS)-Richtlinien, um Agent-Berechtigungen zu isolieren – ein Agent kann nur seine eigenen Tasks lesen/schreiben.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Strukturieren Sie Ihr Schema mit agent_id als Fremdschlüssel, created_at für Sortierung und Status-Enums für Workflow-Zustand (pending, executing, completed, failed). Dies gibt Ihnen kostenlose Auditierbarkeit und macht das Debugging von Multi-Agent-Flows trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Core agent task table
CREATE TABLE agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  status text CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  input jsonb NOT NULL,
  output jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Claude Agent-Integration via Server Actions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Next.js Server Actions ermöglichen es Ihnen, die Claude API serverseitig aufzurufen, Ihren API-Schlüssel zu sichern und die clientseitige Token-Verwaltung zu vermeiden. Jede Action empfängt den aktuellen Zustand des Agenten von Supabase, übergibt ihn an Claude mit Tools/Anweisungen und persistiert das Ergebnis.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie das Anthropic SDK direkt in Ihren Actions. Claude liest die Task-Warteschlange des Agenten, entscheidet, was als nächstes zu tun ist, und Ihre Action aktualisiert Supabase mit dem Ergebnis. Realtime-Abos benachrichtigen andere Agenten über Zustandsänderungen ohne Polling.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server'

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export async function executeAgentTask(agentId: string) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const claude = new Anthropic();
  
  const { data: task } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .single();
  
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: JSON.stringify(task.input) }]
  });
  
  await supabase
    .from('agent_tasks')
    .update({ status: 'completed', output: response.content[0].text })
    .eq('id', task.id);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Echtzeit-Agent-Koordination mit Supabase Realtime"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Agenten müssen Supabase nicht ständig abfragen. Verwenden Sie Realtime-Abos, um auf Änderungen in bestimmten Tabellen zu lauschen. Wenn Agent A eine Task abschließt, wird das Abo von Agent B sofort ausgelöst und löst seine nächste Aktion aus.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies funktioniert gut bei sequenziellen Workflows. Agent A beendet die Analyse, veröffentlicht ein Ergebnis, und Agent B's Listener startet die Synthese. Für parallele Arbeiten verwenden Sie Postgres-Funktions-Trigger, um Tasks atomar zu verteilen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Fehlerbehandlung und Wiederholungslogik"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie Wiederholungsanzahl und letzte Fehlermeldung in Ihrer agent_tasks-Tabelle. Verpacken Sie Ihre Server Actions in try/catch, aktualisieren Sie die Task-Zeile mit Fehlerdetails und reihen Sie automatisch nach einer Verzögerung wieder ein.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Die pg_cron-Erweiterung von Supabase ermöglicht es Ihnen, Wiederholungs-Jobs direkt in Postgres zu planen. Kein separater Queue-Worker erforderlich. Fehlgeschlagene Tasks können über Webhooks Benachrichtigungen an Discord oder E-Mail auslösen für Sichtbarkeit.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository unter github.com/lewisallena17/pantheon enthält ein produktives Starter Kit für Next.js 14 + Supabase Multi-Agent-Systeme. Es umfasst Schema-Migrationen, Server Action-Muster, Realtime-Abonnement-Helfer und Fehlerbehandlungsprogramme.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forken Sie es, um ein funktionierendes Fundament zu erhalten. Der Code demonstriert Agent-Kommunikationsflüsse, Task-Persistierung und Claude-Integration mit Best Practices für Sicherheit und Observability.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Beginnen Sie mit dem Pantheon Starter Kit – klonen Sie es, setzen Sie Ihre Supabase-Anmeldedaten und stellen Sie Multi-Agent-Systeme in wenigen Stunden, nicht Wochen, auf Vercel bereit.`}</p>
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
