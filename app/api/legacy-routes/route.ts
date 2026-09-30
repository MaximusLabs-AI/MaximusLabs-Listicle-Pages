import {NextResponse} from 'next/server'

import {sanityClient} from '@/sanity/lib/client'
import {legacyRoutesQuery} from '@/sanity/lib/queries'

// The Cloudflare worker's routing list, read live from Sanity. The worker caches
// it for 60 seconds, so publishing in Sanity takes effect within about a minute
// with no deploy or Cloudflare change:
// - pages: old-folder addresses the app serves (listicles whose Canonical URL is
//   there). Every other address in those folders stays on Webflow.
// - redirects: /blog/<slug> -> old-folder URL, for articles and those listicles.
// A listicle whose Canonical URL is a migrated article's URL is left out, so an
// article's page can never be taken over by mistake.
export const dynamic = 'force-dynamic'

type Row = {_type: 'infoArticle' | 'listiclePage'; slug: string; url: string}

const path = (url: string) => {
  const p = new URL(url).pathname
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p
}

export async function GET() {
  const rows = await sanityClient.fetch<Row[]>(legacyRoutesQuery)
  const articlePaths = new Set(rows.filter((r) => r._type === 'infoArticle').map((r) => path(r.url)))
  const usable = rows.filter((r) => r._type === 'infoArticle' || !articlePaths.has(path(r.url)))

  const pages = [...new Set(usable.filter((r) => r._type === 'listiclePage').map((r) => path(r.url)))]
  const redirects = Object.fromEntries(usable.map((r) => [`/blog/${r.slug}`, r.url]))

  return NextResponse.json({pages, redirects}, {headers: {'cache-control': 'public, max-age=60'}})
}
