import type {Metadata} from 'next'

import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'

import {BlogCollection, type BlogCollectionItem} from './BlogCollection'

export const metadata: Metadata = {
  title: 'Rethinking How the Internet Finds You | MaximusLabs.ai',
  description: 'Research, comparisons, and practical guidance for AEO, GEO, AI search, and technical SEO.',
}

export default async function BlogPage() {
  const articles = await sanityClient.fetch<BlogCollectionItem[]>(blogCollectionQuery)

  return <BlogCollection articles={articles} />
}
