/**
 * MaximusLabs blog reverse-proxy (Cloudflare Worker)
 * -------------------------------------------------------------------------
 * Serves the Vercel-hosted Next.js blog under the primary domain, replacing
 * the old Webflow blog pages:
 *
 *     www.maximuslabs.ai/blog            -> collection
 *     www.maximuslabs.ai/blog/<slug>     -> listicle or informational article
 *     www.maximuslabs.ai/blog/sitemap.xml
 *
 * The Vercel origin is path-preserving (its collection is at /blog and entries
 * at /blog/<slug>) and sends `X-Robots-Tag: noindex`; this worker strips that
 * header so only the public maximuslabs.ai/blog URLs get indexed, keeping all
 * ranking signal on the primary domain.
 *
 * ATTACH TO THESE ROUTES (Workers > this worker > Routes), all on the zone:
 *     www.maximuslabs.ai/blog
 *     www.maximuslabs.ai/blog/*
 *     www.maximuslabs.ai/_next/*        (Next.js JS/CSS/image assets)
 *     www.maximuslabs.ai/icon.svg
 *     www.maximuslabs.ai/apple-icon
 * Everything else on the zone continues to hit Webflow untouched.
 */

// The Vercel deployment host. Use a dedicated, stable origin — a project domain
// (e.g. blog-origin.maximuslabs.ai) or the *.vercel.app production URL. It must
// stay noindex (this app already sends X-Robots-Tag: noindex).
const ORIGIN = 'maximus-labs-listicle-pages.vercel.app'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const path = url.pathname

    const isBlog = path === '/blog' || path.startsWith('/blog/')
    const isAsset =
      path.startsWith('/_next/') || path === '/icon.svg' || path === '/apple-icon'

    // Not ours -> let it fall through to Webflow (the default origin).
    if (!isBlog && !isAsset) return fetch(request)

    // Map the public path to the origin path. The origin is path-preserving,
    // except the sitemap, which Next serves at the origin root.
    let originPath = path
    if (path === '/blog/sitemap.xml') originPath = '/sitemap.xml'

    const originUrl = `https://${ORIGIN}${originPath}${url.search}`

    const originRequest = new Request(originUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    })

    const res = await fetch(originRequest)

    const headers = new Headers(res.headers)
    headers.delete('x-robots-tag') // origin is noindex; the public URL is indexable
    headers.set('x-served-by', 'maximus-blog-proxy-v1')

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  },
}
