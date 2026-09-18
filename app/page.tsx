import type {Metadata} from 'next'

import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'
import {BookCallCta} from '@/app/components/BookCallCta'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'

import {BlogCollection, type BlogCollectionItem} from './blog/BlogCollection'

export const metadata: Metadata = {
  title: 'Rethinking How the Internet Finds You | MaximusLabs.ai',
  description: 'Research, comparisons, and practical guidance for AEO, GEO, AI search, and technical SEO.',
}

export default async function HomePage() {
  const articles = await sanityClient.fetch<BlogCollectionItem[]>(blogCollectionQuery)

  return (
    <>
      <SiteHeader />
      <BlogCollection articles={articles} />
      <BookCallCta />
      <SiteFooter />
    </>
  )
}
