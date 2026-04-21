'use client'

/**
 * Pure CSS arc-reactor motif. Concentric rings + glowing core, with optional
 * `intensity` prop tying the pulse speed to live activity.
 *   intensity = 0   → calm, slow pulse
 *   intensity = 1   → fast, bright pulse
 */
export default function ArcReactor({
  size      = 64,
  intensity = 0.5,
  className = '',
}: {
  size?: number
  intensity?: number
  className?: string
}) {
  const pulse = Math.max(0.4, 2 - intensity * 1.6) // slower when calm
  const glow  = 0.4 + intensity * 0.6

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Outer rotating ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/60"
        style={{
          animation: `spin ${pulse * 6}s linear infinite`,
          clipPath: 'polygon(0 0, 100% 0, 100% 50%, 50% 50%, 50% 100%, 0 100%)',
        }}
      />
      {/* Middle ring, counter-rotating */}
      <div
        className="absolute rounded-full border border-cyan-300/50"
        style={{
          inset: size * 0.12,
          animation: `spin ${pulse * 4}s linear infinite reverse`,
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 50% 50%)',
        }}
      />
      {/* Inner pulsing glow core */}
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.28,
          background: 'radial-gradient(circle, rgba(6,182,212,0.95), rgba(6,182,212,0.3) 60%, transparent 75%)',
          boxShadow: `0 0 ${8 + glow * 22}px rgba(6,182,212,${glow}), inset 0 0 ${6 + glow * 12}px rgba(255,255,255,0.4)`,
          animation: `pulse-core ${pulse}s ease-in-out infinite`,
        }}
      />
      {/* Dead-center white hot spot */}
      <div
        className="absolute rounded-full bg-white"
        style={{
          inset: size * 0.42,
          boxShadow: `0 0 ${4 + glow * 10}px rgba(255,255,255,0.9)`,
        }}
      />
    </div>
  )
}
