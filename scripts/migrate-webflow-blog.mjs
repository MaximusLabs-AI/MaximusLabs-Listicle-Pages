import {createHash} from 'node:crypto'
import {mkdir, writeFile} from 'node:fs/promises'

import {createClient} from '@sanity/client'
import * as cheerio from 'cheerio'
import dotenv from 'dotenv'

dotenv.config({path: '.env.local'})

const SOURCE_INDEX = 'https://www.maximuslabs.ai/blog'
const AUTHOR_IMAGE = 'https://cdn.prod.website-files.com/688e61db3da1f79ad7b45858/69086a39359a85bbb951e01d_Minimalist%20Square%20Photo%20Instagram%20Post%20(1).png'
const writeDrafts = process.argv.includes('--write')
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN

if (writeDrafts && !token) {
  throw new Error('SANITY_API_WRITE_TOKEN is required for --write.')
}

const client = writeDrafts
  ? createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 'zhc68b02',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-09-16',
      token,
      useCdn: false,
    })
  : null

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}
function modernizeYear(value) {
  return String(value || '')
    .replace(/\b2020\s*[-–]\s*2025\b/g, '2020-2026')
    .replace(/\b2025\b/g, '2026')
}

function trimAtWord(value, maximum) {
  const text = clean(value)
  if (text.length <= maximum) return text
  const shortened = text.slice(0, maximum + 1).replace(/\s+\S*$/, '').replace(/[,:;\-–—]+$/, '')
  return shortened + '…'
}

function parseHeadingText(value) {
  const refreshed = modernizeYear(clean(value))
  const marker = refreshed.match(/\[toc=([^\]]+)\]/i)
  const text = clean(refreshed.replace(/\s*\[toc=[^\]]+\]\s*/gi, ' '))
  let tocLabel = marker ? clean(marker[1]) : text
  tocLabel = tocLabel.replace(/^Q\d+[.):-]?\s*/i, '').replace(/^[^A-Za-z0-9]+/, '')
  return {text, tocLabel: trimAtWord(tocLabel, 48)}
}

function refreshBlock(block) {
  const refreshed = {...block}
  if (refreshed.text) refreshed.text = modernizeYear(refreshed.text)
  if (refreshed.caption) refreshed.caption = modernizeYear(refreshed.caption)
  if (refreshed.alt) refreshed.alt = modernizeYear(refreshed.alt)
  if (refreshed.html) refreshed.html = modernizeYear(refreshed.html)
  if (refreshed.items) refreshed.items = refreshed.items.map(modernizeYear)
  return refreshed
}

function optimizeTitle(value, slug) {
  const specialTitles = {
    'chatgpt-instant-checkout': 'ChatGPT Instant Checkout: Fees, Setup, and AI Commerce',
    'what-is-generative-engine-optimization-geo': 'What Is Generative Engine Optimization (GEO)?',
  }
  if (specialTitles[slug]) return specialTitles[slug]

  let title = modernizeYear(clean(value))
  const pipeLead = title.split('|')[0].trim()
  if (pipeLead.length >= 28) title = pipeLead
  if (title.length <= 82) return title

  const colonLead = title.split(':')[0].trim()
  if (colonLead.length >= 28 && colonLead.length <= 78) return colonLead

  const dashLead = title.split(/\s[-–—]\s/)[0].trim()
  if (dashLead.length >= 28 && dashLead.length <= 78) return dashLead

  return trimAtWord(title, 82)
}

function slugFromUrl(url) {
  const pathname = new URL(url).pathname.replace(/\/+$/, '')
  return pathname.split('/').filter(Boolean).at(-1) || createHash('sha1').update(url).digest('hex').slice(0, 12)
}

function absoluteUrl(value, base) {
  if (!value) return undefined
  try {
    return new URL(value, base).toString()
  } catch {
    return undefined
  }
}

function makeKey(seed) {
  return createHash('sha1').update(seed).digest('hex').slice(0, 12)
}

function findJsonLdDates($) {
  const values = []
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      values.push(JSON.parse($(node).text()))
    } catch {
      // Ignore invalid publisher markup.
    }
  })

  const flattened = []
  const visit = (value) => {
    if (!value) return
    if (Array.isArray(value)) return value.forEach(visit)
    if (typeof value !== 'object') return
    flattened.push(value)
    Object.values(value).forEach(visit)
  }
  values.forEach(visit)

  const article = flattened.find((value) => value.datePublished || value.dateModified) || {}
  return {
    publishedAt: article.datePublished,
    updatedAt: article.dateModified,
  }
}

function dateOnly(value) {
  if (!value) return undefined
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : undefined
}

function chooseArticleRoot($) {
  const preferred = $('.toc-content.w-richtext, .toc-content, [class*="toc-content"]').first()
  if (preferred.length && clean(preferred.text()).length > 300) return preferred

  const candidates = $('.w-richtext').toArray()
  if (!candidates.length) return $('article').first()
  candidates.sort((a, b) => clean($(b).text()).length - clean($(a).text()).length)
  return $(candidates[0])
}

function sanitizeTable($, node) {
  const clone = $(node).clone()
  clone.find('script, style, form, button').remove()
  clone.find('*').each((_, element) => {
    for (const attribute of [...(element.attribs ? Object.keys(element.attribs) : [])]) {
      if (/^on/i.test(attribute) || attribute === 'style' || attribute === 'class') {
        $(element).removeAttr(attribute)
      }
    }
  })
  return $.html(clone)
}

function blocksFromRoot($, root, pageUrl) {
  const blocks = []
  const targetTags = new Set(['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'blockquote', 'figure', 'img', 'table', 'iframe'])

  const add = (block, seed) => {
    if (!block) return
    const meaningfulText = block.text ? String(block.text).replace(/[\u200B-\u200D\uFEFF\s]/g, '') : ''
    const hasContent = meaningfulText || block.items?.length || block.url || block.html
    if (!hasContent) return
    blocks.push({_type: 'blogContentBlock', _key: makeKey(seed + '-' + blocks.length), ...block})
  }

  const convert = (node) => {
    const tag = String(node.name || '').toLowerCase()
    const element = $(node)

    if (/^h[2-4]$/.test(tag)) {
      const heading = parseHeadingText(element.text())
      add({kind: 'heading', headingLevel: Number(tag.slice(1)), text: heading.text, tocLabel: heading.tocLabel}, heading.text)
      return
    }

    if (tag === 'p') {
      add({kind: 'paragraph', text: clean(element.text())}, clean(element.text()))
      return
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = element.children('li').map((_, item) => clean($(item).text())).get().filter(Boolean)
      add({kind: tag === 'ul' ? 'bulletList' : 'numberList', items}, items.join('|'))
      return
    }

    if (tag === 'blockquote') {
      add({kind: 'quote', text: clean(element.text())}, clean(element.text()))
      return
    }

    if (tag === 'figure') {
      const image = element.find('img').first()
      const url = absoluteUrl(image.attr('src') || image.attr('data-src'), pageUrl)
      add({
        kind: 'image',
        url,
        alt: clean(image.attr('alt')),
        caption: clean(element.find('figcaption').first().text()),
      }, url || clean(element.text()))
      return
    }

    if (tag === 'img') {
      const url = absoluteUrl(element.attr('src') || element.attr('data-src'), pageUrl)
      add({kind: 'image', url, alt: clean(element.attr('alt'))}, url)
      return
    }

    if (tag === 'table') {
      add({kind: 'table', html: sanitizeTable($, node)}, clean(element.text()))
      return
    }

    if (tag === 'iframe') {
      const src = absoluteUrl(element.attr('src'), pageUrl)
      if (src) add({kind: 'html', html: '<iframe src="' + src.replace(/"/g, '&quot;') + '" loading="lazy" allowfullscreen></iframe>'}, src)
    }
  }

  const walk = (node) => {
    for (const child of node.children || []) {
      if (child.type !== 'tag') continue
      const tag = String(child.name || '').toLowerCase()
      if (targetTags.has(tag)) convert(child)
      else walk(child)
    }
  }

  root.toArray().forEach(walk)
  return blocks
}

function classifyPage(title, blocks) {
  const headings = blocks.filter((block) => block.kind === 'heading').map((block) => block.text || '')
  const bodyText = blocks.map((block) => block.text || (block.items || []).join(' ')).join(' ')
  const numberedHeadings = headings.filter((heading) => /^(?:#\s*)?\d{1,3}[\.\):\-]\s+/.test(heading)).length
  const entityTitle = /\b(?:agenc(?:y|ies)|tools?|platforms?|software|alternatives?|competitors?|services?)\b/i.test(title)
  const explicitListTitle = /\b(?:top|best)\b.*\b(?:agenc(?:y|ies)|tools?|platforms?|software|alternatives?|competitors?|services?)\b|\b\d+\s+(?:best\s+)?(?:agenc(?:y|ies)|tools?|platforms?|software|alternatives?|competitors?|services?)\b|\balternatives?\b/i.test(title)
  const numberedConceptTitle = /\b\d+\+?\s+.*\b(?:methods?|techniques?|mistakes?|practices?|strategies?|trends?|ways?)\b/i.test(title)
  const hasTitleListSignal = explicitListTitle || numberedConceptTitle || /\btop\s+\d+\b/i.test(title)
  const methodologyNarrative = /research methodology|how did we find/i.test(title)
  const isListicle = !methodologyNarrative && ((hasTitleListSignal && headings.length >= 4) || (numberedHeadings >= 3 && (entityTitle || numberedConceptTitle)))

  let reason = 'Narrative article structure'
  if (numberedHeadings >= 3) reason = String(numberedHeadings) + ' numbered content headings'
  else if (hasTitleListSignal && headings.length >= 4) reason = 'List-oriented title plus repeated article sections'

  return {
    classification: isListicle ? 'listicle-skip' : 'informational',
    reason,
    headingCount: headings.length,
    numberedHeadingCount: numberedHeadings,
    wordCount: clean(bodyText).split(' ').filter(Boolean).length,
  }
}

function classifyService(text) {
  if (/agentic commerce|shopping agent|commerce agent/i.test(text)) return 'agenticCommerce'
  if (/technical seo|schema markup|crawler|robots\.txt|llms\.txt|indexing/i.test(text)) return 'technicalSeo'
  if (/generative engine optimization|\bgeo\b|ai seo/i.test(text)) return 'geo'
  if (/b2b seo|search engine optimization/i.test(text) && !/answer engine/i.test(text)) return 'b2bSeo'
  return 'aeo'
}

function classifyIndustry(text) {
  const matches = [
    ['healthcare', /health|medical|patient|pharma/i],
    ['finance', /fintech|finance|financial|banking|insurance/i],
    ['cybersecurity', /cyber|security|infosec/i],
    ['ecommerce', /ecommerce|e-commerce|retail|shopify/i],
    ['salesCrm', /sales|crm|revenue operations|revops/i],
    ['hrPeople', /hr tech|hrtech|human resources|recruit|workforce/i],
    ['legal', /legal|law firm|lawtech/i],
    ['supplyChain', /supply chain|logistics|procurement/i],
    ['education', /education|edtech|learning/i],
    ['b2bSaas', /b2b saas|saas/i],
  ]
  return matches.find(([, pattern]) => pattern.test(text))?.[0] || 'general'
}

function classifyBlogType(text) {
  if (/case stud|success stor|client result/i.test(text)) return 'caseStudy'
  if (/research|data|statistic|study|benchmark|report/i.test(text)) return 'research'
  if (/guide|how to|checklist|implementation|playbook|tutorial/i.test(text)) return 'guide'
  if (/tool|platform|software|tracker/i.test(text)) return 'tools'
  return 'informational'
}

function classifyContentCategory(title, supportingText) {
  const headline = clean(title)
  if (/ecommerce|e-commerce|agentic commerce|checkout|shopify|product feed|retail/i.test(headline)) return 'commerce'
  if (/technical|schema|crawler|robots\.txt|llms\.txt|site structure|indexing|multimodal|voice search|knowledge graph|topic cluster/i.test(headline)) return 'technical'
  if (/measurement|metrics?|attribution|analytics|calculating roi|competitive analysis/i.test(headline)) return 'measurement'
  if (/\btools?\b|platform comparison|tracking software|alternatives?|competitors?/i.test(headline)) return 'tools'
  if (/\bagenc(?:y|ies)\b|agency selection|choose.*partner/i.test(headline)) return 'agencySelection'
  if (/case stud|success stor|research|market analysis|benchmark|report/i.test(headline)) return 'research'
  if (/health|fintech|cyber|saas startup|b2b saas|local business|education|legal|sales|crm|supply chain|industry-specific/i.test(headline)) return 'industry'
  if (/what is|decoded|fundamental|introduction|aeo vs seo|geo vs/i.test(headline)) return 'fundamentals'
  if (/technical|schema|crawler|implementation/i.test(supportingText)) return 'technical'
  return 'strategy'
}
function searchKeywords(title, blocks) {
  const stop = new Set(['about', 'after', 'again', 'against', 'answer', 'because', 'before', 'being', 'between', 'could', 'engine', 'every', 'from', 'have', 'into', 'maximuslabs', 'more', 'most', 'other', 'search', 'should', 'their', 'there', 'these', 'they', 'this', 'through', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your'])
  const headingText = blocks.filter((block) => block.kind === 'heading').slice(0, 8).map((block) => block.text).join(' ')
  const words = (title + ' ' + headingText).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) || []
  return [...new Set(words.filter((word) => !stop.has(word)))].slice(0, 20)
}

async function fetchHtml(url) {
  const response = await fetch(url, {headers: {'user-agent': 'MaximusLabs-Sanity-Migration/1.0'}})
  if (!response.ok) throw new Error(String(response.status) + ' ' + response.statusText)
  return response.text()
}

async function discoverPosts() {
  const html = await fetchHtml(SOURCE_INDEX)
  const $ = cheerio.load(html)
  const posts = new Map()

  $('.blog-card.w-inline-block, a.blog-card').each((_, anchor) => {
    const href = absoluteUrl($(anchor).attr('href'), SOURCE_INDEX)
    if (!href || new URL(href).hostname !== 'www.maximuslabs.ai') return
    const image = $(anchor).find('img').first()
    posts.set(href, {
      url: href,
      coverImageUrl: absoluteUrl(image.attr('src') || image.attr('data-src'), SOURCE_INDEX),
      cardText: clean($(anchor).text()),
    })
  })

  if (!posts.size) {
    $('a[href]').each((_, anchor) => {
      const href = absoluteUrl($(anchor).attr('href'), SOURCE_INDEX)
      if (!href) return
      const parsed = new URL(href)
      if (parsed.hostname !== 'www.maximuslabs.ai' || parsed.pathname === '/blog' || parsed.pathname === '/') return
      if ($(anchor).find('img').length && clean($(anchor).text()).length > 20) {
        posts.set(href, {url: href, cardText: clean($(anchor).text())})
      }
    })
  }

  return [...posts.values()]
}

async function parsePost(post) {
  const html = await fetchHtml(post.url)
  const $ = cheerio.load(html)
  $('script:not([type="application/ld+json"]), style, noscript').remove()

  const root = chooseArticleRoot($)
  const slug = slugFromUrl(post.url)
  const blocks = blocksFromRoot($, root, post.url).map(refreshBlock)
  const sourceTitle = clean($('meta[property="og:title"]').attr('content')) || clean($('h1').first().text()) || slug
  const title = optimizeTitle(sourceTitle, slug)
  const excerpt = modernizeYear(clean($('meta[name="description"]').attr('content')) || clean(root.find('p').first().text()).slice(0, 320))
  const imageUrl = post.coverImageUrl || absoluteUrl($('meta[property="og:image"]').attr('content'), post.url)
  const dates = findJsonLdDates($)
  const classification = classifyPage(sourceTitle, blocks)
  const fullText = sourceTitle + ' ' + title + ' ' + excerpt + ' ' + blocks.map((block) => block.text || (block.items || []).join(' ')).join(' ')
  const sourceHash = createHash('sha256').update(clean(root.html())).digest('hex')
  const categoryText = sourceTitle + ' ' + excerpt + ' ' + blocks.filter((block) => block.kind === 'heading').slice(0, 12).map((block) => block.text).join(' ')
  const contentCategory = classifyContentCategory(sourceTitle, categoryText)
  const refreshedText = title + ' ' + excerpt + ' ' + JSON.stringify(blocks)
  return {
    audit: {
      url: post.url,
      slug,
      title,
      titleLength: title.length,
      contentCategory,
      tocLabelCount: blocks.filter((block) => block.kind === 'heading' && block.tocLabel).length,
      tocMarkerResidue: (refreshedText.match(/\[toc=/gi) || []).length,
      legacy2025Count: (refreshedText.match(/\b2025\b/g) || []).length,
      classification: classification.classification,
      classificationReason: classification.reason,
      headingCount: classification.headingCount,
      numberedHeadingCount: classification.numberedHeadingCount,
      wordCount: classification.wordCount,
      blockCount: blocks.length,
    },
    document: {
      _id: 'drafts.webflow-info-' + makeKey(post.url),
      _type: 'infoArticle',
      title,
      sourceTitle,
      slug: {_type: 'slug', current: slug},
      excerpt,
      coverImageUrl: imageUrl,
      authorName: 'Krishna Kaanth',
      authorImageUrl: AUTHOR_IMAGE,
      publishedAt: dateOnly(dates.publishedAt),
      updatedAt: new Date().toISOString().slice(0, 10),
      readingMinutes: Math.max(1, Math.ceil(classification.wordCount / 220)),
      service: classifyService(fullText),
      industry: classifyIndustry(fullText),
      blogType: classifyBlogType(fullText),
      contentCategory,
      searchKeywords: searchKeywords(title, blocks),
      seoTitle: title,
      metaDescription: excerpt,
      sourceUrl: post.url,
      sourcePath: new URL(post.url).pathname,
      migratedAt: new Date().toISOString(),
      sourceHash,
      body: blocks,
    },
  }
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      try {
        results[index] = await mapper(items[index], index)
        console.log('[' + (index + 1) + '/' + items.length + '] ' + items[index].url)
      } catch (error) {
        results[index] = {error: error instanceof Error ? error.message : String(error), post: items[index]}
        console.error('[' + (index + 1) + '/' + items.length + '] FAILED ' + items[index].url)
      }
    }
  }

  await Promise.all(Array.from({length: Math.min(concurrency, items.length)}, worker))
  return results
}

const posts = await discoverPosts()
console.log('Discovered ' + posts.length + ' collection posts.')

const results = await mapPool(posts, 4, parsePost)
const parsed = results.filter((item) => item && !item.error)
const failures = results.filter((item) => item?.error)
const informational = parsed.filter((item) => item.audit.classification === 'informational')
const listicleSkips = parsed.filter((item) => item.audit.classification === 'listicle-skip')

if (writeDrafts) {
  for (let index = 0; index < informational.length; index += 1) {
    await client.createOrReplace(informational[index].document)
    console.log('Drafted [' + (index + 1) + '/' + informational.length + '] ' + informational[index].document.slug.current)
  }
}

const audit = {
  generatedAt: new Date().toISOString(),
  source: SOURCE_INDEX,
  mode: writeDrafts ? 'write-drafts' : 'dry-run',
  discovered: posts.length,
  parsed: parsed.length,
  informationalDrafts: informational.length,
  listiclesSkipped: listicleSkips.length,
  failures: failures.map((item) => ({url: item.post.url, error: item.error})),
  articles: parsed.map((item) => item.audit),
}

await mkdir('data', {recursive: true})
await writeFile('data/webflow-blog-migration-audit.json', JSON.stringify(audit, null, 2) + '\n', 'utf8')

console.log(JSON.stringify({
  discovered: audit.discovered,
  parsed: audit.parsed,
  informationalDrafts: audit.informationalDrafts,
  listiclesSkipped: audit.listiclesSkipped,
  failures: audit.failures.length,
  auditFile: 'data/webflow-blog-migration-audit.json',
}, null, 2))
