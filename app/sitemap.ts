import type {MetadataRoute} from 'next'

import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'
import {BLOG_BASE, blogUrl} from '@/app/lib/seo'

type Row = {slug: string; publishedAt?: string; reviewedAt?: string}

// Regenerate hourly (ISR). Served at the origin's /sitemap.xml; the Cloudflare
// worker exposes it publicly at maximuslabs.ai/blog/sitemap.xml for Search
// Console. Every URL is the public /blog/<slug> URL.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await sanityClient.fetch<Row[]>(blogCollectionQuery)

  const entries: MetadataRoute.Sitemap = rows
    .filter((r) => r.slug)
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
