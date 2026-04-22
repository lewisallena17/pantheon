import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:       'Contact · pantheon',
  description: 'Get in touch with pantheon.',
}

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'lta.gb@outlook.com'
const SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL || 'https://task-dashboard-sigma-three.vercel.app'

export default function Contact() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400">contact</span>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4">Contact</h1>

        <section className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            pantheon is built and operated by one person. Drop me a line and I&apos;ll read it.
          </p>

          <div className="rounded border border-cyan-900/40 bg-cyan-950/20 p-6 my-6">
            <div className="text-[10px] font-mono tracking-widest text-cyan-600 uppercase mb-2">email</div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-xl font-mono text-cyan-300 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">What I&apos;m responsive to</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Corrections or feedback on any article on this site</li>
            <li>Questions about the open-source pantheon starter kit</li>
            <li>Requests to remove personal data per the <Link href="/privacy" className="text-cyan-400 hover:underline">privacy policy</Link></li>
            <li>Advertising or sponsorship inquiries</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Open source</h2>
          <p>
            The code behind this site is public at{' '}
            <a className="text-cyan-400 hover:underline" href="https://github.com/lewisallena17/pantheon" target="_blank" rel="noopener noreferrer">github.com/lewisallena17/pantheon</a>. File an issue there for anything code-related — it&apos;s faster than email.
          </p>

          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-2">Response time</h2>
          <p>
            Typically within a few business days. Nothing is automated on this inbox — a human reads every message.
          </p>
        </section>

        <footer className="mt-12 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex gap-4 flex-wrap">
          <Link href="/" className="hover:text-cyan-400">home</Link>
          <Link href="/topics" className="hover:text-cyan-400">articles</Link>
          <Link href="/about" className="hover:text-cyan-400">about</Link>
          <Link href="/privacy" className="hover:text-cyan-400">privacy</Link>
          <a href={SITE_URL} className="ml-auto text-slate-700">{SITE_URL.replace(/^https?:\/\//, '')}</a>
        </footer>
      </article>
    </main>
  )
}
