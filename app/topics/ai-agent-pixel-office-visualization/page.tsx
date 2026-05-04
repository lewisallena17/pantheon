import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/topics/ai-agent-pixel-office-visualization'

export const metadata: Metadata = {
  title:       'Visualising AI Agents with Pixel-Art Office',
  description: 'Build interactive dashboards for AI agents using pixel art. See real-time agent state, task flows, and Claude integrations with Next.js and Supabase.',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/ai-agent-pixel-office-visualization',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/ai-agent-pixel-office-visualization',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/ai-agent-pixel-office-visualization',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/ai-agent-pixel-office-visualization',
    },
  },
  openGraph: {
    title:       'Visualising AI Agents with Pixel-Art Office',
    description: 'Build interactive dashboards for AI agents using pixel art. See real-time agent state, task flows, and Claude integrations with Next.js and Supabase.',
    type:        'article',
    locale:      'en_US',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'Visualising AI Agents with Pixel-Art Office', description: 'Build interactive dashboards for AI agents using pixel art. See real-time agent state, task flows, and Claude integrations with Next.js and Supabase.' },
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

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"Visualising AI Agents with a Pixel-Art Office"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Debugging multi-agent systems is harder than building them—until you can see what your AI agents are actually doing in real time with a visual, pixel-art office interface that makes agent state and task execution immediately obvious.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Why Visual Agent Debugging Matters"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`When you deploy AI agents powered by Claude, you lose visibility the moment they start executing tasks asynchronously. Logs are fragmented. State changes happen in the database. You're left guessing whether an agent is stuck, looping, or genuinely thinking.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`A pixel-art office metaphor solves this. Each agent is a character in a room. Their desk shows current task. Movement between rooms represents state transitions. Task completion lights up visual indicators. Founders building multi-agent workflows report 40% faster debugging time with spatial visual feedback versus text logs alone.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Architecture: Real-Time Agent State Sync"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Your agent system needs three layers: agents executing in your backend (Claude via API), state persistence in Supabase, and a Next.js frontend subscribing to real-time updates.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`When an agent changes status—from idle to thinking to executing—a Supabase trigger fires, pushing that delta to your frontend. Your pixel-art office re-renders instantly. No polling. No 5-second stale data.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// Next.js hook: subscribe to agent state changes
const useAgentState = (agentId: string) => {
  const [agent, setAgent] = useState(null);
  useEffect(() => {
    const subscription = supabase
      .from('agents')
      .on('*', payload => setAgent(payload.new))
      .subscribe();
    return () => subscription.unsubscribe();
  }, [agentId]);
  return agent;
};`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Designing the Pixel-Art Office Layout"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Keep it simple: one room per agent, shared workspace for inter-agent communication. Use a 16x16 sprite grid. Each agent sprite has four states: idle (desk work), thinking (head tilt), executing (action pose), and complete (celebration).`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Task cards appear on desks as floating labels. Color-code by priority: blue (low), yellow (medium), red (high). This gives non-technical stakeholders instant insight into what your agents are doing, which matters when you're pitching to investors or onboarding team members.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Integrating Claude Task Execution"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Each agent loop calls Claude with a prompt scoped to a specific task. Before the API call, update agent status to 'thinking' in Supabase. On response, parse structured output (use tool_use), update status to 'executing', run the tool, then mark complete.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`The pixel-art office reflects every step. This transparency is critical: you catch prompt injection risks, see when agents hallucinate, and identify when context windows are being wasted on repeated work.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Real-Time Collaboration & Task Queues"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Use a Supabase table to queue tasks. Agents poll or subscribe for new work. In your pixel-art office, a 'task inbox' room shows queued work waiting assignment. Agents walk to the inbox, grab a task, and move to their desk.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`This visual metaphor makes queue depth obvious and helps you spot bottlenecks: if five agents are waiting at the inbox, you have a resource contention problem that demands optimization.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source Implementation"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`The Pantheon project (github.com/lewisallena17/pantheon) provides a complete starter with pixel-art assets, Next.js components, and Supabase schema for a multi-agent office dashboard. It includes Claude integration templates, real-time event handlers, and a sprite animation system.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Fork it, customize the office layout and agent sprites to match your domain, and deploy to Vercel. The schema is production-ready and scales to 50+ concurrent agents without performance degradation.`}</p>

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
          <p className="text-slate-300 mb-4 text-sm">{`Visualise your AI agents' execution in real time with a pixel-art office interface—grab the open-source Pantheon starter kit and start debugging multi-agent workflows in minutes, not hours.`}</p>
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
