import {sanityClient} from '@/sanity/lib/client'
import {blogCollectionQuery} from '@/sanity/lib/queries'
import {ArticleCard} from '@/app/blog/BlogCollection'
import {type BlogCollectionItem, getAiSearches, getIndustries, getServices} from '@/app/blog/classify'

import styles from './RelatedPosts.module.css'

function dateValue(a: BlogCollectionItem): number {
  const d = a.publishedAt || a.reviewedAt
  return d ? new Date(`${d}T00:00:00Z`).getTime() : 0
}

export async function RelatedPosts({slug}: {slug: string}) {
  const all = await sanityClient.fetch<BlogCollectionItem[]>(blogCollectionQuery)
  if (!all?.length) return null

  const current = all.find((a) => a.slug === slug || a.href === `/blog/${slug}`)
  const others = all.filter((a) => a.slug !== current?.slug)
  if (!others.length) return null

  // Rank by how much each post shares with the current one, using the same
  // classifiers as the collection filters: service is the strongest signal, then
  // industry and AI-search area. Posts with no overlap fall back to recency, so
  // four cards always fill — and different pages surface genuinely different,
  // topically-related posts instead of the same four.
  let related: BlogCollectionItem[]
  if (current) {
    const curServices = new Set(getServices(current))
    const curIndustries = new Set(getIndustries(current))
    const curAreas = new Set(getAiSearches(current))
    const score = (a: BlogCollectionItem) => {
      let s = 0
      for (const v of getServices(a)) if (curServices.has(v)) s += 3
      for (const v of getIndustries(a)) if (curIndustries.has(v)) s += 2
      for (const v of getAiSearches(a)) if (curAreas.has(v)) s += 2
      return s
    }
    related = others
      .map((a) => ({a, s: score(a)}))
      .sort((x, y) => y.s - x.s || dateValue(y.a) - dateValue(x.a))
      .slice(0, 4)
      .map((x) => x.a)
  } else {
    related = [...others].sort((x, y) => dateValue(y) - dateValue(x)).slice(0, 4)
  }

  return (
    <section className={styles.section} aria-label="Related posts">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Related Posts</h2>
        <div className={styles.grid}>
          {related.map((post) => (
            <ArticleCard key={post._id} article={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
