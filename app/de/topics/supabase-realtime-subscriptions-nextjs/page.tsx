import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/supabase-realtime-subscriptions-nextjs'

export const metadata: Metadata = {
  title:       'Supabase Realtime Subscriptions in Next.js App Router',
  description: 'Erstellen Sie live-aktualisierte KI-Agenten mit Supabase Realtime und Next.js App Router. Echtzeit-Abos, Server Components und Claude Integrationsmuster.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-realtime-subscriptions-nextjs',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-realtime-subscriptions-nextjs',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-realtime-subscriptions-nextjs',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
    },
  },
  openGraph: {
    title:       'Supabase Realtime Subscriptions in Next.js App Router',
    description: 'Erstellen Sie live-aktualisierte KI-Agenten mit Supabase Realtime und Next.js App Router. Echtzeit-Abos, Server Components und Claude Integrationsmuster.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Realtime Subscriptions in Next.js App Router', description: 'Erstellen Sie live-aktualisierte KI-Agenten mit Supabase Realtime und Next.js App Router. Echtzeit-Abos, Server Components und Claude Integrationsmuster.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Realtime Subscriptions in Next.js App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Supabase Realtime-Abos ermöglichen es dir, Live-Datenbankänderungen direkt an deine Next.js App Router-Komponenten zu pushen, was Polling eliminiert und sofortige KI-Agent-Statusaktualisierungen ermöglicht – essentiell beim Aufbau von Multi-Agent-Systemen, die über Benutzer und Claude API-Aufrufe hinweg synchronisiert werden müssen.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum Echtzeit für KI-Agent-Systeme wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beim Aufbau von KI-Agenten mit Claude benötigst du Agenten, die sofort auf Statusänderungen reagieren. Ein Benutzer bearbeitet eine Eingabeaufforderung, ein anderer Agent nimmt sie sofort auf. Eine Tool-Ausführung wird abgeschlossen, die Benutzeroberfläche aktualisiert sich ohne Neuladen. Supabase Realtime-Abos machen dies möglich, ohne deine eigene WebSocket-Infrastruktur aufzubauen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Traditionelles Polling verschwendet Bandbreite und erzeugt Verzögerungen. Realtime-Abos pushen Änderungen in dem Moment, in dem sie deine Postgres-Datenbank erreichen – besonders kritisch, wenn mehrere Claude-Instanzen oder Agenten sich über eine gemeinsame Wissensdatenbank koordinieren.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Einrichten von Realtime in Next.js App Router"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Erstelle einen React Hook, der Supabase-Abos im Server Component-Kontext verwaltet. Next.js App Router unterstützt 'use client'-Grenzen, wo deine Abologik lebt – Server Components können useEffect nicht verwenden, aber sie können Daten über Server Components mit einer untergeordneten Client Component streamen, die Abos verwaltet.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Initialisiere deinen Supabase-Client mit der Realtime-Channel-Konfiguration. Filtere nach Tabelle und Bedingungen (wie agent_id oder user_id), um unnötige Updates zu vermeiden. Melde dich bei der Demontage ab, um Speicherlecks und doppelte Listener zu verhindern.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAgentUpdates(agentId: string) {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const subscription = supabase
      .channel(\`agent:\${agentId}\`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agents', filter: \`id=eq.\${agentId}\` },
        (payload) => setAgent(payload.new)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [agentId]);

  return agent;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Filtern von Abos nach Benutzer und Agent-Kontext"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Nicht jede Änderung in deiner Agenttabelle ist für jeden Client relevant. Verwende Supabase's Filter-Syntax, um nur Zeilen zu abonnieren, die deine Kriterien erfüllen – typischerweise die Agenten des aktuellen Benutzers oder Agenten in einem gemeinsamen Workspace.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies reduziert Rauschen und hält deine Komponenten-Re-Renders fokussiert. Für Multi-Tenant-KI-Systeme ist Filterung unverzichtbar für Performance und Isolierung.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Kombination von Realtime mit Claude API-Antworten"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dein Muster: (1) Benutzer löst einen Claude API-Aufruf über Server Action aus, (2) Claude-Antwort schreibt in Datenbank über Postgres-Trigger oder direktes Einfügen, (3) Realtime-Abo wird ausgelöst, (4) Benutzeroberfläche aktualisiert sich. Dies erzeugt nahtlose Agent-Statusfluss ohne Polling.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwende Datenbanktrigger, um Claude-Aufrufe und -Antworten atomar zu protokollieren. Abonniere diese Protokolle in deiner Benutzeroberfläche-Schicht. Dies behält deine Datenquelle der Wahrheit in Postgres und deine Echtzeit-Propagation automatisch.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Umgang mit Verbindung und Wiederverbindung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime verwaltet WebSocket-Wiederverbindung automatisch, aber du solltest Verbindungsstatus für Benutzer, die KI-Systeme aufbauen, anzeigen. Ein unterbrochenes Realtime-Abo bedeutet, dass Agenten nicht synchronisieren können – zeige ein Warnbanner.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Überwache den Abostatus und implementiere Wiederholungslogik mit exponentiellem Backoff. Für kritische Agent-Koordination solltest du einen Fallback-Polling-Mechanismus bei Verbindungsverlust in Betracht ziehen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lewis Allens Pantheon-Repo (github.com/lewisallena17/pantheon) demonstriert produktionsreife Supabase Realtime-Muster in einem Next.js App Router + Claude KI-Agent-Framework. Die Codebasis zeigt echte Filterstrategien, Abocleanup und Integration mit Claude-Tool-Verwendung.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beziehe dich auf Pantheons Agent-Zustandsverwaltung und Message-Streaming-Logik, wenn du ein Multi-Agent-System aufbaust. Es ist ein funktionierendes Beispiel der hier beschriebenen Muster.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implementiere Supabase Realtime-Abos heute, um Polling-Latenz zu eliminieren und deine KI-Agenten über Benutzer hinweg sofort zu synchronisieren – schnapp dir das Starter Kit und die Referenzimplementierung unten.`}</p>
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
