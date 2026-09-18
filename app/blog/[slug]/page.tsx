import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {infoArticleQuery, listiclePageQuery} from '@/sanity/lib/queries'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {ListicleTemplate} from '@/app/listicles/[slug]/ListicleTemplate'

import {InfoArticleTemplate, type InfoArticleDocument} from './InfoArticleTemplate'

type Props = {params: Promise<{slug: string}>}

const entryTypeQuery = `*[slug.current == $slug && _type in ["listiclePage", "infoArticle"]][0]._type`

type ResolvedEntry =
  | {kind: 'listicle'; page: Record<string, unknown>}
  | {kind: 'article'; article: InfoArticleDocument}

async function resolveEntry(slug: string): Promise<ResolvedEntry | null> {
  const type = await sanityClient.fetch<string | null>(entryTypeQuery, {slug})
  if (type === 'listiclePage') {
    const page = await sanityClient.fetch<Record<string, unknown> | null>(listiclePageQuery, {slug})
    return page ? {kind: 'listicle', page} : null
  }
  if (type === 'infoArticle') {
    const article = await sanityClient.fetch<InfoArticleDocument | null>(infoArticleQuery, {slug})
    return article ? {kind: 'article', article} : null
  }
  return null
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const entry = await resolveEntry(slug)
  if (!entry) return {}

  if (entry.kind === 'listicle') {
    const page = entry.page as Record<string, string | undefined>
    return {
      title: page.seoTitle || page.title,
      description: page.metaDescription || page.dek,
      alternates: page.canonicalUrl ? {canonical: page.canonicalUrl} : undefined,
    }
  }

  const article = entry.article
  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: article.sourceUrl ? {canonical: article.sourceUrl} : undefined,
    openGraph: article.imageUrl ? {images: [article.imageUrl]} : undefined,
  }
}

export default async function BlogEntryPage({params}: Props) {
  const {slug} = await params
  const entry = await resolveEntry(slug)
  if (!entry) notFound()

  // Listicle pages are self-contained (own masthead/nav/footer); articles use
  // the shared site chrome.
  if (entry.kind === 'listicle') {
    return <ListicleTemplate page={entry.page} />
  }

  return (
    <>
      <SiteHeader />
      <InfoArticleTemplate article={entry.article} />
      <SiteFooter />
    </>
  )
}
