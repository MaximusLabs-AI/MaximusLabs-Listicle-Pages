import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {infoArticleQuery, listiclePageQuery} from '@/sanity/lib/queries'
import {ArticleView, articleMetadata} from '@/app/components/ArticleView'
import {ListicleView, listicleMetadata} from '@/app/components/ListicleView'
import {blogUrl} from '@/app/lib/seo'

import type {InfoArticleDocument} from './InfoArticleTemplate'

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
  const url = blogUrl(slug)
  return entry.kind === 'listicle' ? listicleMetadata(entry.page, url) : articleMetadata(entry.article, url)
}

export default async function BlogEntryPage({params}: Props) {
  const {slug} = await params
  const entry = await resolveEntry(slug)
  if (!entry) notFound()

  // A page that lives at an old-folder URL (see sanity/lib/legacyRules.ts): the
  // worker and next.config.ts send the 301. This covers anything they have not
  // picked up yet, so the /blog copy is never served.
  const {legacyUrl} = (entry.kind === 'article' ? entry.article : entry.page) as {legacyUrl?: string}
  if (legacyUrl) permanentRedirect(legacyUrl)

  // Informational articles carry the sticky author/booking card as a right column
  // inside the template; listicles keep their full-width content and get the
  // About-the-Author section at the bottom (the right card cramped the tables).
  return entry.kind === 'listicle'
    ? <ListicleView page={entry.page} slug={slug} url={blogUrl(slug)} />
    : <ArticleView article={entry.article} url={blogUrl(slug)} />
}
