import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-reddit-auto-post-oauth'

export const metadata: Metadata = {
  title:       'Automatisches Posten auf Reddit von AI-Agenten via OAuth',
  description: 'Integrieren Sie Reddit Auto-Posting in Claude AI-Agenten mit OAuth2. Schritt-für-Schritt-Anleitung für Next.js + Supabase-Integration mit echten Code-Beispielen',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-reddit-auto-post-oauth',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-reddit-auto-post-oauth',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-reddit-auto-post-oauth',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-reddit-auto-post-oauth',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-reddit-auto-post-oauth',
    },
  },
  openGraph: {
    title:       'Automatisches Posten auf Reddit von AI-Agenten via OAuth',
    description: 'Integrieren Sie Reddit Auto-Posting in Claude AI-Agenten mit OAuth2. Schritt-für-Schritt-Anleitung für Next.js + Supabase-Integration mit echten Code-Beispielen',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Automatisches Posten auf Reddit von AI-Agenten via OAuth', description: 'Integrieren Sie Reddit Auto-Posting in Claude AI-Agenten mit OAuth2. Schritt-für-Schritt-Anleitung für Next.js + Supabase-Integration mit echten Code-Beispielen' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Automatisches Posten auf Reddit von AI-Agenten via OAuth"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Automatisieren Sie Reddit-Postings direkt von Ihrem Claude AI-Agent aus, indem Sie OAuth2-Authentifizierung und die Reddit API implementieren – ermöglichen Sie autonome Inhaltsverteilung ohne manuelle Eingriffe oder hartcodierte Anmeldedaten.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum OAuth für AI-Agenten wichtig ist"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Speichern von Reddit-Anmeldedaten im Speicher Ihres Agenten oder in Umgebungsvariablen erzeugt Sicherheitsrisiken. OAuth2 ermöglicht es Ihrem Agenten, im Namen eines Benutzers Zugriff auf Reddit anzufordern – danach verfallen und rotieren die Refresh-Tokens. Keine permanenten Geheimnisse liegen herum.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn Ihr Claude-Agent posten muss, verwendet er ein gültiges Access-Token, das an ein bestimmtes Reddit-Konto gebunden ist. Falls kompromittiert, hat dieses Token begrenzten Umfang und kurze Lebensdauer. Sie können es widerrufen, ohne Passwörter in allen Systemen zurückzusetzen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Einrichten von Reddit OAuth2-Anmeldedaten"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Gehen Sie zu reddit.com/prefs/apps und erstellen Sie eine 'script'-Anwendung. Reddit gibt Ihnen eine Client-ID und ein Client-Secret. Setzen Sie Ihren Redirect-URI auf Ihren Next.js-Callback-Handler – typischerweise \`https://yourdomain.com/api/auth/reddit/callback\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie \`REDDIT_CLIENT_ID\` und \`REDDIT_CLIENT_SECRET\` im Supabase-Tresor oder in Ihrer .env.local. Committen Sie diese niemals. Reddits OAuth-Endpunkt ist \`https://www.reddit.com/api/v1/authorize\` mit Scopes wie \`submit\` und \`read\` zum Posten und Abrufen von Benutzerdaten.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Erstellen des OAuth-Callbacks in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn ein Benutzer Ihre App autorisiert, leitet Reddit zu Ihrer Callback-Route mit einem \`code\`-Parameter weiter. Tauschen Sie diesen Code gegen ein Access-Token via POST-Anfrage zu \`https://www.reddit.com/api/v1/access_token\` ein.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie das Refresh-Token in Supabase (verschlüsselt) und das Access-Token im Speicher oder Redis mit kurzem TTL. Ihr Claude-Agent ruft das Refresh-Token ab, wenn es posten muss, aktualisiert es falls abgelaufen, und ruft dann Reddits API-Endpunkt auf, um Inhalte einzureichen.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/auth/reddit/callback.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code } = req.query;
  const auth = Buffer.from(\`\${process.env.REDDIT_CLIENT_ID}:\${process.env.REDDIT_CLIENT_SECRET}\`).toString('base64');
  
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: { 'Authorization': \`Basic \${auth}\` },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: process.env.REDIRECT_URI })
  });
  
  const { access_token, refresh_token } = await tokenRes.json();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  await supabase.from('reddit_tokens').insert([{ user_id: req.user.id, refresh_token, created_at: new Date() }]);
  res.redirect('/dashboard');
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Aufrufen von Reddits API von Ihrem Claude-Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihr Claude-Agent verwendet ein Tool, das \`subreddit\`, \`title\` und \`content\` akzeptiert. Es ruft das Refresh-Token des Benutzers aus Supabase ab, aktualisiert das Access-Token bei Bedarf und sendet dann eine POST-Anfrage zu \`https://oauth.reddit.com/api/v1/submit\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fügen Sie das Access-Token im Authorization-Header ein. Reddit validiert den Token-Scope und die Benutzerberechtigungen. Falls das Token ungültig oder abgelaufen ist, implementieren Sie einen Wiederholungsversuch mit Token-Aktualisierung. Geben Sie Erfolg/Fehler an den Agent zurück, damit er nächste Schritte entscheiden kann.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handhabung von Token-Aktualisierung und -Ablauf"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Access-Tokens von Reddit haben typischerweise eine Lebensdauer von 1 Stunde. Überprüfen Sie vor dem Posten den \`expires_in\`-Zeitstempel des Tokens. Falls veraltet, verwenden Sie das Refresh-Token, um ohne Benutzereingriff ein neues zu erhalten.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Speichern Sie Ablaufzeiten in Supabase und implementieren Sie eine Hilfsfunktion, die automatisch aktualisiert. Dies hält Ihren Agenten autonom – er fragt den Benutzer nie um erneute Autorisierung während einer Sitzung.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository unter github.com/lewisallena17/pantheon enthält eine produktionsreife Implementierung von AI-Agenten, die über OAuth auf Reddit, Twitter und andere Plattformen posten. Es enthält Supabase-Schema-Migrationen, Next.js-API-Routes und Claude-Tool-Definitionen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forken Sie es als Starter-Kit. Das Repository handhabt Token-Rotation, Fehlerwiederherstellung und Rate-Limiting out of the box. Es wurde für Indie-Entwickler entwickelt, die Social-Posting-Funktionalität benötigen, ohne OAuth-Mechaniken neu zu erfinden.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implementieren Sie Reddit OAuth2 in Ihrem Claude-Agent, um autonomes Posten freizuschalten – greifen Sie zum Open-Source-Pantheon-Starter-Kit und stellen Sie alles innerhalb von Stunden bereit.`}</p>
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
