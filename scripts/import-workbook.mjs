import path from 'node:path'

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

import {buildDocuments, root} from './workbook-data.mjs'

dotenv.config({path: path.join(root, '.env.local')})

const commit = process.argv.includes('--commit')
const {agencies, pages} = buildDocuments()

console.log(`Prepared ${agencies.length} agency documents and ${pages.length} listicle documents.`)
for (const page of pages) {
  console.log(`${page._id}: ${page.entries.length} ranked entries, ${page.dataWarnings.length} warnings, status=${page.editorialStatus}`)
}

if (!commit) {
  console.log('\nDry run only. Re-run with --commit after reviewing DATA_AUDIT.md to write these published documents to Sanity.')
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

for (const batch of [agencies, pages]) {
  let transaction = client.transaction()
  for (const document of batch) transaction = transaction.createOrReplace(document)
  const result = await transaction.commit({visibility: 'async'})
  console.log(`Committed transaction ${result.transactionId}`)
}

console.log('Sanity import complete. All listicle pages remain editorialStatus=needsData until the audit gaps are filled and reviewed.')
