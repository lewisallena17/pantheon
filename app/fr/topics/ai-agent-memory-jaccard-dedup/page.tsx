import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-memory-jaccard-dedup'

export const metadata: Metadata = {
  title:       'Déduplication de la mémoire des agents IA avec la similitude de Jaccard',
  description: 'Arrêtez de stocker des mémoires en double dans vos agents IA. Apprenez la similitude de Jaccard pour la déduplication de mémoire dans les systèmes Claude + Next',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-memory-jaccard-dedup',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-memory-jaccard-dedup',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-memory-jaccard-dedup',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-memory-jaccard-dedup',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-memory-jaccard-dedup',
    },
  },
  openGraph: {
    title:       'Déduplication de la mémoire des agents IA avec la similitude de Jaccard',
    description: 'Arrêtez de stocker des mémoires en double dans vos agents IA. Apprenez la similitude de Jaccard pour la déduplication de mémoire dans les systèmes Claude + Next',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Déduplication de la mémoire des agents IA avec la similitude de Jaccard', description: 'Arrêtez de stocker des mémoires en double dans vos agents IA. Apprenez la similitude de Jaccard pour la déduplication de mémoire dans les systèmes Claude + Next' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Déduplication de la mémoire des agents IA avec la similitude de Jaccard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Lorsque votre agent IA stocke chaque tour de conversation en tant que mémoire, vous serez rapidement submergé par des données redondantes—gaspillant des tokens, augmentant la latence et polluant la recherche sémantique. La similitude de Jaccard vous offre un moyen léger d'identifier et fusionner les mémoires en double avant qu'elles ne gonflent votre base de données vectorielle.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi les mémoires en double tuent les performances des agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Chaque fois que votre agent Claude réfléchit à une conversation, il peut stocker des insights similaires plusieurs fois. Un utilisateur demandant « Comment s'authentifier ? » puis « Quel est le flux d'authentification ? » produit deux mémoires presque identiques. Sur des milliers d'interactions, ce gonflement s'accumule : récupération plus lente, coûts d'embedding plus élevés et bruit dans les résultats de recherche sémantique.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La déduplication n'est pas optionnelle—c'est fondamental pour construire des agents qui se mettent à l'échelle. Sans elle, votre système de mémoire devient un passif.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Comprendre la similitude de Jaccard pour la déduplication de mémoire"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La similitude de Jaccard mesure le chevauchement entre deux ensembles. Pour la déduplication de mémoire, vous tokenisez chaque mémoire en mots, calculez l'intersection et l'union, puis calculez : \`|intersection| / |union|\`. Un score de 0,8+ signifie généralement que deux mémoires sont des quasi-doublons méritant d'être fusionnées.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Contrairement à la similitude sémantique (qui nécessite des embeddings et est plus lente), Jaccard s'exécute en millisecondes et ne nécessite aucune surcharge ML. C'est déterministe, débogable et fonctionne bien pour les correspondances exactes et quasi-exactes—exactement ce dont vous avez besoin pour le nettoyage de mémoire.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation de la similitude de Jaccard en Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vous exécuterez généralement la déduplication dans une tâche de fond Supabase ou une route API avant d'insérer des mémoires. Tokenisez, calculez le score de Jaccard et marquez les paires de haute similarité pour fusion ou suppression.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`function jaccardSimilarity(text1: string, text2: string): number {
  const normalize = (t: string) => new Set(t.toLowerCase().split(/\s+/));
  const set1 = normalize(text1);
  const set2 = normalize(text2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 1 : intersection.size / union.size;
}

const threshold = 0.75;
if (jaccardSimilarity(newMemory, existingMemory) > threshold) {
  console.log('Duplicate detected—merge or skip storage');
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Intégration avec les tables de mémoire Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Stockez les mémoires dans Supabase avec une colonne \`memory_text\`. Avant d'insérer une nouvelle mémoire, interrogez les mémoires récentes du même agent et exécutez les vérifications de Jaccard dans la logique applicative (ou via une fonction Postgres si vous préférez). Mettez à jour un timestamp \`deduped_at\` pour suivre quelles mémoires ont été traitées, en évitant le gaspillage de recalcul.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combinaison de Jaccard avec la recherche vectorielle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les meilleurs résultats, utilisez Jaccard comme préfiltre avant la recherche sémantique. Dédupliquez les mémoires stockées tous les 24 heures ou après N nouvelles insertions. Ensuite, quand votre agent interroge les mémoires, recherchez dans l'ensemble nettoyé. Cette approche double attrape à la fois les doublons au niveau des mots (Jaccard) et les quasi-correspondances sémantiques (similitude d'embedding).`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le projet Pantheon sur github.com/lewisallena17/pantheon inclut un pipeline de déduplication de mémoire prêt pour la production utilisant la similitude de Jaccard. Il intègre Claude, Next.js et Supabase avec monitoring intégré pour le gonflement de mémoire. Forkez-le, adaptez le seuil de déduplication à votre cas d'usage, et déployez sur Vercel en un clic.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Dédupliquez vos mémoires d'agent avec la similitude de Jaccard pour réduire les coûts de stockage, accélérer la récupération et garder votre base de données vectorielle propre—commencez avec le kit de démarrage Pantheon aujourd'hui.`}</p>
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
