// app/ads.txt/route.ts
//
// Google's Authorized Digital Sellers (ads.txt) file. Served at /ads.txt.
// Format: <domain>, <publisher ID>, <relationship>, <TAG-ID>
//   - domain: google.com (AdSense)
//   - publisher ID: your pub-XXX number (drop the "ca-" prefix)
//   - relationship: DIRECT (you're the direct seller)
//   - TAG-ID: f08c47fec0942fa0 (Google's fixed TAG-ID for AdSense)
//
// Serving this file is (a) Google's preferred verification method for
// AdSense, (b) required before any ads actually serve in some cases, and
// (c) prevents ad-fraud by letting buyers confirm which sellers are
// authorized to resell your inventory.
//
// NextResponse is plain text — Google's crawler looks for exactly the
// format below.

export const dynamic = 'force-static'

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || ''
  // Convert "ca-pub-1234567890123456" → "pub-1234567890123456"
  const pubId = clientId.replace(/^ca-/, '')

  const lines = []
  if (pubId) {
    lines.push(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0`)
  } else {
    // Emit an empty file so /ads.txt returns 200 (not 404) even before setup
    lines.push('# ads.txt — add NEXT_PUBLIC_ADSENSE_CLIENT_ID to .env.local to activate')
  }

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type':  'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
