import Link from 'next/link'

// 404 for any non-existent route under app/.
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded border border-slate-800/60 bg-black/40 p-5 space-y-3 text-center">
        <div className="text-6xl">👁</div>
        <div className="text-xs font-mono tracking-[0.2em] text-slate-500 uppercase">◈ 404 — not found</div>
        <p className="text-[11px] font-mono text-slate-400">
          This path doesn&apos;t exist in the dashboard.
        </p>
        <Link
          href="/"
          className="inline-block text-[10px] font-mono px-3 py-1.5 rounded border border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/30"
        >
          → BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  )
}
