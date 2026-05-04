import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/claude-context-window-200k-management'

export const metadata: Metadata = {
  title:       'Gestión de la ventana de contexto de 200k de Claude a escala',
  description: 'Aprende a estructurar prompts, cachear eficientemente y construir agentes de IA en producción usando el contexto de 200k de Claude. Patrones reales para Next.js',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-context-window-200k-management',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-context-window-200k-management',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-context-window-200k-management',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-context-window-200k-management',
    },
  },
  openGraph: {
    title:       'Gestión de la ventana de contexto de 200k de Claude a escala',
    description: 'Aprende a estructurar prompts, cachear eficientemente y construir agentes de IA en producción usando el contexto de 200k de Claude. Patrones reales para Next.js',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Gestión de la ventana de contexto de 200k de Claude a escala', description: 'Aprende a estructurar prompts, cachear eficientemente y construir agentes de IA en producción usando el contexto de 200k de Claude. Patrones reales para Next.js' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Gestión de la ventana de contexto de 200k de Claude a escala"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La ventana de contexto de 200k de Claude es poderosa—pero solo si arquitecturizas tu sistema para usarla sin desperdiciar tokens o golpear muros de latencia—aquí está exactamente cómo lo hacen los equipos en producción.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué la escala de la ventana de contexto importa para agentes de IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Una ventana de contexto de 200k significa que puedes ajustar ~150 páginas de documentación, historial de conversación e instrucciones del sistema en una sola solicitud. Para desarrolladores independientes que construyen agentes, esto elimina la necesidad de cadenas complejas de generación aumentada por recuperación (RAG) para muchos casos de uso. Puedes cargar bases de código completas, bases de datos de usuarios o bases de conocimiento directamente en el prompt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El tradeoff: cada token cuesta dinero y la latencia se compone. Si viertes los 200k tokens en cada solicitud, estás pagando por contexto que no usas y ralentizando los tiempos de respuesta. La habilidad real es saber qué contexto pertenece a la ventana y qué pertenece a una base de datos vectorial.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Estructuración de prompts para escala"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Comienza con una arquitectura de prompt de tres capas: instrucciones del sistema (500–1000 tokens), contexto específico de solicitud (variable) e entrada del usuario. Las instrucciones del sistema deben ser inmutables—la personalidad, capacidades y restricciones de tu agente. El contexto de solicitud es dinámico: esquemas de API, docs relevantes, historial de usuario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa el parámetro system de Claude por separado del mensaje, no concatenado en un megaprompt. Esto mantiene los cache hits estables y hace que la ingeniería de prompts sea verificable. Para conversaciones multiturno, agrupa solicitudes relacionadas para reutilizar bloques de caché.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: [
      { type: 'text', text: 'You are a code generation agent.' },
      { type: 'text', text: systemDocs, cache_control: { type: 'ephemeral' } }
    ],
    messages: [
      { role: 'user', content: userQuery }
    ]
  })
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Caching de prompts para eficiencia de tokens"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude soporta caching de prompts—las mismas instrucciones del sistema o documentación accedidas repetidamente son cacheadas y cobradas al 10% del costo normal de tokens después de la primera solicitud. Para agentes que ejecutan cientos de solicitudes, esto es crítico.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cachea bloques reutilizables: documentación de API, guías de framework, contexto de usuario. Establece cache_control: { type: 'ephemeral' } en bloques de texto que no cambian entre solicitudes. Monitorea las tasas de cache hit en tu analítica; una tasa de hit del 50%+ significa que estás estructurando el contexto correctamente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Estrategia de asignación de ventana de contexto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Reserva ~50k tokens para la respuesta del modelo y el razonamiento interno. Eso deja ~150k para entrada. Asigna: 10% a instrucciones del sistema, 30% a contexto específico de solicitud (esquemas de API, docs relevantes), 60% a datos dinámicos del usuario (historial de conversación, contenidos de archivos, registros de base de datos). Ajusta estas proporciones según la tarea de tu agente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Construye un contador de tokens en tu pipeline de solicitudes. Si el contexto dinámico excede tu presupuesto, trunca por recencia para conversaciones o por puntuación de relevancia para documentos. Nunca dejes que una solicitud falle por longitud; el truncamiento elegante mantiene el agente operacional.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Diseño de base de datos para contexto de agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`En Supabase, estructura una tabla de conversations con columnas user_id, agent_id, message_history (JSONB) y metadata. Almacena el historial de conversación completo, pero incluye solo los últimos 20–50 turnos en cada solicitud de API. Usa JSONB de PostgreSQL para esquema flexible y funciones de ventana para obtener el contexto más reciente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Crea una tabla documents separada (content, embedding, tokens) para contexto de formato largo. Consulta por similitud semántica (usando pgvector) o por context_tag explícito. Este enfoque híbrido evita cargar toda la base de conocimiento en cada solicitud mientras mantiene los datos calientes inmediatamente disponibles.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoreo y control de costos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Registra cada llamada a API con tokens_input, tokens_cache_creation, tokens_cache_read y tokens_output. Esta telemetría es esencial para optimizar la asignación de contexto. Establece alertas si el promedio de tokens_input excede tu objetivo—usualmente señala que estás siendo demasiado verboso con el contexto.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Calcula el costo real por solicitud: (input_tokens + cache_creation_tokens) / 1M * \$3 + (cache_read_tokens / 1M * \$0.30) + costo de salida. Cuando ves el payoff del caché (cache_read >> cache_creation), sabes que tu estructura de prompt está funcionando.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Comienza con caching de prompts y una estructura de contexto de tres capas—mide el uso de tokens sin relación—y construirás agentes que escalen sin perder costos o responsividad. Obtén el kit de inicio completo y comienza a gestionar tu ventana de 200k hoy.`}</p>
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
