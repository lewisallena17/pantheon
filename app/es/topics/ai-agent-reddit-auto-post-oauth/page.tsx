import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/es/topics/ai-agent-reddit-auto-post-oauth'

export const metadata: Metadata = {
  title:       'Publicación automática en Reddit desde agentes de IA a través de OAuth',
  description: 'Integra publicación automática en Reddit en agentes de IA Claude usando OAuth2. Guía paso a paso para integración Next.js + Supabase con ejemplos de código real',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-reddit-auto-post-oauth',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-reddit-auto-post-oauth',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-reddit-auto-post-oauth',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-reddit-auto-post-oauth',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-reddit-auto-post-oauth',
    },
  },
  openGraph: {
    title:       'Publicación automática en Reddit desde agentes de IA a través de OAuth',
    description: 'Integra publicación automática en Reddit en agentes de IA Claude usando OAuth2. Guía paso a paso para integración Next.js + Supabase con ejemplos de código real',
    type:        'article',
    locale:      'es_ES',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Publicación automática en Reddit desde agentes de IA a través de OAuth', description: 'Integra publicación automática en Reddit en agentes de IA Claude usando OAuth2. Guía paso a paso para integración Next.js + Supabase con ejemplos de código real' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Publicación automática en Reddit desde agentes de IA a través de OAuth"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Automatiza la publicación en Reddit directamente desde tu agente Claude implementando autenticación OAuth2 y la API de Reddit, permitiendo distribución de contenido autónoma sin intervención manual ni credenciales codificadas.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Por qué OAuth es importante para agentes de IA"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacenar credenciales de Reddit en la memoria del agente o variables de entorno genera deuda de seguridad. OAuth2 permite que tu agente solicite acceso a Reddit en nombre de un usuario, luego los tokens se expiran y rotan—sin secretos permanentes por ahí.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando tu agente Claude necesita publicar, usa un token de acceso válido vinculado a una cuenta específica de Reddit. Si se compromete, ese token tiene alcance limitado y vida útil corta. Lo revocas sin restablecer contraseñas en todos los sistemas.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Configuración de credenciales OAuth2 de Reddit"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ve a reddit.com/prefs/apps y crea una aplicación 'script'. Reddit te proporciona un client ID y client secret. Establece tu URI de redirección al manejador de devolución de llamada de Next.js—típicamente \`https://tudominio.com/api/auth/reddit/callback\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena \`REDDIT_CLIENT_ID\` y \`REDDIT_CLIENT_SECRET\` en Supabase vault o tu .env.local. Nunca hagas commit de estos. El endpoint OAuth de Reddit es \`https://www.reddit.com/api/v1/authorize\` con scopes como \`submit\` y \`read\` para publicar y obtener datos de usuario.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Construcción del callback de OAuth en Next.js"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Cuando un usuario autoriza tu aplicación, Reddit redirige a tu ruta de devolución de llamada con un parámetro \`code\`. Intercambia ese código por un token de acceso mediante una solicitud POST a \`https://www.reddit.com/api/v1/access_token\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena el refresh token en Supabase (encriptado) y el access token en memoria o Redis con un TTL corto. Tu agente Claude recupera el refresh token cuando necesita publicar, lo refresca si está expirado, luego llama al endpoint de API de Reddit para enviar contenido.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/auth/reddit/callback.ts
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code } = req.query;
  const auth = Buffer.from(\`\${process.env.REDDIT_CLIENT_ID}:\${process.env.REDDIT_CLIENT_SECRET}\`).toString('base64');
  
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: { 'Authorization': \`Basic \${auth}\` },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: process.env.REDIRECT_URI })
  });
  
  const { access_token, refresh_token } = await tokenRes.json();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  await supabase.from('reddit_tokens').insert([{ user_id: req.user.id, refresh_token, created_at: new Date() }]);
  res.redirect('/dashboard');
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Llamada a la API de Reddit desde tu agente Claude"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Tu agente Claude usa una herramienta que acepta \`subreddit\`, \`title\` y \`content\`. Recupera el refresh token del usuario desde Supabase, refresca el access token si es necesario, luego hace POST a \`https://oauth.reddit.com/api/v1/submit\`.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Incluye el access token en el encabezado Authorization. Reddit valida el alcance del token y los permisos del usuario. Si el token es inválido o está expirado, implementa un reintento con refresco de token. Devuelve éxito/fallo al agente para que pueda decidir los próximos pasos.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Manejo de refresco de token y expiración"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Los access tokens de Reddit típicamente viven 1 hora. Antes de publicar, verifica la marca de tiempo \`expires_in\` del token. Si está vencido, usa el refresh token para obtener uno nuevo sin intervención del usuario.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Almacena tiempos de expiración en Supabase e implementa una función auxiliar que refresque automáticamente. Esto mantiene tu agente autónomo—nunca pide al usuario que reautorize en medio de una sesión.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implementación de código abierto"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`El repositorio Pantheon en github.com/lewisallena17/pantheon contiene una implementación lista para producción de agentes de IA que publican en Reddit, Twitter y otras plataformas a través de OAuth. Incluye migraciones de esquema de Supabase, rutas de API de Next.js y definiciones de herramientas de Claude.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Bifurcalo como kit de inicio. El repositorio maneja rotación de tokens, recuperación de errores y limitación de velocidad predeterminada. Está construido para desarrolladores independientes que necesitan publicación social sin reinventar la plomería de OAuth.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Implementa Reddit OAuth2 en tu agente Claude para desbloquear publicación autónoma—obtén el kit de inicio Pantheon de código abierto e implementa en horas.`}</p>
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
