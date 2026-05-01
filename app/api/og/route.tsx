import { ImageResponse } from 'next/og'

export const runtime = 'edge'

/**
 * Dynamic OG image generator. Every topic page sets its `openGraph.images`
 * to /api/og?title=<title>&category=<cat> so Twitter/LinkedIn/Slack each get
 * a custom 1200×630 card instead of the same default image. Per Open Graph
 * best practices: bold title, brand mark, gradient background.
 *
 * Edge runtime — renders in <100ms, cacheable forever via the URL query.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title    = (searchParams.get('title')    ?? 'Pantheon').slice(0, 120)
  const category = (searchParams.get('category') ?? 'AI Agents').slice(0, 40)

  return new ImageResponse(
    (
      <div
        style={{
          width:  '100%',
          height: '100%',
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'space-between',
          padding:        '60px 70px',
          background:     'linear-gradient(135deg, #020617 0%, #0c1f3d 50%, #1e1b4b 100%)',
          fontFamily:     'monospace',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#22d3ee' }} />
          <div style={{ fontSize: 22, color: '#22d3ee', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            ◈ pantheon · {category}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display:    'flex',
            fontSize:   title.length > 60 ? 56 : 72,
            fontWeight: 700,
            lineHeight: 1.1,
            color:      '#f1f5f9',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 22, color: '#64748b', letterSpacing: '0.15em' }}>
            autonomous AI agents — built with Claude
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: '#34d399' }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: '#34d399' }} />
            LIVE
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
      headers: {
        // Cache aggressively — title is in the URL so a new title yields a new
        // cached entry. CDN can hold these forever.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
