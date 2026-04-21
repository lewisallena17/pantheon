'use client'

/**
 * SVG circular progress ring — the Iron-Man-HUD-style radial gauge.
 * Accepts 0–100 percent; colour tier auto-shifts with the value unless
 * a fixed color is passed.
 */
interface Props {
  pct:       number          // 0–100
  size?:     number          // diameter in px
  label?:    string
  sublabel?: string
  color?:    'auto' | 'cyan' | 'emerald' | 'amber' | 'red' | 'purple'
  thickness?: number         // stroke width
  className?: string
}

const COLOR_MAP: Record<string, string> = {
  cyan:    '#22d3ee',
  emerald: '#10b981',
  amber:   '#f59e0b',
  red:     '#ef4444',
  purple:  '#a855f7',
}

export default function RadialGauge({
  pct,
  size      = 96,
  label,
  sublabel,
  color     = 'auto',
  thickness = 6,
  className = '',
}: Props) {
  const clamped  = Math.max(0, Math.min(100, pct))
  const radius   = (size - thickness) / 2
  const circ     = 2 * Math.PI * radius
  const offset   = circ - (clamped / 100) * circ

  const resolved =
    color !== 'auto' ? COLOR_MAP[color] :
    clamped >= 80    ? COLOR_MAP.emerald :
    clamped >= 50    ? COLOR_MAP.cyan :
    clamped >= 25    ? COLOR_MAP.amber :
                       COLOR_MAP.red

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`} style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="rgba(100, 116, 139, 0.18)"
            strokeWidth={thickness}
            fill="none"
          />
          {/* Foreground arc */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={resolved}
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 800ms ease, stroke 400ms ease',
              filter: `drop-shadow(0 0 4px ${resolved}aa)`,
            }}
          />
          {/* Tick marks around the perimeter for HUD feel */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i / 24) * 2 * Math.PI - Math.PI / 2
            const x1 = size / 2 + Math.cos(angle) * (radius + thickness / 2 + 2)
            const y1 = size / 2 + Math.sin(angle) * (radius + thickness / 2 + 2)
            const x2 = size / 2 + Math.cos(angle) * (radius + thickness / 2 + 5)
            const y2 = size / 2 + Math.sin(angle) * (radius + thickness / 2 + 5)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(100, 116, 139, 0.3)"
                strokeWidth={1}
              />
            )
          })}
        </svg>
        {/* Centre label — rendered over the SVG */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-base font-black tabular-nums leading-none" style={{ color: resolved, fontFamily: 'Orbitron, monospace' }}>
            {label ?? `${Math.round(clamped)}%`}
          </div>
          {sublabel && (
            <div className="text-[9px] font-mono tracking-wider text-slate-500 mt-0.5 uppercase">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
