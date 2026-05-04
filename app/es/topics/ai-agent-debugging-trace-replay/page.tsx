import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-debugging-trace-replay'

export const metadata: Metadata = {
  title:       'Depuración de Agentes IA con Trace Replay | Claude',
  description: 'Aprende a depurar agentes IA paso a paso usando trace replay. Captura decisiones de agentes, reproduce fallos y soluciona problemas de producción más rápido con',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-debugging-trace-replay',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-debugging-trace-replay',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-debugging-trace-replay',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-debugging-trace-replay',
    },
  },
  openGraph: {
    title:       'Depuración de Agentes IA con Trace Replay | Claude',
    description: 'Aprende a depurar agentes IA paso a paso usando trace replay. Captura decisiones de agentes, reproduce fallos y soluciona problemas de producción más rápido con',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Depuración de Agentes IA con Trace Replay | Claude', description: 'Aprende a depurar agentes IA paso a paso usando trace replay. Captura decisiones de agentes, reproduce fallos y soluciona problemas de producción más rápido con' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Depuración de Agentes IA con Trace Replay | Claude"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Trace replay te permite registrar cada decisión que toma tu agente IA, luego retroceder a través de fallos para encontrar exactamente dónde se rompió el razonamiento—reduciendo el tiempo de depuración de horas a minutos.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué el Logging Estándar Falla para Agentes IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los registros tradicionales te muestran *qué* pasó, no *por qué* tu agente eligió una acción específica. Cuando las tool calls de Claude se descontrolan o una cadena de razonamiento multi-paso diverge, te quedas reconstruyendo el contexto manualmente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La depuración de agentes IA requiere visibilidad en: conteos de tokens en puntos de decisión, contexto exacto de prompt para cada paso, salida de herramientas que activó una rama, y la confianza del modelo en cada nodo. Una única sentencia print no te dará esto.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cómo Trace Replay Captura el Estado del Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace replay registra el gráfico de ejecución completo de tu agente: mensajes enviados a Claude, definiciones de herramientas disponibles, resultados de herramientas recibidos, y tokens consumidos. Cada nodo tiene marca de tiempo e índice.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En lugar de re-ejecutar un agente fallido desde cero (costoso y no determinista con Claude), replicas desde cualquier punto de control. Saltas al paso 7 de 12, inspecciona el contexto exacto que vio Claude, modifica una respuesta de herramienta, y avanza rápidamente para ver cómo cambia el razonamiento.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto es especialmente poderoso para agentes que llaman APIs externas—capturas la respuesta de API en vivo y replicas contra ella sin golpear límites de velocidad o efectos secundarios.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construcción de Captura de Traces en Next.js + Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Captura traces envolviendo tus llamadas a cliente Claude. Almacena historial de mensajes, tool calls, resultados de herramientas, y metadatos de tiempo en Supabase. Consulta por ID de sesión del agente para replay instantáneo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Aquí está el patrón mínimo:`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function executeAgentStep(messages: Message[]) {
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages
  });
  
  const trace = {
    sessionId: currentSession.id,
    stepNumber: messages.length,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
    messageContent: response.content,
    timestamp: new Date()
  };
  
  await supabase
    .from('agent_traces')
    .insert([trace]);
  
  return response;
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Reproducción y Modificación de Decisiones del Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Carga una sesión de trace desde Supabase y reprodúcela determinísticamente. Si la tool call del paso 5 devolvió datos incorrectos, modifica ese resultado en memoria y re-ejecuta los pasos 6–12 contra el estado corregido.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto es mejor que re-ejecutar porque: sin costos de API para pasos repetidos, controlas exactamente cuáles entradas cambian, y puedes hacer pruebas A/B con diferentes salidas de herramientas instantáneamente. Para agentes que realizan 50+ llamadas de API en una sola tarea, esto ahorra dinero real.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Identificación de Inyección de Prompt y Desviación de Razonamiento"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Trace replay hace visible los fallos invisibles. Compara el contexto exacto de prompt entre una trace que funcionó y una que falló. Notarás cuándo un resultado de herramienta contenía formato inesperado, o cuándo los límites de token obligaron a Claude a cortar el razonamiento.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Observa desviación de razonamiento: un agente que puntuó 95% ayer pero 60% hoy probablemente vio un cambio de entrada sutil. Trace replay lo expone inmediatamente en lugar de esperar a que las métricas se degraden aún más.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon (github.com/lewisallena17/pantheon) proporciona un sistema de trace replay completo construido para agentes Claude. Incluye esquemas de base de datos para Supabase, una UI de Next.js para navegar árboles de traces, y utilidades TypeScript para captura y reproducción.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Forkéalo para agregar extensiones específicas del dominio: análisis de costos, perfilado de latencia, o visualizaciones personalizadas para el árbol de decisiones de tu agente.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Comienza a capturar traces de agentes hoy—clona Pantheon, agrega logging de trace a tus llamadas Claude, y reemplaza horas de adivinanzas con depuración a nivel de minuto.`}</p>
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
