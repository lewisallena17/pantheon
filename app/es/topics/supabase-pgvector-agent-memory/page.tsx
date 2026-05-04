import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/supabase-pgvector-agent-memory'

export const metadata: Metadata = {
  title:       'pgvector para Memoria Semántica de Agentes IA | Guía',
  description: 'Aprende cómo usar pgvector en Supabase para memoria semántica persistente en agentes IA impulsados por Claude. Guía técnica con ejemplos de Next.js.',
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
    title:       'pgvector para Memoria Semántica de Agentes IA | Guía',
    description: 'Aprende cómo usar pgvector en Supabase para memoria semántica persistente en agentes IA impulsados por Claude. Guía técnica con ejemplos de Next.js.',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'pgvector para Memoria Semántica de Agentes IA | Guía', description: 'Aprende cómo usar pgvector en Supabase para memoria semántica persistente en agentes IA impulsados por Claude. Guía técnica con ejemplos de Next.js.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"pgvector para Memoria Semántica de Agentes IA | Guía"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Almacena y recupera memorias de agentes IA con incrustaciones vectoriales en Postgres usando pgvector, permitiendo que tus agentes Claude mantengan contexto entre sesiones sin inflación de tokens.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué pgvector para Memoria de Agentes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes IA necesitan recordar contexto de conversaciones, preferencias de usuarios y comportamientos aprendidos—pero las ventanas de contexto son finitas y caras. Las incrustaciones vectoriales resuelven esto: conviertes conversaciones y hechos en vectores semánticos, los almacenas en Postgres con pgvector, y recuperas solo las memorias más relevantes para cada solicitud.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`pgvector es una extensión de Postgres que maneja búsqueda de similitud de forma nativa. Con Supabase, obtienes pgvector habilitado desde el inicio. Esto significa que tu agente puede consultar una base de datos de memorias usando similitud de coseno (u otras métricas de distancia) e inyectar los top-k fragmentos más relevantes en el contexto de Claude, manteniendo el uso de tokens bajo mientras se mantiene memoria a largo plazo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configurar pgvector en Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Habilita la extensión pgvector en tu proyecto Supabase a través del panel (pestaña Extensiones), o ejecuta: \`CREATE EXTENSION IF NOT EXISTS vector;\` en tu editor SQL. Luego crea una tabla de memorias con una columna embeddings de tipo vector(1536) para almacenar incrustaciones de OpenAI.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu esquema debe incluir: id, agent_id (para limitar memorias por agente), content (el texto de memoria real), embedding (el vector), y created_at (para filtrado temporal). Añade un índice: \`CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);\` para búsquedas de similitud rápidas a escala.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Incrustar Conversaciones con Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando Claude responde, extrae hechos clave o resúmenes e incrustalos usando la API de incrustaciones de OpenAI. En tu ruta de API de Next.js, envía el texto de memoria a OpenAI, recibe el vector, y almacenalo en Supabase junto con el ID del agente y el contenido original.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto sucede de forma asíncrona después de que el agente responde al usuario—sin latencia adicional a la interacción de chat. Estás construyendo una base de conocimiento buscable que crece a medida que tu agente aprende.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Recuperar Memorias Relevantes para Contexto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Antes de enviar un mensaje de usuario a Claude, incrusta la consulta entrante y realiza una búsqueda de similitud: \`SELECT content FROM memories WHERE agent_id = \$1 ORDER BY embedding <-> \$2 LIMIT 5;\`. El operador \`<->\` es la métrica de distancia de coseno de pgvector.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Inyecta los top-5 resultados en el prompt del sistema de Claude o como contexto de recuperación. Esto le da a tu agente acceso instantáneo a conversaciones pasadas relevantes sin saturar el presupuesto de tokens.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Poda y Decaimiento Temporal"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las tablas de memoria crecen indefinidamente. Implementa un trabajo de limpieza (a través de una función cron en Supabase o un endpoint de Next.js programado) para eliminar memorias más antiguas de 90 días, o re-incrusta periódicamente y consolida memorias similares en resúmenes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`También puedes ponderar memorias recientes más alto ajustando tu consulta de recuperación: \`ORDER BY embedding <-> \$2 + (EXTRACT(EPOCH FROM (now() - created_at)) / 86400 * 0.01)\` para añadir una pequeña penalización por antigüedad.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon (github.com/lewisallena17/pantheon) proporciona una implementación de referencia lista para producción de sistemas multi-agente con memoria semántica. Demuestra comunicación entre agentes, integración de pgvector, y patrones de consolidación de memoria—ideal para entender cómo arquitectar sistemas agentes que escalen más allá de interacciones de turno único.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Comienza con una tabla de memorias simple, incrusta las interacciones clave de tu agente, y recupera contexto relevante antes de cada llamada de API—obtén un kit de inicio funcional para implementar esto hoy.`}</p>
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
