import type {MetadataRoute} from 'next'

import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'
import {BLOG_BASE, blogUrl} from '@/app/lib/seo'

type Row = {slug: string; href?: string; publishedAt?: string; reviewedAt?: string}

// Regenerate hourly (ISR). Served at the origin's /sitemap.xml; the Cloudflare
// worker exposes it publicly at maximuslabs.ai/blog/sitemap.xml for Search
// Console. Lists only pages that live on /blog: migrated articles 301 to their
// original URL, which Webflow's own sitemap already lists.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await sanityClient.fetch<Row[]>(blogCollectionQuery)

  const entries: MetadataRoute.Sitemap = rows
    .filter((r) => r.slug && !r.href?.startsWith('http'))
    .map((r) => ({
      url: blogUrl(r.slug),
      lastModified: r.publishedAt || r.reviewedAt || undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  return [
    {url: BLOG_BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1},
    ...entries,
  ]
}
