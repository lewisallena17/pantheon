import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/curiosity-driven-agent-exploration'

export const metadata: Metadata = {
  title:       'Exploration guidée par la curiosité dans les agents IA',
  description: 'Construisez des agents IA qui explorent autonomiquement les espaces de problèmes. Apprenez à implémenter des mécanismes de curiosité dans les systèmes alimentés',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/curiosity-driven-agent-exploration',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/curiosity-driven-agent-exploration',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/curiosity-driven-agent-exploration',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
    },
  },
  openGraph: {
    title:       'Exploration guidée par la curiosité dans les agents IA',
    description: 'Construisez des agents IA qui explorent autonomiquement les espaces de problèmes. Apprenez à implémenter des mécanismes de curiosité dans les systèmes alimentés',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Exploration guidée par la curiosité dans les agents IA', description: 'Construisez des agents IA qui explorent autonomiquement les espaces de problèmes. Apprenez à implémenter des mécanismes de curiosité dans les systèmes alimentés' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Exploration guidée par la curiosité dans les agents IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`L'exploration guidée par la curiosité permet à vos agents IA de découvrir autonomiquement des solutions au lieu de suivre des chemins rigides—réduisant le temps de développement et libérant des comportements émergents que vous n'aviez pas explicitement programmés.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi la curiosité est importante dans la conception d'agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents IA traditionnels exécutent des flux de travail prédéfinis. Les agents guidés par la curiosité maintiennent une motivation intrinsèque—ils explorent des états incertains, testent des hypothèses et affinent leur propre compréhension. Cela est important car votre produit indépendant peut gérer les cas limites et les modèles utilisateur sans coder en dur chaque scénario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les systèmes alimentés par Claude, les mécanismes de curiosité réduisent la surcharge d'ingénierie des invites. Au lieu d'écrire des instructions exhaustives, vous définissez des signaux de récompense et laissez l'agent explorer l'espace de solutions. L'agent apprend quelles questions poser, quelles données prioriser, et quand il est suffisamment confus pour demander de l'aide.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation de l'échantillonnage d'incertitude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le cœur de la curiosité est de quantifier l'incertitude. Une approche pratique : suivre les scores de confiance sur les décisions des agents, puis prioriser les états à haute incertitude pour une exploration plus approfondie.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dans vos routes API Next.js, stockez les historiques de décisions des agents dans Supabase avec des métadonnées de confiance. Quand un agent rencontre une décision avec une confiance <0.6, déclenchez un raisonnement étendu ou des boucles d'examen humain. Cela évite les hallucinations confiantes tout en permettant une croissance autonome.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function evaluateAgentUncertainty(agentId: string, decision: string, confidence: number) {
  const { data } = await supabase
    .from('agent_decisions')
    .insert([
      { agent_id: agentId, decision, confidence, explored_at: new Date() }
    ])
    .select();
  
  if (confidence < 0.6) {
    return { action: 'explore', flagForReview: true };
  }
  return { action: 'execute' };
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Signaux de récompense pour l'apprentissage autonome"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents guidés par la curiosité optimisent le gain d'information, pas seulement l'accomplissement des tâches. Définissez des récompenses pour : découvrir de nouveaux modèles de solution, réduire l'erreur de prédiction sur les cas de test retenus, et résoudre les entrées ambiguës.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dans votre boucle d'agent Claude, intégrez les commentaires de chaque tentative d'exploration. Supabase devient la mémoire de votre agent—stockez les résultats, les chaînes de raisonnement, et ce qui a fonctionné/ce qui n'a pas fonctionné. La fenêtre de contexte de Claude vous permet de réintroduire les explorations récentes réussies comme exemples en contexte, accélérant l'apprentissage sans réentraînement.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Structurer l'état d'exploration"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La curiosité sans structure devient du chaos. Utilisez un espace d'exploration limité : définissez les domaines que l'agent peut enquêter, fixez des limites d'itération, et maintenez une file d'attente prioritaire d'hypothèses inexplorées.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre schéma Supabase doit inclure : exploration_targets (problèmes à résoudre), hypothesis_log (théories testées), et outcome_metrics (données de succès/échec). Cela vous permet de visualiser le comportement de l'agent, de déboguer des modèles d'exploration étranges, et d'identifier où l'agent se bloque dans des boucles.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration de commentaires humains en boucle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les systèmes guidés par la curiosité les plus puissants ne sont pas entièrement autonomes—ils savent quand demander. Concevez des points de contrôle où les agents présentent les résultats aux fondateurs/utilisateurs, obtiennent une validation externe, et ajustent leur exploration en fonction des commentaires.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dans Next.js, créez un tableau de bord qui met en surface les décisions à haute incertitude. Les utilisateurs fournissent des étiquettes ou des corrections ; réintroduisez-les à l'agent comme des signaux de récompense forts. Cela ferme la boucle : curiosité + jugement humain = apprentissage rapide et ancré.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le framework Pantheon (github.com/lewisallena17/pantheon) fournit un modèle prêt pour la production pour les agents Claude guidés par la curiosité. Il inclut la quantification de l'incertitude, la journalisation de l'exploration, et un tableau de bord Next.js pour surveiller le comportement des agents.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clonez le référentiel, câblez vos identifiants Supabase, et vous aurez un agent fonctionnant qui explore, apprend et rend compte. La base de code démontre les modèles de gestion d'état, le calcul des récompenses, et l'intégration avec l'API de Claude dans des exemples TypeScript réels que vous pouvez adapter immédiatement.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`L'exploration guidée par la curiosité transforme vos agents IA de simples exécuteurs de tâches en apprenants adaptatifs—utilisez le kit de démarrage Pantheon et déployez des systèmes autonomes qui deviennent plus intelligents à chaque interaction utilisateur.`}</p>
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
