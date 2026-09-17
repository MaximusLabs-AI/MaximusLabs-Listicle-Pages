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

const query = [
  '{',
  '  "informationalDrafts": count(*[_type == "infoArticle" && _id in path("drafts.**")]),',
  '  "publishedInformational": count(*[_type == "infoArticle" && !(_id in path("drafts.**"))]),',
  '  "existingListiclePages": count(*[_type == "listiclePage"]),',
  '  "sample": *[_type == "infoArticle" && _id in path("drafts.**")][0]{',
  '    title,',
  '    "slug": slug.current,',
  '    "blocks": count(body)',
  '  }',
  '}',
].join('\n')

const result = await client.fetch(query)
console.log(JSON.stringify(result, null, 2))
