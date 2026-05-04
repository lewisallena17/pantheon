import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/supabase-pgvector-agent-memory'

export const metadata: Metadata = {
  title:       'pgvector pour la mémoire sémantique des agents IA | Guide',
  description: 'Apprenez à utiliser pgvector dans Supabase pour une mémoire sémantique persistante dans les agents IA alimentés par Claude. Guide technique avec des exemples Ne',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-pgvector-agent-memory',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-pgvector-agent-memory',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-pgvector-agent-memory',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
    },
  },
  openGraph: {
    title:       'pgvector pour la mémoire sémantique des agents IA | Guide',
    description: 'Apprenez à utiliser pgvector dans Supabase pour une mémoire sémantique persistante dans les agents IA alimentés par Claude. Guide technique avec des exemples Ne',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'pgvector pour la mémoire sémantique des agents IA | Guide', description: 'Apprenez à utiliser pgvector dans Supabase pour une mémoire sémantique persistante dans les agents IA alimentés par Claude. Guide technique avec des exemples Ne' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"pgvector pour la mémoire sémantique des agents IA | Guide"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Stockez et récupérez les souvenirs des agents IA avec des embeddings vectoriels dans Postgres en utilisant pgvector, permettant à vos agents Claude de maintenir le contexte entre les sessions sans surcharge de tokens.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi pgvector pour la mémoire des agents"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les agents IA doivent se souvenir du contexte de conversation, des préférences utilisateur et des comportements appris—mais les contextes sont finis et coûteux. Les embeddings vectoriels résolvent ce problème : vous convertissez les conversations et les faits en vecteurs sémantiques, les stockez dans Postgres avec pgvector, et récupérez uniquement les souvenirs les plus pertinents pour chaque demande.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`pgvector est une extension Postgres qui gère la recherche de similarité de manière native. Avec Supabase, pgvector est activé dès le départ. Cela signifie que votre agent peut interroger une base de données de souvenirs en utilisant la similarité cosinus (ou d'autres métriques de distance) et injecter les k meilleurs extraits dans le contexte de Claude, en maintenant une utilisation faible des tokens tout en preservant la mémoire à long terme.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configuration de pgvector dans Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Activez l'extension pgvector dans votre projet Supabase via le tableau de bord (onglet Extensions), ou exécutez : \`CREATE EXTENSION IF NOT EXISTS vector;\` dans votre éditeur SQL. Ensuite, créez une table memories avec une colonne embeddings de type vector(1536) pour stocker les embeddings OpenAI.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Votre schéma devrait inclure : id, agent_id (pour cloisonner les souvenirs par agent), content (le texte du souvenir réel), embedding (le vecteur), et created_at (pour filtrer temporellement). Ajoutez un index : \`CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);\` pour des recherches de similarité rapides à grande échelle.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamp DEFAULT now()
);

CREATE INDEX memories_embedding_idx 
  ON memories USING ivfflat (embedding vector_cosine_ops);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Embedding des conversations avec Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Lorsque Claude répond, extrayez les faits clés ou les résumés et intégrez-les à l'aide de l'API embeddings OpenAI. Dans votre route API Next.js, envoyez le texte du souvenir à OpenAI, recevez le vecteur et stockez-le dans Supabase aux côtés de l'ID de l'agent et du contenu original.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cela se fait de manière asynchrone après que l'agent réponde à l'utilisateur—aucune latence ajoutée à l'interaction de chat. Vous construisez une base de connaissances consultable qui grandit à mesure que votre agent apprend.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/agent/store-memory.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI();

export default async function handler(req, res) {
  const { agentId, content } = req.body;
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });
  
  await supabase.from('memories').insert({
    agent_id: agentId,
    content,
    embedding: embedding.data[0].embedding,
  });
  
  res.status(200).json({ ok: true });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Récupération des souvenirs pertinents pour le contexte"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Avant d'envoyer un message utilisateur à Claude, intégrez la requête entrante et effectuez une recherche de similarité : \`SELECT content FROM memories WHERE agent_id = \$1 ORDER BY embedding <-> \$2 LIMIT 5;\`. L'opérateur \`<->\` est la métrique de distance cosinus de pgvector.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Injectez les 5 meilleurs résultats dans le prompt système de Claude ou comme contexte de récupération augmentée. Cela donne à votre agent un accès instantané aux conversations pertinentes passées sans surcharger le budget des tokens.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Élagage et décroissance temporelle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Les tables de souvenirs croissent indéfiniment. Implémentez un travail de nettoyage (via une fonction cron dans Supabase ou un endpoint Next.js planifié) pour supprimer les souvenirs plus vieux que 90 jours, ou regroupez et consolidez périodiquement les souvenirs similaires en résumés.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vous pouvez également pondérer les souvenirs récents en ajustant votre requête de récupération : \`ORDER BY embedding <-> \$2 + (EXTRACT(EPOCH FROM (now() - created_at)) / 86400 * 0.01)\` pour ajouter une petite pénalité pour l'âge.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le dépôt Pantheon (github.com/lewisallena17/pantheon) fournit une implémentation de référence prête pour la production de systèmes multi-agents avec mémoire sémantique. Il démontre la communication agent-à-agent, l'intégration pgvector et les motifs de consolidation de mémoire—idéal pour comprendre comment architecturer les systèmes d'agents qui s'échelle au-delà des interactions à un seul tour.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Commencez avec une table de souvenirs simple, intégrez les interactions clés de votre agent, et récupérez le contexte pertinent avant chaque appel API—obtenez un kit de démarrage fonctionnel pour implémenter cela dès aujourd'hui.`}</p>
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
