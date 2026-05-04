import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/fr/topics/ai-agent-email-newsletter-resend'

export const metadata: Metadata = {
  title:       'Bulletins d\'information autonomes avec Resend et l\'IA',
  description: 'Construisez des newsletters auto-générées en utilisant Claude AI, Resend et Next.js. Planifiez des agents de messagerie autonomes qui écrivent, formatent et env',
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
    title:       'Bulletins d\'information autonomes avec Resend et l\'IA',
    description: 'Construisez des newsletters auto-générées en utilisant Claude AI, Resend et Next.js. Planifiez des agents de messagerie autonomes qui écrivent, formatent et env',
    type:        'article',
    locale:      'fr_FR',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Bulletins d\'information autonomes avec Resend et l\'IA', description: 'Construisez des newsletters auto-générées en utilisant Claude AI, Resend et Next.js. Planifiez des agents de messagerie autonomes qui écrivent, formatent et env' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Bulletins d'information autonomes avec Resend et l'IA"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Arrêtez d'écrire les newsletters manuellement—construisez un agent autonome qui génère, personnalise et envoie des e-mails selon un calendrier en utilisant Claude, Resend et des fonctions sans serveur.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Pourquoi les e-mails autonomes sont importants pour les développeurs indépendants"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`En tant que fondateur, chaque heure passée à écrire et formater des e-mails est une heure non consacrée à la construction du produit. Les agents de messagerie autonomes résolvent ce problème en déléguant la génération de contenu à Claude tandis que Resend gère la livraison fiable à grande échelle.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Contrairement aux outils de messagerie génériques, Claude comprend le contexte—vos mises à jour de produit, le comportement des utilisateurs, le ton de la newsletter—et génère un contenu authentique qui ne semble pas modélisé. Combiné à l'infrastructure de messagerie transactionnelle de Resend, vous obtenez un système qui se met à l'échelle de 100 à 100 000 abonnés sans surcharge.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture : Claude + Resend + Next.js Functions"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le modèle est simple : une route API Next.js planifiée déclenche Claude pour générer le contenu de la newsletter, puis canalise la sortie directement vers Resend pour l'envoi. Utilisez Supabase pour stocker les listes d'abonnés et suivre les newsletters qui ont été envoyées à qui.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude gère le travail créatif—résumer vos dernières fonctionnalités, écrire des lignes d'objet, formater en HTML. Resend gère l'authentification, le suivi des rebonds et la conformité. Votre route Next.js agit comme orchestrateur, appelant les deux APIs en séquence et enregistrant les résultats dans votre base de données.`}</p>
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
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Planification avec Vercel Cron ou déclencheurs externes"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Utilisez Vercel Cron Jobs (champ cron dans vercel.json) pour déclencher votre fonction de newsletter selon un calendrier—quotidien, hebdomadaire ou à des intervalles personnalisés. Alternativement, utilisez un service comme Trigger.dev ou n8n pour des flux de travail plus complexes qui pourraient impliquer la récupération de données de vos analyses ou CRM d'abord.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour les flux de travail multi-étapes (récupérer les données → générer un e-mail → tester A/B les lignes d'objet → envoyer), les outils d'orchestration évitent les délais d'expiration et ajoutent automatiquement une logique de relance. Conservez l'opération d'envoi réelle dans votre fonction Next.js pour plus de simplicité.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Personnalisation sans segmentation manuelle"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Claude peut lire les métadonnées des abonnés à partir de Supabase (source d'inscription, type de plan, utilisation des fonctionnalités) et injecter des détails personnalisés dans chaque e-mail. Au lieu d'envoyer des newsletters identiques à tout le monde, chaque destinataire obtient un contenu adapté à son contexte.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Interrogez votre tableau Supabase pour les cohortes d'abonnés, transmettez les données utilisateur pertinentes à l'invite de Claude et faites-le ajuster le ton et le contenu en conséquence. Cela prend 30 secondes à mettre en place et améliore considérablement les taux d'engagement.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gestion des défaillances et conformité"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Enregistrez chaque tentative d'envoi dans Supabase avec des horodatages et des codes de réponse. Resend retourne des données détaillées sur les rebonds et les plaintes ; interrogez-les régulièrement pour maintenir une liste propre. Les sorties de Claude sont déterministes compte tenu de la même entrée, vous pouvez donc régénérer le contenu en toute sécurité si nécessaire.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Pour RGPD/CAN-SPAM : stockez le consentement explicite dans votre base de données, incluez des liens de désinscription dans chaque e-mail (Resend a un support intégré) et n'envoyez jamais sans la permission de l'utilisateur dans la base de données.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Implémentation open-source : Pantheon"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Le référentiel Pantheon (github.com/lewisallena17/pantheon) est un kit de démarrage prêt pour la production qui relie Claude, Resend et Next.js avec Supabase pour la gestion des abonnés. Il inclut la configuration de l'environnement, la configuration de cron, la gestion des erreurs et des exemples d'invites.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Clonez-le, ajoutez vos clés API et déployez sur Vercel. En quelques minutes, vous aurez un système de newsletter entièrement autonome générant et envoyant des e-mails sans toucher à un tableau de bord.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Construisez votre newsletter autonome en une après-midi en utilisant Claude, Resend et Pantheon—obtenez le kit de démarrage sur github.com/lewisallena17/pantheon et commencez à expédier.`}</p>
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
