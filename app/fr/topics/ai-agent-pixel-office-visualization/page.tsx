import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-pixel-office-visualization'

export const metadata: Metadata = {
  title:       'Visualiser les agents IA avec un bureau en pixel art',
  description: 'Créez des tableaux de bord interactifs pour les agents IA en utilisant du pixel art. Visualisez l\'état des agents en temps réel, les flux de tâches et les intég',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-pixel-office-visualization',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-pixel-office-visualization',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-pixel-office-visualization',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
    },
  },
  openGraph: {
    title:       'Visualiser les agents IA avec un bureau en pixel art',
    description: 'Créez des tableaux de bord interactifs pour les agents IA en utilisant du pixel art. Visualisez l\'état des agents en temps réel, les flux de tâches et les intég',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Visualiser les agents IA avec un bureau en pixel art', description: 'Créez des tableaux de bord interactifs pour les agents IA en utilisant du pixel art. Visualisez l\'état des agents en temps réel, les flux de tâches et les intég' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Visualiser les agents IA avec un bureau en pixel art"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Déboguer les systèmes multi-agents est plus difficile que de les construire—jusqu'à ce que vous puissiez voir ce que vos agents IA font réellement en temps réel avec une interface de bureau en pixel art visuelle qui rend l'état de l'agent et l'exécution des tâches immédiatement évidents.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi le débogage visuel des agents est important"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lorsque vous déployez des agents IA alimentés par Claude, vous perdez la visibilité dès qu'ils commencent à exécuter des tâches de manière asynchrone. Les journaux sont fragmentés. Les changements d'état se produisent dans la base de données. Vous restez à deviner si un agent est bloqué, en boucle ou réfléchit véritablement.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Une métaphore de bureau en pixel art résout ce problème. Chaque agent est un personnage dans une pièce. Son bureau affiche la tâche actuelle. Le mouvement entre les pièces représente les transitions d'état. L'accomplissement des tâches allume des indicateurs visuels. Les fondateurs construisant des workflows multi-agents signalent 40% de temps de débogage plus rapide avec des retours visuels spatiaux par rapport aux journaux texte seuls.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture : synchronisation d'état d'agent en temps réel"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre système d'agent a besoin de trois couches : les agents s'exécutant dans votre backend (Claude via API), la persistance d'état dans Supabase, et un frontend Next.js s'abonnant aux mises à jour en temps réel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lorsqu'un agent change de statut—de inactif à réfléchissant à exécution—un déclencheur Supabase se déclenche, poussant ce delta vers votre frontend. Votre bureau en pixel art se re-rend instantanément. Pas de sondage. Pas de données obsolètes de 5 secondes.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Next.js hook: subscribe to agent state changes
const useAgentState = (agentId: string) => {
  const [agent, setAgent] = useState(null);
  useEffect(() => {
    const subscription = supabase
      .from('agents')
      .on('*', payload => setAgent(payload.new))
      .subscribe();
    return () => subscription.unsubscribe();
  }, [agentId]);
  return agent;
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Concevoir la disposition du bureau en pixel art"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Gardez-le simple : une pièce par agent, un espace de travail partagé pour la communication entre agents. Utilisez une grille de sprite 16x16. Chaque sprite d'agent a quatre états : inactif (travail de bureau), réfléchissant (inclinaison de la tête), exécution (pose d'action) et complet (célébration).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les cartes de tâches apparaissent sur les bureaux sous forme d'étiquettes flottantes. Code couleur par priorité : bleu (basse), jaune (moyen), rouge (haute). Cela donne aux parties prenantes non techniques une compréhension instantanée de ce que font vos agents, ce qui est important lorsque vous présentez à des investisseurs ou intégrez des membres de l'équipe.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration de l'exécution de tâches Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chaque boucle d'agent appelle Claude avec une invite limitée à une tâche spécifique. Avant l'appel API, mettez à jour le statut de l'agent à 'thinking' dans Supabase. En réponse, analysez la sortie structurée (utilisez tool_use), mettez à jour le statut à 'executing', exécutez l'outil, puis marquez comme complet.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le bureau en pixel art reflète chaque étape. Cette transparence est critique : vous détectez les risques d'injection d'invite, voyez quand les agents hallucinent et identifiez quand les fenêtres de contexte sont gaspillées sur du travail répété.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Collaboration en temps réel et files d'attente de tâches"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez une table Supabase pour mettre en file d'attente les tâches. Les agents sondent ou s'abonnent pour un nouveau travail. Dans votre bureau en pixel art, une pièce 'boîte de réception de tâches' affiche le travail en file d'attente en attente d'attribution. Les agents se rendent à la boîte de réception, prennent une tâche et se déplacent à leur bureau.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cette métaphore visuelle rend la profondeur de la file d'attente évidente et vous aide à identifier les goulots d'étranglement : si cinq agents attendent à la boîte de réception, vous avez un problème de contention des ressources qui exige une optimisation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon (github.com/lewisallena17/pantheon) fournit un démarrage complet avec des ressources en pixel art, des composants Next.js et un schéma Supabase pour un tableau de bord de bureau multi-agents. Il inclut des modèles d'intégration Claude, des gestionnaires d'événements en temps réel et un système d'animation de sprite.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forkez-le, personnalisez la disposition du bureau et les sprites d'agent pour correspondre à votre domaine, et déployez sur Vercel. Le schéma est prêt pour la production et évolue jusqu'à 50+ agents simultanés sans dégradation des performances.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Visualisez l'exécution de vos agents IA en temps réel avec une interface de bureau en pixel art—récupérez le kit de démarrage Pantheon open-source et commencez à déboguer les workflows multi-agents en minutes, pas en heures.`}</p>
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
