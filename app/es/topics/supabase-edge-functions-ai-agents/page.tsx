import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/supabase-edge-functions-ai-agents'

export const metadata: Metadata = {
  title:       'Supabase Edge Functions para Webhooks de Agentes IA',
  description: 'Construye manejadores de webhooks de agentes IA escalables con Supabase Edge Functions. Despliega integraciones de Claude instantáneamente sin gestionar servido',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-edge-functions-ai-agents',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-edge-functions-ai-agents',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-edge-functions-ai-agents',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-edge-functions-ai-agents',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-edge-functions-ai-agents',
    },
  },
  openGraph: {
    title:       'Supabase Edge Functions para Webhooks de Agentes IA',
    description: 'Construye manejadores de webhooks de agentes IA escalables con Supabase Edge Functions. Despliega integraciones de Claude instantáneamente sin gestionar servido',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Supabase Edge Functions para Webhooks de Agentes IA', description: 'Construye manejadores de webhooks de agentes IA escalables con Supabase Edge Functions. Despliega integraciones de Claude instantáneamente sin gestionar servido' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Supabase Edge Functions para Webhooks de Agentes IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Supabase Edge Functions te permite manejar webhooks de agentes IA sin sobrecarga de infraestructura—despliega integraciones de Claude, procesa respuestas en streaming y activa flujos de trabajo autónomos en milisegundos desde una única función TypeScript.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué Edge Functions Superan los Webhooks Tradicionales para Agentes IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los manejadores de webhooks tradicionales requieren servidores persistentes, balanceadores de carga y canales de despliegue. Edge Functions se ejecutan globalmente en Cloudflare Workers, ejecutándose cerca de tus usuarios con arranques en frío inferiores a 100ms. Para agentes IA que dependen del procesamiento de eventos en tiempo real—llamadas a herramientas de Claude, handshakes de webhook, actualizaciones de estado de trabajos asincronos—esta latencia importa.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Evitas el bloqueo de proveedor manteniendo las funciones portátiles. Tu lógica de webhook no está vinculada a la API gateway de un único proveedor de nube. Supabase Edge Functions se ejecuta en el runtime de Deno abierto, permitiéndote migrar u alojar automáticamente si es necesario.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejando Devoluciones de Llamada de Uso de Herramientas de Claude a Escala"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes de Claude a menudo llaman a herramientas externas que requieren devoluciones de llamada de webhook. Cuando tu servicio de herramientas completa una tarea de larga duración, envía un POST a tu webhook. Edge Functions procesan estas devoluciones de llamada instantáneamente sin iniciar instancias de contenedor.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cada invocación de función está aislada y escala automáticamente. Si estás ejecutando 100 instancias concurrentes de agentes de Claude esperando cada una devoluciones de llamada de herramientas, Supabase maneja la carga. Solo pagas por el tiempo de ejecución—típicamente microsegundos por visita de webhook.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function handler(req: Request) {
  const { tool_use_id, result } = await req.json();
  const { data, error } = await supabase
    .from('agent_tasks')
    .update({ status: 'complete', result })
    .eq('tool_use_id', tool_use_id);
  return new Response(JSON.stringify({ ok: !error }));
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Respuestas en Streaming y Contrapresión"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La API de streaming de Claude devuelve salida token por token. Edge Functions admite respuestas en streaming de forma nativa, permitiéndote canalizar la salida de Claude directamente a tu cliente o servicio descendente. Esto reduce la huella de memoria y la latencia para retroalimentación de agentes en tiempo real.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para agentes IA que generan respuestas de forma larga (reportes, código, análisis), el streaming previene problemas de tiempo de espera. Tu webhook permanece abierto, los tokens fluyen continuamente y los clientes ven la salida inmediatamente en lugar de esperar a la finalización.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integración de Base de Datos sin Saltos Adicionales"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Supabase Edge Functions se ejecuta en la misma VPC que tu base de datos PostgreSQL. Los manejadores de webhooks que necesitan leer estado del agente, registrar interacciones o actualizar estados de tareas alcanzan tu base de datos con latencia de red cero. Una única función puede validar la firma del webhook, obtener contexto, llamar a Claude y persistir resultados.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa Supabase RLS (Row Level Security) para aplicar control de acceso directamente en tu Edge Function. Cada invocación de webhook hereda permisos de base de datos basados en API key o JWT, eliminando capas de autorización manual.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Secretos de Entorno y Gestión Segura de Credenciales"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena tu clave API de Claude, secretos de firma de webhook y credenciales de terceros en la configuración del proyecto Supabase. Edge Functions accede a estos a través de variables de entorno—nunca hardcodees claves en tu base de código.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Rota secretos sin reasignar. Supabase propaga actualizaciones instantáneamente a todas las instancias de función. Para flujos de trabajo críticos de seguridad (confirmaciones de pago, devoluciones de llamada de autenticación de usuario), esto es innegociable.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon de Lewis Allen (github.com/lewisallena17/pantheon) demuestra una arquitectura de agente IA de grado de producción utilizando Supabase Edge Functions. La base de código incluye validación de webhook, patrones de integración de Claude, devoluciones de llamada de uso de herramientas y scaffolding de interfaz Next.js.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Haz un fork como tu plantilla de inicio. Pantheon cubre el ciclo completo: invocación de agente, manejo de webhook, streaming y persistencia de estado—todo lo que necesitas para desplegar un sistema de agente IA funcional en horas en lugar de semanas.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Despliega webhooks de agentes IA escalables instantáneamente con Supabase Edge Functions—sin servidores, sin sobrecarga operativa, solo TypeScript ejecutándose globalmente. Obtén el kit de inicio de Pantheon y despliega tu integración de Claude hoy.`}</p>
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
