import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/autonomous-ai-revenue-engine'

export const metadata: Metadata = {
  title:       'Construire un moteur de revenus IA autonome',
  description: 'Apprenez à construire des agents IA autonomes avec Claude qui génèrent des revenus. Modèles réels pour les développeurs indépendants utilisant Next.js, Supabase',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/autonomous-ai-revenue-engine',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/autonomous-ai-revenue-engine',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/autonomous-ai-revenue-engine',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
    },
  },
  openGraph: {
    title:       'Construire un moteur de revenus IA autonome',
    description: 'Apprenez à construire des agents IA autonomes avec Claude qui génèrent des revenus. Modèles réels pour les développeurs indépendants utilisant Next.js, Supabase',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Construire un moteur de revenus IA autonome', description: 'Apprenez à construire des agents IA autonomes avec Claude qui génèrent des revenus. Modèles réels pour les développeurs indépendants utilisant Next.js, Supabase' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Construire un moteur de revenus IA autonome"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Arrêtez de construire des chatbots IA qui nécessitent une intervention humaine à chaque étape—construisez plutôt des agents autonomes qui identifient les opportunités, exécutent les transactions et génèrent des revenus sans intervention.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"La boucle centrale : perception, décision, exécution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Un moteur IA générant des revenus a besoin de trois systèmes étroitement couplés. D'abord, la perception : votre agent ingère continuellement les données de marché, le comportement utilisateur ou les métriques commerciales via les API ou les requêtes de base de données. Deuxièmement, la décision : Claude évalue ce qui s'est passé, applique votre logique métier et décide de la prochaine action. Troisièmement, l'exécution : l'agent exécute réellement cette action—créer une annonce, débiter une carte, mettre à jour l'inventaire ou déclencher un workflow.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La plupart des projets indépendants échouent parce qu'ils câblent ces couches de manière lâche. Votre couche de perception se met à jour une fois par jour. Votre logique de décision emprunte trois chemins de code différents avec des résultats incohérents. Vos appels d'exécution utilisent la mauvaise API. Les revenus autonomes signifient traiter cette boucle comme une seule machine déterministe qui s'exécute continuellement.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Connecter Claude à votre couche de données"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude a besoin d'un accès en temps réel à votre état commercial. Utilisez tool_use pour permettre à Claude de requêter Supabase, appeler vos API ou vérifier l'inventaire en direct. Définissez des outils qui retournent du JSON structuré—pas des vidages de base de données bruts. Un outil appelé \`check_inventory\` devrait retourner \`{sku: string, quantity: number, reorder_threshold: number}\`, pas un tableau de 500 lignes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Gardez la latence sous 2 secondes par cycle de décision d'agent. Cachez les outils et les requêtes de base de données de manière agressive. Si votre agent décide de marquer un article pour la vente, il n'a pas besoin de données historiques sur les clients de 2019.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const tools = [
  {
    name: 'check_inventory',
    description: 'Query current stock levels for a SKU',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' }
      },
      required: ['sku']
    }
  },
  {
    name: 'create_listing',
    description: 'Publish a product to marketplace',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'integer' }
      },
      required: ['sku', 'price', 'quantity']
    }
  }
];`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construire une logique de décision fiable"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ne laissez pas Claude improviser. Donnez-lui un objectif clair, des contraintes et des règles de secours. Au lieu de « optimiser les revenus », dites « si l'inventaire > 500 unités et le coût du fournisseur < \$12, lister à \$29.99 ; si < 100 unités, retirer de la vente ; toujours maintenir une marge de 20 % ».`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez la pensée étendue de Claude pour les décisions complexes. Laissez-le raisonner sur des scénarios multi-étapes—devrions-nous baisser le prix pour liquider l'inventaire ou attendre la demande saisonnière ? Mais enveloppez ce raisonnement dans une machine d'état : décision en attente → Claude évalue → enregistrer le raisonnement → exécuter l'action → vérifier le résultat.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Surveillance et disjoncteurs"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Un agent autonome qui casse vous coûte de l'argent en temps réel. Implémentez des limites strictes : taille maximale de transaction, changement de prix maximum par cycle, appels API maximums par minute. Enregistrez chaque décision et exécution. Utilisez Supabase pour stocker les traces d'agent—qu'a observé l'agent, qu'a-t-il décidé, quel a été le résultat ?`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Configurez des alertes pour les anomalies. Si votre agent crée soudainement 100 annonces alors qu'il en crée normalement 3, quelque chose ne va pas. Arrêtez la boucle, enquêtez, corrigez.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Évoluer au-delà d'un seul agent"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Commencez par une boucle autonome. Une fois qu'elle est stable et génère des revenus, ajoutez-en plus. Un agent gérant l'inventaire, un autre gérant les prix, un autre gérant le support client. Utilisez les routes d'API Next.js comme coordinateur—elles appellent Claude en parallèle, agrègent les décisions, exécutent de manière sûre.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les files d'attente Supabase et les fonctions edge vous permettent d'exécuter les agents à la bonne fréquence pour chaque tâche. Les mises à jour de prix pourraient s'exécuter toutes les 10 minutes. Les vérifications d'inventaire toutes les heures. La détection de nouvelles opportunités chaque jour.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon sur github.com/lewisallena17/pantheon démontre un système d'agent autonome prêt pour la production construit avec Claude, Next.js et Supabase. Il comprend la journalisation des décisions, les modèles d'appel d'outils, la gestion d'état et la coordination multi-agent. Utilisez-le comme référence ou bifurquez-le directement—il est construit exactement pour ce cas d'usage.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construisez votre première boucle de revenus autonome en connectant Claude à vos données, en définissant des règles de décision claires et en ajoutant la surveillance—commencez avec le kit de démarrage Pantheon et lancez cette semaine.`}</p>
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
