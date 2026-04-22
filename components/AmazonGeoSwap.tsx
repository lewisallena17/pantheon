'use client'

import { useEffect } from 'react'

/**
 * Amazon affiliate geo-router. Server-rendered pages emit amazon.com links
 * with the US tag; this client component runs once on page load, detects
 * the visitor's locale, and rewrites .com links to .co.uk with the UK tag
 * when appropriate.
 *
 * Zero visual footprint — pure side-effect component. Mount once per page
 * via the topic-page template.
 *
 * Env vars consumed (client-side, hence NEXT_PUBLIC_):
 *   NEXT_PUBLIC_AMAZON_US_TAG — tag used in the server-rendered href
 *   NEXT_PUBLIC_AMAZON_UK_TAG — tag used after rewrite for UK visitors
 */
export default function AmazonGeoSwap() {
  useEffect(() => {
    const US_TAG = process.env.NEXT_PUBLIC_AMAZON_US_TAG ?? ''
    const UK_TAG = process.env.NEXT_PUBLIC_AMAZON_UK_TAG ?? ''
    if (!UK_TAG || !US_TAG) return

    // Is the visitor more likely to convert on amazon.co.uk?
    const lang = (navigator.language || '').toLowerCase()
    const uk =
      lang.startsWith('en-gb') ||
      lang === 'en-uk' ||
      // Timezone fallback — UK users abroad, or browsers without locale data
      Intl.DateTimeFormat().resolvedOptions().timeZone?.includes('London')

    if (!uk) return

    for (const a of Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="amazon.com"]'))) {
      try {
        const u = new URL(a.href)
        if (!/(^|\.)amazon\.com$/i.test(u.hostname)) continue
        u.hostname = 'www.amazon.co.uk'
        // Swap the tag parameter
        const search = new URLSearchParams(u.search)
        if (search.has('tag')) search.set('tag', UK_TAG)
        else                   search.append('tag', UK_TAG)
        u.search = search.toString()
        a.href = u.toString()
        // Mark for debugging / analytics
        a.setAttribute('data-amazon-geo', 'uk')
      } catch {}
    }
  }, [])

  return null
}
