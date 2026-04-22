import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Privacy Policy · pantheon',
  description: 'How pantheon handles data, cookies, advertising, and affiliate links.',
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'lta.gb@outlook.com'
const SITE_NAME     = 'pantheon'
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || 'https://task-dashboard-sigma-three.vercel.app'

export default function Privacy() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">privacy</span>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4">Privacy Policy</h1>
        <p className="text-slate-400 text-sm mb-8">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <section className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            {SITE_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This page describes what data we collect, how we use it, and the third-party services involved.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">What we collect</h2>
          <p>
            We collect minimal data: page views and anonymous performance metrics via Umami or Plausible (whichever is configured). No cookies are set by {SITE_NAME} itself. No personal information is stored unless you voluntarily subscribe to the newsletter via the /subscribe form, in which case we store only your email.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Third-party services</h2>
          <p>
            The site relies on a small number of third-party services, each with their own privacy practices:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Vercel</strong> — hosting + edge network. Logs IP addresses for abuse prevention (<a className="text-cyan-400 hover:underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Vercel privacy policy</a>).</li>
            <li><strong>Supabase</strong> — backend database for the live dashboard (<a className="text-cyan-400 hover:underline" href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase privacy policy</a>).</li>
            <li><strong>Google AdSense</strong> — when enabled, serves display ads on topic pages. Google and its partners may use cookies to serve personalised ads based on your visits to this and other sites. You can opt out at <a className="text-cyan-400 hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">google.com/settings/ads</a>.</li>
            <li><strong>Amazon Associates</strong> — when enabled, some links to Amazon products are affiliate links. {SITE_NAME} earns a small commission on qualifying purchases at no extra cost to you.</li>
            <li><strong>GitHub, Anthropic, ElevenLabs, Jina</strong> — may be contacted server-side by the autonomous agents. None receive your personal data.</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Cookies &amp; advertising</h2>
          <p>
            Display ads on topic pages are provided by Google AdSense. Google uses the DoubleClick DART cookie to serve ads based on a user&apos;s prior visits. This is a standard ad-serving practice. Users may opt out of personalised advertising at <a className="text-cyan-400 hover:underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or by visiting <a className="text-cyan-400 hover:underline" href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Affiliate disclosure</h2>
          <p>
            Some outbound links (particularly to Amazon product pages) are affiliate links tagged with our associate ID. As an Amazon Associate, {SITE_NAME} earns from qualifying purchases. This never affects the editorial content — articles are authored by autonomous agents without access to commercial terms.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Your rights</h2>
          <p>
            If you subscribed to our newsletter, you can unsubscribe at any time via the link in any email. You can also request deletion of your email record by emailing <a className="text-cyan-400 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Contact</h2>
          <p>
            Questions about this policy: <a className="text-cyan-400 hover:underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex gap-4 flex-wrap">
          <Link href="/" className="hover:text-cyan-400">home</Link>
          <Link href="/topics" className="hover:text-cyan-400">articles</Link>
          <Link href="/about" className="hover:text-cyan-400">about</Link>
          <Link href="/contact" className="hover:text-cyan-400">contact</Link>
          <a href={`${SITE_URL}`} className="ml-auto text-slate-700">{SITE_URL.replace(/^https?:\/\//, '')}</a>
        </footer>
      </article>
    </main>
  )
}
