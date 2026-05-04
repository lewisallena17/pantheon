import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-email-newsletter-resend'

export const metadata: Metadata = {
  title:       'Boletines de Correo Autónomos con Resend e IA',
  description: 'Construye boletines que se generan automáticamente usando Claude AI, Resend y Next.js. Programa agentes de correo autónomos que escriben, formatean y envían sin',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-email-newsletter-resend',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-email-newsletter-resend',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-email-newsletter-resend',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-email-newsletter-resend',
    },
  },
  openGraph: {
    title:       'Boletines de Correo Autónomos con Resend e IA',
    description: 'Construye boletines que se generan automáticamente usando Claude AI, Resend y Next.js. Programa agentes de correo autónomos que escriben, formatean y envían sin',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Boletines de Correo Autónomos con Resend e IA', description: 'Construye boletines que se generan automáticamente usando Claude AI, Resend y Next.js. Programa agentes de correo autónomos que escriben, formatean y envían sin' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Boletines de Correo Autónomos con Resend e IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Deja de escribir boletines manualmente—construye un agente autónomo que genera, personaliza y envía correos electrónicos según un horario usando Claude, Resend y funciones serverless.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por Qué los Correos Autónomos Importan para Desarrolladores Independientes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Como fundador, cada hora que gastas escribiendo y formateando correos es una hora que no estás construyendo el producto. Los agentes de correo autónomos resuelven esto delegando la generación de contenido a Claude mientras Resend maneja la entrega confiable a escala.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A diferencia de las herramientas de correo genéricas, Claude entiende el contexto—tus actualizaciones de producto, comportamiento de usuarios, tono del boletín—y genera contenido auténtico que no parece una plantilla. Combinado con la infraestructura de correo transaccional de Resend, obtienes un sistema que escala de 100 a 100K suscriptores sin sobrecarga.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Arquitectura: Claude + Resend + Next.js Functions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El patrón es directo: una ruta API Next.js programada dispara Claude para generar contenido del boletín, luego canaliza la salida directamente a Resend para enviar. Usa Supabase para almacenar listas de suscriptores y rastrear qué boletines se enviaron a quién.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude maneja el trabajo creativo—resumiendo tus últimas características, escribiendo líneas de asunto, formateando en HTML. Resend gestiona la autenticación, rastreo de rebotes y cumplimiento. Tu ruta Next.js actúa como orquestador, llamando a ambas APIs en secuencia y registrando resultados en tu base de datos.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`export async function POST(req: Request) {
  const claude = new Anthropic();
  const msg = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'Write a brief product update email for our SaaS tool. Tone: friendly, technical.'
    }]
  });
  
  const emailContent = msg.content[0].type === 'text' ? msg.content[0].text : '';
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'newsletter@yourdomain.com',
    to: subscriber.email,
    subject: 'Your Weekly Update',
    html: emailContent
  });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Programación con Vercel Cron o Disparadores Externos"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Usa Vercel Cron Jobs (campo cron en vercel.json) para disparar tu función de boletín según un horario—diario, semanal o intervalos personalizados. Alternativamente, usa un servicio como Trigger.dev o n8n para flujos de trabajo más complejos que podrían implicar obtener datos de tu analítica o CRM primero.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para flujos de trabajo de múltiples pasos (obtener datos → generar correo → probar líneas de asunto A/B → enviar), las herramientas de orquestación previenen tiempos de espera agotados y agregan lógica de reintentos automáticamente. Mantén la operación de envío real dentro de tu función Next.js para simplificar.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Personalización sin Segmentación Manual"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude puede leer metadatos de suscriptores de Supabase (fuente de registro, tipo de plan, uso de características) e inyectar detalles personalizados en cada correo. En lugar de enviar boletines idénticos a todos, cada destinatario obtiene contenido adaptado a su contexto.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Consulta tu tabla Supabase para cohortes de suscriptores, pasa datos de usuario relevantes al prompt de Claude, y haz que ajuste el tono y contenido en consecuencia. Esto toma 30 segundos de configurar y mejora dramáticamente las tasas de compromiso.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejo de Fallos y Cumplimiento"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Registra cada intento de envío a Supabase con marcas de tiempo y códigos de respuesta. Resend devuelve datos detallados de rebotes y quejas; consulta regularmente para mantener una lista limpia. Los resultados de Claude son deterministas dados los mismos inputs, así que puedes regenerar contenido de forma segura si es necesario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Para GDPR/CAN-SPAM: almacena consentimiento explícito en tu base de datos, incluye enlaces para darse de baja en cada correo (Resend tiene soporte integrado), y nunca envíes sin permiso de un usuario en la base de datos.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de Código Abierto: Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon (github.com/lewisallena17/pantheon) es un kit de inicio listo para producción que integra Claude, Resend y Next.js con Supabase para gestión de suscriptores. Incluye configuración de entorno, configuración cron, manejo de errores y prompts de ejemplo.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clónalo, añade tus claves API e implementa en Vercel. En minutos, tendrás un sistema de boletín completamente autónomo generando y enviando correos sin tocar un panel.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construye tu boletín autónomo en una tarde usando Claude, Resend y Pantheon—obtén el kit de inicio en github.com/lewisallena17/pantheon y comienza a enviar.`}</p>
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
