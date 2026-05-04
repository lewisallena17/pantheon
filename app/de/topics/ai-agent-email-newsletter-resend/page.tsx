import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/ai-agent-email-newsletter-resend'

export const metadata: Metadata = {
  title:       'Autonome E-Mail-Newsletter mit Resend und AI',
  description: 'Erstellen Sie selbstgenerierende Newsletter mit Claude AI, Resend und Next.js. Planen Sie autonome E-Mail-Agenten, die ohne manuelle Arbeit schreiben, formatier',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-email-newsletter-resend',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-email-newsletter-resend',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-email-newsletter-resend',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
    },
  },
  openGraph: {
    title:       'Autonome E-Mail-Newsletter mit Resend und AI',
    description: 'Erstellen Sie selbstgenerierende Newsletter mit Claude AI, Resend und Next.js. Planen Sie autonome E-Mail-Agenten, die ohne manuelle Arbeit schreiben, formatier',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Autonome E-Mail-Newsletter mit Resend und AI', description: 'Erstellen Sie selbstgenerierende Newsletter mit Claude AI, Resend und Next.js. Planen Sie autonome E-Mail-Agenten, die ohne manuelle Arbeit schreiben, formatier' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Autonome E-Mail-Newsletter mit Resend und AI"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Hören Sie auf, Newsletter manuell zu schreiben—erstellen Sie einen autonomen Agenten, der E-Mails mit Claude, Resend und Serverless-Funktionen zeitgesteuert generiert, personalisiert und versendet.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum autonome E-Mails für Indie-Entwickler wichtig sind"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Als Gründer ist jede Stunde, die Sie mit dem Schreiben und Formatieren von E-Mails verbringen, eine Stunde, die Sie nicht in die Produktentwicklung investieren. Autonome E-Mail-Agenten lösen dieses Problem, indem sie die Inhaltsgenerierung an Claude delegieren, während Resend zuverlässige Zustellung im großen Maßstab übernimmt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Im Gegensatz zu generischen E-Mail-Tools versteht Claude den Kontext—Ihre Produktupdates, das Nutzerverhalten, den Newsletter-Ton—und generiert authentische Inhalte, die nicht wie Vorlagen wirken. In Kombination mit Resends Transaktions-E-Mail-Infrastruktur erhalten Sie ein System, das von 100 bis 100.000 Abonnenten skaliert, ohne Overhead zu verursachen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architektur: Claude + Resend + Next.js-Funktionen"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Muster ist einfach: Eine zeitgesteuerte Next.js-API-Route löst Claude aus, um Newsletter-Inhalte zu generieren, und leitet die Ausgabe direkt an Resend zum Versand weiter. Verwenden Sie Supabase, um Abonnentenlisten zu speichern und nachzuverfolgen, welche Newsletter an wen versendet wurden.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude übernimmt die kreative Arbeit—Zusammenfassung Ihrer neuesten Funktionen, Schreiben von Betreffzeilen, Formatierung in HTML. Resend verwaltet Authentifizierung, Bounce-Tracking und Compliance. Ihre Next.js-Route fungiert als Orchestrator, ruft beide APIs nacheinander auf und protokolliert Ergebnisse in Ihrer Datenbank.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function POST(req: Request) {
  const claude = new Anthropic();
  const msg = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'Write a brief product update email for our SaaS tool. Tone: friendly, technical.'
    }]
  });
  
  const emailContent = msg.content[0].type === 'text' ? msg.content[0].text : '';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'newsletter@yourdomain.com',
    to: subscriber.email,
    subject: 'Your Weekly Update',
    html: emailContent
  });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Zeitplanung mit Vercel Cron oder externen Triggern"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Verwenden Sie Vercel Cron Jobs (cron-Feld in vercel.json), um Ihre Newsletter-Funktion nach einem Zeitplan auszulösen—täglich, wöchentlich oder in benutzerdefinierten Intervallen. Alternativ können Sie einen Service wie Trigger.dev oder n8n für komplexere Workflows verwenden, die möglicherweise zuerst Daten von Ihren Analytics oder CRM abrufen.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für mehrstufige Workflows (Daten abrufen → E-Mail generieren → Betreffzeilen A/B-testen → versenden) verhindern Orchestration-Tools Timeouts und fügen automatisch Wiederholungslogik hinzu. Halten Sie den eigentlichen Versandvorgang in Ihrer Next.js-Funktion einfach.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Personalisierung ohne manuelle Segmentierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude kann Abonnenten-Metadaten aus Supabase lesen (Anmeldungsquelle, Plan-Typ, Funktionsnutzung) und personalisierte Details in jede E-Mail einfügen. Anstatt identische Newsletter an alle zu versenden, erhält jeder Empfänger Inhalte, die auf seinen Kontext abgestimmt sind.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fragen Sie Ihre Supabase-Tabelle nach Abonnenten-Kohorten ab, übergeben Sie relevante Benutzerdaten an Claudes Prompt, und lassen Sie ihn Ton und Inhalt entsprechend anpassen. Dies dauert 30 Sekunden zur Einrichtung und verbessert die Engagement-Raten dramatisch.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Fehlerbehandlung und Compliance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Protokollieren Sie jeden Versandversuch in Supabase mit Zeitstempel und Antwortcodes. Resend gibt detaillierte Bounce- und Beschwerdedaten zurück; fragen Sie diese regelmäßig ab, um eine saubere Liste zu führen. Claudes Ausgaben sind deterministisch bei gleichem Input, sodass Sie Inhalte bei Bedarf sicher neu generieren können.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Für GDPR/CAN-SPAM: Speichern Sie explizite Zustimmung in Ihrer Datenbank, fügen Sie in jede E-Mail Abmelde-Links ein (Resend hat integrierte Unterstützung), und versenden Sie niemals ohne Genehmigung des Benutzers in der Datenbank.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository (github.com/lewisallena17/pantheon) ist ein produktionsreifes Starter-Kit, das Claude, Resend und Next.js mit Supabase für die Abonnentenverwaltung verbindet. Es enthält Umgebungssetup, Cron-Konfiguration, Fehlerbehandlung und Beispiel-Prompts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Klonen Sie es, fügen Sie Ihre API-Schlüssel hinzu und stellen Sie es auf Vercel bereit. Innerhalb weniger Minuten haben Sie ein vollständig autonomes Newsletter-System, das E-Mails generiert und versendet, ohne ein Dashboard zu berühren.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Erstellen Sie Ihren autonomen Newsletter an einem Nachmittag mit Claude, Resend und Pantheon—holen Sie sich das Starter-Kit auf github.com/lewisallena17/pantheon und beginnen Sie zu versenden.`}</p>
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
