/**
 * Drop-in "Buy the Kit" CTA. Rendered on every topic page above + below
 * the article body so SEO traffic always sees the offer once.
 *
 * Single source of truth for the price + URL — bump them here and every
 * page updates next deploy.
 */
const GUMROAD_URL = 'https://ltagb.gumroad.com/l/ai'
const PRICE_USD   = 39

interface Props {
  variant?: 'banner' | 'inline'
}

export default function KitCTA({ variant = 'inline' }: Props) {
  if (variant === 'banner') {
    return (
      <a
        href={GUMROAD_URL}
        target="_blank"
        rel="noopener sponsored"
        className="block my-8 rounded-lg border border-emerald-700/50 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-cyan-950/30 px-5 py-4 hover:border-emerald-500/70 hover:from-emerald-900/40 transition-all group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase mb-1">◆ The Kit</div>
            <div className="text-base font-bold text-slate-100">Pantheon Starter Kit — Build your own autonomous AI workforce</div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              Full Next.js + Supabase + Claude codebase. 9 PM2 agents wired up. Cost guardrails included.
              43 SEO-ready topic pages with AdSense + affiliate slots already plumbed.
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">${PRICE_USD}</div>
            <div className="text-[10px] font-mono tracking-widest text-emerald-600/80 uppercase mt-0.5 group-hover:text-emerald-400">buy on gumroad →</div>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={GUMROAD_URL}
      target="_blank"
      rel="noopener sponsored"
      className="my-6 inline-flex items-center gap-2 px-4 py-2 rounded border border-emerald-700/50 bg-emerald-950/30 hover:bg-emerald-900/40 hover:border-emerald-500/70 transition-colors text-[12px] font-mono"
    >
      <span className="text-emerald-400">◆</span>
      <span className="text-slate-200">Get the Pantheon Starter Kit</span>
      <span className="text-emerald-400 font-bold tabular-nums">${PRICE_USD}</span>
      <span className="text-emerald-600">→</span>
    </a>
  )
}
