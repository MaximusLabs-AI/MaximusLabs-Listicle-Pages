import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {articleByUrlQuery, listicleByUrlQuery} from '@/sanity/lib/queries'
import type {InfoArticleDocument} from '@/app/blog/[slug]/InfoArticleTemplate'
import {ArticleView, articleMetadata} from '@/app/components/ArticleView'
import {ListicleView, listicleMetadata} from '@/app/components/ListicleView'
import {SITE} from '@/app/lib/seo'

type Props = {params: Promise<{slug: string}>}
type Found =
  | {kind: 'listicle'; page: Record<string, unknown> & {slug?: string}; url: string}
  | {kind: 'article'; article: InfoArticleDocument; url: string}

// Serves a page created in Sanity at an old Webflow-folder address, in the new
// design: a listicle whose Canonical URL is that address, or an article whose
// "Replaces old page" is. The Cloudflare worker sends only the addresses on its
// routing list (app/api/legacy-routes) here; every other page in these folders,
// including the migrated articles, stays on Webflow.
export function legacyPageRoute(folder: 'answer-engine-optimizations' | 'generative-engine-optimization') {
  async function load(slug: string): Promise<Found | null> {
    const url = `${SITE}/${folder}/${slug}`
    const page = await sanityClient.fetch<(Record<string, unknown> & {slug?: string}) | null>(listicleByUrlQuery, {url})
    if (page) return {kind: 'listicle', page, url}
    const article = await sanityClient.fetch<InfoArticleDocument | null>(articleByUrlQuery, {url})
    return article ? {kind: 'article', article, url} : null
  }

  async function generateMetadata({params}: Props): Promise<Metadata> {
    const found = await load((await params).slug)
    if (!found) return {}
    return found.kind === 'listicle' ? listicleMetadata(found.page, found.url) : articleMetadata(found.article, found.url)
  }

  async function LegacyPage({params}: Props) {
    const found = await load((await params).slug)
    if (!found) notFound()
    return found.kind === 'listicle'
      ? <ListicleView page={found.page} slug={String(found.page.slug)} url={found.url} />
      : <ArticleView article={found.article} url={found.url} />
  }

  return {generateMetadata, LegacyPage}
}
