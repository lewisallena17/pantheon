import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/nextjs-14-app-router-ai-dashboard'

export const metadata: Metadata = {
  title:       'Panel de IA Next.js 14: Guía de App Router',
  description: 'Construye paneles de IA en producción con Next.js 14 App Router. Patrones reales para integración de Claude, actualizaciones en tiempo real y autenticación Supa',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/nextjs-14-app-router-ai-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/nextjs-14-app-router-ai-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/nextjs-14-app-router-ai-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/nextjs-14-app-router-ai-dashboard',
    },
  },
  openGraph: {
    title:       'Panel de IA Next.js 14: Guía de App Router',
    description: 'Construye paneles de IA en producción con Next.js 14 App Router. Patrones reales para integración de Claude, actualizaciones en tiempo real y autenticación Supa',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Panel de IA Next.js 14: Guía de App Router', description: 'Construye paneles de IA en producción con Next.js 14 App Router. Patrones reales para integración de Claude, actualizaciones en tiempo real y autenticación Supa' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Panel de IA Next.js 14: Guía de App Router"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`El App Router de Next.js 14 hace posible lanzar un panel de IA completamente funcional—con integración de Claude API, respuestas en streaming y sesiones de usuario autenticadas—en un solo fin de semana en lugar de semanas de código repetitivo.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué App Router lo cambia todo para paneles de IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El Pages Router te obligaba a administrar rutas de API por separado de tu lógica de UI. App Router colapsa esa separación: los componentes del servidor manejan llamadas a Claude directamente, las respuestas en streaming fluyen al cliente sin complejidad de middleware, y el middleware se ejecuta una sola vez en el edge en lugar de en cada solicitud. Para paneles de IA específicamente, esto significa menor latencia entre la entrada del usuario y el flujo de respuesta de Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los componentes del servidor también eliminan la necesidad de exponer tu clave de API de Claude al navegador. Llamas la API desde layout.tsx o una server action, transmites el resultado, y el cliente nunca toca la autenticación. Las sesiones de Supabase funcionan de la misma manera—verifica tokens en el servidor, úsalos en solicitudes a Claude, listo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Server Actions para integración con Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las server actions reemplazan los endpoints de API tradicionales. Marca una función con 'use server', llama la API de Claude dentro de ella, e invócala directamente desde tu componente. Sin serialización JSON, sin route handlers, sin dolores de cabeza de CORS.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Al transmitir respuestas de Claude al cliente, usa readline o text-decoder para dividir el flujo de respuesta en chunks. Este patrón funciona particularmente bien para sistemas de agentes donde quieres mostrar pasos de pensamiento intermedio a medida que llegan.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`'use server';

import Anthropic from '@anthropic-ai/sdk';

export async function streamAgentResponse(input: string) {
  const client = new Anthropic();
  const stream = client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    stream: true,
    messages: [{ role: 'user', content: input }],
  });
  
  return stream;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Actualizaciones en tiempo real con Server-Sent Events"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`App Router soporta respuestas en streaming de forma nativa a través de objetos Response. Para paneles de agentes en vivo, crea un route handler que abre una conexión Server-Sent Event, canaliza el flujo de Claude a través de ella, y tu cliente se suscribe con EventSource. El resultado se siente como una experiencia nativa de WebSocket sin el costo de infraestructura.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto es esencial cuando tus agentes realizan múltiples llamadas a Claude en secuencia. Puedes transmitir la salida de cada paso a medida que se completa, dando a los usuarios visibilidad de lo que el agente está haciendo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Autenticación Supabase con Middleware"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El middleware de App Router se ejecuta antes de que se acceda a cualquier ruta. Configura la verificación de sesión de Supabase aquí para verificar JWTs y refrescar tokens en cada solicitud. Almacena el usuario verificado en request.user, accesible en componentes del servidor y server actions sin consultas de base de datos adicionales.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Este patrón protege tus llamadas a Claude—puedes verificar que solo usuarios autenticados con sesiones válidas activen solicitudes de API, y puedes rastrear el uso por usuario para límites de velocidad o facturación.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construyendo componentes de panel reutilizables"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa componentes 'use client' para UI interactiva (gráficos, formularios de entrada, actualizaciones en tiempo real), pero mantén la lógica de Claude en server actions. Esta separación mantiene tu árbol de componentes limpio y tus llamadas de API seguras. Un panel típico tendrá 3-4 server actions: una para cada tarea de agente, una para actualización de sesión, una para registro de analítica.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para paneles que muestran múltiples agentes en paralelo, usa Promise.all() en una server action para invocar Claude múltiples veces, luego retorna todos los resultados al cliente en un solo renderizado. Esto es más rápido que las llamadas secuenciales.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Patrones de producción: manejo de errores y límites de velocidad"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Envuelve las llamadas de API de Claude en bloques try-catch que retornen respuestas de error estructuradas. El cliente puede mostrar mensajes amigables sin exponer detalles de la API. Para límites de velocidad, usa el límite de velocidad integrado de Supabase o una capa Redis—verifica límites antes de invocar Claude, no después.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Siempre establece tiempos de espera explícitos en solicitudes a Claude. Un tiempo de espera de 30 segundos previene que conexiones colgadas se acumulen. Registra fallos con IDs de solicitud para que puedas rastrear problemas en producción.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`App Router + server actions + server components eliminan el 70% del código repetitivo que tradicionalmente ralentiza el desarrollo de paneles de IA—comienza con Pantheon, lanza tu primer panel de agentes esta semana.`}</p>
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
