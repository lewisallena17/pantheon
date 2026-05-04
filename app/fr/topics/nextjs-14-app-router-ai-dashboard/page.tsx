import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/nextjs-14-app-router-ai-dashboard'

export const metadata: Metadata = {
  title:       'Tableau de bord IA Next.js 14 : Guide App Router',
  description: 'Créez des tableaux de bord IA en production avec Next.js 14 App Router. Patterns réels pour l\'intégration Claude, les mises à jour en temps réel et l\'authentifi',
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
    title:       'Tableau de bord IA Next.js 14 : Guide App Router',
    description: 'Créez des tableaux de bord IA en production avec Next.js 14 App Router. Patterns réels pour l\'intégration Claude, les mises à jour en temps réel et l\'authentifi',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Tableau de bord IA Next.js 14 : Guide App Router', description: 'Créez des tableaux de bord IA en production avec Next.js 14 App Router. Patterns réels pour l\'intégration Claude, les mises à jour en temps réel et l\'authentifi' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Tableau de bord IA Next.js 14 : Guide App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`L'App Router de Next.js 14 rend possible de déployer un tableau de bord IA entièrement fonctionnel—complet avec intégration de l'API Claude, réponses en streaming et sessions utilisateur authentifiées—en un seul week-end au lieu de semaines de boilerplate.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi App Router change tout pour les tableaux de bord IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le Pages Router vous forçait à gérer les routes API séparément de votre logique UI. App Router efface cette séparation : les server components gèrent les appels Claude directement, les réponses en streaming circulent vers le client sans complexité middleware, et le middleware s'exécute une seule fois à la edge au lieu de sur chaque requête. Pour les tableaux de bord IA spécifiquement, cela signifie une latence plus faible entre l'entrée utilisateur et le flux de réponse de Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les server components éliminent également le besoin d'exposer votre clé API Claude au navigateur. Vous appelez l'API depuis layout.tsx ou une server action, streamez le résultat, et le client ne touche jamais à l'authentification. Les sessions Supabase fonctionnent de la même manière—vérifiez les tokens côté serveur, utilisez-les dans les requêtes Claude, c'est fait.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Server Actions pour l'intégration Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les server actions remplacent les endpoints API traditionnels. Marquez une fonction avec 'use server', appelez l'API Claude à l'intérieur, et invoquez-la directement depuis votre composant. Pas de sérialisation JSON, pas de route handlers, pas de maux de tête CORS.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lors du streaming des réponses Claude vers le client, utilisez readline ou text-decoder pour chunker le flux de réponse. Ce pattern fonctionne particulièrement bien pour les systèmes d'agents où vous voulez afficher les étapes de réflexion intermédiaires au fur et à mesure qu'elles arrivent.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Mises à jour en temps réel avec Server-Sent Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router supporte nativement les réponses en streaming via des objets Response. Pour les tableaux de bord d'agents en direct, créez un route handler qui ouvre une connexion Server-Sent Event, transfère le flux de Claude vers elle, et votre client s'abonne avec EventSource. Le résultat ressemble à une expérience WebSocket native sans le coût infrastructurel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`C'est essentiel quand vos agents font plusieurs appels Claude en séquence. Vous pouvez streamer la sortie de chaque étape au fur et à mesure qu'elle se termine, donnant aux utilisateurs une visibilité sur ce que fait l'agent.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Authentification Supabase avec Middleware"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le middleware d'App Router s'exécute avant l'accès à toute route. Configurez la vérification de session Supabase ici pour vérifier les JWTs et rafraîchir les tokens à chaque requête. Stockez l'utilisateur vérifié dans request.user, accessible dans les server components et server actions sans requêtes de base de données supplémentaires.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ce pattern protège vos appels Claude—vous pouvez vérifier que seuls les utilisateurs authentifiés avec des sessions valides déclenchent les requêtes API, et vous pouvez suivre l'utilisation par utilisateur pour le rate limiting ou la facturation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construction de composants de tableau de bord réutilisables"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez les client components pour l'UI interactive (graphiques, formulaires d'entrée, mises à jour en temps réel), mais gardez la logique Claude dans les server actions. Cette séparation garde votre arborescence de composants propre et vos appels API sécurisés. Un tableau de bord typique aura 3-4 server actions : une pour chaque tâche d'agent, une pour le rafraîchissement de session, une pour la journalisation analytique.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les tableaux de bord montrant plusieurs agents en parallèle, utilisez Promise.all() dans une server action pour invoquer Claude plusieurs fois, puis retournez tous les résultats au client en une seule render. C'est plus rapide que les appels séquentiels.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Patterns de production : gestion des erreurs et rate limiting"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Encapsulez les appels d'API Claude dans des blocs try-catch qui retournent des réponses d'erreur structurées. Le client peut afficher des messages conviviaux sans exposer les détails de l'API. Pour le rate limiting, utilisez le rate limiting intégré de Supabase ou une couche Redis—vérifiez les limites avant d'invoquer Claude, pas après.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Définissez toujours des timeouts explicites sur les requêtes Claude. Un timeout de 30 secondes empêche l'accumulation de connexions suspendues. Journalisez les défaillances avec des ID de requête pour pouvoir tracer les problèmes en production.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`App Router + server actions + server components éliminent 70% du boilerplate qui ralentit traditionnellement le développement de tableaux de bord IA—commencez avec Pantheon, déployez votre premier tableau de bord d'agent cette semaine.`}</p>
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
