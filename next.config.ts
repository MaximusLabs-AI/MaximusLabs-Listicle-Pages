import {createClient} from '@sanity/client'
import type {NextConfig} from 'next'

// /blog/<slug> -> the article's original Webflow URL, as true 301s. Same filter
// as `legacyUrl` in sanity/lib/queries.ts. Read at build time, so a newly added
// legacy article takes effect on the next deploy; until then the article page
// itself redirects (app/blog/[slug]/page.tsx), so nothing is ever served twice.
async function legacyArticleRedirects() {
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'zhc68b02',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
      apiVersion: '2026-09-16',
      token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
      useCdn: false,
      perspective: 'published',
    })
    const rows = await client.fetch<{slug: string; url: string}[]>(
      `*[_type == "infoArticle" && defined(slug.current) && defined(sourceUrl) && !string::startsWith(sourceUrl, "https://www.maximuslabs.ai/blog/")]{"slug": slug.current, "url": sourceUrl}`,
    )
    return rows.map((r) => ({source: `/blog/${r.slug}`, destination: r.url, statusCode: 301 as const}))
  } catch (error) {
    console.warn('Could not load legacy article redirects from Sanity; the page-level redirect still applies.', error)
    return []
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Listicles moved under the unified /blog path.
      {source: '/listicles/:slug', destination: '/blog/:slug', permanent: true},
      ...(await legacyArticleRedirects()),
    ]
  },
  // The Vercel origin must never be indexed directly — only the public
  // maximuslabs.ai/blog/* URLs (served through the Cloudflare worker, which
  // strips this header) should be. Keeps ranking signal on the primary domain.
  async headers() {
    return [
      {source: '/:path*', headers: [{key: 'X-Robots-Tag', value: 'noindex'}]},
    ]
  },
}

export default nextConfig
