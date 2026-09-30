import type {Metadata} from 'next'

import {AboutAuthor} from '@/app/components/AboutAuthor'
import {JsonLd} from '@/app/components/JsonLd'
import {RelatedPosts} from '@/app/components/RelatedPosts'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {listicleJsonLd} from '@/app/lib/seo'
import {ListicleTemplate} from '@/app/listicles/[slug]/ListicleTemplate'

type ListiclePageData = Record<string, unknown>

// Page metadata for a listicle, with the canonical set to the URL it is published at.
export function listicleMetadata(page: ListiclePageData, url: string): Metadata {
  const p = page as Record<string, string | undefined>
  return {
    title: p.seoTitle || p.title,
    description: p.metaDescription || p.dek,
    alternates: {canonical: url},
    openGraph: {type: 'article', url, title: p.seoTitle || p.title, description: p.metaDescription || p.dek},
  }
}

// The full listicle page. Rendered at /blog/<slug>, or at an old-folder URL when
// the listicle is published there. `url` is the public URL either way.
export function ListicleView({page, slug, url}: {page: ListiclePageData; slug: string; url: string}) {
  return (
    <>
      <JsonLd data={listicleJsonLd({...page, slug, url} as Parameters<typeof listicleJsonLd>[0])} />
      <SiteHeader />
      <ListicleTemplate page={page} />
      <AboutAuthor />
      <RelatedPosts slug={slug} />
      <SiteFooter />
    </>
  )
}
