import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/claude-tool-use-best-practices'

export const metadata: Metadata = {
  title:       'Meilleures pratiques de production pour l\'utilisation d\'outils Claude',
  description: 'Maîtrisez les modèles d\'utilisation d\'outils Claude pour les agents IA de production. Apprenez la gestion des erreurs, la gestion de la concurrence et l\'optimis',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-tool-use-best-practices',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-tool-use-best-practices',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-tool-use-best-practices',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
    },
  },
  openGraph: {
    title:       'Meilleures pratiques de production pour l\'utilisation d\'outils Claude',
    description: 'Maîtrisez les modèles d\'utilisation d\'outils Claude pour les agents IA de production. Apprenez la gestion des erreurs, la gestion de la concurrence et l\'optimis',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Meilleures pratiques de production pour l\'utilisation d\'outils Claude', description: 'Maîtrisez les modèles d\'utilisation d\'outils Claude pour les agents IA de production. Apprenez la gestion des erreurs, la gestion de la concurrence et l\'optimis' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Meilleures pratiques de production pour l'utilisation d'outils Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Construire des intégrations fiables d'outils Claude à grande échelle nécessite bien plus que l'ingénierie des invites—vous avez besoin d'une gestion robuste des erreurs, d'une gestion intelligente de la concurrence et d'une visibilité claire des coûts.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Concevoir des définitions d'outils pour la résilience"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La fonctionnalité tool_use de Claude fonctionne mieux lorsque les schémas sont explicites et flexibles. Les paramètres sur-contraints échouent silencieusement ; les paramètres sous-spécifiés causent des hallucinations. Définissez des valeurs d'énumération claires pour les entrées attendues, utilisez les champs de description pour guider le raisonnement de Claude et incluez des exemples d'appels valides et invalides.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En production, traitez les définitions d'outils comme des contrats. Versionnez-les séparément de votre logique d'agent. Si vous devez modifier le comportement d'un outil, créez un new tool_version plutôt que de muter l'original—cela empêche Claude de mélanger les anciennes et nouvelles sémantiques au cours d'une conversation.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémenter un backoff exponentiel pour les appels d'outils"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'exécution d'outils peut échouer pour des raisons transitoires : verrous de base de données, limites de débit ou brèves pannes de service. La logique de retry naïve aggrave ces problèmes. À la place, utilisez un backoff exponentiel avec jitter pour répartir les tentatives dans le temps.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le modèle : attendez 100ms avant la tentative 1, 200ms avant la tentative 2, 400ms avant la tentative 3, chacune avec ±20% de jitter aléatoire. Cela donne aux défaillances transitoires le temps de se rétablir sans surcharger votre infrastructure. Définissez un maximum de 3–4 tentatives ; au-delà, l'échec est probablement structurel.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const executeWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 100 * (0.8 + Math.random() * 0.4);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Valider les sorties d'outils avant de les retourner à Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude fait confiance aux résultats d'outils que vous renvoyez. Si un outil retourne des données mal formées ou inattendues, Claude peut prendre des décisions incorrectes en aval. Validez toujours les sorties par rapport à un schéma avant de les réinjecter dans la conversation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez un validateur léger (Zod, io-ts ou des gardes TypeScript simples). Enregistrez les échecs de validation séparément afin que vous puissiez détecter les bugs d'outils tôt. Si la validation échoue, retournez une erreur lisible par l'homme à Claude plutôt que de laisser les mauvaises données se propager.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Suivre les coûts des outils et l'utilisation des tokens"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chaque appel API Claude a un coût, et l'utilisation d'outils ajoute des frictions : des tokens supplémentaires pour les définitions d'outils, des tokens pour les résultats et potentiellement plusieurs rounds de raisonnement de Claude. Surveillez vos dépenses par agent, par utilisateur et par outil.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enregistrez input_tokens, output_tokens et cache_read_tokens à partir de chaque réponse API. Connectez-les à une table Supabase pour pouvoir interroger les tendances des coûts. Définissez des alertes si une seule session utilisateur dépasse un budget (par exemple, \$0,50) et implémentez des limites de débit pour les agents coûteux.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Sérialiser et persister l'état des outils"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Si votre agent effectue plusieurs appels d'outils au cours d'une session, persistez la conversation et les résultats des outils. Cela vous permet de reprendre les tâches interrompues, d'auditer les décisions et de détecter les boucles où Claude appelle le même outil à plusieurs reprises avec des entrées identiques.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez les messages, tool_results et les métadonnées d'invocation dans Supabase en tant que colonnes JSONB. Indexez sur user_id et session_id pour que la récupération soit rapide. Incluez les timestamps et les drapeaux de résultat (success, validation_failed, timeout) pour l'analyse post-mortem.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Utiliser les sorties structurées pour des résultats déterministes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`L'utilisation d'outils fonctionne mieux lorsqu'elle est associée au mode de sortie structuré de Claude. Définissez un schéma JSON pour ce que Claude doit retourner après l'utilisation d'outils—cela empêche le texte libre et garantit que votre code en aval obtient toujours une forme prévisible.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Combinez les outils et les sorties structurées : Claude appelle les outils pour rassembler des données, puis formate sa réponse dans votre schéma. Cela vous donne à la fois la flexibilité (Claude peut raisonner sur les outils à appeler) et le déterminisme (vous savez exactement quelle forme vous obtenez).`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Appliquez ces six pratiques—conception d'outils résiliente, logique de backoff, validation de sortie, suivi des coûts, persistence d'état et sorties structurées—pour déployer des agents Claude fiables qui s'adaptent sans coûts cachés ou défaillances silencieuses. Commencez avec le kit de démarrage Pantheon.`}</p>
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
