import Link from 'next/link'

import styles from './InfoArticleTemplate.module.css'

export type InfoArticleBlock = {
  _key?: string
  kind: 'heading' | 'paragraph' | 'bulletList' | 'numberList' | 'quote' | 'image' | 'table' | 'html'
  headingLevel?: number
  tocLabel?: string
  text?: string
  items?: string[]
  url?: string
  alt?: string
  caption?: string
  html?: string
}

export type InfoArticleDocument = {
  _id: string
  title: string
  slug: string
  excerpt: string
  seoTitle?: string
  metaDescription?: string
  imageUrl?: string
  authorName?: string
  authorImageUrl?: string
  publishedAt?: string
  updatedAt?: string
  readingMinutes?: number
  service?: string
  industry?: string
  blogType?: string
  sourceUrl?: string
  body?: InfoArticleBlock[]
}

const serviceLabels: Record<string, string> = {
  aeo: 'Answer Engine Optimization',
  geo: 'GEO and AI SEO',
  b2bSeo: 'B2B SEO',
  technicalSeo: 'Technical SEO',
  agenticCommerce: 'Agentic Commerce',
}

function formatDate(value?: string) {
  if (!value) return 'Recently updated'
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value.length === 10 ? value + 'T00:00:00Z' : value))
}

function blockId(index: number) {
  return 'section-' + index
}

function ArticleBlock({block, index}: {block: InfoArticleBlock; index: number}) {
  const key = block._key || String(index)

  if (block.kind === 'heading') {
    if (block.headingLevel === 3) return <h3 id={blockId(index)} key={key}>{block.text}</h3>
    if (block.headingLevel === 4) return <h4 id={blockId(index)} key={key}>{block.text}</h4>
    return <h2 id={blockId(index)} key={key}>{block.text}</h2>
  }

  if (block.kind === 'paragraph') return <p key={key}>{block.text}</p>
  if (block.kind === 'bulletList') return <ul key={key}>{(block.items || []).map((item) => <li key={item}>{item}</li>)}</ul>
  if (block.kind === 'numberList') return <ol key={key}>{(block.items || []).map((item) => <li key={item}>{item}</li>)}</ol>
  if (block.kind === 'quote') return <blockquote key={key}>{block.text}</blockquote>

  if (block.kind === 'image' && block.url) {
    return (
      <figure key={key}>
        <img src={block.url} alt={block.alt || ''} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    )
  }

  if ((block.kind === 'table' || block.kind === 'html') && block.html) {
    return <div className={block.kind === 'table' ? styles.tableWrap : styles.embed} dangerouslySetInnerHTML={{__html: block.html}} key={key} />
  }

  return null
}

export function InfoArticleTemplate({article}: {article: InfoArticleDocument}) {
  const blocks = article.body || []
  const headings = blocks
    .map((block, index) => ({block, index}))
    .filter(({block}) => block.kind === 'heading' && block.headingLevel === 2 && block.text)

  return (
    <div className={styles.page}>
      <nav className={styles.utilityNav}>
        <div className={styles.wrap}>
          <Link href="/blog">All resources</Link>
          <span>Informational article</span>
        </div>
      </nav>

      <header className={styles.masthead}>
        <div className={styles.wrap}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">MaximusLabs.ai</Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog">Resources</Link>
            <span aria-hidden="true">/</span>
            <span>{serviceLabels[article.service || ''] || 'AI search insights'}</span>
          </nav>
          <div className={styles.heroGrid}>
            <div>
              <h1>{article.title}</h1>
              <p className={styles.dek}>{article.excerpt}</p>
              <div className={styles.byline}>
                {article.authorImageUrl ? <img src={article.authorImageUrl} alt="" /> : null}
                <span>
                  <strong>{article.authorName || 'Krishna Kaanth'}</strong>
                  <small>{formatDate(article.publishedAt)} / {article.readingMinutes || 8} min read</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.wrap}>
        <div className={styles.articleShell}>
          <aside className={styles.toc}>
            <strong>On this page</strong>
            {headings.map(({block, index}) => (
              <a href={'#' + blockId(index)} key={block._key || String(index)}>{block.tocLabel || block.text}</a>
            ))}
          </aside>

          <article className={styles.article}>
            {blocks.map((block, index) => <ArticleBlock block={block} index={index} key={block._key || String(index)} />)}
          </article>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.wrap}>
          <strong>MaximusLabs.ai</strong>
          <p>Independent guidance for visibility across search and AI answer engines.</p>
        </div>
      </footer>
    </div>
  )
}
