import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {sanityClient} from '@/sanity/lib/client'
import {listicleByUrlQuery} from '@/sanity/lib/queries'
import {ListicleView, listicleMetadata} from '@/app/components/ListicleView'
import {SITE} from '@/app/lib/seo'

type Props = {params: Promise<{slug: string}>}
type ListiclePage = Record<string, unknown> & {slug?: string}

// Serves a listicle at an old Webflow-folder URL, when its Canonical URL in Sanity
// is that address. The Cloudflare worker sends only the addresses that have their
// own route to this app, so every other page in these folders stays on Webflow.
export function legacyListicleRoute(folder: 'answer-engine-optimizations' | 'generative-engine-optimization') {
  async function load(slug: string) {
    const url = `${SITE}/${folder}/${slug}`
    const page = await sanityClient.fetch<ListiclePage | null>(listicleByUrlQuery, {url})
    return page ? {page, url} : null
  }

  async function generateMetadata({params}: Props): Promise<Metadata> {
    const found = await load((await params).slug)
    return found ? listicleMetadata(found.page, found.url) : {}
  }

  async function LegacyListiclePage({params}: Props) {
    const found = await load((await params).slug)
    if (!found) notFound()
    return <ListicleView page={found.page} slug={String(found.page.slug)} url={found.url} />
  }

  return {generateMetadata, LegacyListiclePage}
}
