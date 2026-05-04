import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/claude-tool-use-best-practices'

export const metadata: Metadata = {
  title:       'Mejores prácticas de Claude Tool Use en producción',
  description: 'Domina los patrones de Claude tool use para agentes de IA en producción. Aprende manejo de errores, gestión de concurrencia y optimización de costos para sistem',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/claude-tool-use-best-practices',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/claude-tool-use-best-practices',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/claude-tool-use-best-practices',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/claude-tool-use-best-practices',
    },
  },
  openGraph: {
    title:       'Mejores prácticas de Claude Tool Use en producción',
    description: 'Domina los patrones de Claude tool use para agentes de IA en producción. Aprende manejo de errores, gestión de concurrencia y optimización de costos para sistem',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Mejores prácticas de Claude Tool Use en producción', description: 'Domina los patrones de Claude tool use para agentes de IA en producción. Aprende manejo de errores, gestión de concurrencia y optimización de costos para sistem' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Mejores prácticas de Claude Tool Use en producción"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Construir integraciones confiables de Claude tool use a escala requiere más que ingeniería de prompts—necesitas manejo robusto de errores, gestión inteligente de concurrencia y visibilidad clara de costos.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Diseña definiciones de herramientas para la resiliencia"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La característica tool_use de Claude funciona mejor cuando los esquemas son explícitos y tolerantes. Los parámetros demasiado restringidos fallan silenciosamente; los insuficientemente especificados causan alucinaciones. Define valores enum claros para entradas esperadas, usa campos description para guiar el razonamiento de Claude e incluye ejemplos de llamadas válidas e inválidas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`En producción, trata las definiciones de herramientas como contratos. Versionalas por separado de tu lógica de agente. Si necesitas cambiar el comportamiento de una herramienta, crea una tool_version nueva en lugar de mutar la original—esto evita que Claude mezcle semánticas viejas y nuevas a mitad de la conversación.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementa backoff exponencial para llamadas de herramientas"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`La ejecución de herramientas puede fallar por razones transitorias: bloqueos de bases de datos, límites de velocidad o interrupciones breves del servicio. La lógica ingenua de reintentos agrava estos problemas. En cambio, usa backoff exponencial con jitter para distribuir reintentos a lo largo del tiempo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`El patrón: espera 100ms antes del reintento 1, 200ms antes del reintento 2, 400ms antes del reintento 3, cada uno con ±20% de jitter aleatorio. Esto da espacio a las fallas transitorias sin sobrecargar tu infraestructura. Establece un máximo de 3–4 reintentos; más allá de eso, el fallo es probablemente estructural.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`const executeWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 100 * (0.8 + Math.random() * 0.4);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Valida salidas de herramientas antes de devolverlas a Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude confía en los resultados de herramientas que devuelves. Si una herramienta devuelve datos malformados o inesperados, Claude puede tomar decisiones incorrectas posteriormente. Siempre valida salidas contra un esquema antes de alimentarlas de vuelta a la conversación.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa un validador ligero (Zod, io-ts o guardias simples de TypeScript). Registra fallas de validación por separado para que puedas detectar errores de herramientas temprano. Si la validación falla, devuelve un error legible a Claude en lugar de dejar que datos malos se propaguen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Rastrea costos de herramientas y uso de tokens"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cada llamada a la API de Claude tiene un costo, y tool use añade fricción: tokens extra para definiciones de herramientas, tokens para resultados y potencialmente múltiples rondas de razonamiento de Claude. Monitorea tu gasto por agente, por usuario y por herramienta.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Registra input_tokens, output_tokens y cache_read_tokens de cada respuesta de API. Conecta esto a una tabla de Supabase para que puedas consultar tendencias de costos. Establece alertas si una sesión de usuario único excede un presupuesto (ej: \$0.50) e implementa límites de velocidad para agentes de alto costo.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Serializa y persiste el estado de herramientas"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Si tu agente hace múltiples llamadas de herramientas a lo largo de una sesión, persiste la conversación y los resultados de herramientas. Esto te permite reanudar trabajos interrumpidos, auditar decisiones y detectar bucles donde Claude llama a la misma herramienta repetidamente con entradas idénticas.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena messages, tool_results e invocation metadata en Supabase como columnas JSONB. Indexa en user_id y session_id para que la recuperación sea rápida. Incluye timestamps y banderas de resultado (success, validation_failed, timeout) para análisis post-mortem.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Usa salidas estructuradas para resultados determinísticos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tool use funciona mejor cuando se empareja con el modo de salida estructurada de Claude. Define un esquema JSON para lo que Claude debe devolver después de usar herramientas—esto previene texto improvisado y asegura que tu código posterior siempre obtenga una forma predecible.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Combina herramientas y salidas estructuradas: Claude llama a herramientas para recopilar datos, luego formatea su respuesta en tu esquema. Esto te da tanto flexibilidad (Claude puede razonar sobre qué herramientas llamar) como determinismo (sabes exactamente qué forma obtendrás).`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Aplica estas seis prácticas—diseño de herramientas resiliente, lógica de backoff, validación de salidas, seguimiento de costos, persistencia de estado y salidas estructuradas—para enviar agentes Claude confiables que escalen sin costos sorpresa o fallas silenciosas. Comienza con el kit de inicio de Pantheon.`}</p>
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
