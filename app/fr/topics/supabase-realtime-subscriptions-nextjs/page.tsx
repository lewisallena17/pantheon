import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/supabase-realtime-subscriptions-nextjs'

export const metadata: Metadata = {
  title:       'Abonnements Supabase Realtime dans Next.js App Router',
  description: 'Créez des agents IA en temps réel avec Supabase Realtime et Next.js App Router. Abonnements en temps réel, composants serveur et modèles d\'intégration Claude.',
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
    title:       'Abonnements Supabase Realtime dans Next.js App Router',
    description: 'Créez des agents IA en temps réel avec Supabase Realtime et Next.js App Router. Abonnements en temps réel, composants serveur et modèles d\'intégration Claude.',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Abonnements Supabase Realtime dans Next.js App Router', description: 'Créez des agents IA en temps réel avec Supabase Realtime et Next.js App Router. Abonnements en temps réel, composants serveur et modèles d\'intégration Claude.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Abonnements Supabase Realtime dans Next.js App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Les abonnements Supabase Realtime vous permettent de transmettre les changements de base de données en direct vers vos composants Next.js App Router, éliminant le polling et permettant les mises à jour instantanées de l'état des agents IA—essentiel lors de la création de systèmes multi-agents qui doivent se synchroniser entre les utilisateurs et les appels API Claude.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi le temps réel est important pour les systèmes d'agents IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lors de la création d'agents IA avec Claude, vous avez besoin d'agents qui réagissent instantanément aux changements d'état. Un utilisateur modifie une invite, un autre agent la récupère immédiatement. Une exécution d'outil se termine, l'interface utilisateur se met à jour sans recalcul. Les abonnements Supabase Realtime rendent cela possible sans construire votre propre infrastructure WebSocket.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le polling traditionnel gaspille la bande passante et crée une latence. Les abonnements en temps réel transmettent les changements au moment où ils atteignent votre base de données Postgres, ce qui est particulièrement critique lorsque plusieurs instances Claude ou agents se coordonnent via une base de connaissances partagée.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configuration du temps réel dans Next.js App Router"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Créez un hook React qui gère les abonnements Supabase dans un contexte de composant serveur. Next.js App Router supporte les frontières 'use client', c'est là que réside votre logique d'abonnement—les composants serveur ne peuvent pas utiliser useEffect, mais ils peuvent diffuser les données via des composants serveur avec un enfant composant client qui gère les abonnements.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Initialisez votre client Supabase avec la configuration du canal en temps réel. Filtrez par tableau et conditions (comme agent_id ou user_id) pour éviter les mises à jour inutiles. Désinscrivez-vous au démontage pour éviter les fuites mémoire et les écouteurs en doublon.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Filtrage des abonnements par contexte utilisateur et agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tous les changements dans votre tableau d'agents n'intéressent pas chaque client. Utilisez la syntaxe de filtre de Supabase pour vous abonner uniquement aux lignes correspondant à vos critères—généralement les agents de l'utilisateur actuel ou les agents dans un espace de travail partagé.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cela réduit le bruit et garde vos re-rendus de composants concentrés. Pour les systèmes IA multi-locataires, le filtrage est indispensable pour la performance et l'isolation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combinaison du temps réel avec les réponses de l'API Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre modèle : (1) L'utilisateur déclenche un appel API Claude via Server Action, (2) La réponse Claude s'écrit dans la base de données via un déclencheur Postgres ou une insertion directe, (3) L'abonnement en temps réel se déclenche, (4) L'interface utilisateur se met à jour. Cela crée un flux d'état d'agent transparent sans polling.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez les déclencheurs de base de données pour enregistrer atomiquement les invocations et réponses Claude. Abonnez-vous à ces journaux dans votre couche d'interface utilisateur. Cela maintient votre source de vérité dans Postgres et votre propagation en temps réel automatique.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestion de la connexion et de la reconnexion"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime gère la reconnexion WebSocket automatiquement, mais vous devriez afficher le statut de connexion aux utilisateurs construisant des systèmes IA. Un abonnement en temps réel déconnecté signifie que les agents ne peuvent pas se synchroniser—affichez une bannière d'avertissement.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Surveillez l'état de l'abonnement et implémentez la logique de nouvelle tentative avec backoff exponentiel. Pour la coordination critique des agents, envisagez un mécanisme de polling de secours en cas de perte de connexion.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le dépôt Pantheon de Lewis Allen (github.com/lewisallena17/pantheon) démontre les modèles Supabase Realtime prêts pour la production dans un framework d'agent IA Next.js App Router + Claude. La base de code montre les véritables stratégies de filtrage, le nettoyage des abonnements et l'intégration avec l'utilisation d'outils Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Consultez la gestion de l'état des agents et la logique de diffusion en continu de Pantheon si vous construisez un système multi-agents. C'est un exemple fonctionnel des modèles décrits ici.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implémentez aujourd'hui les abonnements Supabase Realtime pour éliminer la latence du polling et synchroniser vos agents IA instantanément entre les utilisateurs—téléchargez le kit de démarrage et l'implémentation de référence ci-dessous.`}</p>
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
