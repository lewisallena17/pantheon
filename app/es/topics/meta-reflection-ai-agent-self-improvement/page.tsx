import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/meta-reflection-ai-agent-self-improvement'

export const metadata: Metadata = {
  title:       'Meta-Reflexión para Agentes de IA | Primitivos de Auto-Mejora',
  description: 'Implementa meta-reflexión en agentes Claude para habilitar auto-mejora autónoma. Construye mejores sistemas de IA con bucles de introspección estructurada.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/meta-reflection-ai-agent-self-improvement',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/meta-reflection-ai-agent-self-improvement',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/meta-reflection-ai-agent-self-improvement',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/meta-reflection-ai-agent-self-improvement',
    },
  },
  openGraph: {
    title:       'Meta-Reflexión para Agentes de IA | Primitivos de Auto-Mejora',
    description: 'Implementa meta-reflexión en agentes Claude para habilitar auto-mejora autónoma. Construye mejores sistemas de IA con bucles de introspección estructurada.',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Meta-Reflexión para Agentes de IA | Primitivos de Auto-Mejora', description: 'Implementa meta-reflexión en agentes Claude para habilitar auto-mejora autónoma. Construye mejores sistemas de IA con bucles de introspección estructurada.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Meta-Reflexión para Agentes de IA | Primitivos de Auto-Mejora"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Meta-reflexión—la capacidad de un agente de IA de observar y criticar su propio razonamiento—es la diferencia entre agentes que se estancan y agentes que mejoran con cada interacción.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Qué hace realmente la Meta-Reflexión"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Meta-reflexión no es ingeniería de prompts ni fine-tuning. Es un primitivo en tiempo de ejecución: después de que tu agente completa una tarea, examina su proceso de razonamiento, identifica modos de fallo y ajusta el comportamiento futuro dentro de la misma sesión o entre despliegues.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para agentes basados en Claude, esto significa capturar salidas intermedias—llamadas a herramientas, cadenas de razonamiento, resultados—y luego pedirle a Claude que evalúe qué funcionó y qué no. El resultado es retroalimentación estructurada que se acumula en ganancias de rendimiento medibles.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Arquitectura Central: Capturar, Reflexionar, Actualizar"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El patrón es de tres etapas: (1) Ejecuta la tarea principal y registra todos los puntos de decisión, (2) Pasa el rastro de ejecución a Claude con un prompt de reflexión que pide análisis de fallos y sugerencias de mejora, (3) Almacena la reflexión en el contexto del agente o base de datos para que las futuras ejecuciones incorporen el conocimiento.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Esto crea un bucle de retroalimentación sin reentrenamiento. Cada instancia de agente se vuelve más inteligente a medida que encuentra nuevos casos. En producción, esto significa que tu instancia de Supabase almacena no solo resultados, sino las mejoras de razonamiento que los generaron.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// TypeScript: Bucle básico de reflexión en una ruta de API de Next.js
const executeWithReflection = async (task: string, history: Reflection[]) => {
  const execution = await claude.runAgent(task, history);
  const reflection = await claude.reflect(execution.trace);
  await supabase.from('reflections').insert({ task, execution, reflection });
  return { execution, reflection };
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Dónde triunfa la Meta-Reflexión"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tareas de razonamiento multi-paso: generación SQL, orquestación de API, planificación de contenido. Los agentes a menudo toman caminos subóptimos al principio; la reflexión detecta esto y corrige el patrón.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Casos límite raros: Cuando un agente encuentra un caso que no ha visto, la meta-reflexión puede sintetizar una respuesta e inmediatamente codificar por qué esa respuesta funcionó, evitando el mismo error más tarde.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Optimización de costos: En lugar de ciclos de ingeniería de prompts, la reflexión descubre naturalmente mejores formatos de instrucción, reduciendo el gasto de tokens con el tiempo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementando Prompts de Reflexión"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu prompt de reflexión debe preguntar: ¿Qué suposiciones hice? ¿Qué pasos fueron innecesarios? ¿Usé la herramienta correcta? ¿Qué señal me diría que estaba equivocado más temprano? Claude maneja esta introspección de forma nativa—está diseñado para razonar sobre sus propias salidas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena reflexiones como JSON estructurado en Supabase: { taskType, failureMode, correction, confidence }. Con el tiempo, verás patrones: ciertos tipos de tareas tienen problemas recurrentes que apuntan a brechas sistémicas en el conocimiento o capacidades de tu agente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Escalando la Reflexión Across Agent Fleets"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`En sistemas de producción con muchos agentes concurrentes, la reflexión se convierte en una capa de conocimiento compartido. Cuando el Agent A descubre una mejora, el Agent B la aprende sin redespliegue. Usa un trigger de Supabase para propagar reflexiones de alta confianza a un vector de contexto compartido o conjunto de instrucciones.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Este enfoque funciona porque la meta-reflexión es sin estado: cualquier agente puede leer y aplicar aprendizajes de las reflexiones de cualquier otro agente, creando una mejora colectiva emergente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon en github.com/lewisallena17/pantheon implementa meta-reflexión como un primitivo reutilizable para agentes Claude. Incluye ejemplos ejecutables para Next.js, migraciones de esquema de Supabase para almacenar reflexiones y scaffolding para plantillas de prompts de reflexión.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clónalo como un iniciador: está construido para equipos independientes e incluye configuración para desarrollo local y despliegues de producción en Vercel + Supabase.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Meta-reflexión transforma sistemas de agentes de tuberías estáticas en entidades que aprenden—constrúyelo en tu próximo agente Claude y observa cómo el rendimiento se compone con cada tarea.`}</p>
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
