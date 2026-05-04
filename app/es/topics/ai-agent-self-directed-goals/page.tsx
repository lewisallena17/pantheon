import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-self-directed-goals'

export const metadata: Metadata = {
  title:       'Objetivos Autónomos para Agentes de IA | Claude + Next.js',
  description: 'Permite que tus agentes de IA Claude establezcan y persigan sus propios objetivos. Aprende a implementar la configuración autónoma de objetivos con Next.js y Su',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-self-directed-goals',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-self-directed-goals',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-self-directed-goals',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-self-directed-goals',
    },
  },
  openGraph: {
    title:       'Objetivos Autónomos para Agentes de IA | Claude + Next.js',
    description: 'Permite que tus agentes de IA Claude establezcan y persigan sus propios objetivos. Aprende a implementar la configuración autónoma de objetivos con Next.js y Su',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Objetivos Autónomos para Agentes de IA | Claude + Next.js', description: 'Permite que tus agentes de IA Claude establezcan y persigan sus propios objetivos. Aprende a implementar la configuración autónoma de objetivos con Next.js y Su' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Objetivos Autónomos para Agentes de IA | Claude + Next.js"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`La mayoría de los agentes de IA ejecutan tareas que defines de antemano, pero los objetivos autónomos permiten que tus agentes identifiquen qué es importante, prioricen autónomamente y adapten su estrategia sin intervención humana constante, transformándolos de ejecutores de tareas en tomadores de decisiones.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué los Objetivos Autónomos Importan para Agentes de IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los flujos de trabajo agenticos tradicionales requieren que especifiques el objetivo, lo dividas en pasos y monitorees la finalización. Esto funciona para tareas bien definidas pero falla cuando tu agente enfrenta problemas abiertos, prioridades cambiantes o contexto faltante. Los objetivos autónomos invierten el modelo: tu agente observa su entorno, identifica qué necesita hacerse y se compromete con resultados medibles.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para constructores independientes, esto significa menos revisiones de prompts, menos código de andamiaje y agentes que realmente se adapten a la complejidad del mundo real. Un agente de servicio al cliente con objetivos autónomos nota atrasos en tickets y escala sin ser instruido. Un agente de procesamiento de datos identifica problemas de calidad de datos y los señala de manera proactiva.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"El Patrón Central: Observar, Reflexionar, Comprometerse"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los objetivos autónomos siguen un bucle de tres pasos. Primero, tu agente observa su estado actual—qué tareas existen, qué restricciones aplican, qué métricas importan. Segundo, reflexiona usando el pensamiento extendido de Claude o el uso de herramientas para decidir qué objetivo vale la pena perseguir. Tercero, se compromete con ese objetivo en tu base de datos, creando un rastro de auditoría y previniendo objetivos conflictivos.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Este patrón previene alucinaciones (los agentes no pueden afirmar que están trabajando hacia objetivos que no existen) y mantiene tu sistema transparente. Siempre puedes consultar qué decidió tu agente y por qué.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementando Estado de Objetivo en Supabase"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena objetivos como registros estructurados con estados de ciclo de vida claros. Un objetivo debe rastrear la marca de tiempo de creación, el razonamiento detrás de él, el estado actual (activo, bloqueado, completado) y cualquier tarea secundaria que generó. Usa un enum simple para el estado y siempre registra el razonamiento del agente en un campo de metadatos para depuración.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Este esquema te permite consultar objetivos activos por agente, filtrar objetivos bloqueados para intervención humana y auditar por qué tu agente eligió el objetivo A sobre el objetivo B. Es la fuente de verdad a la que tus llamadas a Claude pueden hacer referencia para evitar contradicciones.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`-- Tabla de objetivo de Supabase
CREATE TABLE agent_goals (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  goal TEXT NOT NULL,
  reasoning TEXT,
  status TEXT CHECK (status IN ('active', 'blocked', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_agent_active ON agent_goals(agent_id, status);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"El Rol de Claude: Propuesta de Objetivo y Razonamiento"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa Claude como tu capa de deliberación de objetivos. Pásale el estado actual (tareas abiertas, métricas, restricciones) y pídele que proponga un único objetivo autónomo con razonamiento explícito. Usa herramientas para obtener contexto de Supabase, luego guarda el objetivo propuesto de vuelta usando tu API de Next.js.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La capacidad nativa de Claude para razonar a través de prioridades competidoras lo hace ideal para este punto de decisión. No le estás pidiendo que ejecute el objetivo—le estás pidiendo que decida qué objetivo vale la pena perseguir, que es una tarea de deliberación que maneja bien.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Conectando Objetivos a Acciones en Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Una vez que un objetivo se compromete, la capa de acción de tu agente lo referencia. En rutas API de Next.js, verifica el objetivo activo antes de decidir qué herramientas llamar. Esto previene que tu agente se desvíe: cada acción debe escalar hacia el objetivo actual o explícitamente re-proponer uno nuevo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa middleware o un hook de envoltura para obtener el objetivo activo al inicio de cada ciclo del agente. Si el objetivo se vuelve imposible (un recurso desaparece, una fecha límite pasa), tu agente debe reflexionar y comprometerse con un objetivo de respaldo o escalar.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejando Conflictos de Objetivos y Replanificación"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando tu agente descubre que un objetivo está bloqueado u obsoleto, no debe reintentar silenciosamente. En su lugar, activa un ciclo de reflexión: consulta por qué falló el objetivo, propón alternativas y comprométete con una nueva dirección. Esto mantiene los registros limpios y previene que el agente se agite.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa tus banderas de estado de base de datos para separar objetivos activos de bloqueados y registra la razón del bloqueo. Si un humano necesita intervenir, ve exactamente por qué el agente se quedó atrapado.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon (github.com/lewisallena17/pantheon) demuestra patrones de objetivos autónomos para sistemas multi-agente. Incluye una capa de propuesta de objetivo, esquema de Supabase y endpoints de Next.js para gestión de objetivos. Clónalo, adapta el prompt de razonamiento de objetivo para tu dominio e intégralo en tu stack Claude + Supabase existente.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Los objetivos autónomos transforman tus agentes de IA de ejecutores de tareas en tomadores de decisiones autónomos—comienza almacenando objetivos en Supabase, usando Claude para razonar sobre prioridades y conectando cada acción de vuelta a un objetivo comprometido. Obtén el kit de inicio completo y el esquema de Pantheon.`}</p>
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
