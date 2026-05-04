import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-observability-langfuse-logfire'

export const metadata: Metadata = {
  title:       'Observabilidad de Agentes IA: Guía Langfuse + Logfire',
  description: 'Monitorea agentes Claude en producción con Langfuse y Logfire. Trazas en tiempo real, seguimiento de costos y depuración para sistemas Next.js con IA.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-observability-langfuse-logfire',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-observability-langfuse-logfire',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-observability-langfuse-logfire',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-observability-langfuse-logfire',
    },
  },
  openGraph: {
    title:       'Observabilidad de Agentes IA: Guía Langfuse + Logfire',
    description: 'Monitorea agentes Claude en producción con Langfuse y Logfire. Trazas en tiempo real, seguimiento de costos y depuración para sistemas Next.js con IA.',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Observabilidad de Agentes IA: Guía Langfuse + Logfire', description: 'Monitorea agentes Claude en producción con Langfuse y Logfire. Trazas en tiempo real, seguimiento de costos y depuración para sistemas Next.js con IA.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Observabilidad de Agentes IA: Guía Langfuse + Logfire"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Deja de volar a ciegas con tus agentes Claude—Langfuse y Logfire te dan visibilidad completa en el uso de tokens, latencia y modos de fallo para que puedas depurar en producción en lugar de adivinar.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué la Observabilidad de Agentes es Importante"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes de IA son cajas negras por defecto. Despliegas un sistema impulsado por Claude, los usuarios interactúan con él, y cuando algo se rompe, no tienes idea de si es un problema de prompt, límite de tokens, alucinación de herramientas o pico de latencia. La observabilidad invierte esto: obtienes trazas estructuradas de cada llamada a LLM, ejecución de herramientas y rama de decisión.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para equipos independientes, esto es crítico. No puedes contratar a una persona de DevOps para investigar problemas de producción. Necesitas herramientas que te muestren exactamente qué sucedió, cuánto costó y por qué falló—en un solo panel.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Langfuse para Trazas de LLM y Seguimiento de Costos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Langfuse captura cada interacción con Claude: tokens de prompt, tokens de finalización, latencia y salidas estructuradas. Se integra directamente con el SDK de Anthropic y rastrea ejecuciones de agentes jerárquicamente—cada llamada de herramienta, recuperación y decisión se convierte en un span consultable.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El desglose de costos es en tiempo real. Ves exactamente qué comportamientos de agente o acciones de usuario impulsan el gasto. Para un sistema RAG donde algunas consultas desencadenan 10 llamadas de herramientas y otras desencadenan 1, detectarás el patrón instantáneamente. El núcleo de código abierto de Langfuse se ejecuta auto-hospedado; su nivel de nube agrega integraciones sin fricción.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Logfire para Registro Estructurado y Rendimiento"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Logfire (la plataforma de observabilidad de Pydantic) destaca en capturar registros estructurados desde tu backend de Next.js. Cada paso del agente, consulta de base de datos y llamada a API externa se etiqueta con contexto—user_id, session_id, agent_version—para que puedas dividir registros por cualquier dimensión.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A diferencia del registro tradicional, Logfire entiende tus tipos de TypeScript. Registras datos estructurados, no cadenas, y consultas con sintaxis similar a SQL. Esto importa al depurar: puedes preguntar 'muéstrame todas las ejecuciones de agente donde la herramienta X falló y la latencia excedió 2s' y obtener la respuesta en segundos.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Patrón de Integración: Next.js + Claude + Langfuse + Logfire"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El stack típico: una ruta de API de Next.js llama a un servicio de agente, que usa Claude a través del SDK de Anthropic (Langfuse intercepta esto automáticamente), realiza llamadas de herramientas a Supabase y registra eventos estructurados en Logfire.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Aquí está el patrón principal:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`import Anthropic from '@anthropic-ai/sdk';
import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const logger = pino();

export async function runAgent(input: string, userId: string) {
  logger.info({ userId, input, event: 'agent_start' });
  
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: input }],
  });
  
  logger.info({ userId, tokens: response.usage, event: 'agent_complete' });
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Qué Observar en Producción"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enfócate en cuatro métricas: (1) uso de tokens por ejecución de agente—detecta bucles descontrolados donde el agente sigue reintentando; (2) fallos de llamadas de herramientas—ve qué integraciones son inestables; (3) latencia por paso—identifica cuellos de botella en la cadena de razonamiento; (4) costo por cohorte de usuario—sabe qué características son costosas de soportar.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Configura alertas en Langfuse cuando el uso de tokens se dispara 3x lo normal o una herramienta falla 5 veces seguidas. En Logfire, alerta cuando la latencia del agente excede tu SLA. Esto previene fallos silenciosos donde un agente se queda atrapado en un bucle durante horas antes de que alguien lo note.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon en github.com/lewisallena17/pantheon demuestra este stack de principio a fin: un kit de inicio de agente Next.js con Langfuse y Logfire integrados, Supabase para persistencia, y Claude como motor principal. Es boilerplate listo para producción—clónalo, establece tus claves de API e implementa. Cada llamada de herramienta y decisión de agente se rastrea y registra automáticamente.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Comienza a observar tus agentes de IA hoy—obtén el kit de inicio Pantheon e integra Langfuse + Logfire en una implementación.`}</p>
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
