import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {infoArticleQuery} from '@/sanity/lib/queries'
import {SiteFooter} from '@/app/components/SiteFooter'
import {SiteHeader} from '@/app/components/SiteHeader'

import {InfoArticleTemplate, type InfoArticleDocument} from './InfoArticleTemplate'

type Props = {params: Promise<{slug: string}>}

async function getArticle(slug: string) {
  return sanityClient.fetch<InfoArticleDocument | null>(infoArticleQuery, {slug})
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) return {}

  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: article.sourceUrl ? {canonical: article.sourceUrl} : undefined,
    openGraph: article.imageUrl ? {images: [article.imageUrl]} : undefined,
  }
}

export default async function InformationalArticlePage({params}: Props) {
  const {slug} = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  return (
    <>
      <SiteHeader />
      <InfoArticleTemplate article={article} />
      <SiteFooter />
    </>
  )
}
