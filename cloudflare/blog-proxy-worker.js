/**
 * MaximusLabs blog reverse-proxy (Cloudflare Worker)
 * -------------------------------------------------------------------------
 * Serves the Vercel-hosted Next.js blog as part of the main site:
 *
 *     www.maximuslabs.ai/blog            -> collection + landing page
 *     www.maximuslabs.ai/blog/<slug>     -> listicle, or a 301 to the page's old URL
 *     www.maximuslabs.ai/blog/sitemap.xml
 *
 * It also serves a page created in Sanity at an old Webflow-folder address
 * (/answer-engine-optimizations/<x>, /generative-engine-optimization/<x>): a
 * listicle whose Canonical URL is that address, or an article whose "Replaces old
 * page" is. Which addresses those are comes from the app's routing list, read live
 * from Sanity, so publishing in Sanity is enough. Every other page in those
 * folders, including the migrated articles, stays on Webflow.
 *
 * Everything else on the domain stays on Webflow. The origin is noindex; the
 * worker strips that so the public URLs index on the primary domain.
 *
 * Attach on routes:
 *   www.maximuslabs.ai/blog*   (the /blog page with or without tags, and all of /blog/)
 *   www.maximuslabs.ai/answer-engine-optimizations/*
 *   www.maximuslabs.ai/generative-engine-optimization/*
 *   www.maximuslabs.ai/_next/*, /icon.svg, /apple-icon
 */

// Must be a host configured on the Vercel project (the *.vercel.app URL or a
// custom subdomain). Not forwarding the client Host keeps requests routed here.
const ORIGIN = 'maximus-labs-listicle-pages.vercel.app'
const LEGACY_FOLDERS = ['/answer-engine-optimizations/', '/generative-engine-optimization/']

// { pages: [old-folder paths the app serves], redirects: { '/blog/<slug>': url } },
// built by the app from Sanity and cached at the edge for 60 seconds. Null when it
// cannot be read: old-folder pages then stay on Webflow and the app answers /blog
// itself, which is how the site worked before this list existed.
async function legacyRoutes() {
  try {
    const res = await fetch(`https://${ORIGIN}/api/legacy-routes`, {cf: {cacheTtl: 60, cacheEverything: true}})
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

const trimSlash = (p) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p)

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const p = url.pathname
    const isBlog = p === '/blog' || p.startsWith('/blog/')
    const isLegacyFolder = LEGACY_FOLDERS.some((folder) => p.startsWith(folder))
    const isAsset = p.startsWith('/_next/') || p === '/icon.svg' || p === '/apple-icon'

    // Not ours (e.g. /blog-tags/*): straight to Webflow.
    if (!isBlog && !isLegacyFolder && !isAsset) return fetch(request)

    if (isBlog || isLegacyFolder) {
      const routes = await legacyRoutes()
      if (isBlog) {
        // A page that lives at its old URL: send the permanent redirect here, so it
        // takes effect as soon as it is published, without a deploy.
        const target = routes?.redirects?.[trimSlash(p)]
        if (target) {
          return new Response(null, {status: 301, headers: {location: target + url.search, 'x-served-by': 'maximus-blog-proxy'}})
        }
      } else if (!routes?.pages?.includes(trimSlash(p))) {
        // No listicle published at this old address: the Webflow page.
        return fetch(request)
      }
    }

    // Path-preserving, except the sitemap (Next serves it at the origin root).
    const path = p === '/blog/sitemap.xml' ? '/sitemap.xml' : p

    // redirect: 'manual' passes the app's own redirects to the browser. The default
    // ('follow') would fetch the target itself and serve it here with a 200.
    const res = await fetch(`https://${ORIGIN}${path}${url.search}`, {
      headers: {'X-Forwarded-Host': url.host},
      redirect: 'manual',
    })

    const headers = new Headers(res.headers)
    headers.delete('x-robots-tag') // origin is noindex; the public URL indexes
    headers.set('x-served-by', 'maximus-blog-proxy')
    return new Response(res.body, {status: res.status, headers})
  },
}
