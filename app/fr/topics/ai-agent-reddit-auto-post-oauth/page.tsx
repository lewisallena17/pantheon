import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-reddit-auto-post-oauth'

export const metadata: Metadata = {
  title:       'Publication automatique sur Reddit à partir d\'agents IA via OAuth',
  description: 'Intégrez la publication automatique sur Reddit dans les agents Claude IA en utilisant OAuth2. Guide étape par étape pour l\'intégration Next.js + Supabase avec d',
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
    title:       'Publication automatique sur Reddit à partir d\'agents IA via OAuth',
    description: 'Intégrez la publication automatique sur Reddit dans les agents Claude IA en utilisant OAuth2. Guide étape par étape pour l\'intégration Next.js + Supabase avec d',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Publication automatique sur Reddit à partir d\'agents IA via OAuth', description: 'Intégrez la publication automatique sur Reddit dans les agents Claude IA en utilisant OAuth2. Guide étape par étape pour l\'intégration Next.js + Supabase avec d' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Publication automatique sur Reddit à partir d'agents IA via OAuth"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Automatisez la publication sur Reddit directement à partir de votre agent Claude IA en implémentant l'authentification OAuth2 et l'API Reddit—permettant une distribution de contenu autonome sans intervention manuelle ni identifiants codés en dur.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi OAuth est important pour les agents IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stocker les identifiants Reddit dans la mémoire ou les variables d'environnement de votre agent crée une dette de sécurité. OAuth2 permet à votre agent de demander l'accès à Reddit au nom d'un utilisateur, puis les jetons d'actualisation expirent et se renouvellent—pas de secrets permanents qui traînent.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lorsque votre agent Claude doit publier, il utilise un jeton d'accès valide lié à un compte Reddit spécifique. S'il est compromis, ce jeton a une portée limitée et une durée de vie courte. Vous pouvez le révoquer sans réinitialiser les mots de passe dans tous les systèmes.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configuration des identifiants OAuth2 de Reddit"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Allez sur reddit.com/prefs/apps et créez une application 'script'. Reddit vous donne un ID client et un secret client. Définissez votre URI de redirection sur votre gestionnaire de rappel Next.js—généralement \`https://votredomaine.com/api/auth/reddit/callback\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez \`REDDIT_CLIENT_ID\` et \`REDDIT_CLIENT_SECRET\` dans le coffre-fort Supabase ou votre .env.local. Ne les validez jamais. Le point de terminaison OAuth de Reddit est \`https://www.reddit.com/api/v1/authorize\` avec des portées comme \`submit\` et \`read\` pour la publication et l'extraction des données utilisateur.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construction du rappel OAuth dans Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lorsqu'un utilisateur autorise votre application, Reddit redirige vers votre route de rappel avec un paramètre \`code\`. Échangez ce code contre un jeton d'accès via une requête POST à \`https://www.reddit.com/api/v1/access_token\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez le jeton d'actualisation dans Supabase (chiffré) et le jeton d'accès en mémoire ou dans Redis avec un court TTL. Votre agent Claude récupère le jeton d'actualisation quand il doit publier, l'actualise s'il a expiré, puis appelle le point de terminaison API de Reddit pour soumettre du contenu.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Appel de l'API Reddit à partir de votre agent Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre agent Claude utilise un outil qui accepte \`subreddit\`, \`title\` et \`content\`. Il récupère le jeton d'actualisation de l'utilisateur à partir de Supabase, actualise le jeton d'accès si nécessaire, puis POST vers \`https://oauth.reddit.com/api/v1/submit\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Incluez le jeton d'accès dans l'en-tête Authorization. Reddit valide la portée du jeton et les autorisations de l'utilisateur. Si le jeton est invalide ou expiré, implémentez une nouvelle tentative avec actualisation du jeton. Retournez le succès/l'échec à l'agent pour qu'il puisse décider des prochaines étapes.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestion de l'actualisation et de l'expiration des jetons"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les jetons d'accès de Reddit vivent généralement 1 heure. Avant de publier, vérifiez l'horodatage \`expires_in\` du jeton. S'il est obsolète, utilisez le jeton d'actualisation pour en obtenir un nouveau sans intervention de l'utilisateur.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez les heures d'expiration dans Supabase et implémentez une fonction d'assistance qui actualise automatiquement. Cela maintient votre agent autonome—il ne demande jamais à l'utilisateur de se réautoriser en milieu de session.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le repo Pantheon sur github.com/lewisallena17/pantheon contient une implémentation prête pour la production d'agents IA publiant sur Reddit, Twitter et d'autres plates-formes via OAuth. Il inclut des migrations de schéma Supabase, des routes API Next.js et des définitions d'outils Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forkez-le comme kit de démarrage. Le repo gère la rotation des jetons, la récupération des erreurs et la limitation du débit dès le départ. Il est construit pour les développeurs indépendants qui ont besoin de publication sociale sans réinventer la tuyauterie OAuth.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implémentez OAuth2 Reddit dans votre agent Claude pour déverrouiller la publication autonome—récupérez le kit de démarrage Pantheon open-source et déployez en quelques heures.`}</p>
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
