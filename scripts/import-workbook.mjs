import path from 'node:path'

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

import {buildDocuments, root} from './workbook-data.mjs'

dotenv.config({path: path.join(root, '.env.local')})

const commit = process.argv.includes('--commit')
const {agencies, template, pages} = buildDocuments()

console.log(`Prepared ${agencies.length} agencies, 1 standard template, and ${pages.length} listicle pages.`)
for (const page of pages) {
  console.log(`${page._id}: ${page.entries.length} ranked entries, ${page.dataWarnings.length} warnings, status=${page.editorialStatus}`)
}

if (!commit) {
  console.log('\nDry run only. Re-run with --commit to create or update the standard template, agencies, and listicle pages in Sanity.')
  process.exit(0)
}

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
if (!token) throw new Error('SANITY_API_WRITE_TOKEN is required for --commit.')
if (pages.some((page) => page.dataWarnings.length)) throw new Error('Import stopped because one or more pages still have workbook warnings.')

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2026-09-16',
  token,
  useCdn: false,
})

for (const batch of [[template], agencies, pages]) {
  let transaction = client.transaction()
  for (const document of batch) transaction = transaction.createOrReplace(document)
  const result = await transaction.commit({visibility: 'sync'})
  console.log(`Committed transaction ${result.transactionId}`)
}

console.log('Sanity import complete. Workbook-complete pages are readyForReview and use the global listicleTemplate.default singleton.')
