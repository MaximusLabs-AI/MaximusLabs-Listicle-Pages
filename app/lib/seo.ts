// Public-facing SEO constants + JSON-LD builders. Every URL here is the PUBLIC
// URL under the MaximusLabs domain (what Google should index), not the Vercel
// origin — the Cloudflare worker maps /blog/* on the public domain to this app.

export const SITE = 'https://www.maximuslabs.ai'
export const BLOG_BASE = `${SITE}/blog`
export const blogUrl = (slug: string) => `${SITE}/blog/${slug}`

const ORG_ID = `${SITE}/#organization`
const WEBSITE_ID = `${SITE}/#website`

const organization = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'MaximusLabs',
  url: SITE,
  logo: 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b457dd/68a189ae4f772123c8ebb7be_webclip.svg',
  sameAs: ['https://www.linkedin.com/company/maximus-labs-ai/'],
}

const author = {
  '@type': 'Person',
  name: 'Krishna Kaanth',
  jobTitle: 'Founder & CEO, MaximusLabs',
  url: `${SITE}/company/about-us`,
}

function breadcrumb(title: string, url: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'MaximusLabs', item: SITE},
      {'@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_BASE},
      {'@type': 'ListItem', position: 3, name: title, item: url},
    ],
  }
}

// Drop undefined values so we never emit `"image": undefined` etc.
const clean = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

type ArticleInput = {
  slug: string
  title: string
  excerpt?: string
  imageUrl?: string | null
  publishedAt?: string
  updatedAt?: string
}

export function articleJsonLd(a: ArticleInput) {
  const url = blogUrl(a.slug)
  return clean({
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: a.title,
        description: a.excerpt,
        image: a.imageUrl ? [a.imageUrl] : undefined,
        datePublished: a.publishedAt,
        dateModified: a.updatedAt || a.publishedAt,
        author,
        publisher: {'@id': ORG_ID},
        mainEntityOfPage: url,
        url,
      },
      breadcrumb(a.title, url),
    ],
  })
}

type ListicleInput = {
  slug: string
  title: string
  dek?: string
  publishedAt?: string
  reviewedAt?: string
  entries?: Array<{rank?: number; agency?: {name?: string; url?: string; home?: string}}>
  questions?: Array<{title?: string; description?: string}>
}

export function listicleJsonLd(p: ListicleInput) {
  const url = blogUrl(p.slug)
  const entries = Array.isArray(p.entries) ? p.entries : []
  const questions = Array.isArray(p.questions) ? p.questions : []

  const graph: Record<string, unknown>[] = [
    organization,
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: p.title,
      description: p.dek,
      datePublished: p.publishedAt,
      dateModified: p.reviewedAt || p.publishedAt,
      author,
      publisher: {'@id': ORG_ID},
      mainEntityOfPage: url,
      url,
    },
    {
      '@type': 'ItemList',
      name: p.title,
      itemListElement: entries
        .map((e, i) => ({
          '@type': 'ListItem',
          position: e.rank || i + 1,
          name: e.agency?.name,
          url: e.agency?.url || (e.agency?.home ? `https://${e.agency.home}` : undefined),
        }))
        .filter((x) => x.name),
    },
    breadcrumb(p.title, url),
  ]

  const faqs = questions
    .filter((q) => q.title && q.description)
    .map((q) => ({'@type': 'Question', name: q.title, acceptedAnswer: {'@type': 'Answer', text: q.description}}))
  if (faqs.length) graph.push({'@type': 'FAQPage', mainEntity: faqs})

  return clean({'@context': 'https://schema.org', '@graph': graph})
}

export function collectionJsonLd(items: Array<{slug: string; href?: string}>) {
  return clean({
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {'@type': 'WebSite', '@id': WEBSITE_ID, url: SITE, name: 'MaximusLabs', publisher: {'@id': ORG_ID}},
      {
        '@type': 'CollectionPage',
        '@id': BLOG_BASE,
        url: BLOG_BASE,
        name: 'AI Search Resources',
        description:
          'Research, comparisons, and practical guidance for AEO, GEO, AI search, and technical SEO.',
        isPartOf: {'@id': WEBSITE_ID},
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: items.slice(0, 25).map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: it.href ? `${SITE}${it.href}` : blogUrl(it.slug),
          })),
        },
      },
    ],
  })
}
