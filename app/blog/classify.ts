// Shared, server-safe topic classification for blog entries. Used by the client
// collection (BlogCollection, filters) and the server RelatedPosts matcher, so
// both apply the exact same pattern-matching logic. Pure functions only — no
// React, no client-only APIs — so it can run on the server.

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

export const serviceOptions = ['AEO', 'GEO & AI SEO', 'B2B SEO', 'Technical SEO', 'Agentic Commerce'] as const
export type Service = (typeof serviceOptions)[number]

export const industryOptions = ['B2B SaaS', 'Healthcare', 'Finance & FinTech', 'Cybersecurity', 'Ecommerce', 'Sales & CRM', 'HR & People', 'Legal', 'Supply Chain', 'Education'] as const
export type Industry = (typeof industryOptions)[number]

export const aiSearchOptions = ['Platform', 'Technical', 'Strategies', 'Future'] as const
export type AiSearch = (typeof aiSearchOptions)[number]

// Multi-topic classification: an article can belong to several services and
// industries at once (e.g. "Best AEO Agencies for Cybersecurity" is both AEO and
// Cybersecurity). The stored field is the primary; regex over title + dek adds
// the rest. The single-value helpers return the primary (first) match.
const serviceStored = {aeo: 'AEO', geo: 'GEO & AI SEO', b2bSeo: 'B2B SEO', technicalSeo: 'Technical SEO', agenticCommerce: 'Agentic Commerce'} as const

export function getServices(article: BlogCollectionItem): Service[] {
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

export function getService(article: BlogCollectionItem): Service {
  return getServices(article)[0]
}

const industryStored = {b2bSaas: 'B2B SaaS', healthcare: 'Healthcare', finance: 'Finance & FinTech', cybersecurity: 'Cybersecurity', ecommerce: 'Ecommerce', salesCrm: 'Sales & CRM', hrPeople: 'HR & People', legal: 'Legal', supplyChain: 'Supply Chain', education: 'Education'} as const

export function getIndustries(article: BlogCollectionItem): Industry[] {
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

export function getIndustry(article: BlogCollectionItem): Industry {
  return getIndustries(article)[0]
}

// The AI Search 101 "Explore by area" facet(s) an article touches, matched on
// the hidden keywords specified for each (multi-topic).
export function getAiSearches(article: BlogCollectionItem): AiSearch[] {
  const out: AiSearch[] = []
  const add = (value: AiSearch) => {
    if (!out.includes(value)) out.push(value)
  }
  const text = `${article.serviceName || ''} ${article.title} ${article.dek || ''}`.toLowerCase()
  if (/chatgpt|openai|\bgpt-?\d|\bclaude\b|anthropic|perplexity|gemini|google ai|ai overview|\bcopilot\b|apple intelligence|bing chat|meta ai|deepseek|\bgrok\b/.test(text)) add('Platform')
  if (/content formatting|structured data|\bschema\b|ai crawler|crawler optimization|robots\.txt|llms\.txt|entit(?:y|ies)|knowledge graph|\bmcp\b/.test(text)) add('Technical')
  if (/citation|question research|\beeat\b|e-?e-?a-?t|zero-?click|competitor analysis|competitive analysis/.test(text)) add('Strategies')
  if (/agentic ai|conversational ai|personali[sz]ation|ai search evolution|evolution of|future of|next-?gen|emerging/.test(text)) add('Future')
  return out
}
