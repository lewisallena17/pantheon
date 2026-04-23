'use client'

/**
 * Success-rate bar with a shaded "uncertainty" overlay. Uses the Wilson
 * 95% interval so a 2/2 sample visibly has more uncertainty than a 50/52.
 * Borrowed from NASA human-factors practice: if the data is noisy, say so.
 */
export default function ConfidenceBar({ wins, losses, width = 96 }: { wins: number; losses: number; width?: number }) {
  const total = wins + losses
  if (total === 0) {
    return <div className="text-[10px] font-mono text-slate-700">no data</div>
  }

  const p     = wins / total
  const z     = 1.96
  const denom = 1 + z * z / total
  const centre = (p + z * z / (2 * total)) / denom
  const margin = (z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total)) / denom
  const lower  = Math.max(0, centre - margin)
  const upper  = Math.min(1, centre + margin)

  const pct       = Math.round(p * 100)
  const lowerPct  = Math.round(lower * 100)
  const upperPct  = Math.round(upper * 100)
  const bandWidth = upperPct - lowerPct

  const fillColor =
    pct >= 75 ? 'bg-emerald-600' :
    pct >= 50 ? 'bg-amber-500'   :
                'bg-red-600'

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-2 bg-slate-900 rounded overflow-hidden" style={{ width }}>
        {/* Uncertainty band (shaded) */}
        <div
          className="absolute top-0 h-full bg-slate-500/25"
          style={{ left: `${lowerPct}%`, width: `${bandWidth}%` }}
          title={`95% CI: ${lowerPct}–${upperPct}%`}
        />
        {/* Point estimate */}
        <div className={`absolute top-0 h-full ${fillColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono tabular-nums text-slate-400 w-7 text-right">{pct}%</span>
    </div>
  )
}
