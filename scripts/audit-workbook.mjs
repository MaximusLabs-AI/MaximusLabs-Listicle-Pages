import {buildDocuments, workbookPath} from './workbook-data.mjs'

const {tables, agencies, template, pages} = buildDocuments()
const playerIds = new Set(tables.players.map((row) => row.player_id))
const orphanAlsoConsidered = tables.below_the_line.filter((row) => !playerIds.has(row.player_id)).map((row) => row.player_id)
let warningCount = 0

console.log(`Workbook: ${workbookPath}`)
console.log(`Agencies: ${agencies.length}`)
console.log(`Standard template sections: ${template.sectionOrder.length}`)
console.log(`Writing-memory rules: ${template.writingRules.length}`)
console.log(`Listicle pages: ${pages.length}`)
for (const page of pages) {
  console.log(`\n${page.slug.current}`)
  console.log(`  Ranked entries: ${page.entries.length}`)
  console.log(`  Quick-answer entries: ${page.quickAnswers.length}`)
  console.log(`  Methodology steps: ${page.methodologySteps.length}`)
  console.log(`  Comparison questions: ${page.questions.length}`)
  console.log(`  Service-axis rows: ${page.serviceAxis.length}`)
  console.log(`  Coverage marks: ${page.entries.reduce((sum, entry) => sum + entry.coverage.length, 0)}`)
  console.log(`  Editorial status: ${page.editorialStatus}`)
  warningCount += page.dataWarnings.length
  for (const warning of page.dataWarnings) console.log(`  WARNING: ${warning}`)
}
if (orphanAlsoConsidered.length) {
  console.log(`\nInformational: also-considered firms do not require reusable agency documents: ${[...new Set(orphanAlsoConsidered)].join(', ')}`)
}
console.log(`\nWorkbook warnings: ${warningCount}`)
if (warningCount) process.exitCode = 1
