import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-memory-jaccard-dedup'

export const metadata: Metadata = {
  title:       'Deduplicación de Memoria de Agentes IA con Similitud Jaccard',
  description: 'Deja de almacenar memorias duplicadas en tus agentes IA. Aprende similitud Jaccard para deduplicación de memoria en sistemas Claude + Next.js.',
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
    title:       'Deduplicación de Memoria de Agentes IA con Similitud Jaccard',
    description: 'Deja de almacenar memorias duplicadas en tus agentes IA. Aprende similitud Jaccard para deduplicación de memoria en sistemas Claude + Next.js.',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Deduplicación de Memoria de Agentes IA con Similitud Jaccard', description: 'Deja de almacenar memorias duplicadas en tus agentes IA. Aprende similitud Jaccard para deduplicación de memoria en sistemas Claude + Next.js.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Deduplicación de Memoria de Agentes IA con Similitud Jaccard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Cuando tu agente Claude almacena cada turno de conversación como una memoria, rápidamente te ahogarás en datos redundantes—desperdiciando tokens, aumentando la latencia y contaminando la búsqueda semántica. La similitud Jaccard te proporciona una forma ligera de identificar y fusionar memorias duplicadas antes de que saturen tu base de datos vectorial.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué las Memorias Duplicadas Matan el Desempeño del Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cada vez que tu agente Claude reflexiona sobre una conversación, puede almacenar información similar múltiples veces. Un usuario preguntando "¿Cómo autentico?" y luego "¿Cuál es el flujo de autenticación?" produce dos memorias casi idénticas. Durante miles de interacciones, esta hinchazón se compone: recuperación más lenta, costos de embeddings más altos y ruido en los resultados de búsqueda semántica.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La deduplicación no es opcional—es fundamental para construir agentes que escalen. Sin ella, tu sistema de memoria se convierte en un pasivo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Entendiendo la Similitud Jaccard para Dedup de Memoria"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La similitud Jaccard mide la superposición entre dos conjuntos. Para dedup de memoria, tokenizas cada memoria en palabras, calculas la intersección y la unión, luego calculas: \`|intersección| / |unión|\`. Una puntuación de 0.8+ típicamente significa que dos memorias son casi duplicadas que vale la pena fusionar.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A diferencia de la similitud semántica (que requiere embeddings y es más lenta), Jaccard se ejecuta en milisegundos y requiere cero sobrecarga de ML. Es determinística, depurable y funciona bien para coincidencias exactas y casi exactas—exactamente lo que necesitas para la limpieza de memoria.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementando Similitud Jaccard en Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Típicamente ejecutarás dedup en un trabajo en segundo plano de Supabase o una ruta API antes de insertar memorias. Tokeniza, calcula la puntuación Jaccard y marca pares de alta similitud para fusionar o eliminar.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrando con Tablas de Memoria de Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena memorias en Supabase con una columna \`memory_text\`. Antes de insertar una nueva memoria, consulta memorias recientes para el mismo agente y ejecuta verificaciones Jaccard en lógica de aplicación (o a través de una función Postgres si lo prefieres). Actualiza una marca de tiempo \`deduped_at\` para rastrear qué memorias han sido procesadas, previniendo desperdicio de recálculo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combinando Jaccard con Búsqueda Vectorial"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para mejores resultados, usa Jaccard como prefiltro antes de la búsqueda semántica. Deduplica memorias almacenadas cada 24 horas o después de N inserciones nuevas. Luego, cuando tu agente consulta memorias, busca en el conjunto limpio. Este enfoque dual atrapa tanto dupes a nivel de palabra (Jaccard) como casi-duplicados semánticos (similitud de embeddings).`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon en github.com/lewisallena17/pantheon incluye un pipeline de dedup de memoria listo para producción usando similitud Jaccard. Se integra con Claude, Next.js y Supabase con monitoreo incorporado para hinchazón de memoria. Bifurcalo, adapta el umbral de dedup a tu caso de uso e implementa en Vercel con un clic.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Deduplica tus memorias de agente con similitud Jaccard para reducir costos de almacenamiento, acelerar la recuperación y mantener tu base de datos vectorial limpia—comienza con el kit de inicio Pantheon hoy.`}</p>
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
