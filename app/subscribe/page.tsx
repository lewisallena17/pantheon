import SubscribeForm from '@/components/SubscribeForm'

export const metadata = {
  title:       'Subscribe · Autonomous AI Task Dashboard',
  description: 'Get notified when new features, articles, and versions drop.',
}

export default function SubscribePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👁</div>
          <h1 className="text-2xl font-mono font-bold text-slate-200 tracking-wider">
            AUTONOMOUS AI TASK DASHBOARD
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-mono">
            Self-improving agents built on Next.js + Supabase + Claude
          </p>
        </div>

        <SubscribeForm
          source="subscribe-page"
          title="Get notified"
          subtitle="I ship occasional updates — new features, articles about building autonomous agents, and when the product gets major upgrades. No spam, unsubscribe anytime."
        />

        <div className="mt-6 text-center text-[10px] font-mono text-slate-700 tracking-widest">
          NO SPAM · UNSUBSCRIBE WITH ONE CLICK · YOUR EMAIL STAYS PRIVATE
        </div>
      </div>
    </main>
  )
}
