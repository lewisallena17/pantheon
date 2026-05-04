import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/nextjs-14-app-router-ai-dashboard'

export const metadata: Metadata = {
  title:       'AI Dashboard Next.js 14: App Router Anleitung',
  description: 'Erstellen Sie produktive AI Dashboards mit Next.js 14 App Router. Echte Muster für Claude Integration, Echtzeit-Updates und Supabase-Authentifizierung.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-app-router-ai-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-app-router-ai-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-app-router-ai-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
    },
  },
  openGraph: {
    title:       'AI Dashboard Next.js 14: App Router Anleitung',
    description: 'Erstellen Sie produktive AI Dashboards mit Next.js 14 App Router. Echte Muster für Claude Integration, Echtzeit-Updates und Supabase-Authentifizierung.',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'AI Dashboard Next.js 14: App Router Anleitung', description: 'Erstellen Sie produktive AI Dashboards mit Next.js 14 App Router. Echte Muster für Claude Integration, Echtzeit-Updates und Supabase-Authentifizierung.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"AI Dashboard Next.js 14: App Router Anleitung"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Der App Router von Next.js 14 ermöglicht es, ein vollständig funktionales AI Dashboard – komplett mit Claude API Integration, Streaming-Antworten und authentifizierten Benutzersitzungen – an einem Wochenende statt in Wochen voller Boilerplate zu versenden.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum App Router alles für AI Dashboards verändert"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Der Pages Router zwang Sie, API-Routen separat von Ihrer UI-Logik zu verwalten. App Router hebt diese Trennung auf: Server-Komponenten handhaben Claude-Aufrufe direkt, Streaming-Antworten fließen zum Client ohne Middleware-Komplexität, und Middleware läuft einmal am Edge statt bei jedem Request. Für AI Dashboards speziell bedeutet dies eine niedrigere Latenz zwischen Benutzereingabe und Claudes Response-Stream.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Server-Komponenten eliminieren auch die Notwendigkeit, Ihren Claude API-Schlüssel dem Browser auszusetzen. Sie rufen die API aus layout.tsx oder einer Server Action auf, streamen das Ergebnis, und der Client berührt niemals die Authentifizierung. Supabase-Sitzungen funktionieren auf die gleiche Weise – verifizieren Sie Token serverseitig, verwenden Sie sie in Claude-Anfragen, fertig.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Server Actions für Claude Integration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Server Actions ersetzen traditionelle API-Endpunkte. Markieren Sie eine Funktion mit 'use server', rufen Sie Claudes API darin auf, und rufen Sie sie direkt aus Ihrer Komponente auf. Keine JSON-Serialisierung, keine Route Handler, keine CORS-Kopfschmerzen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Beim Streaming von Claude-Antworten zum Client verwenden Sie readline oder text-decoder, um den Response-Stream zu teilen. Dieses Muster funktioniert besonders gut für Agent-Systeme, bei denen Sie zwischenzeitliche Thinking-Schritte anzeigen möchten, während sie ankommen.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server';

import Anthropic from '@anthropic-ai/sdk';

export async function streamAgentResponse(input: string) {
  const client = new Anthropic();
  const stream = client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: input }],
  });
  
  return stream;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Echtzeit-Updates mit Server-Sent Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router unterstützt Streaming-Antworten nativ über Response-Objekte. Für Live-Agent-Dashboards erstellen Sie einen Route Handler, der eine Server-Sent Event-Verbindung öffnet, Claudes Stream darin piped, und Ihr Client abonniert mit EventSource. Das Ergebnis fühlt sich wie eine native WebSocket-Erfahrung an, ohne die Infrastrukturkosten.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies ist wesentlich, wenn Ihre Agents mehrere Claude-Aufrufe hintereinander durchführen. Sie können die Ausgabe jedes Schritts streamen, wenn er abgeschlossen ist, was Benutzern Einblick gibt, was der Agent tut.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Supabase Auth mit Middleware"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router Middleware läuft vor jeder Route. Richten Sie hier die Supabase-Sitzungsverifizierung ein, um JWTs zu prüfen und Tokens bei jedem Request zu aktualisieren. Speichern Sie den verifizierten Benutzer in request.user, zugänglich in Server-Komponenten und Server Actions ohne zusätzliche Datenbankabfragen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dieses Muster schützt Ihre Claude-Aufrufe – Sie können verifizieren, dass nur authentifizierte Benutzer mit gültigen Sitzungen API-Anfragen auslösen, und Sie können die Nutzung pro Benutzer für Rate Limiting oder Billing verfolgen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Wiederverwendbare Dashboard-Komponenten erstellen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Client-Komponenten für interaktive UI (Diagramme, Eingabeformulare, Echtzeit-Updates), halten Sie aber Claude-Logik in Server Actions. Diese Trennung hält Ihren Component Tree sauber und Ihre API-Aufrufe sicher. Ein typisches Dashboard hat 3-4 Server Actions: eine für jeden Agent Task, eine für Sitzungsaktualisierung, eine für Analytics-Logging.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für Dashboards mit mehreren parallel laufenden Agents verwenden Sie Promise.all() in einer Server Action, um Claude mehrmals aufzurufen, geben dann alle Ergebnisse zum Client in einem einzigen Render zurück. Dies ist schneller als sequenzielle Aufrufe.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Produktionsmuster: Error Handling und Rate Limiting"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wickeln Sie Claude API-Aufrufe in try-catch-Blöcke ein, die strukturierte Fehlerantworten zurückgeben. Der Client kann benutzerfreundliche Meldungen anzeigen, ohne API-Details auszusetzen. Für Rate Limiting verwenden Sie Supabase's integriertes Rate Limiting oder eine Redis-Ebene – prüfen Sie Limits vor dem Claude-Aufruf, nicht danach.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Legen Sie immer explizite Timeouts auf Claude-Anfragen fest. Ein 30-Sekunden-Timeout verhindert, dass hängende Verbindungen sich anhäufen. Protokollieren Sie Fehler mit Request-IDs, damit Sie Probleme in der Produktion nachverfolgbar machen können.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`App Router + Server Actions + Server Components eliminieren 70% des Boilerplate, das traditionell die AI Dashboard Entwicklung verlangsamt – beginnen Sie mit Pantheon, versenden Sie Ihr erstes Agent Dashboard diese Woche.`}</p>
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
