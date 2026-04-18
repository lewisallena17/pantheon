'use client'

// Last-line-of-defense boundary. Fires when even the root layout throws.
// Must render its own <html> + <body> since it replaces the tree.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ margin: 0, background: '#000', color: '#e2e8f0', fontFamily: 'monospace' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 480, width: '100%', border: '1px solid #7f1d1d', background: '#1e0b0d', padding: 20, borderRadius: 4 }}>
            <div style={{ color: '#fca5a5', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              ◈ FATAL ERROR
            </div>
            <div style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 8 }}>
              The dashboard root crashed.
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', wordBreak: 'break-word' }}>
              {error.message || 'Unknown error'}
            </div>
            {error.digest && (
              <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
                digest: {error.digest}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <button
                onClick={reset}
                style={{ background: 'transparent', border: '1px solid #0e7490', color: '#67e8f9', padding: '6px 14px', fontSize: 11, fontFamily: 'monospace', borderRadius: 4, cursor: 'pointer' }}
              >
                ↻ RETRY
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
