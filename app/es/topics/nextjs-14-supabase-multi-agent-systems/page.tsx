import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/nextjs-14-supabase-multi-agent-systems'

export const metadata: Metadata = {
  title:       'Next.js 14 + Supabase Sistemas Multi-Agente de IA',
  description: 'Construye sistemas multi-agente de IA en producción con Next.js 14 y Supabase. Patrones reales para integración de Claude, coordinación de agentes y estado pers',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-supabase-multi-agent-systems',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-supabase-multi-agent-systems',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-supabase-multi-agent-systems',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-supabase-multi-agent-systems',
    },
  },
  openGraph: {
    title:       'Next.js 14 + Supabase Sistemas Multi-Agente de IA',
    description: 'Construye sistemas multi-agente de IA en producción con Next.js 14 y Supabase. Patrones reales para integración de Claude, coordinación de agentes y estado pers',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Next.js 14 + Supabase Sistemas Multi-Agente de IA', description: 'Construye sistemas multi-agente de IA en producción con Next.js 14 y Supabase. Patrones reales para integración de Claude, coordinación de agentes y estado pers' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Next.js 14 + Supabase Sistemas Multi-Agente de IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Construye sistemas multi-agente de IA escalables donde los agentes Claude se coordinan a través de Supabase, ejecutan tareas de forma independiente y mantienen estado entre solicitudes, sin la sobrecarga de infraestructura.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué Next.js 14 + Supabase para Sistemas Multi-Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El App Router de Next.js 14 y Server Actions te dan las primitivas que necesitas: endpoints en tiempo real para polling de agentes, middleware para enrutamiento de solicitudes y funciones compatibles con edge. Supabase proporciona la base—PostgreSQL para estado de agentes, Realtime para streaming de eventos y Auth para comunicación segura entre agentes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La combinación elimina la necesidad de colas de mensajes u frameworks de orquestación. Los agentes escriben su estado directamente a Postgres, se suscriben a canales Realtime y disparan acciones a través de rutas API. Posees la infraestructura desde el primer día.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Arquitectura de Estado de Agentes con Postgres"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cada agente necesita un almacén de estado canónico. Las tablas de Supabase te permiten rastrear estado del agente, colas de tareas y resultados en un formato consultable. Usa políticas de Row-Level Security (RLS) para aislar permisos de agentes—un agente solo puede leer/escribir sus propias tareas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Estructura tu schema con agent_id como clave foránea, created_at para ordenamiento y enums de estado para workflow (pending, executing, completed, failed). Esto te proporciona auditabilidad gratuita y hace que depurar flujos multi-agente sea trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Tabla central de tareas de agentes
CREATE TABLE agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  status text CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  input jsonb NOT NULL,
  output jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integración de Agentes Claude vía Server Actions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los Server Actions de Next.js te permiten llamar a la API de Claude del lado del servidor, manteniendo tu clave API segura y evitando la gestión de tokens del lado del cliente. Cada acción recibe el estado actual del agente de Supabase, lo pasa a Claude con herramientas/instrucciones y persiste el resultado.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa el SDK de Anthropic directamente en tus acciones. Claude lee la cola de tareas del agente, decide qué hacer a continuación y tu acción actualiza Supabase con el resultado. Las suscripciones Realtime notifican a otros agentes de cambios de estado sin polling.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server'

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export async function executeAgentTask(agentId: string) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const claude = new Anthropic();
  
  const { data: task } = await supabase
    .from('agent_tasks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('status', 'pending')
    .single();
  
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: JSON.stringify(task.input) }]
  });
  
  await supabase
    .from('agent_tasks')
    .update({ status: 'completed', output: response.content[0].text })
    .eq('id', task.id);
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Coordinación de Agentes en Tiempo Real con Supabase Realtime"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes no necesitan hacer polling constante a Supabase. Usa suscripciones Realtime para escuchar cambios en tablas específicas. Cuando el Agente A completa una tarea, la suscripción del Agente B se dispara inmediatamente, desencadenando su siguiente acción.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto funciona bien para workflows secuenciales. El Agente A termina el análisis, publica un resultado y el listener del Agente B inicia la síntesis. Para trabajo paralelo, usa triggers de funciones Postgres para distribuir tareas atómicamente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejo de Errores y Lógica de Reintentos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena el contador de reintentos y el mensaje de error más reciente en tu tabla agent_tasks. Envuelve tus Server Actions en try/catch, actualiza la fila de tarea con detalles de error y vuelve a encolar automáticamente después de una demora.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La extensión pg_cron de Supabase te permite programar trabajos de reintento directamente en Postgres. No se necesita un worker de cola separado. Las tareas fallidas pueden desencadenar alertas vía webhooks a Discord o email para visibilidad.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio de Pantheon en github.com/lewisallena17/pantheon contiene un starter kit listo para producción para sistemas multi-agente de Next.js 14 + Supabase. Incluye migraciones de schema, patrones de Server Actions, helpers de suscripción Realtime y utilidades de manejo de errores.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Realiza un fork para obtener una base funcional. El código demuestra flujos de comunicación de agentes, persistencia de tareas e integración de Claude con mejores prácticas para seguridad y observabilidad.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Comienza con el starter kit de Pantheon—clónalo, establece tus credenciales de Supabase e implementa sistemas multi-agente en Vercel en horas, no semanas.`}</p>
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
