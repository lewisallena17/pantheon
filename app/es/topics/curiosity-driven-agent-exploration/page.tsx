import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/curiosity-driven-agent-exploration'

export const metadata: Metadata = {
  title:       'Exploración Impulsada por Curiosidad en Agentes de IA',
  description: 'Construye agentes de IA que exploren autónomamente espacios de problemas. Aprende cómo implementar mecanismos de curiosidad en sistemas impulsados por Claude co',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/curiosity-driven-agent-exploration',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/curiosity-driven-agent-exploration',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/curiosity-driven-agent-exploration',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/curiosity-driven-agent-exploration',
    },
  },
  openGraph: {
    title:       'Exploración Impulsada por Curiosidad en Agentes de IA',
    description: 'Construye agentes de IA que exploren autónomamente espacios de problemas. Aprende cómo implementar mecanismos de curiosidad en sistemas impulsados por Claude co',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Exploración Impulsada por Curiosidad en Agentes de IA', description: 'Construye agentes de IA que exploren autónomamente espacios de problemas. Aprende cómo implementar mecanismos de curiosidad en sistemas impulsados por Claude co' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Exploración Impulsada por Curiosidad en Agentes de IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La exploración impulsada por curiosidad permite que tus agentes de IA descubran soluciones autónomamente en lugar de seguir caminos rígidos, reduciendo el tiempo de desarrollo y desbloqueando comportamientos emergentes que no programaste explícitamente.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué la Curiosidad Importa en el Diseño de Agentes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes de IA tradicionales ejecutan flujos de trabajo predefinidos. Los agentes impulsados por curiosidad mantienen motivación intrínseca: exploran estados inciertos, prueban hipótesis y refinan su propia comprensión. Esto importa porque tu producto indie puede manejar casos extremos y patrones de usuario sin codificar cada escenario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para sistemas impulsados por Claude, los mecanismos de curiosidad reducen la sobrecarga de ingeniería de prompts. En lugar de escribir instrucciones exhaustivas, defines señales de recompensa y dejas que el agente explore el espacio de soluciones. El agente aprende qué preguntas hacer, qué datos priorizar y cuándo está lo suficientemente confundido para pedir ayuda.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementando Muestreo de Incertidumbre"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El núcleo de la curiosidad es cuantificar la incertidumbre. Un enfoque práctico: rastrear puntuaciones de confianza en decisiones del agente, luego priorizar estados de alta incertidumbre para exploración más profunda.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En tus rutas de API de Next.js, almacena historiales de decisiones del agente en Supabase con metadatos de confianza. Cuando un agente encuentra una decisión con confianza <0.6, activa razonamiento extendido o bucles de revisión humana. Esto previene alucinaciones confiadas mientras permite crecimiento autónomo.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`async function evaluateAgentUncertainty(agentId: string, decision: string, confidence: number) {
  const { data } = await supabase
    .from('agent_decisions')
    .insert([
      { agent_id: agentId, decision, confidence, explored_at: new Date() }
    ])
    .select();
  
  if (confidence < 0.6) {
    return { action: 'explore', flagForReview: true };
  }
  return { action: 'execute' };
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Señales de Recompensa para Aprendizaje Autónomo"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes de curiosidad optimizan para ganancia de información, no solo completación de tareas. Define recompensas para: descubrir patrones de solución novedosos, reducir error de predicción en casos de prueba reservados y resolver entradas ambiguas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En tu bucle de agente Claude, incrusta retroalimentación de cada intento de exploración. Supabase se convierte en la memoria de tu agente: almacena resultados, cadenas de razonamiento y qué-funcionó/qué-no. La ventana de contexto de Claude te permite alimentar exploraciones exitosas recientes como ejemplos en contexto, acelerando el aprendizaje sin reentrenamiento.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Estructurando Estado de Exploración"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La curiosidad sin estructura se convierte en caos. Usa un espacio de exploración acotado: define qué dominios puede investigar el agente, establece límites de iteración y mantén una cola de prioridad de hipótesis inexploradas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu esquema de Supabase debe incluir: exploration_targets (problemas a resolver), hypothesis_log (teorías probadas) y outcome_metrics (datos de éxito/fracaso). Esto te permite visualizar el comportamiento del agente, depurar patrones de exploración extraños e identificar dónde el agente se queda atrapado en bucles.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrando Retroalimentación Humana en el Bucle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los sistemas más poderosos impulsados por curiosidad no son completamente autónomos: saben cuándo preguntar. Diseña puntos de control donde los agentes presenten hallazgos a fundadores/usuarios, obtengan validación externa y ajusten su exploración basada en retroalimentación.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En Next.js, crea un dashboard que muestre decisiones de alta incertidumbre. Los usuarios proporcionan etiquetas o correcciones; alimenta esas de vuelta al agente como fuertes señales de recompensa. Esto cierra el bucle: curiosidad + juicio humano = aprendizaje rápido y fundamentado.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El framework Pantheon (github.com/lewisallena17/pantheon) proporciona una plantilla lista para producción para agentes Claude impulsados por curiosidad. Incluye cuantificación de incertidumbre, registro de exploración y un dashboard de Next.js para monitorear el comportamiento del agente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clona el repositorio, conecta tus credenciales de Supabase y tendrás un agente que funciona, que explora, aprende e informa. La base de código demuestra patrones de gestión de estado, cálculo de recompensas e integración con la API de Claude en ejemplos reales de TypeScript que puedes adaptar inmediatamente.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`La exploración impulsada por curiosidad transforma tus agentes de IA de ejecutores de tareas rígidas en aprendices adaptativos: obtén el kit de inicio de Pantheon e implementa sistemas autónomos que se vuelven más inteligentes con cada interacción del usuario.`}</p>
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
