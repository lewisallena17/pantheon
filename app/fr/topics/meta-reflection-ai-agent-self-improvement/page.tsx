import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/meta-reflection-ai-agent-self-improvement'

export const metadata: Metadata = {
  title:       'Méta-réflexion pour agents IA | Primitives d\'auto-amélioration',
  description: 'Implémentez la méta-réflexion dans les agents Claude pour permettre l\'auto-amélioration autonome. Construisez de meilleurs systèmes IA avec des boucles d\'intros',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/meta-reflection-ai-agent-self-improvement',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/meta-reflection-ai-agent-self-improvement',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/meta-reflection-ai-agent-self-improvement',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
    },
  },
  openGraph: {
    title:       'Méta-réflexion pour agents IA | Primitives d\'auto-amélioration',
    description: 'Implémentez la méta-réflexion dans les agents Claude pour permettre l\'auto-amélioration autonome. Construisez de meilleurs systèmes IA avec des boucles d\'intros',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Méta-réflexion pour agents IA | Primitives d\'auto-amélioration', description: 'Implémentez la méta-réflexion dans les agents Claude pour permettre l\'auto-amélioration autonome. Construisez de meilleurs systèmes IA avec des boucles d\'intros' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Méta-réflexion pour agents IA | Primitives d'auto-amélioration"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La méta-réflexion—la capacité d'un agent IA à observer et critiquer son propre raisonnement—est la différence entre les agents qui stagnent et les agents qui s'améliorent à chaque interaction.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Ce que la méta-réflexion fait réellement"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La méta-réflexion n'est pas de l'ingénierie de prompts ou du fine-tuning. C'est une primitive d'exécution : après que votre agent termine une tâche, il examine son processus de raisonnement, identifie les modes de défaillance et ajuste le comportement futur au cours de la même session ou entre les déploiements.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les agents basés sur Claude, cela signifie capturer les sorties intermédiaires—appels d'outils, chaînes de raisonnement, résultats—puis demander à Claude d'évaluer ce qui a fonctionné et ce qui n'a pas fonctionné. Le résultat est un retour d'information structuré qui s'accumule en gains de performance mesurables.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture centrale : capturer, réfléchir, mettre à jour"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le modèle se divise en trois étapes : (1) exécuter la tâche principale et enregistrer tous les points de décision, (2) passer la trace d'exécution à Claude avec un prompt de réflexion qui demande une analyse des défaillances et des suggestions d'amélioration, (3) stocker la réflexion dans le contexte de votre agent ou dans une base de données pour que les exécutions futures intègrent cette connaissance.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cela crée une boucle de rétroaction sans réentraînement. Chaque instance d'agent devient plus intelligente à mesure qu'elle rencontre de nouveaux cas. En production, cela signifie que votre instance Supabase stocke non seulement les résultats, mais aussi les améliorations de raisonnement qui les ont générés.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// TypeScript: Basic reflection loop in a Next.js API route
const executeWithReflection = async (task: string, history: Reflection[]) => {
  const execution = await claude.runAgent(task, history);
  const reflection = await claude.reflect(execution.trace);
  await supabase.from('reflections').insert({ task, execution, reflection });
  return { execution, reflection };
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Où la méta-réflexion excelle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tâches de raisonnement multi-étapes : génération SQL, orchestration d'API, planification de contenu. Les agents prennent souvent des chemins sous-optimaux au début ; la réflexion détecte cela et corrige le modèle.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cas limites rares : quand un agent rencontre un cas qu'il n'a pas vu, la méta-réflexion peut synthétiser une réponse et encoder immédiatement pourquoi cette réponse a fonctionné, évitant la même erreur plus tard.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Optimisation des coûts : au lieu de cycles d'ingénierie de prompts, la réflexion découvre naturellement de meilleurs formats d'instructions, réduisant les dépenses en tokens au fil du temps.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation des prompts de réflexion"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre prompt de réflexion devrait demander : Quelles hypothèses ai-je formulées ? Quelles étapes étaient inutiles ? Ai-je utilisé le bon outil ? Quel signal m'aurait dit que j'avais tort plus tôt ? Claude gère cette introspection nativement—il est conçu pour raisonner sur ses propres résultats.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez les réflexions en tant que JSON structuré dans Supabase : { taskType, failureMode, correction, confidence }. Au fil du temps, vous verrez des modèles : certains types de tâches ont des problèmes récurrents qui pointent vers des lacunes systémiques dans les connaissances ou les capacités de votre agent.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Mise à l'échelle de la réflexion sur les flottes d'agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dans les systèmes de production avec de nombreux agents concurrents, la réflexion devient une couche de connaissances partagées. Quand l'Agent A découvre une amélioration, l'Agent B l'apprend sans redéploiement. Utilisez un trigger Supabase pour propager les réflexions de haute confiance à un vecteur de contexte partagé ou un ensemble d'instructions.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cette approche fonctionne parce que la méta-réflexion est sans état : n'importe quel agent peut lire et appliquer les apprentissages des réflexions de n'importe quel autre agent, créant une amélioration collective émergente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation Open-Source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le dépôt Pantheon à github.com/lewisallena17/pantheon implémente la méta-réflexion comme une primitive réutilisable pour les agents Claude. Il comprend des exemples exécutables pour Next.js, des migrations de schéma Supabase pour stocker les réflexions et des modèles pour les templates de prompts de réflexion.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clonez-le comme point de départ : il est conçu pour les équipes indépendantes et inclut la configuration pour le développement local et les déploiements en production sur Vercel + Supabase.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`La méta-réflexion transforme les systèmes d'agents de pipelines statiques en entités apprenantes—intégrez-la à votre prochain agent Claude et regardez la performance se composer à chaque tâche.`}</p>
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
