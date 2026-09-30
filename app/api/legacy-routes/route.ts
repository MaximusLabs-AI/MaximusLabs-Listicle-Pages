import {NextResponse} from 'next/server'

import {sanityClient} from '@/sanity/lib/client'
import {legacyRoutesQuery} from '@/sanity/lib/queries'

// The Cloudflare worker's routing list, read live from Sanity. The worker caches
// it for 60 seconds, so publishing in Sanity takes effect within about a minute
// with no deploy or Cloudflare change:
// - pages: old-folder addresses the app serves in the new design (listicles, and
//   articles created in Sanity with "Replaces old page"). Every other address in
//   those folders stays on Webflow.
// - redirects: /blog/<slug> -> old-folder URL, for those pages and for the
//   migrated articles (whose old pages stay on Webflow).
// A page claiming a migrated article's address is left out entirely, so the
// migrated articles' pages can never be taken over.
export const dynamic = 'force-dynamic'

type Row = {_type: 'infoArticle' | 'listiclePage'; slug: string; url: string; takeover: boolean}

const path = (url: string) => {
  const p = new URL(url).pathname
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p
}

export async function GET() {
  const rows = await sanityClient.fetch<Row[]>(legacyRoutesQuery)
  const migratedPaths = new Set(rows.filter((r) => !r.takeover).map((r) => path(r.url)))
  const usable = rows.filter((r) => !r.takeover || !migratedPaths.has(path(r.url)))

  const pages = [...new Set(usable.filter((r) => r.takeover).map((r) => path(r.url)))]
  const redirects = Object.fromEntries(usable.map((r) => [`/blog/${r.slug}`, r.url]))

  return NextResponse.json({pages, redirects}, {headers: {'cache-control': 'public, max-age=60'}})
}
