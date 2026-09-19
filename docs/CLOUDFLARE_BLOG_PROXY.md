# Serving this blog under maximuslabs.ai/blog (Cloudflare proxy)

Goal: make the Vercel-hosted Next.js blog appear at `maximuslabs.ai/blog/*`,
replacing the old Webflow blog, so users and Google see one domain and all SEO
signal stays on the primary domain. Same pattern as AI Search 101.

```
maximuslabs.ai (Webflow)          homepage, services, /company/*, /ai-search-101/*
maximuslabs.ai/blog/*      ->      Cloudflare Worker (thin reverse proxy)
                                        |
                                        v
                                   <vercel origin>  (this Next.js app, noindex)
                                        |
                                        v
                                   Sanity Content Lake
```

## How the app is already wired for this

- **Path-preserving:** the collection is served at `/blog` and entries at
  `/blog/<slug>` on the origin — the same paths as the public URLs, so
  client-side navigation and canonicals line up. (`/` redirects to `/blog`.)
- **Origin is noindex:** `next.config.ts` sends `X-Robots-Tag: noindex` on every
  origin response. The worker strips it for the public URLs.
- **Canonicals** point at `https://www.maximuslabs.ai/blog/<slug>`.
- **Structured data** (JSON-LD) is emitted per page: BlogPosting + Breadcrumb on
  articles; Article + ItemList + FAQPage + Breadcrumb on listicles; WebSite +
  Organization + CollectionPage on the collection.
- **Sitemap** at the origin `/sitemap.xml`, listing the public
  `maximuslabs.ai/blog/...` URLs; the worker exposes it at
  `maximuslabs.ai/blog/sitemap.xml`.

## Steps

1. **Give the origin a stable host.** Either keep the `*.vercel.app` production
   URL or (recommended) add a project domain like `blog-origin.maximuslabs.ai`
   in Vercel + Cloudflare DNS (proxied is fine). Do NOT index this host — the
   app already sends `noindex`.

2. **Set `ORIGIN`** at the top of `cloudflare/blog-proxy-worker.js` to that host.

3. **Create the Worker** (Cloudflare dashboard > Workers & Pages > Create >
   Worker, or `wrangler deploy`), paste `blog-proxy-worker.js`.

4. **Add the routes** to the worker (Worker > Settings > Domains & Routes), all
   on the maximuslabs.ai zone:
   - `www.maximuslabs.ai/blog`
   - `www.maximuslabs.ai/blog/*`
   - `www.maximuslabs.ai/_next/*`
   - `www.maximuslabs.ai/icon.svg`
   - `www.maximuslabs.ai/apple-icon`

   (If the canonical host is the apex `maximuslabs.ai`, add the same patterns for
   it too, or ensure www<->apex redirects run before the worker.)

5. **Unlink the Webflow blog** for the `/blog/*` paths so Webflow no longer
   answers them (delete/unpublish those Webflow pages or their CMS collection
   route). The worker now owns `/blog/*`.

6. **Search Console:** submit `https://www.maximuslabs.ai/blog/sitemap.xml`, and
   add that line to the site's robots.txt:
   `Sitemap: https://www.maximuslabs.ai/blog/sitemap.xml`

## Verify after deploy

- `curl -sI https://www.maximuslabs.ai/blog` → 200, no `x-robots-tag`, header
  `x-served-by: maximus-blog-proxy-v1`.
- `curl -sI https://<origin>/blog` → 200 **with** `x-robots-tag: noindex`.
- Open a `/blog/<slug>` page: styles/JS load (`/_next/*` proxied), canonical is
  the maximuslabs.ai/blog URL, and Rich Results Test shows the JSON-LD.
- `https://www.maximuslabs.ai/blog/sitemap.xml` returns the URL set.
