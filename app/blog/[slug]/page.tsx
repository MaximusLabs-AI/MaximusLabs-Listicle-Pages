import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {infoArticleQuery, listiclePageQuery} from '@/sanity/lib/queries'
import {JsonLd} from '@/app/components/JsonLd'
import {ListicleView, listicleMetadata} from '@/app/components/ListicleView'
import {RelatedPosts} from '@/app/components/RelatedPosts'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {articleJsonLd, blogUrl} from '@/app/lib/seo'

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

  // Canonical always points to the public /blog/<slug> URL (not the legacy
  // Webflow sourceUrl, which was telling Google the page lived elsewhere).
  const canonical = blogUrl(slug)

  if (entry.kind === 'listicle') return listicleMetadata(entry.page, canonical)

  const article = entry.article
  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: {canonical},
    openGraph: {
      type: 'article',
      url: canonical,
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  }
}

export default async function BlogEntryPage({params}: Props) {
  const {slug} = await params
  const entry = await resolveEntry(slug)
  if (!entry) notFound()

  // A migrated article, or a listicle published at an old-folder URL, lives at
  // that URL; next.config.ts sends the 301. This covers a mapping added after the
  // last deploy, so the /blog copy is never served.
  const legacyUrl = (entry.kind === 'article' ? entry.article : entry.page) as {legacyUrl?: string}
  if (legacyUrl.legacyUrl) permanentRedirect(legacyUrl.legacyUrl)

  // Both types share the global chrome + Related Posts. Informational articles
  // carry the sticky author/booking card as a right column inside the template;
  // listicles keep their full-width content and get the About-the-Author section
  // at the bottom instead (the right card was cramping the comparison tables).
  if (entry.kind === 'listicle') return <ListicleView page={entry.page} slug={slug} url={blogUrl(slug)} />

  return (
    <>
      <JsonLd data={articleJsonLd({...entry.article, slug})} />
      <SiteHeader />
      <InfoArticleTemplate article={entry.article} />
      <RelatedPosts slug={slug} />
      <SiteFooter />
    </>
  )
}
