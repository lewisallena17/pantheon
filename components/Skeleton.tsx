'use client'

/**
 * Tiny shimmering placeholder. Used where we have a known shape but are
 * waiting on data — gives the dashboard a Superhuman-tier instant-feel
 * rather than leaving panels blank.
 */
export default function Skeleton({ className = '', rows = 1 }: { className?: string; rows?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-[length:200%_100%] animate-skeleton rounded"
        />
      ))}
    </div>
  )
}
