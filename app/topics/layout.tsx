import type { ReactNode } from 'react'

/**
 * Topic-section layout. The AdSense `adsbygoogle.js` loader lives ONLY here so
 * Google's policy bot never finds ads on the dashboard / navigation surfaces
 * (Google flags those as "ads on behavioral screens"). Every page under
 * /topics/* has long-form article content where ads are policy-compliant.
 *
 * Keep this layout passthrough — no shared chrome, just the script.
 */
export default function TopicsLayout({ children }: { children: ReactNode }) {
  const adSenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  return (
    <>
      {adSenseClient && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClient}`}
          crossOrigin="anonymous"
        />
      )}
      {children}
    </>
  )
}
