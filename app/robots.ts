import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://task-dashboard-sigma-three.vercel.app'
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/topics/', '/subscribe'], disallow: ['/api/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
