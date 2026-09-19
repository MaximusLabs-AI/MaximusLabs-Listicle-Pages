import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {infoArticleQuery, listiclePageQuery} from '@/sanity/lib/queries'
import {AboutAuthor} from '@/app/components/AboutAuthor'
import {RelatedPosts} from '@/app/components/RelatedPosts'
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

  // Both types share the global chrome + Related Posts. Informational articles
  // carry the sticky author/booking card as a right column inside the template;
  // listicles keep their full-width content and get the About-the-Author section
  // at the bottom instead (the right card was cramping the comparison tables).
  if (entry.kind === 'listicle') {
    return (
      <>
        <SiteHeader />
        <ListicleTemplate page={entry.page} />
        <AboutAuthor />
        <RelatedPosts slug={slug} />
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <InfoArticleTemplate article={entry.article} />
      <RelatedPosts slug={slug} />
      <SiteFooter />
    </>
  )
}
