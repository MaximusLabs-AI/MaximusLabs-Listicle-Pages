/**
 * MaximusLabs blog reverse-proxy (Cloudflare Worker)
 * -------------------------------------------------------------------------
 * Serves the Vercel-hosted Next.js blog under the primary domain, replacing the
 * old Webflow blog pages:
 *
 *     www.maximuslabs.ai/blog            -> collection
 *     www.maximuslabs.ai/blog/<slug>     -> listicle or informational article
 *     www.maximuslabs.ai/blog/sitemap.xml
 *
 * The Vercel origin is path-preserving (collection at /blog, entries at
 * /blog/<slug>) and sends `X-Robots-Tag: noindex`; this worker strips that so
 * only the public maximuslabs.ai/blog URLs get indexed.
 *
 * ATTACH TO THESE ROUTES (Worker > Settings > Domains & Routes), on the zone:
 *     www.maximuslabs.ai/blog
 *     www.maximuslabs.ai/blog/*
 *     www.maximuslabs.ai/_next/*        (Next.js JS/CSS/image assets)
 *     www.maximuslabs.ai/icon.svg
 *     www.maximuslabs.ai/apple-icon
 * Everything else on the zone keeps hitting Webflow untouched.
 */

// The Vercel deployment host. MUST be a domain configured on that Vercel project
// (the *.vercel.app production URL, or a custom subdomain like
// blog-origin.maximuslabs.ai). It stays noindex — this app already sends that.
const ORIGIN = 'maximus-labs-listicle-pages.vercel.app'

const TAG = 'maximus-blog-proxy-v1'

function owns(path) {
  return (
    path === '/blog' ||
    path.startsWith('/blog/') ||
    path.startsWith('/_next/') ||
    path === '/icon.svg' ||
    path === '/apple-icon'
  )
}

export default {
  async fetch(request) {
    const url = new URL(request.url)

    // Not one of ours -> let Cloudflare serve it from Webflow (the zone origin).
    if (!owns(url.pathname)) return fetch(request)

    // Build the origin URL. Path-preserving, except the sitemap, which Next
    // serves at the origin root.
    const target = new URL(url)
    target.protocol = 'https:'
    target.hostname = ORIGIN
    target.port = ''
    if (url.pathname === '/blog/sitemap.xml') target.pathname = '/sitemap.xml'

    // Forward the client's headers, but drop `host` so the request is routed to
    // (and identified as) the origin; tell the origin the real public host.
    const fwd = new Headers(request.headers)
    fwd.delete('host')
    fwd.set('x-forwarded-host', url.host)
    fwd.set('x-forwarded-proto', 'https')

    const init = {
      method: request.method,
      headers: fwd,
      redirect: 'manual', // pass origin redirects through to the browser
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    }

    // Fallback: never 500 the whole page if the origin hiccups.
    let res
    try {
      res = await fetch(target, init)
    } catch {
      return new Response('The blog is briefly unavailable. Please refresh in a moment.', {
        status: 502,
        headers: {'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-served-by': TAG},
      })
    }

    const headers = new Headers(res.headers)
    headers.delete('x-robots-tag') // origin is noindex; the public URL should index
    headers.set('x-served-by', TAG)

    // If the origin ever returns an absolute redirect to itself, rewrite it back
    // to the public host so we never leak the origin domain.
    const loc = headers.get('location')
    if (loc) headers.set('location', loc.replaceAll(`https://${ORIGIN}`, `https://${url.host}`))

    // Body streams straight through (no buffering); cacheable responses are
    // edge-cached by Cloudflare using the origin's Cache-Control (Next ISR +
    // immutable static assets), so repeat hits are fast.
    return new Response(res.body, {status: res.status, statusText: res.statusText, headers})
  },
}
