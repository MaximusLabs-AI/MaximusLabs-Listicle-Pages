'use client'

import Link from 'next/link'
import {useMemo, useState} from 'react'

import styles from './BlogCollection.module.css'

export type BlogCollectionItem = {
  _id: string
  _type?: 'listiclePage' | 'infoArticle'
title: string
  slug: string
  href?: string
serviceName?: string
  verticalLabel?: string
  dek?: string
  publisherName?: string
  publishedAt?: string
  reviewedAt?: string
  imageUrl?: string | null
  agencyCount?: number
  readingMinutes?: number
  blogType?: string
  contentCategory?: string
}

const serviceOptions = ['AEO', 'GEO & AI SEO', 'B2B SEO', 'Technical SEO', 'Agentic Commerce'] as const
const industryOptions = ['B2B SaaS', 'Healthcare', 'Finance & FinTech', 'Cybersecurity', 'Ecommerce', 'Sales & CRM', 'HR & People', 'Legal', 'Supply Chain', 'Education'] as const
const blogTypeOptions = ['Informational', 'Listicle', 'Research & Data', 'How-to Guides', 'Case Studies', 'Tools & Platforms'] as const
const contentCategoryOptions = ['AI Search Fundamentals', 'Strategy & Frameworks', 'Technical SEO & Implementation', 'Measurement & Analytics', 'Ecommerce & Agentic Commerce', 'Industry Applications', 'Case Studies & Research', 'Agency Selection', 'Tools & Platforms'] as const

const webflowCoverImages: Record<string, string> = {
  '10-best-aeo-agencies-b2b-saas': 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/6917030add326a8504d22a80_Black%20and%20Blue%20Simple%20Technology%20Business%20Plan%20Presentation%20(2).png',
  '10-best-aeo-agencies-cybersecurity': 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69287d12d16729b4b36e672b_2.png',
}

const authorImageUrl = 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69086a39359a85bbb951e01d_Minimalist%20Square%20Photo%20Instagram%20Post%20(1).png'

type Service = (typeof serviceOptions)[number]
type Industry = (typeof industryOptions)[number]
type BlogType = (typeof blogTypeOptions)[number]
type ContentCategory = (typeof contentCategoryOptions)[number]

function getService(article: BlogCollectionItem): Service {
  const stored = {aeo: 'AEO', geo: 'GEO & AI SEO', b2bSeo: 'B2B SEO', technicalSeo: 'Technical SEO', agenticCommerce: 'Agentic Commerce'} as const
  if (article.serviceName && article.serviceName in stored) return stored[article.serviceName as keyof typeof stored]
  const text = `${article.serviceName || ''} ${article.title}`.toLowerCase()
  if (/technical seo|schema|crawler|robots\.txt|llms\.txt/.test(text)) return 'Technical SEO'
  if (/agentic commerce|shopping agent|ai commerce/.test(text)) return 'Agentic Commerce'
  if (/b2b seo|search engine optimization/.test(text) && !/answer engine/.test(text)) return 'B2B SEO'
  if (/generative engine|\bgeo\b|ai seo/.test(text)) return 'GEO & AI SEO'
  return 'AEO'
}

function getIndustry(article: BlogCollectionItem): Industry {
  const stored = {b2bSaas: 'B2B SaaS', healthcare: 'Healthcare', finance: 'Finance & FinTech', cybersecurity: 'Cybersecurity', ecommerce: 'Ecommerce', salesCrm: 'Sales & CRM', hrPeople: 'HR & People', legal: 'Legal', supplyChain: 'Supply Chain', education: 'Education'} as const
  if (article.verticalLabel && article.verticalLabel in stored) return stored[article.verticalLabel as keyof typeof stored]
  const text = `${article.verticalLabel || ''} ${article.title} ${article.dek || ''}`.toLowerCase()
  if (/health|medical|patient|pharma/.test(text)) return 'Healthcare'
  if (/fintech|finance|financial|banking|insurance/.test(text)) return 'Finance & FinTech'
  if (/cyber|security|infosec/.test(text)) return 'Cybersecurity'
  if (/ecommerce|e-commerce|retail|shopify/.test(text)) return 'Ecommerce'
  if (/sales|crm|revenue operations|revops/.test(text)) return 'Sales & CRM'
  if (/hr tech|hrtech|human resources|recruit|workforce/.test(text)) return 'HR & People'
  if (/legal|law firm|lawtech/.test(text)) return 'Legal'
  if (/supply chain|logistics|procurement/.test(text)) return 'Supply Chain'
  if (/education|edtech|learning/.test(text)) return 'Education'
  return 'B2B SaaS'
}

function getBlogType(article: BlogCollectionItem): BlogType {
  if (article._type === 'listiclePage') return 'Listicle'
  const stored = {informational: 'Informational', research: 'Research & Data', guide: 'How-to Guides', caseStudy: 'Case Studies', tools: 'Tools & Platforms'} as const
  if (article.blogType && article.blogType in stored) return stored[article.blogType as keyof typeof stored]
  const text = `${article.title} ${article.dek || ''}`.toLowerCase()
  if (/case stud|success stor|client result/.test(text)) return 'Case Studies'
  if (/tool|platform|software|tracker/.test(text)) return 'Tools & Platforms'
  if (/research|data|statistic|study|market analysis|benchmark/.test(text)) return 'Research & Data'
  if (/best|top\s+\d|versus|\bvs\b|alternative|compar|agenc/.test(text)) return 'Listicle'
  if (/guide|how to|checklist|implementation|playbook|tutorial/.test(text)) return 'How-to Guides'
  return 'Informational'
}

function getContentCategory(article: BlogCollectionItem): ContentCategory {
  const stored = {
    fundamentals: 'AI Search Fundamentals',
    strategy: 'Strategy & Frameworks',
    technical: 'Technical SEO & Implementation',
    measurement: 'Measurement & Analytics',
    commerce: 'Ecommerce & Agentic Commerce',
    industry: 'Industry Applications',
    research: 'Case Studies & Research',
    agencySelection: 'Agency Selection',
    tools: 'Tools & Platforms',
  } as const
  if (article.contentCategory && article.contentCategory in stored) {
    return stored[article.contentCategory as keyof typeof stored]
  }

  const text = `${article.title} ${article.dek || ''}`.toLowerCase()
  if (/agenc|partner selection/.test(text)) return 'Agency Selection'
  if (/tool|platform|software|alternative|competitor/.test(text)) return 'Tools & Platforms'
  if (/ecommerce|e-commerce|commerce|checkout|shopify|product/.test(text)) return 'Ecommerce & Agentic Commerce'
  if (/technical|schema|crawler|robots\.txt|llms\.txt|indexing/.test(text)) return 'Technical SEO & Implementation'
  if (/measurement|metric|analytics|attribution|\broi\b/.test(text)) return 'Measurement & Analytics'
  if (/case stud|research|benchmark|report|market analysis/.test(text)) return 'Case Studies & Research'
  if (/health|fintech|cyber|education|legal|sales|crm|supply chain|industry/.test(text)) return 'Industry Applications'
  if (/what is|decoded|fundamental|aeo vs seo|geo vs/.test(text)) return 'AI Search Fundamentals'
  return 'Strategy & Frameworks'
}
function getCoverVariant(article: BlogCollectionItem) {
  return (Array.from(article.slug).reduce((total, character) => total + character.charCodeAt(0), 0) % 4) + 1
}

function formatDate(value?: string) {
  if (!value) return 'Recently updated'
  return new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${value}T00:00:00Z`))
}

function readingTime(article: BlogCollectionItem) {
  return article.readingMinutes || Math.max(8, article.agencyCount || 0)
}

function isListicle(article: BlogCollectionItem): boolean {
  return article._type === 'listiclePage' || getBlogType(article) === 'Listicle'
}

function getListicleType(article: BlogCollectionItem): string {
  const text = (article.title || '').toLowerCase()
  const nBest = text.match(/\b(\d+)\s+best\b/)
  if (nBest) return `${nBest[1]} Best`
  const top = text.match(/\btop\s+(\d+)\b/)
  if (top) return `Top ${top[1]}`
  if (/\bbest\b/.test(text)) return 'Best'
  const num = text.match(/\b(\d+)\b/)
  if (num) return `${num[1]} Picks`
  return 'Listicle'
}

const servicePriority: Record<string, number> = {'AEO': 60, 'GEO & AI SEO': 50, 'Agentic Commerce': 40, 'B2B SEO': 30, 'Technical SEO': 20}

// "Most Read" has no analytics yet, so it ranks by how central a piece is to
// our services: listicles first, then by service weight, recency as tiebreak.
function priorityScore(article: BlogCollectionItem): number {
  let score = isListicle(article) ? 1000 : 0
  score += servicePriority[getService(article)] ?? 10
  const date = article.publishedAt || article.reviewedAt
  if (date) score += new Date(`${date}T00:00:00Z`).getTime() / 1e13
  return score
}

function ArticleCard({article}: {article: BlogCollectionItem}) {
  const coverImage = article.imageUrl || webflowCoverImages[article.slug]
  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} href={article.href || `/listicles/${article.slug}`}>
        <div className={styles.cardImage}>
          {coverImage ? (
            <img src={coverImage} alt="" />
          ) : (
            <div className={`${styles.imageFallback} ${styles[`coverVariant${getCoverVariant(article)}`]}`} aria-hidden="true">
              <i className={styles.coverGrid} />
              <i className={styles.coverShape} />
              <span className={styles.coverService}>{getService(article)}</span>
              <strong>{getIndustry(article)}</strong>
            </div>
          )}
        </div>
        <div className={styles.cardContent}>
          <span className={styles.category}>{isListicle(article) ? getListicleType(article) : getService(article)}</span>
          <h3>{article.title}</h3>
          <p>{article.dek}</p>
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.avatar}>
            <img src={authorImageUrl} alt="Krishna Kaanth" />
          </span>
          <span>
            <strong>Krishna Kaanth</strong>
            <small>{formatDate(article.publishedAt || article.reviewedAt)} · {readingTime(article)} min read</small>
          </span>
        </div>
      </Link>
    </article>
  )
}

export function BlogCollection({articles}: {articles: BlogCollectionItem[]}) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [service, setService] = useState<Service | 'All'>('All')
  const [industry, setIndustry] = useState<Industry | 'All'>('All')
  const [blogType, setBlogType] = useState<BlogType | 'All'>('All')
  const [contentCategory, setContentCategory] = useState<ContentCategory | 'All'>('All')

  const filteredArticles = useMemo(() => {
    const search = submittedQuery.trim().toLowerCase()
    return articles.filter((article) => {
      const matchesService = service === 'All' || getService(article) === service
      const matchesIndustry = industry === 'All' || getIndustry(article) === industry
      const matchesBlogType = blogType === 'All' || getBlogType(article) === blogType
      const matchesContentCategory = contentCategory === 'All' || getContentCategory(article) === contentCategory
      const haystack = `${article.title} ${article.dek || ''} ${article.serviceName || ''} ${article.verticalLabel || ''}`.toLowerCase()
      const matchesSearch = !search || haystack.includes(search)
      return matchesService && matchesIndustry && matchesBlogType && matchesContentCategory && matchesSearch
    })
  }, [articles, blogType, contentCategory, industry, service, submittedQuery])

  // Displayed as stacked sections (not filter tabs): every matching card is
  // shown; Most Read is the top-priority mix of both types.
  const sections = useMemo(() => {
    const mostRead = [...filteredArticles].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 6)
    return [
      {key: 'listicles', title: 'Listicles', blurb: 'Ranked directories and best-of guides.', items: filteredArticles.filter(isListicle)},
      {key: 'informational', title: 'Informational', blurb: 'Explainers, how-tos, and deep dives.', items: filteredArticles.filter((article) => !isListicle(article))},
      {key: 'mostRead', title: 'Most Read', blurb: 'The highest-priority reads across our services.', items: mostRead},
    ].filter((section) => section.items.length)
  }, [filteredArticles])

  const clearFilters = () => {
    setQuery('')
    setSubmittedQuery('')
    setService('All')
    setIndustry('All')
    setBlogType('All')
    setContentCategory('All')
  }

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1><span>Rethinking How the</span> <strong>Internet Finds You</strong></h1>
        <p className={styles.subheading}>Explore practical research, comparisons, and field-tested guidance for earning visibility across Google and AI answer engines.</p>
        <form
          className={styles.search}
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmittedQuery(query)
          }}
        >
          <label className={styles.srOnly} htmlFor="blog-search">Search resources</label>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search AEO, GEO, SEO, tools, industries…"
          />
          <button type="submit">Search</button>
        </form>
      </header>

      <div className={styles.collectionLayout}>
        <aside className={styles.filters} aria-label="Blog filters">
          <div className={styles.filterHeader}>
            <div>
              <span>Resource library</span>
              <h2>Find your next answer</h2>
            </div>
            {(service !== 'All' || industry !== 'All' || blogType !== 'All' || contentCategory !== 'All' || submittedQuery) && (
              <button type="button" onClick={clearFilters}>Clear</button>
            )}
          </div>

          <details name="blog-filters" className={styles.filterGroup}>
            <summary>Service <span aria-hidden="true">+</span></summary>
            <div className={styles.filterOptions}>
              {serviceOptions.map((option) => (
                <button className={service === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setService((prev) => (prev === option ? 'All' : option))}>{option}</button>
              ))}
            </div>
          </details>

          <details name="blog-filters" className={styles.filterGroup}>
            <summary>Industry <span aria-hidden="true">+</span></summary>
            <div className={styles.filterOptions}>
              {industryOptions.map((option) => (
                <button className={industry === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setIndustry((prev) => (prev === option ? 'All' : option))}>{option}</button>
              ))}
            </div>
          </details>

          <details name="blog-filters" className={styles.filterGroup}>
            <summary>Content focus <span aria-hidden="true">+</span></summary>
            <div className={styles.filterOptions}>
              {contentCategoryOptions.map((option) => (
                <button className={contentCategory === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setContentCategory((prev) => (prev === option ? 'All' : option))}>{option}</button>
              ))}
            </div>
          </details>

          <details name="blog-filters" className={styles.filterGroup}>
            <summary>Blog type <span aria-hidden="true">+</span></summary>
            <div className={styles.filterOptions}>
              {blogTypeOptions.map((option) => (
                <button className={blogType === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setBlogType((prev) => (prev === option ? 'All' : option))}>{option}</button>
              ))}
            </div>
          </details>
        </aside>

        <section className={styles.results} aria-live="polite">
          <div className={styles.resultsHeader}>
            <div>
              <span>Latest thinking</span>
              <h2>AI search resources</h2>
            </div>
            <p>{filteredArticles.length} {filteredArticles.length === 1 ? 'resource' : 'resources'}</p>
          </div>

          {sections.length ? (
            sections.map((section) => (
              <section className={styles.collectionSection} key={section.key} aria-label={section.title}>
                <div className={styles.sectionHead}>
                  <h3>{section.title}</h3>
                  <p>{section.blurb}</p>
                </div>
                <div className={styles.cardGrid}>
                  {section.items.map((article) => (
                    <ArticleCard article={article} key={`${section.key}-${article._id}`} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No matching resources</h3>
              <p>Try a broader keyword or clear the service, content focus, industry, and blog type filters.</p>
              <button type="button" onClick={clearFilters}>Show all resources</button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
