/**
 * MaximusLabs blog reverse-proxy (Cloudflare Worker)
 * -------------------------------------------------------------------------
 * Serves the Vercel-hosted Next.js blog as a SUBDIRECTORY of the main site:
 *
 *     www.maximuslabs.ai/blog            -> collection + landing page
 *     www.maximuslabs.ai/blog/<slug>     -> listicle or informational article
 *     www.maximuslabs.ai/blog/sitemap.xml
 *
 * The navbar "Blog" link on Webflow points to /blog; this worker serves that
 * path (and the app's assets) from the Vercel origin. Everything else on the
 * domain stays on Webflow. The origin is noindex; the worker strips that so the
 * public /blog URLs index on the primary domain.
 *
 * Attach on routes: /blog, /blog/*, /_next/*, /icon.svg, /apple-icon
 */

// Must be a host configured on the Vercel project (the *.vercel.app URL or a
// custom subdomain). Not forwarding the client Host keeps requests routed here.
const ORIGIN = 'maximus-labs-listicle-pages.vercel.app'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const p = url.pathname

    // Only the blog and its assets are proxied; everything else is Webflow.
    if (!(p === '/blog' || p.startsWith('/blog/') || p.startsWith('/_next/') || p === '/icon.svg' || p === '/apple-icon')) {
      return fetch(request)
    }

    // Path-preserving, except the sitemap (Next serves it at the origin root).
    const path = p === '/blog/sitemap.xml' ? '/sitemap.xml' : p

    const res = await fetch(`https://${ORIGIN}${path}${url.search}`, {
      headers: {'X-Forwarded-Host': url.host},
    })

    const headers = new Headers(res.headers)
    headers.delete('x-robots-tag') // origin is noindex; the public /blog URL indexes
    headers.set('x-served-by', 'maximus-blog-proxy')
    return new Response(res.body, {status: res.status, headers})
  },
}
