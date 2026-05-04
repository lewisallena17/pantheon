import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/supabase-realtime-subscriptions-nextjs'

export const metadata: Metadata = {
  title:       'Suscripciones en Tiempo Real de Supabase en Next.js App Router',
  description: 'Construye agentes de IA que se actualizan en vivo con Supabase Realtime y Next.js App Router. Patrones de suscripciones en tiempo real, componentes del servidor',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-realtime-subscriptions-nextjs',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-realtime-subscriptions-nextjs',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-realtime-subscriptions-nextjs',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-realtime-subscriptions-nextjs',
    },
  },
  openGraph: {
    title:       'Suscripciones en Tiempo Real de Supabase en Next.js App Router',
    description: 'Construye agentes de IA que se actualizan en vivo con Supabase Realtime y Next.js App Router. Patrones de suscripciones en tiempo real, componentes del servidor',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Suscripciones en Tiempo Real de Supabase en Next.js App Router', description: 'Construye agentes de IA que se actualizan en vivo con Supabase Realtime y Next.js App Router. Patrones de suscripciones en tiempo real, componentes del servidor' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Suscripciones en Tiempo Real de Supabase en Next.js App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Las suscripciones en tiempo real de Supabase te permiten enviar cambios de base de datos en vivo directamente a tus componentes de Next.js App Router, eliminando el polling y habilitando actualizaciones instantáneas del estado del agente de IA—esencial al construir sistemas multi-agente que necesitan sincronizarse entre usuarios y llamadas a la API de Claude.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué el Tiempo Real es Importante para Sistemas de Agentes de IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando construyes agentes de IA con Claude, necesitas agentes que reaccionen instantáneamente a cambios de estado. Un usuario edita un prompt, otro agente lo recoge inmediatamente. Una ejecución de herramienta se completa, la UI se actualiza sin refetch. Las suscripciones en tiempo real de Supabase hacen esto posible sin construir tu propia infraestructura de WebSocket.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El polling tradicional desperdicia ancho de banda y crea latencia. Las suscripciones en tiempo real envían cambios en el momento en que llegan a tu base de datos Postgres, lo cual es especialmente crítico cuando múltiples instancias de Claude u agentes se coordinan a través de una base de conocimiento compartida.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configurando Realtime en Next.js App Router"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Crea un hook de React que gestione suscripciones de Supabase en un contexto de Server Component. Next.js App Router soporta límites 'use client', donde vive tu lógica de suscripción—los Server Components no pueden usar useEffect, pero pueden transmitir datos vía Server Components con un hijo Client Component que maneja las suscripciones.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Inicializa tu cliente de Supabase con la configuración del canal realtime. Filtra por tabla y condiciones (como agent_id o user_id) para evitar actualizaciones innecesarias. Desuscríbete al desmontar para prevenir pérdidas de memoria y listeners duplicados.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAgentUpdates(agentId: string) {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    const subscription = supabase
      .channel(\`agent:\${agentId}\`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agents', filter: \`id=eq.\${agentId}\` },
        (payload) => setAgent(payload.new)
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [agentId]);

  return agent;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Filtrando Suscripciones por Usuario y Contexto del Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`No todo cambio en tu tabla de agentes importa a cada cliente. Usa la sintaxis de filtro de Supabase para suscribirte solo a filas que coincidan con tus criterios—típicamente los agentes del usuario actual o agentes en un workspace compartido.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto reduce ruido y mantiene los re-renders de tu componente enfocados. Para sistemas de IA multi-tenant, el filtrado es innegociable para rendimiento e aislamiento.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Combinando Realtime con Respuestas de la API de Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu patrón: (1) Usuario dispara una llamada a la API de Claude vía Server Action, (2) La respuesta de Claude se escribe en la base de datos vía trigger de Postgres o inserción directa, (3) La suscripción Realtime se dispara, (4) La UI se actualiza. Esto crea un flujo de estado del agente sin fisuras sin polling.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa triggers de base de datos para registrar atómicamente invocaciones y respuestas de Claude. Suscríbete a esos registros en tu capa de UI. Esto mantiene tu fuente de verdad de datos en Postgres y tu propagación en tiempo real automática.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejando Conexión y Reconexión"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Realtime maneja la reconexión de WebSocket automáticamente, pero deberías mostrar el estado de la conexión a usuarios que construyen sistemas de IA. Una suscripción realtime desconectada significa que los agentes no pueden sincronizarse—muestra un banner de advertencia.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Monitorea el estado de la suscripción e implementa lógica de reintentos con backoff exponencial. Para coordinación crítica de agentes, considera un mecanismo de polling fallback en pérdida de conexión.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación Open-Source: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repo Pantheon de Lewis Allen (github.com/lewisallena17/pantheon) demuestra patrones de Supabase Realtime listos para producción en un marco de agente de IA Next.js App Router + Claude. El codebase muestra estrategias de filtrado reales, limpieza de suscripciones e integración con tool use de Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Referencia la gestión de estado del agente de Pantheon y la lógica de transmisión de mensajes si estás construyendo un sistema multi-agente. Es un ejemplo funcional de los patrones descritos aquí.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implementa suscripciones en tiempo real de Supabase hoy para eliminar la latencia de polling y sincronizar tus agentes de IA entre usuarios instantáneamente—obtén el kit de inicio y la implementación de referencia abajo.`}</p>
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
