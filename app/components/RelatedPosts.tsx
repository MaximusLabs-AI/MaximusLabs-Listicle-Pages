import Link from 'next/link'

import {sanityClient} from '@/sanity/lib/client'
import {relatedPostsQuery} from '@/sanity/lib/queries'

import styles from './RelatedPosts.module.css'

type RelatedPost = {
  _id: string
  title: string
  slug: string
  dek?: string
  serviceName?: string
  href: string
}

// Short cover phrase: the core topic from the title, with listicle prefixes and
// a trailing generic noun trimmed, and the optimisation terms abbreviated —
// mirrors the collection covers so related cards feel like the same system.
function coverKeyword(title: string): string {
  return (
    title
      .split(/:\s|\s[|–—]\s/)[0]
      .replace(/^the\s+/i, '')
      .replace(/^\d+\s+/, '')
      .replace(/^(best|top(\s+\d+)?)\s+/i, '')
      .replace(/^(what\s+(is|are)|how\s+(to|do|does))\s+/i, '')
      .replace(/\s+(companies|company|businesses|business|brands|teams|firms)\s*$/i, '')
      .replace(/[?.!]+$/, '')
      .replace(/answer engine optimi[sz]ation/gi, 'AEO')
      .replace(/generative engine optimi[sz]ation/gi, 'GEO')
      .replace(/search engine optimi[sz]ation/gi, 'SEO')
      .trim() || title
  )
}

const VARIANTS = ['v1', 'v2', 'v3', 'v4'] as const

export async function RelatedPosts({slug}: {slug: string}) {
  const posts = await sanityClient.fetch<RelatedPost[]>(relatedPostsQuery, {slug})
  if (!posts?.length) return null

  return (
    <section className={styles.section} aria-label="Related posts">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Related Posts</h2>
        <div className={styles.grid}>
          {posts.map((post, index) => (
            <Link className={styles.card} key={post._id} href={post.href || `/blog/${post.slug}`}>
              <div className={`${styles.cover} ${styles[VARIANTS[index % 4]]}`} aria-hidden="true">
                <span className={styles.coverKeyword}>{coverKeyword(post.title)}</span>
              </div>
              <p className={styles.cardTitle}>{post.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
