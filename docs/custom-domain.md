# Custom Domain Setup

The dashboard is live at `task-dashboard-sigma-three.vercel.app` but that URL hurts SEO + brand. Swap it for a custom domain in ~10 minutes.

## 1. Buy a domain (2 min, ~$12/yr)

Recommended registrars:
- **Cloudflare Registrar** — at-cost pricing, no markup
- **Porkbun** — cheap + clean UI
- **Namecheap** — well-known
- **Google Domains / Squarespace** — convenient but pricier

Name suggestions if `pantheon.dev` is taken:
- `pantheon.sh`
- `pantheon.so`
- `pantheon-ai.dev`
- `heypantheon.com`
- `autonomous.dev`
- `godagent.dev`

Check availability before you buy: https://pantheon.dev

## 2. Add the domain to Vercel

1. Open https://vercel.com/lewisallena17s-projects/task-dashboard/settings/domains
2. Click **Add Domain**
3. Paste `pantheon.dev` (or whatever you bought)
4. Vercel will show one of:
   - **DNS records to add** (A / CNAME) — paste them at your registrar's DNS settings
   - **Nameservers to change** (for Cloudflare-registered domains, this is the easiest path)

Vercel auto-provisions SSL once DNS resolves. Usually takes 5–60 minutes.

## 3. Update `NEXT_PUBLIC_SITE_URL` everywhere

```powershell
# Local (.env.local) — add:
NEXT_PUBLIC_SITE_URL=https://pantheon.dev

# Sync to Vercel:
cd C:\Users\LTAGB\task-dashboard
VERCEL_TOKEN="<your-token>" node scripts/vercel-setup.mjs
```

The following already read from this var, so they'll pick up the new domain automatically:
- `app/sitemap.ts` — `https://pantheon.dev/sitemap.xml`
- `app/robots.ts` — `https://pantheon.dev/robots.txt`
- `app/topics/[slug]/page.tsx` (OG tags) — all future pages use the new URL
- `app/api/newsletter/send/route.ts` — unsubscribe footer
- `scripts/seo-topic-generator.mjs` — new pages use the new URL

## 4. Update references that are hardcoded

Search + replace across the repo once DNS resolves:

```powershell
# Find remaining hardcoded references
cd C:\Users\LTAGB\task-dashboard
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.mjs,*.md -Exclude node_modules,.next `
  | Select-String "task-dashboard-sigma-three.vercel.app" -List
```

## 5. Re-submit sitemap to Google

```
https://search.google.com/search-console
  → Add property → pantheon.dev
  → Verify (DNS or HTML file)
  → Sitemaps → submit: sitemap.xml
```

Google will start re-indexing everything under the new domain. Old Vercel URL pages will 301 redirect if you set up the redirect in Vercel (Settings → Domains → set `*.vercel.app` to redirect to the primary domain).

## 6. Update dev.to articles

After the domain is live:

```powershell
cd C:\Users\LTAGB\task-dashboard
$env:SUBSCRIBE_URL = "https://pantheon.dev/subscribe"
$env:GUMROAD_URL   = "https://ltagb.gumroad.com/l/gferg"
node scripts/update-devto-cta.mjs
```

The script is idempotent — it detects the existing CTA marker and updates the URLs in place.

## Cost

| Item | Cost |
|---|---|
| Domain registration | $10–15/yr |
| Vercel SSL | free |
| DNS hosting (Cloudflare) | free |
| **Total** | **$10–15/yr** |

## Why it matters

- **SEO**: Google gives custom domains ~30% higher trust than subdomain-of-subdomain URLs
- **Brand**: `pantheon.dev` is 10× more memorable than `task-dashboard-sigma-three.vercel.app`
- **Portability**: you own the URL — if you ever migrate off Vercel, links don't break
- **Ad networks**: some (Carbon Ads, etc.) won't accept `*.vercel.app` subdomains
