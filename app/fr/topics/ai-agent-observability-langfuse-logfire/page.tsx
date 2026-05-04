import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-observability-langfuse-logfire'

export const metadata: Metadata = {
  title:       'Observabilité des agents IA : Guide Langfuse + Logfire',
  description: 'Surveillez les agents Claude en production avec Langfuse et Logfire. Traces en temps réel, suivi des coûts et débogage pour systèmes IA Next.js.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-observability-langfuse-logfire',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-observability-langfuse-logfire',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-observability-langfuse-logfire',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
    },
  },
  openGraph: {
    title:       'Observabilité des agents IA : Guide Langfuse + Logfire',
    description: 'Surveillez les agents Claude en production avec Langfuse et Logfire. Traces en temps réel, suivi des coûts et débogage pour systèmes IA Next.js.',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Observabilité des agents IA : Guide Langfuse + Logfire', description: 'Surveillez les agents Claude en production avec Langfuse et Logfire. Traces en temps réel, suivi des coûts et débogage pour systèmes IA Next.js.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Observabilité des agents IA : Guide Langfuse + Logfire"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Cessez de voler à l'aveugle avec vos agents Claude—Langfuse et Logfire vous donnent une visibilité complète sur l'utilisation des tokens, la latence et les modes de défaillance pour que vous puissiez déboguer en production au lieu de deviner.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi l'observabilité des agents est importante"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents IA sont des boîtes noires par défaut. Vous déployez un système basé sur Claude, les utilisateurs interagissent avec lui, et quand quelque chose se casse, vous n'avez aucune idée si c'est un problème de prompt, une limite de tokens, une hallucination d'outil ou un pic de latence. L'observabilité inverse cela : vous obtenez des traces structurées de chaque appel LLM, exécution d'outil et branche de décision.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les équipes indépendantes, c'est critique. Vous ne pouvez pas embaucher une personne DevOps pour enquêter sur les problèmes de production. Vous avez besoin d'outils qui vous montrent exactement ce qui s'est passé, combien cela a coûté et pourquoi c'a échoué—dans un seul tableau de bord.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Langfuse pour les traces LLM et le suivi des coûts"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Langfuse capture chaque interaction avec Claude : tokens de prompt, tokens de complétion, latence et outputs structurés. Il s'intègre directement au SDK Anthropic et suit les exécutions d'agents de manière hiérarchique—chaque appel d'outil, récupération et décision devient un span interrogeable.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La répartition des coûts est en temps réel. Vous voyez exactement quels comportements d'agent ou actions utilisateur entraînent les dépenses. Pour un système RAG où certaines requêtes déclenchent 10 appels d'outil et d'autres en déclenchent 1, vous verrez le motif instantanément. Le noyau open-source de Langfuse s'exécute auto-hébergé ; leur offre cloud ajoute des intégrations sans friction.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Logfire pour l'enregistrement structuré et la performance"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Logfire (plateforme d'observabilité de Pydantic) excelle à capturer les logs structurés de votre backend Next.js. Chaque étape d'agent, requête de base de données et appel d'API externe est marqué avec du contexte—user_id, session_id, agent_version—afin que vous puissiez segmenter les logs par n'importe quelle dimension.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Contrairement à l'enregistrement traditionnel, Logfire comprend vos types TypeScript. Vous enregistrez des données structurées, pas des chaînes, et interrogez avec une syntaxe de type SQL. C'est important lors du débogage : vous pouvez demander « affiche-moi toutes les exécutions d'agent où l'outil X a échoué et la latence a dépassé 2s » et obtenez la réponse en secondes.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Modèle d'intégration : Next.js + Claude + Langfuse + Logfire"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La pile typique : une route API Next.js appelle un service d'agent, qui utilise Claude via le SDK Anthropic (Langfuse intercepte automatiquement ceci), effectue des appels d'outil vers Supabase et enregistre des événements structurés vers Logfire.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Voici le modèle central :`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';
import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const logger = pino();

export async function runAgent(input: string, userId: string) {
  logger.info({ userId, input, event: 'agent_start' });
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: input }],
  });
  
  logger.info({ userId, tokens: response.usage, event: 'agent_complete' });
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Ce qu'il faut observer en production"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Concentrez-vous sur quatre métriques : (1) utilisation des tokens par exécution d'agent—détectez les boucles incontrôlées où l'agent continue à réessayer ; (2) défaillances d'appels d'outils—voyez quelles intégrations sont instables ; (3) latence par étape—identifiez les goulets d'étranglement dans la chaîne de raisonnement ; (4) coût par cohorte d'utilisateurs—sachez quelles fonctionnalités sont onéreuses à supporter.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Définissez des alertes dans Langfuse quand l'utilisation des tokens augmente 3x la normale ou quand un outil échoue 5 fois de suite. Dans Logfire, alertez quand la latence de l'agent dépasse votre SLA. Cela prévient les défaillances silencieuses où un agent reste bloqué dans une boucle pendant des heures avant que quelqu'un ne s'en aperçoive.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le repo Pantheon sur github.com/lewisallena17/pantheon démontre cette pile de bout en bout : un kit de démarrage d'agent Next.js avec Langfuse et Logfire intégrés, Supabase pour la persistance et Claude comme moteur principal. C'est du boilerplate prêt pour la production—clonez-le, définissez vos clés API et déployez. Chaque appel d'outil et décision d'agent est automatiquement tracé et enregistré.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Commencez à observer vos agents IA aujourd'hui—récupérez le kit de démarrage Pantheon et intégrez Langfuse + Logfire en un seul déploiement.`}</p>
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
