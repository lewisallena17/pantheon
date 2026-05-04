import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/command-palette-ctrl-k-dashboard'

export const metadata: Metadata = {
  title:       'Palette de commandes (Ctrl+K) pour votre tableau de bord',
  description: 'Ajoutez une palette de commandes pilotée au clavier à votre tableau de bord Next.js. Accélérez la navigation pour les systèmes d\'agents IA créés avec Claude et ',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/command-palette-ctrl-k-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/command-palette-ctrl-k-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/command-palette-ctrl-k-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
    },
  },
  openGraph: {
    title:       'Palette de commandes (Ctrl+K) pour votre tableau de bord',
    description: 'Ajoutez une palette de commandes pilotée au clavier à votre tableau de bord Next.js. Accélérez la navigation pour les systèmes d\'agents IA créés avec Claude et ',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Palette de commandes (Ctrl+K) pour votre tableau de bord', description: 'Ajoutez une palette de commandes pilotée au clavier à votre tableau de bord Next.js. Accélérez la navigation pour les systèmes d\'agents IA créés avec Claude et ' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Palette de commandes (Ctrl+K) pour votre tableau de bord"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Une palette de commandes permet à vos utilisateurs de naviguer instantanément, d'exécuter des actions et de rechercher sans toucher la souris—transformant votre tableau de bord en un outil pour utilisateurs avancés qui se sent natif et réactif.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi les palettes de commandes sont importantes pour les tableaux de bord d'agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les palettes de commandes (Cmd+K ou Ctrl+K) sont devenues incontournables dans les logiciels modernes. Elles réduisent les frictions : au lieu de fouiller dans des menus imbriqués, les utilisateurs tapent ce qu'ils veulent et appuient sur Entrée. Pour les tableaux de bord d'agents IA, c'est crucial—vos utilisateurs ont besoin de déclencher rapidement des exécutions d'agents, de basculer entre les modèles, d'ajuster les paramètres ou de naviguer vers des journaux spécifiques.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ce modèle fonctionne particulièrement bien pour les constructeurs indépendants car il se met à l'échelle. Ajoutez une nouvelle fonctionnalité ? Ajoutez une nouvelle commande. Aucune refonte d'interface utilisateur nécessaire. Votre tableau de bord se développe sans encombrer l'interface.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture centrale : modèle de registre de commandes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'approche la plus élégante est un registre de commandes—un objet centralisé qui mappe les identifiants de commandes aux gestionnaires. Chaque commande a un label, une description, une catégorie et un raccourci clavier optionnel.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre composant de palette de commandes interroge ce registre, filtre par entrée utilisateur et exécute le gestionnaire sélectionné. Séparez votre couche de données de l'interface utilisateur : cela rend les tests simples et la réutilisation des commandes dans les fonctionnalités (raccourcis clavier, menus contextuels, règles d'automatisation) triviale.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const commands = {
  'agent.run': {
    label: 'Run Agent',
    category: 'Agent',
    handler: (agentId) => triggerAgentRun(agentId),
  },
  'model.switch': {
    label: 'Switch Model',
    category: 'Settings',
    handler: (modelId) => updateModel(modelId),
  },
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation de l'interface utilisateur : recherche, filtrage, exécution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez une superposition modale avec un champ de recherche. À chaque frappe, filtrez votre registre de commandes par label et description en utilisant la correspondance floue (des bibliothèques comme \`fuse.js\` fonctionnent bien). Affichez les résultats avec navigation au clavier—les touches fléchées pour se déplacer, Entrée pour exécuter, Échap pour fermer.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les tableaux de bord soutenus par Supabase, les commandes peuvent récupérer des données en temps réel : 'Basculer vers un agent' pourrait interroger votre table d'agents, permettant aux utilisateurs de choisir parmi les enregistrements actifs. Liez Ctrl+K globalement en utilisant une bibliothèque comme \`cmdk\` ou \`command-palette\`.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration avec Claude et les flux de travail des agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les commandes deviennent particulièrement puissantes lorsqu'elles sont connectées à Claude. Mappez les commandes aux modèles d'invite : 'Déboguer l'exécution d'un agent' pourrait ouvrir une modale qui génère une analyse basée sur Claude de la dernière défaillance. 'Générer un cas de test' pourrait appeler Claude pour produire des entrées de test basées sur le schéma de votre agent.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez l'historique des commandes dans Supabase pour les pistes d'audit et l'analyse. Suivez les commandes que vos utilisateurs invoquent le plus—cela signale les fonctionnalités qui comptent et guide votre feuille de route.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Navigation au clavier et accessibilité"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rendez la navigation instantanée. Déboguer la recherche à 100-150ms. Pré-rendez les résultats principaux. Utilisez les rôles WAI-ARIA (\`role="listbox"\`, \`aria-selected\`) afin que les lecteurs d'écran comprennent la palette. Supportez les touches fléchées, Entrée et Échap.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Proposez des alias de commandes ('ra' pour 'Run Agent') et mémorisez les commandes récemment utilisées. Affichez les raccourcis en ligne afin que les utilisateurs découvrent les liaisons clavier sans documentation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon sur GitHub (github.com/lewisallena17/pantheon) fournit une implémentation complète de la palette de commandes pour les tableaux de bord d'agents IA. Il inclut un composant Next.js, un schéma Supabase pour stocker les commandes et les journaux, et des exemples d'intégration avec les appels de l'API Claude. Forkez-le, personnalisez les commandes pour votre système d'agent, et déployez.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Une palette de commandes transforme votre tableau de bord de cliquable à puissant—adoptez le modèle maintenant, et vos utilisateurs vous remercieront avec des flux de travail plus rapides et une meilleure rétention.`}</p>
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
