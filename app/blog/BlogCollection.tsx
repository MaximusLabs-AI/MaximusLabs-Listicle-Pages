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

const authorImageUrl = 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69086a39359a85bbb951e01d_Minimalist%20Square%20Photo%20Instagram%20Post%20(1).png'

type Service = (typeof serviceOptions)[number]
type Industry = (typeof industryOptions)[number]
type BlogType = (typeof blogTypeOptions)[number]
type ContentCategory = (typeof contentCategoryOptions)[number]

// Only the filter values that currently have content are shown; a filter with
// an empty list is hidden entirely. To re-enable a value or a whole filter
// later, add it back to the relevant list below (the full option sets, states,
// and filter logic all remain in place).
const shownServiceOptions: readonly Service[] = ['AEO', 'GEO & AI SEO', 'Agentic Commerce', 'Technical SEO']
const shownIndustryOptions: readonly Industry[] = ['B2B SaaS', 'Cybersecurity', 'Healthcare', 'Finance & FinTech', 'Ecommerce', 'Sales & CRM', 'Education']
const shownContentCategoryOptions: readonly ContentCategory[] = []
const shownBlogTypeOptions: readonly BlogType[] = []

// Multi-topic classification: an article can belong to several services and
// industries at once (e.g. "Best AEO Agencies for Cybersecurity" is both AEO
// and Cybersecurity), so it surfaces under every relevant filter. The stored
// field is the primary; regex over title + dek adds the rest. The single-value
// helpers return the primary (first) match, used for the card badge/eyebrow.
const serviceStored = {aeo: 'AEO', geo: 'GEO & AI SEO', b2bSeo: 'B2B SEO', technicalSeo: 'Technical SEO', agenticCommerce: 'Agentic Commerce'} as const

function getServices(article: BlogCollectionItem): Service[] {
  const out: Service[] = []
  const add = (value: Service) => {
    if (!out.includes(value)) out.push(value)
  }
  if (article.serviceName && article.serviceName in serviceStored) add(serviceStored[article.serviceName as keyof typeof serviceStored])
  const text = `${article.serviceName || ''} ${article.title} ${article.dek || ''}`.toLowerCase()
  if (/answer engine|\baeo\b/.test(text)) add('AEO')
  if (/generative engine|\bgeo\b|ai seo|ai search|ai citation|llm\b/.test(text)) add('GEO & AI SEO')
  if (/agentic commerce|shopping agent|ai commerce|instant checkout|\bcheckout\b/.test(text)) add('Agentic Commerce')
  if (/technical seo|schema|crawler|robots\.txt|llms\.txt|indexing/.test(text)) add('Technical SEO')
  if (/b2b seo/.test(text)) add('B2B SEO')
  if (!out.length) add('AEO')
  return out
}

function getService(article: BlogCollectionItem): Service {
  return getServices(article)[0]
}

const industryStored = {b2bSaas: 'B2B SaaS', healthcare: 'Healthcare', finance: 'Finance & FinTech', cybersecurity: 'Cybersecurity', ecommerce: 'Ecommerce', salesCrm: 'Sales & CRM', hrPeople: 'HR & People', legal: 'Legal', supplyChain: 'Supply Chain', education: 'Education'} as const

function getIndustries(article: BlogCollectionItem): Industry[] {
  const out: Industry[] = []
  const add = (value: Industry) => {
    if (!out.includes(value)) out.push(value)
  }
  if (article.verticalLabel && article.verticalLabel in industryStored) add(industryStored[article.verticalLabel as keyof typeof industryStored])
  const text = `${article.verticalLabel || ''} ${article.title} ${article.dek || ''}`.toLowerCase()
  if (/health|medical|patient|pharma|ymyl/.test(text)) add('Healthcare')
  if (/fintech|finance|financial|banking|insurance/.test(text)) add('Finance & FinTech')
  if (/cyber|infosec|security vendor/.test(text)) add('Cybersecurity')
  if (/ecommerce|e-commerce|retail|shopify|product feed|instant checkout/.test(text)) add('Ecommerce')
  if (/\bsales\b|\bcrm\b|revenue operations|revops/.test(text)) add('Sales & CRM')
  if (/hr tech|hrtech|human resources|recruit|workforce/.test(text)) add('HR & People')
  if (/legal|law firm|lawtech/.test(text)) add('Legal')
  if (/supply chain|logistics|procurement/.test(text)) add('Supply Chain')
  if (/education|edtech|\blearning\b/.test(text)) add('Education')
  if (/b2b saas|\bsaas\b/.test(text)) add('B2B SaaS')
  if (!out.length) add('B2B SaaS')
  return out
}

function getIndustry(article: BlogCollectionItem): Industry {
  return getIndustries(article)[0]
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

// The main keyword shown on the generated cover: the core topic phrase from the
// title, with listicle prefixes ("The 10 Best"), lead-ins ("What is") and a
// trailing generic audience noun ("Companies") removed. The differentiating
// vertical ("for B2B SaaS", "for Cybersecurity") is KEPT so two otherwise
// identical listicles get distinct keywords.
function getCoverKeyword(article: BlogCollectionItem): string {
  const raw = (article.title || '').trim()
  let keyword = raw.split(/:\s|\s[|–—]\s/)[0].trim()
  keyword = keyword
    .replace(/^the\s+/i, '')
    .replace(/^\d+\s+/, '')
    .replace(/^(best|top(\s+\d+)?)\s+/i, '')
    .replace(/^(what\s+(is|are)|how\s+to)\s+/i, '')
    .replace(/\s+(companies|company|businesses|business|brands|teams|firms)\s*$/i, '')
    .replace(/[?.!]+$/, '')
    // MaximusLabs covers use the acronym, which also keeps the differentiating
    // vertical ("for B2B SaaS" / "for Cybersecurity") visible on the small card.
    .replace(/answer engine optimi[sz]ation/gi, 'AEO')
    .replace(/generative engine optimi[sz]ation/gi, 'GEO')
    .replace(/search engine optimi[sz]ation/gi, 'SEO')
    .trim()
  return keyword.length >= 3 ? keyword : getService(article)
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

function ArticleCard({article, keyword}: {article: BlogCollectionItem; keyword: string}) {
  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} href={article.href || `/listicles/${article.slug}`}>
        <div className={styles.cardImage}>
          <div className={`${styles.imageFallback} ${styles[`coverVariant${getCoverVariant(article)}`]}`} aria-hidden="true">
            <i className={styles.coverGrid} />
            <i className={styles.coverShape} />
            <strong>{keyword}</strong>
          </div>
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
      const matchesService = service === 'All' || getServices(article).includes(service)
      const matchesIndustry = industry === 'All' || getIndustries(article).includes(industry)
      const matchesBlogType = blogType === 'All' || getBlogType(article) === blogType
      const matchesContentCategory = contentCategory === 'All' || getContentCategory(article) === contentCategory
      const haystack = `${article.title} ${article.dek || ''} ${article.serviceName || ''} ${article.verticalLabel || ''}`.toLowerCase()
      const matchesSearch = !search || haystack.includes(search)
      return matchesService && matchesIndustry && matchesBlogType && matchesContentCategory && matchesSearch
    })
  }, [articles, blogType, contentCategory, industry, service, submittedQuery])

  // One unified collection under a single heading. Readers do not care whether
  // a card is a listicle or an explainer, so everything sits together, ordered
  // best-first (highest priority to our services) rather than split by type.
  const sortedArticles = useMemo(
    () => [...filteredArticles].sort((a, b) => priorityScore(b) - priorityScore(a)),
    [filteredArticles],
  )

  // Guarantee every cover title is unique: start from the extracted keyword,
  // and if two collide, disambiguate with the vertical, then a counter.
  const coverKeywords = useMemo(() => {
    const seen = new Set<string>()
    const map = new Map<string, string>()
    for (const article of articles) {
      const base = getCoverKeyword(article)
      let keyword = base
      if (seen.has(keyword.toLowerCase())) {
        const industry = getIndustry(article)
        const withIndustry = industry && !base.toLowerCase().includes(industry.toLowerCase()) ? `${base} for ${industry}` : base
        keyword = withIndustry
        let n = 2
        while (seen.has(keyword.toLowerCase())) keyword = `${withIndustry} (${n++})`
      }
      seen.add(keyword.toLowerCase())
      map.set(article._id, keyword)
    }
    return map
  }, [articles])

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

          {shownServiceOptions.length > 0 && (
            <details name="blog-filters" className={styles.filterGroup}>
              <summary>Service <span aria-hidden="true">+</span></summary>
              <div className={styles.filterOptions}>
                {shownServiceOptions.map((option) => (
                  <button className={service === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setService((prev) => (prev === option ? 'All' : option))}>{option}</button>
                ))}
              </div>
            </details>
          )}

          {shownIndustryOptions.length > 0 && (
            <details name="blog-filters" className={styles.filterGroup}>
              <summary>Industry <span aria-hidden="true">+</span></summary>
              <div className={styles.filterOptions}>
                {shownIndustryOptions.map((option) => (
                  <button className={industry === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setIndustry((prev) => (prev === option ? 'All' : option))}>{option}</button>
                ))}
              </div>
            </details>
          )}

          {shownContentCategoryOptions.length > 0 && (
            <details name="blog-filters" className={styles.filterGroup}>
              <summary>Content focus <span aria-hidden="true">+</span></summary>
              <div className={styles.filterOptions}>
                {shownContentCategoryOptions.map((option) => (
                  <button className={contentCategory === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setContentCategory((prev) => (prev === option ? 'All' : option))}>{option}</button>
                ))}
              </div>
            </details>
          )}

          {shownBlogTypeOptions.length > 0 && (
            <details name="blog-filters" className={styles.filterGroup}>
              <summary>Blog type <span aria-hidden="true">+</span></summary>
              <div className={styles.filterOptions}>
                {shownBlogTypeOptions.map((option) => (
                  <button className={blogType === option ? styles.activeFilter : ''} key={option} type="button" onClick={() => setBlogType((prev) => (prev === option ? 'All' : option))}>{option}</button>
                ))}
              </div>
            </details>
          )}
        </aside>

        <section className={styles.results} aria-live="polite">
          <div className={styles.resultsHeader}>
            <div>
              <span>Latest thinking</span>
              <h2>AI search resources</h2>
            </div>
            <p>{filteredArticles.length} {filteredArticles.length === 1 ? 'resource' : 'resources'}</p>
          </div>

          {sortedArticles.length ? (
            <div className={styles.cardGrid}>
              {sortedArticles.map((article) => (
                <ArticleCard article={article} keyword={coverKeywords.get(article._id) ?? getCoverKeyword(article)} key={article._id} />
              ))}
            </div>
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
