import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-debugging-trace-replay'

export const metadata: Metadata = {
  title:       'Déboguer les agents IA avec la relecture de traces | Claude',
  description: 'Apprenez à déboguer les agents IA étape par étape en utilisant la relecture de traces. Capturez les décisions des agents, rejouez les défaillances et corrigez l',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-debugging-trace-replay',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-debugging-trace-replay',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-debugging-trace-replay',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
    },
  },
  openGraph: {
    title:       'Déboguer les agents IA avec la relecture de traces | Claude',
    description: 'Apprenez à déboguer les agents IA étape par étape en utilisant la relecture de traces. Capturez les décisions des agents, rejouez les défaillances et corrigez l',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Déboguer les agents IA avec la relecture de traces | Claude', description: 'Apprenez à déboguer les agents IA étape par étape en utilisant la relecture de traces. Capturez les décisions des agents, rejouez les défaillances et corrigez l' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Déboguer les agents IA avec la relecture de traces | Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La relecture de traces vous permet d'enregistrer chaque décision que votre agent IA prend, puis de revenir en arrière à travers les défaillances pour trouver exactement où le raisonnement a échoué—réduisant le temps de débogage de heures à minutes.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi la journalisation standard échoue pour les agents IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les journaux traditionnels vous montrent *ce* qui s'est passé, pas *pourquoi* votre agent a choisi une action spécifique. Lorsque les appels d'outils de Claude deviennent problématiques ou qu'une chaîne de raisonnement multi-étapes diverge, vous êtes obligé de reconstruire le contexte manuellement.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le débogage d'agents IA nécessite une visibilité sur : les comptages de tokens aux points de décision, le contexte exact de l'invite pour chaque étape, la sortie d'outil qui a déclenché une branche, et la confiance du modèle à chaque nœud. Une seule instruction print ne vous donnera pas cela.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Comment la relecture de traces capture l'état de l'agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La relecture de traces enregistre le graphe d'exécution complet de votre agent : les messages envoyés à Claude, les définitions d'outils disponibles, les résultats d'outils reçus et les tokens consommés. Chaque nœud est horodaté et indexé.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Au lieu de relancer un agent défaillant de zéro (coûteux et non-déterministe avec Claude), vous rejouez à partir de n'importe quel point de contrôle. Vous sautez à l'étape 7 sur 12, inspectez le contexte exact que Claude a vu, modifiez une réponse d'outil et accélérez pour voir comment le raisonnement change.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`C'est particulièrement puissant pour les agents qui appellent des API externes—vous capturez la réponse API en direct et rejouez sans atteindre les limites de débit ou les effets secondaires.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construire la capture de traces en Next.js + Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Capturez les traces en enveloppant vos appels client Claude. Stockez l'historique des messages, les appels d'outils, les résultats d'outils et les métadonnées de synchronisation dans Supabase. Interrogez par ID de session d'agent pour une relecture instantanée.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Voici un modèle minimal :`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function executeAgentStep(messages: Message[]) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages
  });
  
  const trace = {
    sessionId: currentSession.id,
    stepNumber: messages.length,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
    messageContent: response.content,
    timestamp: new Date()
  };
  
  await supabase
    .from('agent_traces')
    .insert([trace]);
  
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Rejouer et modifier les décisions des agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chargez une session de trace depuis Supabase et rejouez-la de manière déterministe. Si l'appel d'outil de l'étape 5 a renvoyé des données incorrectes, modifiez ce résultat en mémoire et réexécutez les étapes 6–12 par rapport à l'état corrigé.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`C'est mieux que de relancer parce que : aucun coût d'API pour les étapes répétées, vous contrôlez exactement quelles entrées changent, et vous pouvez tester instantanément différentes sorties d'outils en A/B. Pour les agents effectuant 50+ appels API dans une seule tâche, cela économise de l'argent réel.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Identifier l'injection d'invite et la dérive de raisonnement"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La relecture de traces rend les défaillances invisibles visibles. Comparez le contexte exact de l'invite entre une trace fonctionnelle et une défaillante. Vous repérerez quand un résultat d'outil contenait un formatage inattendu, ou quand les limites de tokens ont forcé Claude à raccourcir le raisonnement.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Surveillez la dérive de raisonnement : un agent qui a marqué 95% hier mais 60% aujourd'hui a probablement vu un changement d'entrée subtil. La relecture de traces le révèle immédiatement au lieu d'attendre que les métriques se dégradent davantage.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon (github.com/lewisallena17/pantheon) fournit un système complet de relecture de traces construit pour les agents Claude. Il comprend des schémas de base de données pour Supabase, une interface utilisateur Next.js pour naviguer dans les arbres de traces et des utilitaires TypeScript pour la capture et la relecture.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Bifurquez-le pour ajouter des extensions spécifiques au domaine : analyse des coûts, profilage de la latence ou visualisations personnalisées pour l'arbre de décision de votre agent.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Commencez à capturer les traces des agents dès aujourd'hui—clonez Pantheon, ajoutez la journalisation de traces à vos appels Claude et remplacez des heures de devinettes par un débogage au niveau de la minute.`}</p>
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
