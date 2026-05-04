import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/supabase-edge-functions-ai-agents'

export const metadata: Metadata = {
  title:       'Supabase Edge Functions pour les webhooks d\'agents IA',
  description: 'Créez des gestionnaires de webhooks d\'agents IA évolutifs avec Supabase Edge Functions. Déployez les intégrations Claude instantanément sans gérer de serveurs.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-edge-functions-ai-agents',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-edge-functions-ai-agents',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-edge-functions-ai-agents',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-edge-functions-ai-agents',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-edge-functions-ai-agents',
    },
  },
  openGraph: {
    title:       'Supabase Edge Functions pour les webhooks d\'agents IA',
    description: 'Créez des gestionnaires de webhooks d\'agents IA évolutifs avec Supabase Edge Functions. Déployez les intégrations Claude instantanément sans gérer de serveurs.',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Edge Functions pour les webhooks d\'agents IA', description: 'Créez des gestionnaires de webhooks d\'agents IA évolutifs avec Supabase Edge Functions. Déployez les intégrations Claude instantanément sans gérer de serveurs.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Edge Functions pour les webhooks d'agents IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Supabase Edge Functions vous permet de gérer les webhooks des agents IA sans infrastructure—déployez les intégrations Claude, traitez les réponses en streaming, et déclenchez des flux de travail autonomes en millisecondes à partir d'une seule fonction TypeScript.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi les Edge Functions surpassent les webhooks traditionnels pour les agents IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les gestionnaires de webhooks traditionnels nécessitent des serveurs persistants, des équilibreurs de charge et des pipelines de déploiement. Les Edge Functions s'exécutent globalement sur Cloudflare Workers, avec des démarrages à froid inférieurs à 100 ms. Pour les agents IA qui dépendent du traitement des événements en temps réel—appels d'outils Claude, poignées de main de webhooks, mises à jour asynchrones du statut des tâches—cette latence est importante.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vous évitez la dépendance envers un fournisseur en gardant les fonctions portables. Votre logique de webhook n'est pas liée à la passerelle API d'un seul fournisseur cloud. Supabase Edge Functions s'exécutent sur le runtime Deno ouvert, ce qui vous permet de migrer ou d'auto-héberger si nécessaire.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestion des rappels d'utilisation d'outils Claude à grande échelle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents Claude appellent souvent des outils externes qui nécessitent des rappels webhook. Lorsque votre service d'outils complète une tâche longue, il envoie un POST vers votre webhook. Les Edge Functions traitent ces rappels instantanément sans démarrer d'instances de conteneur.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chaque invocation de fonction est isolée et mise à l'échelle automatiquement. Si vous exécutez 100 instances d'agents Claude concurrentes attendant chacun des rappels d'outils, Supabase gère la charge. Vous ne payez que pour le temps d'exécution—généralement des microsecondes par hit webhook.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function handler(req: Request) {
  const { tool_use_id, result } = await req.json();
  const { data, error } = await supabase
    .from('agent_tasks')
    .update({ status: 'complete', result })
    .eq('tool_use_id', tool_use_id);
  return new Response(JSON.stringify({ ok: !error }));
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Réponses en streaming et contre-pression"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'API de streaming de Claude renvoie la sortie token par token. Les Edge Functions prennent en charge les réponses en streaming nativement, vous permettant de diriger la sortie de Claude directement vers votre client ou service en aval. Cela réduit l'empreinte mémoire et la latence pour les retours d'agent en temps réel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les agents IA générant des réponses longues (rapports, code, analyses), le streaming évite les problèmes de délai d'expiration. Votre webhook reste ouvert, les tokens circulent continuellement, et les clients voient la sortie immédiatement au lieu d'attendre l'achèvement.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration de base de données sans sauts supplémentaires"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Edge Functions s'exécutent dans le même VPC que votre base de données PostgreSQL. Les gestionnaires de webhooks qui ont besoin de lire l'état de l'agent, de consigner les interactions ou de mettre à jour les statuts des tâches accèdent à votre base de données avec une latence réseau nulle. Une seule fonction peut valider la signature du webhook, récupérer le contexte, appeler Claude et persister les résultats.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez Supabase RLS (Row Level Security) pour appliquer le contrôle d'accès directement dans votre Edge Function. Chaque invocation de webhook hérite des permissions de base de données basées sur la clé API ou JWT, éliminant les couches d'autorisation manuelle.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Secrets d'environnement et gestion sécurisée des identifiants"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez votre clé API Claude, vos secrets de signature de webhook et vos identifiants tiers dans les paramètres du projet Supabase. Les Edge Functions y accèdent via des variables d'environnement—ne codez jamais en dur les clés dans votre base de code.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Faites tourner les secrets sans redéployer. Supabase propage les mises à jour instantanément à toutes les instances de fonction. Pour les flux de travail critiques de sécurité (confirmations de paiement, rappels d'authentification utilisateur), c'est indispensable.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le dépôt Pantheon de Lewis Allen (github.com/lewisallena17/pantheon) démontre une architecture d'agent IA de qualité production utilisant Supabase Edge Functions. La base de code inclut la validation des webhooks, les modèles d'intégration Claude, les rappels d'utilisation d'outils et l'échafaudage du frontend Next.js.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forkez-le comme votre modèle de démarrage. Pantheon couvre la boucle complète : invocation d'agent, gestion des webhooks, streaming et persistance d'état—tout ce dont vous avez besoin pour déployer un système d'agent IA fonctionnel en heures au lieu de semaines.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Déployez des webhooks d'agents IA évolutifs instantanément avec Supabase Edge Functions—pas de serveurs, pas de frais d'exploitation, juste du TypeScript exécuté globalement. Prenez le kit de démarrage Pantheon et lancez votre intégration Claude dès aujourd'hui.`}</p>
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
