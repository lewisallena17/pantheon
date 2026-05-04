import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-self-directed-goals'

export const metadata: Metadata = {
  title:       'Objectifs auto-dirigés pour les agents IA | Claude + Next.js',
  description: 'Donnez à vos agents IA Claude la capacité de fixer et de poursuivre leurs propres objectifs. Apprenez à implémenter la définition d\'objectifs autonome avec Next',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-self-directed-goals',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-self-directed-goals',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-self-directed-goals',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
    },
  },
  openGraph: {
    title:       'Objectifs auto-dirigés pour les agents IA | Claude + Next.js',
    description: 'Donnez à vos agents IA Claude la capacité de fixer et de poursuivre leurs propres objectifs. Apprenez à implémenter la définition d\'objectifs autonome avec Next',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Objectifs auto-dirigés pour les agents IA | Claude + Next.js', description: 'Donnez à vos agents IA Claude la capacité de fixer et de poursuivre leurs propres objectifs. Apprenez à implémenter la définition d\'objectifs autonome avec Next' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Objectifs auto-dirigés pour les agents IA | Claude + Next.js"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La plupart des agents IA exécutent les tâches que vous définissez à l'avance, mais les objectifs auto-dirigés permettent à vos agents d'identifier ce qui compte, de prioriser de manière autonome et d'adapter leur stratégie sans intervention humaine constante, les transformant de simples exécutants en décideurs.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi les objectifs auto-dirigés sont importants pour les agents IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les flux de travail agents traditionnels vous obligent à spécifier l'objectif, à le décomposer en étapes et à surveiller l'achèvement. Cela fonctionne pour les tâches bien définies mais s'effondre quand votre agent fait face à des problèmes ouverts, des priorités changeantes ou un contexte manquant. Les objectifs auto-dirigés inversent le modèle : votre agent observe son environnement, identifie ce qui doit être fait et s'engage vers des résultats mesurables.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les constructeurs indépendants, cela signifie moins de révisions d'instructions, moins de code d'échafaudage et des agents qui s'adaptent réellement à la complexité du monde réel. Un agent de service client ayant des objectifs auto-dirigés remarque les arriérés de tickets et escalade sans qu'on le lui dise. Un agent de traitement de données identifie les problèmes de qualité des données et les signale de façon proactive.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Le modèle fondamental : Observer, Réfléchir, S'engager"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les objectifs auto-dirigés suivent une boucle à trois étapes. D'abord, votre agent observe son état actuel—quelles tâches existent, quelles contraintes s'appliquent, quelles métriques comptent. Deuxièmement, il réfléchit en utilisant la réflexion étendue de Claude ou l'utilisation d'outils pour décider quel objectif vaut la peine d'être poursuivi. Troisièmement, il s'engage envers cet objectif dans votre base de données, créant une piste d'audit et évitant les objectifs contradictoires.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ce modèle prévient les hallucinations (les agents ne peuvent pas prétendre qu'ils poursuivent des objectifs qui n'existent pas) et garde votre système transparent. Vous pouvez toujours interroger ce que votre agent a décidé et pourquoi.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémenter l'état des objectifs dans Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez les objectifs sous forme d'enregistrements structurés avec des états de cycle de vie clairs. Un objectif doit suivre l'horodatage de création, le raisonnement derrière lui, l'état actuel (actif, bloqué, complété) et toute tâche enfant qu'il a générée. Utilisez une enum simple pour le statut et enregistrez toujours le raisonnement de l'agent dans un champ de métadonnées pour le débogage.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ce schéma vous permet d'interroger les objectifs actifs par agent, de filtrer les objectifs bloqués pour l'intervention humaine et d'auditer pourquoi votre agent a choisi l'objectif A plutôt que l'objectif B. C'est la source de vérité que vos appels Claude peuvent référencer pour éviter les contradictions.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Supabase goal table
CREATE TABLE agent_goals (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  reasoning TEXT,
  status TEXT CHECK (status IN ('active', 'blocked', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_agent_active ON agent_goals(agent_id, status);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Le rôle de Claude : Proposition et raisonnement d'objectifs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez Claude comme votre couche de délibération d'objectifs. Transmettez-lui l'état actuel (tâches ouvertes, métriques, contraintes) et demandez-lui de proposer un seul objectif auto-dirigé avec un raisonnement explicite. Utilisez les outils pour récupérer le contexte de Supabase, puis enregistrez l'objectif proposé en arrière en utilisant votre API Next.js.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La capacité native de Claude à raisonner sur les priorités concurrentes le rend idéal pour ce point de décision. Vous ne lui demandez pas d'exécuter l'objectif—vous lui demandez de décider quel objectif vaut la peine d'être poursuivi, ce qui est une tâche de délibération qu'il gère bien.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecter les objectifs aux actions dans Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Une fois qu'un objectif est engagé, votre couche d'action agent le référence. Dans les routes d'API Next.js, vérifiez l'objectif actif avant de décider quels outils appeler. Cela empêche votre agent de dériver : chaque action devrait remonter à l'objectif actuel ou proposer explicitement un nouveau.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez un middleware ou un hook wrapper pour récupérer l'objectif actif au début de chaque cycle agent. Si l'objectif devient impossible (une ressource disparaît, une date limite passe), votre agent devrait réfléchir et soit s'engager envers un objectif de secours, soit escalader.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gérer les conflits d'objectifs et la replanification"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Quand votre agent découvre qu'un objectif est bloqué ou obsolète, il ne devrait pas silencieusement réessayer. Au lieu de cela, déclenchez un cycle de réflexion : interrogez pourquoi l'objectif a échoué, proposez des alternatives et engagez-vous envers une nouvelle direction. Cela garde les journaux propres et prévient le chaos agent.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez vos drapeaux de statut de base de données pour séparer les objectifs actifs des objectifs bloqués, et enregistrez la raison du blocage. Si un humain doit intervenir, il voit exactement pourquoi l'agent s'est bloqué.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon (github.com/lewisallena17/pantheon) démontre des modèles d'objectifs auto-dirigés pour les systèmes multi-agents. Il inclut une couche de proposition d'objectif, un schéma Supabase et des endpoints Next.js pour la gestion des objectifs. Clonez-le, adaptez l'instruction de raisonnement d'objectif pour votre domaine et intégrez-le dans votre pile Claude + Supabase existante.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Les objectifs auto-dirigés transforment vos agents IA en simples exécutants de tâches en décideurs autonomes—commencez par stocker les objectifs dans Supabase, utilisez Claude pour raisonner sur les priorités et connectez chaque action à un objectif engagé. Obtenez le kit de démarrage complet et le schéma de Pantheon.`}</p>
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
