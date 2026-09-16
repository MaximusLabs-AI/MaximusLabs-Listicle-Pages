import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {listiclePageQuery} from '@/sanity/lib/queries'

import {ListicleTemplate} from './ListicleTemplate'

type Props = {params: Promise<{slug: string}>}

async function getPage(slug: string) {
  return sanityClient.fetch(listiclePageQuery, {slug})
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const page = await getPage(slug)
  if (!page) return {}
  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.dek,
    alternates: page.canonicalUrl ? {canonical: page.canonicalUrl} : undefined,
  }
}

export default async function ListiclePage({params}: Props) {
  const {slug} = await params
  const page = await getPage(slug)
  if (!page) notFound()
  return <ListicleTemplate page={page} />
}
