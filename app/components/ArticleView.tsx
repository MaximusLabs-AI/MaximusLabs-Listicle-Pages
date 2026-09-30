import type {Metadata} from 'next'

import {JsonLd} from '@/app/components/JsonLd'
import {RelatedPosts} from '@/app/components/RelatedPosts'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'
import {InfoArticleTemplate, type InfoArticleDocument} from '@/app/blog/[slug]/InfoArticleTemplate'
import {articleJsonLd} from '@/app/lib/seo'

// Page metadata for an informational article, with the canonical set to the URL it
// is published at.
export function articleMetadata(article: InfoArticleDocument, url: string): Metadata {
  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: {canonical: url},
    openGraph: {
      type: 'article',
      url,
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : undefined,
    },
  }
}

// The full article page. Rendered at /blog/<slug>, or at an old-folder URL when an
// article created in Sanity replaces that page. `url` is the public URL either way.
export function ArticleView({article, url}: {article: InfoArticleDocument; url: string}) {
  return (
    <>
      <JsonLd data={articleJsonLd({...article, url})} />
      <SiteHeader />
      <InfoArticleTemplate article={article} />
      <RelatedPosts slug={article.slug} />
      <SiteFooter />
    </>
  )
}
