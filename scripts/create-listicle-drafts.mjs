import path from 'node:path'

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

import {buildDocuments, root} from './workbook-data.mjs'

dotenv.config({path: path.join(root, '.env.local')})

const selectedSlugs = new Set([
  '10-best-aeo-agencies-cybersecurity',
  '10-best-aeo-agencies-b2b-saas',
])
const commit = process.argv.includes('--commit')
const {pages, template} = buildDocuments()
const drafts = pages
  .filter((page) => selectedSlugs.has(page.slug.current))
  .map((page) => ({...page, _id: `drafts.${page._id}`, editorialStatus: 'readyForReview'}))

if (drafts.length !== selectedSlugs.size) throw new Error(`Expected ${selectedSlugs.size} complete pages, found ${drafts.length}.`)
if (drafts.some((page) => page.dataWarnings.length)) throw new Error('Draft creation stopped because workbook warnings remain.')

for (const draft of drafts) {
  console.log(`${draft._id}: ${draft.title} (${draft.entries.length} entries, ${draft.questions.length} questions)`)
}
if (!commit) {
  console.log('\nDry run only. Re-run with --commit to create or replace these Sanity drafts.')
  process.exit(0)
}

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
if (!token) throw new Error('SANITY_API_WRITE_TOKEN is required for --commit.')

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2026-09-16',
  token,
  useCdn: false,
})

let transaction = client.transaction().createOrReplace(template)
for (const draft of drafts) transaction = transaction.createOrReplace(draft)
const result = await transaction.commit({visibility: 'sync'})
console.log(`Updated the standard template and created or replaced ${drafts.length} drafts in transaction ${result.transactionId}.`)
