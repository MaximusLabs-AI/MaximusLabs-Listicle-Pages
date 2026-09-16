import path from 'node:path'

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

import {root} from './workbook-data.mjs'

dotenv.config({path: path.join(root, '.env.local')})

const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN
if (!token) throw new Error('SANITY_API_WRITE_TOKEN is required.')

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2026-09-16',
  token,
  useCdn: false,
  perspective: 'raw',
})

const pageIds = await client.fetch(`*[_type == "listiclePage"]._id`)
console.log(`Listicle documents to clean: ${pageIds.length}`)
for (const id of pageIds) console.log(`- ${id}`)

if (!process.argv.includes('--commit')) {
  console.log('Dry run only. Re-run with --commit to remove the internal fields.')
} else {
  let transaction = client.transaction()
  for (const id of pageIds) {
    transaction = transaction.patch(id, (patch) => patch.unset(['sourceWorkbook', 'template', 'templateVersion']))
  }
  transaction = transaction.patch('listicleTemplate.default', (patch) => patch.unset(['sourceWorkbook', 'templateVersion']))

  const result = await transaction.commit({visibility: 'sync'})
  console.log(`Removed internal fields from ${pageIds.length} listicle documents and the global template in transaction ${result.transactionId}.`)
}