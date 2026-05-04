import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/claude-extended-thinking-agent-reasoning'

export const metadata: Metadata = {
  title:       'Claude Extended Thinking para el Razonamiento de Agentes',
  description: 'Habilita razonamiento multi-paso complejo en agentes de IA con extended thinking de Claude. Construye sistemas autónomos más inteligentes con Next.js y Supabase',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-extended-thinking-agent-reasoning',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-extended-thinking-agent-reasoning',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-extended-thinking-agent-reasoning',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-extended-thinking-agent-reasoning',
    },
  },
  openGraph: {
    title:       'Claude Extended Thinking para el Razonamiento de Agentes',
    description: 'Habilita razonamiento multi-paso complejo en agentes de IA con extended thinking de Claude. Construye sistemas autónomos más inteligentes con Next.js y Supabase',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Claude Extended Thinking para el Razonamiento de Agentes', description: 'Habilita razonamiento multi-paso complejo en agentes de IA con extended thinking de Claude. Construye sistemas autónomos más inteligentes con Next.js y Supabase' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Claude Extended Thinking para el Razonamiento de Agentes"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Extended thinking permite que los agentes de Claude razonen a través de problemas multi-paso antes de actuar, mejorando dramáticamente la calidad de decisión en sistemas de producción—aquí te mostramos cómo implementarlo para tu proyecto indie.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué Extended Thinking es Importante para Sistemas de Agentes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las respuestas estándar de Claude ocurren en un solo paso. Para agentes que manejan lógica empresarial real—consultas de bases de datos, flujos multi-paso, cálculos financieros—eso no es suficiente. Extended thinking obliga al modelo a razonar a través del problema, detectar casos límite y validar su propia lógica antes de responder.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando tu agente controla mutaciones de datos o llama APIs externas, una respuesta de un solo paso puede propagar errores aguas abajo. Extended thinking actúa como un rubber duck interno, reduciendo alucinaciones y mejorando la precisión entre 15-40% en tareas de razonamiento complejo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cómo Funciona Extended Thinking en Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Extended thinking utiliza el parámetro bloque \`thinking\` en la API de Claude. Envías una solicitud con \`budgetTokens\` configurado al límite de pensamiento (típicamente 5000-10000), y Claude asigna tokens para razonamiento interno antes de generar la respuesta final.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proceso de pensamiento del modelo está oculto de tu salida—solo ves la conclusión final. Esto significa que obtienes mejor razonamiento sin inflar tus tokens de respuesta o confundir a tus usuarios con monólogo interno.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const response = await anthropic.messages.create({
  model: 'claude-3-7-sonnet-20250219',
  max_tokens: 16000,
  thinking: {
    type: 'enabled',
    budget_tokens: 10000
  },
  messages: [{
    role: 'user',
    content: 'Validate this database schema and suggest optimizations'
  }]
});`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrando Extended Thinking en Agentes de Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`En tu ruta API de Next.js, envuelve la llamada del cliente Anthropic y maneja el tipo de respuesta de pensamiento. Pasa definiciones de herramientas para consultas de base de datos o llamadas a APIs externas—el extended thinking razonará a través de qué herramientas llamar y en qué orden.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cachea los tokens de pensamiento si estás procesando tareas de agente similares repetidamente. Esto reduce la latencia y el costo, especialmente útil para aplicaciones indie SaaS de alto volumen donde cada milisegundo cuenta.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Cuándo Usar Extended Thinking vs. Llamadas Estándar"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa extended thinking para: lógica de decisión multi-paso, validación de datos antes de mutaciones, análisis de esquema complejo, y bucles agenticos con uso de herramientas. Omítelo para búsquedas simples, chat en tiempo real, o tareas de clasificación—desperdiciarás tokens y latencia.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Una regla práctica: si tu agente necesita razonar sobre consecuencias antes de actuar, habilita pensamiento. Si solo está reformateando o recuperando datos, ahorra los tokens de presupuesto.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Ejemplo del Mundo Real: Agente de Esquema de Base de Datos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Imagina un agente que valida cambios de esquema de base de datos entrantes en Supabase. Extended thinking le permite razonar a través de: si las columnas entran en conflicto, si los índices son necesarios, si las migraciones podrían bloquear tablas, y cuál es el orden óptimo. Sin pensamiento, podría sugerir cambios peligrosos en paralelo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El agente usa herramientas para consultar tu esquema existente, luego razona a través de restricciones antes de devolver un script de migración. Extended thinking detecta casos límite que tus pruebas unitarias podrían perder.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon (github.com/lewisallena17/pantheon) proporciona un marco de agente listo para producción con extended thinking preconfigurado. Incluye manejadores API de Next.js, patrones de integración Supabase, y definiciones de herramientas de ejemplo para tareas comunes de desarrolladores indie.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Haz un fork para omitir boilerplate: registro de herramientas, manejo de errores, presupuesto de tokens, y análisis de respuesta de pensamiento ya están cableados. Agrega tu propia lógica empresarial e implementa en Vercel.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Habilita extended thinking de Claude en tu sistema de agentes hoy—haz un fork de Pantheon, integra el parámetro thinking, e implementa flujos de trabajo autónomos más inteligentes que razonen antes de actuar.`}</p>
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
