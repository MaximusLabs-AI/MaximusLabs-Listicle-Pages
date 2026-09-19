import {sanityClient} from '@/sanity/lib/client'
import {relatedPostsQuery} from '@/sanity/lib/queries'
import {ArticleCard, type BlogCollectionItem} from '@/app/blog/BlogCollection'

import styles from './RelatedPosts.module.css'

export async function RelatedPosts({slug}: {slug: string}) {
  const posts = await sanityClient.fetch<BlogCollectionItem[]>(relatedPostsQuery, {slug})
  if (!posts?.length) return null

  return (
    <section className={styles.section} aria-label="Related posts">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Related Posts</h2>
        <div className={styles.grid}>
          {posts.map((post) => (
            <ArticleCard key={post._id} article={post} />
          ))}
        </div>
      </div>
    </section>
  )
}
