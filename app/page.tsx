import Link from 'next/link'

import {sanityClient} from '@/sanity/lib/client'
import {listicleIndexQuery} from '@/sanity/lib/queries'

export default async function HomePage() {
  const pages = await sanityClient.fetch(listicleIndexQuery)

  return (
    <main className="site-index">
      <p className="eyebrow">MaximusLabs.ai</p>
      <h1>Listicle pages</h1>
      <p className="index-dek">Reusable evidence-led directories managed in Sanity.</p>
      <div className="index-list">
        {pages.length ? (
          pages.map((page: { _id: string; title: string; slug: string; verticalLabel?: string; editorialStatus?: string }) => (
            <Link key={page._id} href={`/listicles/${page.slug}`}>
              <strong>{page.title}</strong>
              <span>{page.verticalLabel} · {page.editorialStatus || 'status not set'}</span>
            </Link>
          ))
        ) : (
          <p>No listicle documents have been imported yet. Open <Link href="/studio">Sanity Studio</Link> or run the workbook importer.</p>
        )}
      </div>
    </main>
  )
}
