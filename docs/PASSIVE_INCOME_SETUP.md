# Passive Income Setup — Hands-Off Checklist

The dashboard does 95% of the work. Your two one-time jobs are:

1. **Apply for the accounts** (AdSense, Amazon Associates) — can't be automated
2. **Paste the IDs into `.env.local`** — takes 30 seconds

Everything after that — page generation, ad placement, affiliate link injection, revenue tracking — runs autonomously.

## What the dashboard already does for you

Agents generate ~3 new SEO topic pages per 10 cycles (~30–90 pages/month) covering topics in your niche. Each page has:

- Two `<DisplayAd />` slots (top-of-article, mid-article)
- Placeholder rendering if AdSense isn't wired yet (safe to deploy now)
- Server-rendered HTML for SEO — Google can crawl everything
- Structured metadata (OpenGraph, Twitter cards)
- Amazon affiliate auto-linking on hardware/book mentions

You can see live status in the **Revenue tab → Passive Income Pipelines** panel. It tells you the ONE thing to do next.

---

## Step 1: Google AdSense (biggest single revenue source)

### Apply

1. Go to [google.com/adsense/start](https://www.google.com/adsense/start/)
2. Sign in with the Google account you want payments linked to
3. Add your site — use the Vercel URL shown in `NEXT_PUBLIC_SITE_URL` in `.env.local`
4. AdSense places a verification script — the dashboard already loads it when you set the publisher ID (see step 2). Submit for review anyway.
5. Wait 2–4 weeks for approval. They reject sites with thin content, but your topic pages are 500+ words of real technical content, so you're in a reasonable position.

### Wire it

Once approved, AdSense gives you a **publisher ID** that looks like `ca-pub-1234567890123456`. Add to `.env.local`:

```sh
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
```

That's it. The loader script in `app/layout.tsx` activates; every `<DisplayAd />` on your topic pages starts serving real ads. No code changes needed.

### Optional: specific ad slot IDs

In AdSense → Ads → "By ad unit", create two display ad units and copy their slot IDs. Pass them to `<DisplayAd />` via the `slot` prop. The template already uses `"topic-top"` and `"topic-mid"` as placeholder IDs — replace them in `scripts/seo-topic-generator.mjs` with your real ones if you prefer manual slots. (Auto Ads works fine without this.)

---

## Step 2: Amazon Associates (additive, easy)

### Apply

1. Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com)
2. Sign in with your regular Amazon account
3. Fill in your website URL — same Vercel URL as AdSense
4. Add your **tracking ID** (it becomes your affiliate tag). Pick something like `pantheon-20` for Amazon US.
5. Amazon approves instantly but your tag is on **probation**. You have **180 days to make 3 qualifying sales** or they revoke it. Don't panic — SEO content with hardware/book mentions typically hits this naturally.

### Wire it

Add to `.env.local`:

```sh
AMAZON_ASSOCIATE_TAG=pantheon-20
# Optional: if you're in the UK/DE/etc:
# AMAZON_TLD=co.uk
```

The agent's `seo-topic-generator.mjs` auto-injects affiliate links on the next page generation cycle. Existing topic pages aren't retroactively modified (to avoid churn on approved content); you can regenerate specific ones if wanted.

### FTC disclosure

Amazon requires a disclosure like *"As an Amazon Associate, pantheon earns from qualifying purchases."* The `scripts/lib-amazon-affiliate.mjs` module has a `disclosureHtml()` helper that the generator inserts on any page with affiliate links.

---

## Step 3: Ezoic (only when you hit traffic thresholds)

Skip this until your site is getting **10,000+ monthly pageviews**. Below that, Ezoic pays less than AdSense and adds setup complexity. Above it, Ezoic typically pays 2–3× AdSense's RPM for the same traffic.

If you do qualify:
1. Sign up at [ezoic.com](https://ezoic.com)
2. Set `NEXT_PUBLIC_EZOIC_SITE_ID` — future versions of `<DisplayAd />` will detect this and prefer Ezoic's ad units

---

## Step 4: Monitor

Open the **Revenue tab** on your dashboard. The `Passive Income Pipelines` panel shows:

- Which streams are active (green dot)
- Which need setup (amber)
- The single next recommended action
- Total SEO pages shipped + newest-page date

Over time, agents keep generating pages. Traffic accumulates. Ads and affiliates serve automatically. Revenue appears in:

- **AdSense**: [adsense.google.com](https://adsense.google.com) — payouts monthly when balance ≥ $100
- **Amazon**: [affiliate-program.amazon.com/home](https://affiliate-program.amazon.com/home/reports) — payouts monthly when balance ≥ $10 (US)

---

## Realistic timeline

| Month | Pages shipped | Monthly pageviews | Est. revenue (AdSense + Amazon) |
|-------|---------------|-------------------|----------------------------------|
| 1     | 30            | 100–500           | $0 (pre-approval or sub-threshold) |
| 3     | 80            | 1k–3k             | $5–$25                           |
| 6     | 150+          | 5k–15k            | $50–$250                         |
| 12    | 300+          | 20k–80k           | $200–$1,000                      |

The range is wide because it depends on:
- Topic competitiveness (your niche is moderately competitive)
- AdSense approval timing (2–4 wks)
- Google indexing (2–8 wks per page)
- Click-through / conversion rates (unknowable until live)

Not life-changing. But real, not speculative, and doesn't require any of your time once the IDs are pasted.

---

## What you should NOT do

- Don't click your own ads. AdSense bans for this. Use a different device / incognito / VPN if you need to verify ads render.
- Don't generate pages that are pure keyword farms. Google demotes them and AdSense can pull your approval.
- Don't add affiliate links for products you wouldn't genuinely recommend. Low conversion + readers bounce.

The current `seo-topic-generator.mjs` prompt already optimizes for quality — each page is 500+ words of real technical content. Keep it that way.
