import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({path: '.env.local', quiet: true})

const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zhc68b02',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-09-16',
  token,
  useCdn: false,
  perspective: 'raw',
})

const summaryQuery = [
  '{',
  '  "informationalDrafts": count(*[_type == "infoArticle" && _id in path("drafts.**")]),',
  '  "publishedInformational": count(*[_type == "infoArticle" && !(_id in path("drafts.**"))]),',
  '  "existingListiclePages": count(*[_type == "listiclePage"])',
  '}',
].join('\n')

const documentsQuery = [
  '*[_type == "infoArticle" && _id in path("drafts.**")]{',
  '  title, excerpt, contentCategory, "slug": slug.current,',
  '  body[]{kind, text, tocLabel, items, caption, html}',
  '}',
].join('\n')

const [summary, documents] = await Promise.all([
  client.fetch(summaryQuery),
  client.fetch(documentsQuery),
])

const renderedText = JSON.stringify(documents)
const headings = documents.flatMap((document) => (document.body || []).filter((block) => block.kind === 'heading'))
const categories = documents.reduce((counts, document) => {
  const key = document.contentCategory || 'missing'
  counts[key] = (counts[key] || 0) + 1
  return counts
}, {})

const sample = documents.find((document) => document.slug === 'chatgpt-instant-checkout')
const result = {
  ...summary,
  quality: {
    maximumTitleLength: Math.max(...documents.map((document) => document.title.length)),
    headings: headings.length,
    headingsMissingTocLabel: headings.filter((heading) => !heading.tocLabel).length,
    missingTocLabels: documents.flatMap((document) => (document.body || []).filter((block) => block.kind === 'heading' && !block.tocLabel).map((block) => ({slug: document.slug, heading: block.text}))),
    tocMarkerResidue: (renderedText.match(/\[toc=/gi) || []).length,
    legacy2025References: (renderedText.match(/\b2025\b/g) || []).length,
    categories,
  },
  chatgptInstantCheckout: sample
    ? {
        title: sample.title,
        contentCategory: sample.contentCategory,
        toc: sample.body
          .filter((block) => block.kind === 'heading')
          .slice(0, 8)
          .map((block) => ({label: block.tocLabel, heading: block.text})),
      }
    : null,
}

console.log(JSON.stringify(result, null, 2))
