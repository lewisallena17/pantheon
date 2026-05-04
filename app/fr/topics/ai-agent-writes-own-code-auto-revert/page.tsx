import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-writes-own-code-auto-revert'

export const metadata: Metadata = {
  title:       'Agents IA qui modifient leur propre code en toute sécurité',
  description: 'Apprenez à construire des agents IA utilisant Claude qui modifient safely leur propre code. Inclut les patterns d\'isolation, de validation et d\'implémentation N',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-writes-own-code-auto-revert',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-writes-own-code-auto-revert',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-writes-own-code-auto-revert',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
    },
  },
  openGraph: {
    title:       'Agents IA qui modifient leur propre code en toute sécurité',
    description: 'Apprenez à construire des agents IA utilisant Claude qui modifient safely leur propre code. Inclut les patterns d\'isolation, de validation et d\'implémentation N',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Agents IA qui modifient leur propre code en toute sécurité', description: 'Apprenez à construire des agents IA utilisant Claude qui modifient safely leur propre code. Inclut les patterns d\'isolation, de validation et d\'implémentation N' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Agents IA qui modifient leur propre code en toute sécurité"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Permettez à Claude de modifier, tester et déployer en toute sécurité ses propres changements de code sans casser votre système de production—en utilisant des portes de validation, l'exécution isolée, et des mécanismes de rollback qui fonctionnent avec les vrais frameworks d'agents IA.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi le code auto-modifié a besoin de garde-fous"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents IA qui peuvent modifier leur propre code rencontrent le même problème à chaque fois : la mutation non bornée. Claude peut générer un correctif qui fonctionne isolément mais casse les dépendances en aval. Il pourrait optimiser en supprimant la gestion des erreurs. Il pourrait introduire des vulnérabilités d'injection SQL en résolvant un problème de performance.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La solution n'est pas de désactiver la auto-modification—c'est d'ajouter des couches de validation avant que le code s'exécute. Vous avez besoin de vérification de syntaxe, de validation de type, d'exécution de tests dans un sandbox, et de portes d'approbation humaine pour les changements en production. Construisez-les correctement, et vous obtenez un système qui apprend et s'améliore lui-même sans modes de défaillance catastrophiques.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Isolation de l'exécution du code avec Docker ou isolation VM"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Avant qu'un agent IA valide les changements de code, il doit les exécuter en isolation. Utilisez des conteneurs Docker ou des VMs Node.js isolés pour exécuter le code généré. Créez un clone de base de données temporaire, déployez le service modifié dans un conteneur, exécutez votre suite de tests, et vérifiez qu'aucune régression ne se produit.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cette approche fonctionne particulièrement bien avec les routes API Next.js : générez un endpoint modifié, testez-le contre des requêtes connues, mesurez la latence et les taux d'erreur, puis approuvez ou rejetez en fonction des métriques. Gardez le sandbox étroit—pas d'accès réseau, mémoire limitée, timeouts stricts.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Si l'agent modifie les schémas de base de données, utilisez des transactions avec rollback automatique. Testez les migrations sur une copie des données de production avant de toucher le vrai système.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Portes de validation : analyse AST et vérification de type"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tout le code généré n'est pas du code exécutable. Avant la mise en sandbox, validez la structure. Analysez TypeScript avec un outil comme l'API du compilateur TypeScript ou Babel, vérifiez les patterns interdits (eval, APIs Node dangereuses, credentials codées en dur), et vérifiez la sécurité des types.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les changements de base de données, validez la syntaxe SQL et les contraintes de schéma. Utilisez un parser SQL pour détecter les patterns d'injection. Pour les routes API, assurez-vous que la signature de fonction correspond à votre contrat.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Une approche simple : rejetez tout code contenant eval, require() en dehors d'une liste blanche, ou l'accès à process.env dans les méthodes générées. Rejetez tout SQL qui supprime les tables sans un flag admin explicite.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const code = \`
const handler = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [req.query.id]
  );
  return res.json(result);
};
\`;
const hasEval = /\beval\s*\(/.test(code);
const hasDrop = /\bDROP\s+TABLE/i.test(code);
if (hasEval || hasDrop) throw new Error('Pattern blocked');
`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Génération de code conduite par les tests avec Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Invitez Claude à générer du code avec des tests. Utilisez la fonctionnalité de pensée étendue pour que Claude raisonne à travers les cas limites avant d'écrire. Structurez les prompts pour demander des tests unitaires aux côtés de l'implémentation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fournissez à Claude votre suite de tests existante et demandez-lui de garantir que tous les tests passent. Donnez-lui un document de schéma et demandez-lui de vérifier que les migrations sont rétro-compatibles. Plus vous encodez de contraintes dans le prompt, moins vous verrez de régressions dans les exécutions de sandbox.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Workflows d'approbation et journaux d'audit"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Même le code validé doit nécessiter une approbation humaine avant d'atteindre la production. Stockez chaque changement généré dans une table Supabase avec le prompt original, le raisonnement de Claude, les résultats des tests, et le statut d'approbation. Construisez un tableau de bord montrant les changements d'agent en attente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Journalisez chaque exécution. Qui l'a approuvé, quand il a été exécuté, quelles métriques ont changé, les erreurs qui ont suivi. Cela crée la responsabilité et rend facile de tracer les bugs vers une modification d'agent spécifique.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon à github.com/lewisallena17/pantheon fournit une implémentation de référence fonctionnelle pour les agents IA qui modifient le code en toute sécurité. Il inclut les patterns d'exécution isolée, le schéma Supabase pour le suivi des changements, les endpoints API Next.js pour le déploiement, et l'intégration Claude avec des portes de validation.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Étudiez comment Pantheon structure ses prompts pour inclure les instructions de génération de tests, comment il orchestre les exécutions de sandbox avant approbation, et comment il journalise les changements vers une piste d'audit persistante. Vous pouvez adapter ces patterns dans votre propre système ou forker Pantheon comme point de départ.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construisez des agents IA auto-améliorants en superposant la validation, l'isolation et les workflows d'approbation—téléchargez le starter kit Pantheon pour voir les patterns de code fonctionnels pour la auto-modification propulsée par Claude avec des garde-fous de sécurité.`}</p>
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
