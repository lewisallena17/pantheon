import type { MetadataRoute } from 'next'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// Auto-generates sitemap.xml from filesystem — every new topic page is
// instantly discoverable by Google without manual updates.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://task-dashboard-sigma-three.vercel.app'
  const now = new Date()

  const staticPages = [
    { url: `${base}/`,          lastModified: now, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${base}/subscribe`, lastModified: now, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${base}/topics`,    lastModified: now, priority: 0.9, changeFrequency: 'daily' as const },
  ]

  // Enumerate /topics/<slug> (English) + /{lang}/topics/<slug> (translations)
  const topicsDir = join(process.cwd(), 'app', 'topics')
  const topicPages: MetadataRoute.Sitemap = []
  if (existsSync(topicsDir)) {
    const slugs = readdirSync(topicsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const slug of slugs) {
      // English canonical — include hreflang alternates pointing to
      // localised variants when they exist on disk.
      const alternateLangs: Record<string, string> = {}
      for (const lang of ['es', 'de', 'fr']) {
        const localPath = join(process.cwd(), 'app', lang, 'topics', slug, 'page.tsx')
        if (existsSync(localPath)) alternateLangs[lang] = `${base}/${lang}/topics/${slug}`
      }

      topicPages.push({
        url:            `${base}/topics/${slug}`,
        lastModified:   now,
        priority:       0.8,
        changeFrequency: 'weekly',
        ...(Object.keys(alternateLangs).length > 0
          ? { alternates: { languages: { ...alternateLangs, en: `${base}/topics/${slug}`, 'x-default': `${base}/topics/${slug}` } } }
          : {}),
      })

      // Also list the localised pages as their own sitemap entries
      for (const [lang, url] of Object.entries(alternateLangs)) {
        void lang
        topicPages.push({
          url,
          lastModified:   now,
          priority:       0.7,
          changeFrequency: 'weekly',
        })
      }
    }
  }

  return [...staticPages, ...topicPages]
}
