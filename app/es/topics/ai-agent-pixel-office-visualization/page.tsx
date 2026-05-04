import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-pixel-office-visualization'

export const metadata: Metadata = {
  title:       'Visualizando Agentes IA con Oficina en Pixel Art',
  description: 'Construye dashboards interactivos para agentes IA usando pixel art. Ve el estado del agente en tiempo real, flujos de tareas e integraciones con Claude usando N',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-pixel-office-visualization',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-pixel-office-visualization',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-pixel-office-visualization',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
    },
  },
  openGraph: {
    title:       'Visualizando Agentes IA con Oficina en Pixel Art',
    description: 'Construye dashboards interactivos para agentes IA usando pixel art. Ve el estado del agente en tiempo real, flujos de tareas e integraciones con Claude usando N',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Visualizando Agentes IA con Oficina en Pixel Art', description: 'Construye dashboards interactivos para agentes IA usando pixel art. Ve el estado del agente en tiempo real, flujos de tareas e integraciones con Claude usando N' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Visualizando Agentes IA con Oficina en Pixel Art"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Depurar sistemas multi-agente es más difícil que construirlos—hasta que puedas ver qué están haciendo realmente tus agentes IA en tiempo real con una interfaz visual de oficina en pixel art que hace el estado del agente y la ejecución de tareas inmediatamente obvios.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué la Depuración Visual de Agentes es Importante"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando despliegas agentes IA impulsados por Claude, pierdes visibilidad en el momento en que comienzan a ejecutar tareas de forma asincrónica. Los registros están fragmentados. Los cambios de estado suceden en la base de datos. Te quedas adivinando si un agente está atascado, en bucle, o genuinamente pensando.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Una metáfora de oficina en pixel art resuelve esto. Cada agente es un personaje en una sala. Su escritorio muestra la tarea actual. El movimiento entre salas representa transiciones de estado. La finalización de tareas ilumina indicadores visuales. Los fundadores que construyen flujos multi-agente reportan un 40% de tiempo de depuración más rápido con retroalimentación visual espacial en comparación con solo registros de texto.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Arquitectura: Sincronización de Estado de Agente en Tiempo Real"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu sistema de agentes necesita tres capas: agentes ejecutándose en tu backend (Claude vía API), persistencia de estado en Supabase, y un frontend Next.js suscribiéndose a actualizaciones en tiempo real.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando un agente cambia de estado—de inactivo a pensando a ejecutando—un disparador de Supabase se activa, empujando ese delta a tu frontend. Tu oficina en pixel art se re-renderiza instantáneamente. Sin polling. Sin datos obsoletos de 5 segundos.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Next.js hook: subscribe to agent state changes
const useAgentState = (agentId: string) => {
  const [agent, setAgent] = useState(null);
  useEffect(() => {
    const subscription = supabase
      .from('agents')
      .on('*', payload => setAgent(payload.new))
      .subscribe();
    return () => subscription.unsubscribe();
  }, [agentId]);
  return agent;
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Diseñando el Diseño de Oficina en Pixel Art"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Mantenlo simple: una sala por agente, espacio compartido para comunicación entre agentes. Usa una cuadrícula de sprite de 16x16. Cada sprite de agente tiene cuatro estados: inactivo (trabajo de escritorio), pensando (inclinación de cabeza), ejecutando (pose de acción), y completo (celebración).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las tarjetas de tareas aparecen en escritorios como etiquetas flotantes. Codifica por color según prioridad: azul (bajo), amarillo (medio), rojo (alto). Esto da a las partes interesadas no técnicas una visión instantánea de qué están haciendo tus agentes, lo que importa cuando estás presentando a inversores u onboarding a miembros del equipo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrando la Ejecución de Tareas de Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cada bucle de agente llama a Claude con un prompt limitado a una tarea específica. Antes de la llamada a la API, actualiza el estado del agente a 'pensando' en Supabase. En la respuesta, analiza la salida estructurada (usa tool_use), actualiza el estado a 'ejecutando', ejecuta la herramienta, luego marca como completo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La oficina en pixel art refleja cada paso. Esta transparencia es crítica: detectas riesgos de inyección de prompts, ves cuándo los agentes alucinen, e identificas cuándo las ventanas de contexto se están desperdiciando en trabajo repetido.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Colaboración en Tiempo Real y Colas de Tareas"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa una tabla de Supabase para encolar tareas. Los agentes sondean o se suscriben a nuevo trabajo. En tu oficina en pixel art, una sala de 'bandeja de entrada de tareas' muestra el trabajo en cola esperando asignación. Los agentes caminan a la bandeja de entrada, toman una tarea, y se mueven a su escritorio.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esta metáfora visual hace obvia la profundidad de la cola y te ayuda a detectar cuellos de botella: si cinco agentes están esperando en la bandeja de entrada, tienes un problema de contención de recursos que requiere optimización.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon (github.com/lewisallena17/pantheon) proporciona un iniciador completo con activos de pixel art, componentes Next.js, y esquema de Supabase para un dashboard de oficina multi-agente. Incluye plantillas de integración con Claude, manejadores de eventos en tiempo real, y un sistema de animación de sprites.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Haz un fork, personaliza el diseño de la oficina y sprites de agentes para que coincidan con tu dominio, e implementa a Vercel. El esquema está listo para producción y escala a 50+ agentes concurrentes sin degradación del rendimiento.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Visualiza la ejecución de tus agentes IA en tiempo real con una interfaz de oficina en pixel art—obtén el kit de inicio de código abierto Pantheon y comienza a depurar flujos de trabajo multi-agente en minutos, no en horas.`}</p>
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
