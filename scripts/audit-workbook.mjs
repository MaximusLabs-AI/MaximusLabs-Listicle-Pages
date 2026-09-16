import {buildDocuments, workbookPath} from './workbook-data.mjs'

const {tables, agencies, pages} = buildDocuments()
const playerIds = new Set(tables.players.map((row) => row.player_id))
const orphanAlsoConsidered = tables.below_the_line.filter((row) => !playerIds.has(row.player_id)).map((row) => row.player_id)

console.log(`Workbook: ${workbookPath}`)
console.log(`Agencies: ${agencies.length}`)
console.log(`Listicle pages: ${pages.length}`)
for (const page of pages) {
  console.log(`\n${page.slug.current}`)
  console.log(`  Ranked entries: ${page.entries.length}`)
  console.log(`  Quick-answer entries: ${page.quickAnswers.length}`)
  console.log(`  Service-axis rows: ${page.serviceAxis.length}`)
  console.log(`  Coverage marks: ${page.entries.reduce((sum, entry) => sum + entry.coverage.length, 0)}`)
  console.log(`  Editorial status: ${page.editorialStatus}`)
  for (const warning of page.dataWarnings) console.log(`  WARNING: ${warning}`)
}
if (orphanAlsoConsidered.length) console.log(`\nAlso-considered IDs without agency records: ${[...new Set(orphanAlsoConsidered)].join(', ')}`)

