import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/autonomous-ai-revenue-engine'

export const metadata: Metadata = {
  title:       'Construyendo un Motor de Ingresos Autónomo con IA',
  description: 'Aprende cómo construir agentes de IA autónomos con Claude que generen ingresos. Patrones reales para desarrolladores indie usando Next.js, Supabase y flujos de ',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/autonomous-ai-revenue-engine',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/autonomous-ai-revenue-engine',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/autonomous-ai-revenue-engine',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/autonomous-ai-revenue-engine',
    },
  },
  openGraph: {
    title:       'Construyendo un Motor de Ingresos Autónomo con IA',
    description: 'Aprende cómo construir agentes de IA autónomos con Claude que generen ingresos. Patrones reales para desarrolladores indie usando Next.js, Supabase y flujos de ',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Construyendo un Motor de Ingresos Autónomo con IA', description: 'Aprende cómo construir agentes de IA autónomos con Claude que generen ingresos. Patrones reales para desarrolladores indie usando Next.js, Supabase y flujos de ' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Construyendo un Motor de Ingresos Autónomo con IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Deja de construir chatbots de IA que necesitan intervención humana en cada paso—en su lugar, construye agentes autónomos que identifiquen oportunidades, ejecuten transacciones y generen ingresos sin intervención.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"El Ciclo Principal: Percepción, Decisión, Ejecución"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Un motor de IA generador de ingresos necesita tres sistemas fuertemente acoplados. Primero, percepción: tu agente ingiere continuamente datos de mercado, comportamiento del usuario o métricas empresariales a través de APIs o consultas a bases de datos. Segundo, decisión: Claude evalúa qué sucedió, aplica tu lógica empresarial y decide la próxima acción. Tercero, ejecución: el agente realiza esa acción—crear un listado, cobrar una tarjeta, actualizar inventario o activar un flujo de trabajo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La mayoría de proyectos indie fallan porque conectan estos componentes de manera débil. Tu capa de percepción se actualiza una vez al día. Tu lógica de decisión toma tres caminos de código diferentes con resultados inconsistentes. Tu ejecución llama a la API incorrecta. Los ingresos autónomos significan tratar este ciclo como una única máquina determinista que se ejecuta continuamente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Conectando Claude a tu Capa de Datos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude necesita acceso en tiempo real a tu estado empresarial. Usa tool_use para permitir que Claude consulte Supabase, llame a tus APIs o verifique el inventario en vivo. Define herramientas que devuelvan JSON estructurado—no volcados de bases de datos sin procesar. Una herramienta llamada \`check_inventory\` debe devolver \`{sku: string, quantity: number, reorder_threshold: number}\`, no una tabla de 500 filas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Mantén la latencia por debajo de 2 segundos por ciclo de decisión del agente. Cachea herramientas y consultas de bases de datos agresivamente. Si tu agente está decidiendo si marcar un artículo para la venta, no necesita datos históricos de clientes de 2019.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const tools = [
  {
    name: 'check_inventory',
    description: 'Query current stock levels for a SKU',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' }
      },
      required: ['sku']
    }
  },
  {
    name: 'create_listing',
    description: 'Publish a product to marketplace',
    input_schema: {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        price: { type: 'number' },
        quantity: { type: 'integer' }
      },
      required: ['sku', 'price', 'quantity']
    }
  }
];`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construyendo Lógica de Decisión Confiable"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`No dejes que Claude actúe sin límites. Dale un objetivo claro, restricciones y reglas de respaldo. En lugar de 'optimizar ingresos,' di 'si inventario > 500 unidades y costo del proveedor < \$12, listar a \$29.99; si < 100 unidades, eliminar de venta; siempre mantener margen del 20%.'`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa el pensamiento extendido de Claude para decisiones complejas. Deja que razone a través de escenarios de múltiples pasos—¿deberíamos bajar el precio para limpiar inventario o esperar a la demanda estacional? Pero envuelve ese razonamiento en una máquina de estados: decisión pendiente → Claude evalúa → registra razonamiento → ejecuta acción → verifica resultado.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Monitoreo y Disyuntores"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Un agente autónomo que falla te cuesta dinero en tiempo real. Implementa límites duros: tamaño máximo de transacción, cambio máximo de precio por ciclo, máximo de llamadas a API por minuto. Registra cada decisión y ejecución. Usa Supabase para almacenar trazas del agente—¿qué observó el agente, qué decidió, cuál fue el resultado?`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Configura alertas para anomalías. Si tu agente de repente crea 100 listados cuando normalmente crea 3, algo está mal. Detén el ciclo, investiga, corrige.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Escalando Más Allá de un Único Agente"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Comienza con un ciclo autónomo. Una vez que sea estable y genere ingresos, agrega más. Un agente gestionando inventario, otro gestionando precios, otro manejando soporte al cliente. Usa rutas de API de Next.js como coordinador—llaman a Claude en paralelo, agregan decisiones, ejecutan de manera segura.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las colas de Supabase y las funciones edge te permiten ejecutar agentes a la frecuencia correcta para cada tarea. Las actualizaciones de precios podrían ejecutarse cada 10 minutos. Las verificaciones de inventario cada hora. La detección de nuevas oportunidades cada día.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon en github.com/lewisallena17/pantheon demuestra un sistema de agente autónomo listo para producción construido con Claude, Next.js y Supabase. Incluye registro de decisiones, patrones de llamada de herramientas, gestión de estado y coordinación multi-agente. Úsalo como referencia o haz un fork directamente—está construido exactamente para este caso de uso.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construye tu primer ciclo de ingresos autónomo conectando Claude a tus datos, definiendo reglas de decisión claras y agregando monitoreo—comienza con el kit de inicio Pantheon y envía esta semana.`}</p>
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
