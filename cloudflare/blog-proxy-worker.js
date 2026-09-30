/**
 * MaximusLabs blog reverse-proxy (Cloudflare Worker)
 * -------------------------------------------------------------------------
 * Serves the Vercel-hosted Next.js blog as a SUBDIRECTORY of the main site:
 *
 *     www.maximuslabs.ai/blog            -> collection + landing page
 *     www.maximuslabs.ai/blog/<slug>     -> listicle or informational article
 *     www.maximuslabs.ai/blog/sitemap.xml
 *
 * It also serves a listicle published at an old Webflow-folder URL
 * (/answer-engine-optimizations/<x>, /generative-engine-optimization/<x>). Only
 * those exact addresses have a route; the rest of those folders stays on Webflow.
 *
 * The navbar "Blog" link on Webflow points to /blog; this worker serves that
 * path (and the app's assets) from the Vercel origin. Everything else on the
 * domain stays on Webflow. The origin is noindex; the worker strips that so the
 * public /blog URLs index on the primary domain.
 *
 * Attach on routes:
 *   www.maximuslabs.ai/blog*   (the /blog page with or without tags, and all of /blog/)
 *   www.maximuslabs.ai/_next/*, /icon.svg, /apple-icon
 *   one route per listicle published at an old-folder URL, ending in *, e.g.
 *   www.maximuslabs.ai/answer-engine-optimizations/b2b-saas-aeo-geo-agencies*
 * Never add a whole-folder route such as /answer-engine-optimizations/*: the
 * migrated articles in those folders must keep coming from Webflow.
 */

// Must be a host configured on the Vercel project (the *.vercel.app URL or a
// custom subdomain). Not forwarding the client Host keeps requests routed here.
const ORIGIN = 'maximus-labs-listicle-pages.vercel.app'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const p = url.pathname

    // The blog, its assets, and old-folder listicles (reached only via their own
    // routes) are proxied; everything else, such as /blog-tags/*, is Webflow.
    const legacyListicle = p.startsWith('/answer-engine-optimizations/') || p.startsWith('/generative-engine-optimization/')
    if (!(p === '/blog' || p.startsWith('/blog/') || legacyListicle || p.startsWith('/_next/') || p === '/icon.svg' || p === '/apple-icon')) {
      return fetch(request)
    }

    // Path-preserving, except the sitemap (Next serves it at the origin root).
    const path = p === '/blog/sitemap.xml' ? '/sitemap.xml' : p

    // redirect: 'manual' passes the app's redirects (e.g. /blog/<article> 301 ->
    // its original URL) to the browser. The default ('follow') would fetch the
    // target itself and serve it at the /blog URL with a 200.
    const res = await fetch(`https://${ORIGIN}${path}${url.search}`, {
      headers: {'X-Forwarded-Host': url.host},
      redirect: 'manual',
    })

    const headers = new Headers(res.headers)
    headers.delete('x-robots-tag') // origin is noindex; the public /blog URL indexes
    headers.set('x-served-by', 'maximus-blog-proxy')
    return new Response(res.body, {status: res.status, headers})
  },
}
