import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/nextjs-14-supabase-multi-agent-systems'

export const metadata: Metadata = {
  title:       'Next.js 14 + Supabase Systèmes Multi-Agents IA',
  description: 'Construisez des systèmes multi-agents IA de production avec Next.js 14 et Supabase. Patterns réels pour l\'intégration de Claude, la coordination d\'agents et l\'é',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-supabase-multi-agent-systems',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-supabase-multi-agent-systems',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-supabase-multi-agent-systems',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
    },
  },
  openGraph: {
    title:       'Next.js 14 + Supabase Systèmes Multi-Agents IA',
    description: 'Construisez des systèmes multi-agents IA de production avec Next.js 14 et Supabase. Patterns réels pour l\'intégration de Claude, la coordination d\'agents et l\'é',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Next.js 14 + Supabase Systèmes Multi-Agents IA', description: 'Construisez des systèmes multi-agents IA de production avec Next.js 14 et Supabase. Patterns réels pour l\'intégration de Claude, la coordination d\'agents et l\'é' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Next.js 14 + Supabase Systèmes Multi-Agents IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Construisez des systèmes multi-agents IA scalables où les agents Claude se coordonnent via Supabase, exécutent des tâches indépendamment et maintiennent l'état entre les requêtes—sans surcharge d'infrastructure.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi Next.js 14 + Supabase pour les systèmes multi-agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'App Router de Next.js 14 et les Server Actions vous donnent les primitives dont vous avez besoin : des endpoints en temps réel pour l'interrogation d'agents, des middlewares pour le routage des requêtes, et des fonctions compatibles avec les edges. Supabase fournit la base—PostgreSQL pour l'état des agents, Realtime pour le streaming d'événements, et Auth pour la communication sécurisée agent-à-agent.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La combinaison élimine le besoin de files d'attente de messages ou de frameworks d'orchestration. Les agents écrivent leur état directement dans Postgres, s'abonnent aux canaux Realtime et déclenchent des actions via les routes API. Vous êtes propriétaire de l'infrastructure dès le départ.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture d'état d'agent avec Postgres"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chaque agent a besoin d'un magasin d'état canonique. Les tables Supabase vous permettent de suivre le statut des agents, les files d'attente de tâches et les résultats dans un format interrogeable. Utilisez les politiques Row-Level Security (RLS) pour isoler les permissions des agents—un agent ne peut lire/écrire que ses propres tâches.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Structurez votre schéma avec agent_id comme clé étrangère, created_at pour l'ordre, et des énumérations de status pour l'état du flux de travail (pending, executing, completed, failed). Cela vous donne l'auditabilité gratuite et rend le débogage des flux multi-agents trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Core agent task table
CREATE TABLE agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  status text CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  input jsonb NOT NULL,
  output jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration d'agent Claude via Server Actions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les Server Actions de Next.js vous permettent d'appeler l'API de Claude côté serveur, en gardant votre clé API sécurisée et en évitant la gestion des tokens côté client. Chaque action reçoit l'état actuel de l'agent depuis Supabase, le transmet à Claude avec des outils/instructions, et persiste le résultat.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez le SDK Anthropic directement dans vos actions. Claude lit la file d'attente de tâches de l'agent, décide quoi faire ensuite, et votre action met à jour Supabase avec le résultat. Les abonnements Realtime notifient les autres agents des changements d'état sans interrogation.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server'

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export async function executeAgentTask(agentId: string) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const claude = new Anthropic();
  
  const { data: task } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .single();
  
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: JSON.stringify(task.input) }]
  });
  
  await supabase
    .from('agent_tasks')
    .update({ status: 'completed', output: response.content[0].text })
    .eq('id', task.id);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Coordination d'agents en temps réel avec Supabase Realtime"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents n'ont pas besoin d'interroger Supabase constamment. Utilisez les abonnements Realtime pour écouter les changements de tables spécifiques. Quand l'Agent A termine une tâche, l'abonnement de l'Agent B se déclenche immédiatement, déclenchant son action suivante.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cela fonctionne bien pour les flux de travail séquentiels. L'Agent A termine l'analyse, publie un résultat, et l'écouteur de l'Agent B démarre la synthèse. Pour le travail parallèle, utilisez les déclencheurs de fonctions Postgres pour distribuer les tâches de façon atomique.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestion des erreurs et logique de réessai"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez le nombre de tentatives et le dernier message d'erreur dans votre table agent_tasks. Enveloppez vos Server Actions dans try/catch, mettez à jour la ligne de tâche avec les détails de l'erreur, et re-mettez en queue automatiquement après un délai.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'extension pg_cron de Supabase vous permet de planifier les tâches de réessai directement dans Postgres. Aucun worker de queue séparé nécessaire. Les tâches échouées peuvent déclencher des alertes via des webhooks vers Discord ou l'email pour la visibilité.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le dépôt Pantheon sur github.com/lewisallena17/pantheon contient un kit de démarrage prêt pour la production pour les systèmes multi-agents Next.js 14 + Supabase. Il comprend les migrations de schéma, les patterns de Server Action, les aides d'abonnement Realtime et les utilitaires de gestion des erreurs.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forkez-le pour obtenir une base de travail. Le code démontre les flux de communication d'agents, la persistance des tâches et l'intégration de Claude avec les meilleures pratiques pour la sécurité et l'observabilité.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Commencez avec le kit de démarrage Pantheon—clonez-le, définissez vos credentials Supabase, et déployez des systèmes multi-agents sur Vercel en heures, pas en semaines.`}</p>
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
