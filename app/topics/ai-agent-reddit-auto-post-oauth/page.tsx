import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-reddit-auto-post-oauth'

export const metadata: Metadata = {
  title:       'Auto-Post to Reddit from AI Agents via OAuth',
  description: 'Build Reddit auto-posting into Claude AI agents using OAuth2. Step-by-step guide for Next.js + Supabase integration with real code examples.',
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
    title:       'Auto-Post to Reddit from AI Agents via OAuth',
    description: 'Build Reddit auto-posting into Claude AI agents using OAuth2. Step-by-step guide for Next.js + Supabase integration with real code examples.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Auto-Post to Reddit from AI Agents via OAuth', description: 'Build Reddit auto-posting into Claude AI agents using OAuth2. Step-by-step guide for Next.js + Supabase integration with real code examples.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Auto-Posting to Reddit from an AI Agent via OAuth"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Automate Reddit posting directly from your Claude AI agent by implementing OAuth2 authentication and the Reddit API—enabling autonomous content distribution without manual intervention or hardcoded credentials.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why OAuth Matters for AI Agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Storing Reddit credentials in your agent's memory or environment variables creates security debt. OAuth2 lets your agent request Reddit access on behalf of a user, then refresh tokens expire and rotate—no permanent secrets lying around.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When your Claude agent needs to post, it uses a valid access token tied to a specific Reddit account. If compromised, that token has limited scope and a short lifetime. You revoke it without resetting passwords across systems.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Setting Up Reddit OAuth2 Credentials"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Go to reddit.com/prefs/apps and create a 'script' application. Reddit gives you a client ID and client secret. Set your redirect URI to your Next.js callback handler—typically \`https://yourdomain.com/api/auth/reddit/callback\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store \`REDDIT_CLIENT_ID\` and \`REDDIT_CLIENT_SECRET\` in Supabase vault or your .env.local. Never commit these. Reddit's OAuth endpoint is \`https://www.reddit.com/api/v1/authorize\` with scopes like \`submit\` and \`read\` for posting and fetching user data.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Building the OAuth Callback in Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When a user authorizes your app, Reddit redirects to your callback route with a \`code\` parameter. Exchange that code for an access token via a POST request to \`https://www.reddit.com/api/v1/access_token\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store the refresh token in Supabase (encrypted) and the access token in memory or Redis with a short TTL. Your Claude agent retrieves the refresh token when it needs to post, refreshes if expired, then calls Reddit's API endpoint to submit content.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Calling Reddit's API from Your Claude Agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your Claude agent uses a tool that accepts \`subreddit\`, \`title\`, and \`content\`. It retrieves the user's refresh token from Supabase, refreshes the access token if needed, then POST to \`https://oauth.reddit.com/api/v1/submit\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Include the access token in the Authorization header. Reddit validates the token scope and user permissions. If the token is invalid or expired, implement a retry with token refresh. Return success/failure to the agent so it can decide next steps.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Handling Token Refresh and Expiry"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Access tokens from Reddit typically live 1 hour. Before posting, check the token's \`expires_in\` timestamp. If stale, use the refresh token to get a new one without user intervention.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Store expiry times in Supabase and implement a helper function that automatically refreshes. This keeps your agent autonomous—it never asks the user to re-authorize mid-session.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon repo at github.com/lewisallena17/pantheon contains a production-ready implementation of AI agents posting to Reddit, Twitter, and other platforms via OAuth. It includes Supabase schema migrations, Next.js API routes, and Claude tool definitions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it as a starter kit. The repo handles token rotation, error recovery, and rate limiting out of the box. It's built for indie developers who need social posting without reinventing OAuth plumbing.`}</p>

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
        {/* <!-- tools-mentioned:v1 --> */}
        <section className="mb-6 mt-10 rounded border border-slate-800/60 bg-slate-950 p-4">
          <h3 className="text-sm font-mono text-slate-400 tracking-widest uppercase mb-2">◈ Tools mentioned</h3>
          <ul className="text-[13px] text-slate-300 space-y-1">
            <li><a href="https://supabase.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Supabase</a> <span className="text-slate-500">— open-source Firebase alt</span></li>
            <li><a href="https://vercel.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Vercel</a> <span className="text-slate-500">— zero-config Next.js hosting</span></li>
            <li><a href="https://claude.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Claude</a> <span className="text-slate-500">— AI assistant by Anthropic</span></li>
            <li><a href="https://gumroad.com" target="_blank" rel="noopener noreferrer sponsored" className="text-cyan-400 hover:underline">Gumroad</a> <span className="text-slate-500">— sell digital products</span></li>
          </ul>
          <p className="text-[10px] text-slate-600 mt-3">Some links may pay us a referral if you sign up. Never affects the price you pay.</p>
        </section>


        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Implement Reddit OAuth2 in your Claude agent to unlock autonomous posting—grab the open-source Pantheon starter kit and deploy within hours.`}</p>
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
