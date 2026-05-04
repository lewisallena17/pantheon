import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-writes-own-code-auto-revert'

export const metadata: Metadata = {
  title:       'Agentes de IA que Editan Su Propio Código de Forma Segura',
  description: 'Aprende cómo construir agentes de IA usando Claude que modifiquen de forma segura su propio código. Incluye patrones de sandboxing, validación e implementación ',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-writes-own-code-auto-revert',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-writes-own-code-auto-revert',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-writes-own-code-auto-revert',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-writes-own-code-auto-revert',
    },
  },
  openGraph: {
    title:       'Agentes de IA que Editan Su Propio Código de Forma Segura',
    description: 'Aprende cómo construir agentes de IA usando Claude que modifiquen de forma segura su propio código. Incluye patrones de sandboxing, validación e implementación ',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Agentes de IA que Editan Su Propio Código de Forma Segura', description: 'Aprende cómo construir agentes de IA usando Claude que modifiquen de forma segura su propio código. Incluye patrones de sandboxing, validación e implementación ' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Agentes de IA que Editan Su Propio Código de Forma Segura"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Permite que Claude modifique, pruebe e implemente de forma segura sus propios cambios de código sin romper tu sistema de producción—usando compuertas de validación, ejecución en sandbox, y mecanismos de reversión que funcionan con marcos de trabajo de agentes de IA reales.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué el Código Autorreparable Necesita Salvaguardias"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los agentes de IA que pueden editar su propio código se encuentran con el mismo problema cada vez: mutación sin límites. Claude podría generar una solución que funciona en aislamiento pero rompe dependencias aguas abajo. Podría optimizar eliminando manejo de errores. Podría introducir vulnerabilidades de inyección SQL mientras resuelve un problema de rendimiento.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`La solución no es deshabilitar la automutación—es agregar capas de validación antes de que el código se ejecute. Necesitas verificación de sintaxis, validación de tipos, ejecución de pruebas en un sandbox, y compuertas de aprobación humana para cambios en producción. Construye estos correctamente, y obtienes un sistema que aprende y se mejora a sí mismo sin modos de fallo catastrófico.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Aislamiento de Ejecución de Código con Docker o Aislamiento de VM"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Antes de que un agente de IA confirme cambios de código, debe ejecutarlos en aislamiento. Usa contenedores Docker o máquinas virtuales Node.js aisladas para ejecutar el código generado. Crea un clon temporal de la base de datos, levanta el servicio modificado en un contenedor, ejecuta tu suite de pruebas, y verifica que no haya regresiones.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Este enfoque funciona especialmente bien con rutas API de Next.js: genera un endpoint modificado, pruébalo contra solicitudes conocidas, mide latencia y tasas de error, luego aprueba o rechaza basándote en métricas. Mantén el sandbox ajustado—sin acceso a red, memoria limitada, timeouts estrictos.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Si el agente está modificando esquemas de base de datos, usa transacciones con reversión automática. Prueba migraciones en una copia de datos de producción antes de tocar lo real.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Compuertas de Validación: Análisis AST y Verificación de Tipos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`No todo código generado es código ejecutable. Antes del sandboxing, valida la estructura. Analiza TypeScript con una herramienta como la API del compilador de TypeScript o Babel, verifica patrones no permitidos (eval, APIs peligrosas de Node, credenciales hardcodeadas), y verifica seguridad de tipos.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para cambios de base de datos, valida sintaxis SQL y restricciones de esquema. Usa un parseador SQL para detectar patrones de inyección. Para rutas API, asegura que la firma de función coincida con tu contrato.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Un enfoque simple: rechaza cualquier código que contenga eval, require() fuera de una lista blanca, o acceso a process.env en métodos generados. Rechaza cualquier SQL que elimine tablas sin una bandera explícita de administrador.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const code = \`
const handler = async (req, res) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = ?',
    [req.query.id]
  );
  return res.json(result);
};
\`;
const hasEval = /\beval\s*\(/.test(code);
const hasDrop = /\bDROP\s+TABLE/i.test(code);
if (hasEval || hasDrop) throw new Error('Pattern blocked');
`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Generación de Código Impulsada por Pruebas con Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Solicita a Claude que genere código con pruebas. Usa la característica de pensamiento extendido para que Claude razone sobre casos límite antes de escribir. Estructura prompts para solicitar pruebas unitarias junto con la implementación.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Proporciona a Claude tu suite de pruebas existente y solicítale que asegure que todas las pruebas pasen. Dale un documento de esquema y solicítale que verifique que las migraciones sean compatible hacia atrás. Cuantas más restricciones codifiques en el prompt, menos regresiones verás en ejecuciones de sandbox.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Flujos de Aprobación y Registros de Auditoría"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Incluso el código validado debe requerir aprobación humana antes de llegar a producción. Almacena cada cambio generado en una tabla de Supabase con el prompt original, razonamiento de Claude, resultados de pruebas, y estado de aprobación. Construye un panel mostrando cambios de agentes pendientes.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Registra cada ejecución. Quién la aprobó, cuándo se ejecutó, qué métricas cambiaron, cualquier error que siguiera. Esto crea responsabilidad y facilita rastrear bugs de vuelta a una modificación específica de agente.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El proyecto Pantheon en github.com/lewisallena17/pantheon proporciona una implementación de referencia de trabajo para agentes de IA que modifiquen código de forma segura. Incluye patrones de ejecución en sandbox, esquema de Supabase para rastrear cambios, puntos finales API de Next.js para implementación, e integración de Claude con compuertas de validación.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Estudia cómo Pantheon estructura sus prompts para incluir instrucciones de generación de pruebas, cómo orquesta ejecuciones de sandbox antes de aprobación, y cómo registra cambios a una pista de auditoría persistente. Puedes adaptar estos patrones en tu propio sistema o hacer un fork de Pantheon como punto de partida.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construye agentes de IA automejorados estratificando validación, sandboxing, y flujos de aprobación—descarga el kit de inicio de Pantheon para ver patrones de código de trabajo para automutación impulsada por Claude con salvaguardias de seguridad.`}</p>
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
