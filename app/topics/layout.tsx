import type { ReactNode } from 'react'

/**
 * Topic-section layout. The AdSense `adsbygoogle.js` loader lives ONLY here so
 * Google's policy bot never finds ads on the dashboard / navigation surfaces
 * (Google flags those as "ads on behavioral screens"). Every page under
 * /topics/* has long-form article content where ads are policy-compliant.
 *
 * Also injects a single Article-schema JSON-LD blob — every topic page is an
 * article, so Google can render rich result snippets (date, author, breadcrumbs).
 */
export default function TopicsLayout({ children }: { children: ReactNode }) {
  const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://task-dashboard-sigma-three.vercel.app'

  // Site-level schema. Per-topic schema is added inside each generated page.
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type':    'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',   item: site },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${site}/topics` },
    ],
  }

  return (
    <>
      {adSenseClient && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
          crossOrigin="anonymous"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  )
}
