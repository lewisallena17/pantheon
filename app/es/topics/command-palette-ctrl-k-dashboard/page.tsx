import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/command-palette-ctrl-k-dashboard'

export const metadata: Metadata = {
  title:       'Paleta de Comandos (Ctrl+K) para tu Dashboard',
  description: 'Añade una paleta de comandos impulsada por teclado a tu dashboard de Next.js. Acelera la navegación para sistemas de agentes IA construidos con Claude y Supabas',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/command-palette-ctrl-k-dashboard',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/command-palette-ctrl-k-dashboard',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/command-palette-ctrl-k-dashboard',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/command-palette-ctrl-k-dashboard',
    },
  },
  openGraph: {
    title:       'Paleta de Comandos (Ctrl+K) para tu Dashboard',
    description: 'Añade una paleta de comandos impulsada por teclado a tu dashboard de Next.js. Acelera la navegación para sistemas de agentes IA construidos con Claude y Supabas',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Paleta de Comandos (Ctrl+K) para tu Dashboard', description: 'Añade una paleta de comandos impulsada por teclado a tu dashboard de Next.js. Acelera la navegación para sistemas de agentes IA construidos con Claude y Supabas' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Paleta de Comandos (Ctrl+K) para tu Dashboard"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Una paleta de comandos permite a tus usuarios navegar al instante, ejecutar acciones y buscar sin tocar el ratón—convirtiendo tu dashboard en una herramienta para usuarios avanzados que se siente nativa y responsiva.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué las Paletas de Comandos Importan para Dashboards de Agentes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Las paletas de comandos (Cmd+K o Ctrl+K) se han convertido en lo esencial en software moderno. Reducen la fricción: en lugar de buscar en menús anidados, los usuarios escriben lo que quieren y presionan enter. Para dashboards de agentes IA, esto es crítico—tus usuarios necesitan disparar rápidamente ejecuciones de agentes, cambiar entre modelos, ajustar parámetros, o navegar a logs específicos.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El patrón funciona especialmente bien para constructores independientes porque escala. ¿Añades una nueva característica? Añade un nuevo comando. No se necesita rediseño de UI. Tu dashboard crece sin inflar la interfaz.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Arquitectura Central: Patrón de Registro de Comandos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El enfoque más limpio es un registro de comandos—un objeto centralizado que mapea IDs de comandos a manejadores. Cada comando tiene una etiqueta, descripción, categoría, y un atajo de teclado opcional.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu componente de paleta de comandos consulta este registro, filtra por entrada del usuario, y ejecuta el manejador seleccionado. Separa tu capa de datos de la UI: esto hace que probar sea simple y reutilizar comandos entre características (atajos de teclado, menús contextuales, reglas de automatización) sea trivial.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const commands = {
  'agent.run': {
    label: 'Run Agent',
    category: 'Agent',
    handler: (agentId) => triggerAgentRun(agentId),
  },
  'model.switch': {
    label: 'Switch Model',
    category: 'Settings',
    handler: (modelId) => updateModel(modelId),
  },
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de UI: Buscar, Filtrar, Ejecutar"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa un overlay modal con una entrada de búsqueda. En cada pulsación de tecla, filtra tu registro de comandos por etiqueta y descripción usando coincidencia difusa (librerías como \`fuse.js\` funcionan bien). Muestra resultados con navegación por teclado—teclas de flecha para moverse, Enter para ejecutar, Esc para cerrar.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para dashboards respaldados por Supabase, los comandos pueden obtener datos en tiempo real: 'Cambiar a agente' podría consultar tu tabla de agentes, permitiendo a los usuarios elegir de registros activos. Vincula Ctrl+K globalmente usando una librería como \`cmdk\` o \`command-palette\`.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integración con Claude y Flujos de Trabajo de Agentes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los comandos se vuelven especialmente poderosos cuando se conectan a Claude. Mapea comandos a plantillas de prompts: 'Depurar ejecución de agente' podría abrir un modal que genere un análisis impulsado por Claude del último fallo. 'Generar caso de prueba' podría llamar a Claude para producir entradas de prueba basadas en el esquema de tu agente.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena el historial de comandos en Supabase para pistas de auditoría y analítica. Rastrea qué comandos invocan más tus usuarios—esto señala qué características importan y guía tu roadmap.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Navegación por Teclado y Accesibilidad"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Haz que la navegación se sienta al instante. Deshaz búsqueda a 100-150ms. Pre-renderiza resultados principales. Usa roles WAI-ARIA (\`role="listbox"\`, \`aria-selected\`) para que los lectores de pantalla comprendan la paleta. Soporta teclas de flecha, Enter, y Escape.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ofrece alias de comandos ('ra' para 'Run Agent') y recuerda comandos usados recientemente. Muestra atajos en línea para que los usuarios descubran vinculaciones de teclado sin documentación.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon en GitHub (github.com/lewisallena17/pantheon) proporciona una implementación completa de paleta de comandos para dashboards de agentes IA. Incluye un componente de Next.js, esquema de Supabase para almacenar comandos y logs, y ejemplos de integración con llamadas a la API de Claude. Haz un fork, personaliza comandos para tu sistema de agentes, y despliega.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Una paleta de comandos transforma tu dashboard de cliqueable a poderoso—adopta el patrón ahora, y tus usuarios te lo agradecerán con flujos de trabajo más rápidos y mejor retención.`}</p>
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
