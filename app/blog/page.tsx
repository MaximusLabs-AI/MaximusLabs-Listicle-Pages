import type {Metadata} from 'next'

import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'
import {BookCallCta} from '@/app/components/BookCallCta'
import {JsonLd} from '@/app/components/JsonLd'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {BLOG_BASE, collectionJsonLd} from '@/app/lib/seo'

import {BlogCollection, type BlogCollectionItem} from './BlogCollection'

export const metadata: Metadata = {
  title: 'Rethinking How the Internet Finds You | MaximusLabs.ai',
  description: 'Research, comparisons, and practical guidance for AEO, GEO, AI search, and technical SEO.',
  alternates: {canonical: BLOG_BASE},
}

// The collection lives at /blog so the origin path matches the public path the
// Cloudflare worker serves (maximuslabs.ai/blog). ISR keeps it fresh.
export const revalidate = 60

export default async function BlogCollectionPage() {
  const articles = await sanityClient.fetch<BlogCollectionItem[]>(blogCollectionQuery)

  return (
    <>
      <JsonLd data={collectionJsonLd(articles)} />
      <SiteHeader />
      <BlogCollection articles={articles} />
      <BookCallCta />
      <SiteFooter />
    </>
  )
}
