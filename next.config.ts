import {createClient} from '@sanity/client'
import type {NextConfig} from 'next'

import {legacyUrlGroq} from './sanity/lib/legacyRules'

// /blog/<slug> -> the page's old-folder URL, as true 301s (rule in
// sanity/lib/legacyRules.ts). A backup: the Cloudflare worker sends these 301s
// live from Sanity. Read at build time; anything newer is caught by the /blog
// page itself (app/blog/[slug]/page.tsx), so nothing is ever served twice.
async function legacyRedirects() {
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
      `*[_type in ["infoArticle", "listiclePage"] && defined(slug.current)]{"slug": slug.current, "url": ${legacyUrlGroq}}[defined(url)]`,
    )
    return rows.map((r) => ({source: `/blog/${r.slug}`, destination: r.url, statusCode: 301 as const}))
  } catch (error) {
    console.warn('Could not load legacy redirects from Sanity; the page-level redirect still applies.', error)
    return []
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Listicles moved under the unified /blog path.
      {source: '/listicles/:slug', destination: '/blog/:slug', permanent: true},
      ...(await legacyRedirects()),
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
