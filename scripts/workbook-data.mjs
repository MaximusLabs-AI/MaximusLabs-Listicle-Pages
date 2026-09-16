import path from 'node:path'
import {fileURLToPath} from 'node:url'

import XLSX from 'xlsx'

const here = path.dirname(fileURLToPath(import.meta.url))
export const root = path.resolve(here, '..')
export const workbookPath = path.join(root, 'MaximusLabs listicle feed.xlsx')

const headerRows = {README: 2, directions: 2, service_axis: 2, listings: 2, page_spec: 2, writing_memory: 4}
const engineColumns = {
  engines_chatgpt: 'ChatGPT',
  engines_perplexity: 'Perplexity',
  engines_gemini: 'Gemini',
  engines_aio: 'AI Overviews',
  engines_claude: 'Claude',
  engines_copilot: 'Copilot',
  engines_grok: 'Grok',
}

export function readTables() {
  const workbook = XLSX.readFile(workbookPath, {cellDates: false})
  return Object.fromEntries(
    workbook.SheetNames.map((name) => [
      name,
      XLSX.utils.sheet_to_json(workbook.Sheets[name], {
        range: (headerRows[name] || 1) - 1,
        defval: null,
        raw: false,
      }),
    ]),
  )
}

export function splitPipe(value) {
  if (value === null || value === undefined || value === '') return []
  return String(value).split('|').map((item) => item.trim()).filter(Boolean)
}

function numeric(value) {
  const result = Number(value)
  return Number.isFinite(result) ? result : undefined
}

function idPart(value) {
  return String(value || 'item').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

function key(prefix, value, index) {
  return `${idPart(prefix)}-${idPart(value)}-${index}`
}

function objects(rows, type, labelField, mapper) {
  return rows.map((row, index) => ({
    _key: key(type, row[labelField], index),
    _type: type,
    ...mapper(row),
  }))
}

function titleCase(value) {
  return String(value || '').split(/[-_]/).map((part) => part ? part[0].toUpperCase() + part.slice(1) : '').join(' ')
}

function rowsFor(tables, name, playerId) {
  return tables[name].filter((row) => row.player_id === playerId)
}

function directionRows(tables, playerId, verticalKey, slug) {
  const rows = rowsFor(tables, 'directions', playerId)
  const exact = rows.filter((row) => row.listing_slug === slug && row.vertical === verticalKey)
  if (exact.length) return exact
  const vertical = rows.filter((row) => row.vertical === verticalKey)
  if (vertical.length) return vertical
  const tagged = rows.filter((row) => String(row.shown_in || '').includes(verticalKey))
  return tagged.length ? tagged : rows
}

function portableText(value, prefix) {
  return String(value || '').split(/\r?\n/).map((text) => text.trim()).filter(Boolean).map((text, index) => ({
    _key: key(prefix, text, index),
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{_key: `span-${index + 1}`, _type: 'span', marks: [], text}],
  }))
}

function buildVerticalProfiles(tables, playerId) {
  return objects(rowsFor(tables, 'vertical_meta', playerId), 'verticalProfile', 'vertical', (meta) => ({
    verticalKey: meta.vertical,
    pitch: meta.pitch,
    serviceLines: objects(
      rowsFor(tables, 'vertical_services', playerId)
        .filter((row) => row.vertical === meta.vertical)
        .sort((a, b) => numeric(a.row_order) - numeric(b.row_order)),
      'serviceLine',
      'service_name',
      (row) => ({
        order: numeric(row.row_order),
        name: row.service_name,
        whyItExists: row.why_it_exists,
        howTheyDoIt: row.how_this_firm_does_it,
        sourceUrl: row.source_url || undefined,
      }),
    ),
    notOffered: splitPipe(meta.not_offered),
    builtFor: splitPipe(meta.built_for),
    icpNote: meta.icp_note,
    whoTheyWriteAgainst: meta.who_they_write_against,
    auditFindings: splitPipe(meta.audit_findings),
    evidence: meta.evidence,
    whereItBreaks: meta.where_it_breaks,
    namedIndustryClients: meta.named_industry_clients || undefined,
    declaredSurface: meta.declared_surface || undefined,
    citedOnPrompts: meta.cited_on_prompts || undefined,
  }))
}

function buildAgency(tables, player) {
  const playerId = player.player_id
  const universalLines = rowsFor(tables, 'vertical_services', playerId)
    .filter((row) => row.vertical === 'universal')
    .sort((a, b) => numeric(a.row_order) - numeric(b.row_order))
  const reviewNote = rowsFor(tables, 'review_notes', playerId)[0]
  return {
    _id: `agency.${idPart(playerId)}`,
    _type: 'agency',
    playerId,
    name: player.name,
    home: player.home,
    url: player.url,
    positioningLine: player.positioning_line,
    shortWhy: player.short_why,
    headquarters: player.hq,
    offices: splitPipe(player.offices),
    founded: player.founded,
    teamSize: player.size,
    projectsCompleted: player.projects_completed,
    industries: splitPipe(player.industries),
    expertise: player.expertise,
    notableClients: player.notable_clients,
    pricing: {
      _type: 'pricing',
      monthly: player.price_monthly,
      monthlyShort: player.price_monthly_short,
      annual: player.price_annual,
      annualShort: player.price_annual_short,
      minimumEngagement: player.min_engagement,
      contractTerms: player.contract_terms,
    },
    timeToResult: player.time_to_result,
    wins: player.wins,
    loses: player.loses,
    buyerTrust: {
      _type: 'buyerTrust',
      identity: player.identity,
      trackRecord: splitPipe(player.track_record),
      thirdPartyProof: splitPipe(player.third_party_proof),
      delivery: splitPipe(player.delivery),
      commercials: splitPipe(player.commercials),
      risk: splitPipe(player.risk),
    },
    ratings: objects(rowsFor(tables, 'ratings', playerId), 'rating', 'platform', (row) => ({
      platform: row.platform,
      value: row.value,
      count: row.count,
      note: row.note || undefined,
      profileUrl: row.profile_url || undefined,
      checkedOn: row.checked_on || undefined,
    })),
    reviews: objects(rowsFor(tables, 'reviews', playerId), 'customerReview', 'reviewer_name', (row) => ({
      quote: row.quote,
      reviewerName: row.reviewer_name,
      reviewerRole: row.reviewer_role,
      source: row.source,
      verification: row.verified || 'unverified',
      sourceUrl: row.source_url || undefined,
    })),
    reviewNote: reviewNote?.review_note || undefined,
    reviewNoteSourceUrl: reviewNote?.source_url || undefined,
    caseStudies: objects(rowsFor(tables, 'cases', playerId), 'caseStudy', 'client', (row) => ({
      client: row.client,
      vertical: row.vertical || undefined,
      clientIndustry: row.client_industry,
      problem: row.problem,
      workDone: row.work_done,
      reportedResult: row.reported_result,
      source: row.source,
      sourceUrl: row.source_url || undefined,
    })),
    portfolio: objects(rowsFor(tables, 'portfolio', playerId), 'portfolioItem', 'title', (row) => ({
      title: row.title,
      vertical: row.vertical,
      assetType: row.asset_type,
      note: row.note,
      url: row.url,
    })),
    primaryServices: splitPipe(player.services_primary),
    supportingServices: splitPipe(player.services_supporting),
    engineCoverage: Object.entries(engineColumns).map(([column, engine], index) => ({
      _key: key('engine', engine, index),
      _type: 'engineCoverage',
      engine,
      coverage: player[column],
    })),
    measurement: player.measure,
    tooling: player.tooling,
    seoRelationship: player.seo_relationship,
    universalServiceLines: objects(universalLines, 'serviceLine', 'service_name', (row) => ({
      order: numeric(row.row_order),
      name: row.service_name,
      whyItExists: row.why_it_exists,
      howTheyDoIt: row.how_this_firm_does_it,
      sourceUrl: row.source_url || undefined,
    })),
    verticalProfiles: buildVerticalProfiles(tables, playerId),
    sources: objects(rowsFor(tables, 'sources', playerId), 'sourceLink', 'label', (row) => ({
      label: row.label,
      url: row.url,
      fetchedOn: row.fetched_on,
    })),
    lastVerified: player.last_verified,
  }
}

function pageWarnings(tables, slug, pageRow) {
  const warnings = []
  const required = [
    ['headline', 'headline'], ['service_name', 'service name'], ['vertical_key', 'vertical key'],
    ['vertical_label', 'vertical label'], ['year', 'year'], ['dek', 'dek'],
    ['publisher_disclosure', 'publisher disclosure'], ['reviewed_date', 'review date'],
    ['published_date', 'published date'], ['methodology_intro', 'methodology introduction'],
    ['seo_title', 'SEO title'], ['meta_description', 'meta description'], ['canonical_url', 'canonical URL'],
  ]
  for (const [field, label] of required) if (!pageRow?.[field]) warnings.push(`Missing page-level ${label}.`)
  if ((tables.assessment_keys || []).filter((row) => row.listing_slug === slug).length !== 3) warnings.push('Exactly three assessment keys are required.')
  if ((tables.methodology || []).filter((row) => row.listing_slug === slug).length < 1) warnings.push('At least one methodology step is required.')
  if ((tables.questions || []).filter((row) => row.listing_slug === slug).length < 4) warnings.push('At least four comparison questions are required.')
  if ((tables.quick_answer || []).filter((row) => row.listing_slug === slug).length < 5) warnings.push('At least five quick-answer rows are required.')
  const considered = (tables.below_the_line || []).filter((row) => row.listing_slug === slug)
  if (considered.some((row) => !row.what_they_are || !row.url || !row.home)) warnings.push('Also-considered records are missing what_they_are, home, or URL values.')
  return warnings
}

function buildPage(tables, slug, rows) {
  const ordered = rows.slice().sort((a, b) => numeric(a.rank) - numeric(b.rank))
  const pageRow = (tables.listicle_pages || []).find((row) => row.listing_slug === slug) || {}
  const verticalKey = pageRow.vertical_key || ordered[0]?.vertical
  const warnings = pageWarnings(tables, slug, pageRow)
  const entries = ordered.map((row, index) => ({
    _key: key('entry', row.player_id, index),
    _type: 'listicleEntry',
    agency: {_type: 'reference', _ref: `agency.${idPart(row.player_id)}`},
    rank: numeric(row.rank),
    listedReason: row.listed_reason,
    capabilityScore: numeric(row.score_capability_70),
    industryScore: numeric(row.score_industry_30),
    totalScore: numeric(row.score_total_100),
    signalRank: numeric(row.signal_rank),
    evidenceQuality: numeric(row.evidence_quality_10),
    bestFor: row.best_for,
    directions: directionRows(tables, row.player_id, verticalKey, slug)
      .sort((a, b) => numeric(a.row_order) - numeric(b.row_order))
      .map((direction) => direction.lever),
    coverage: objects(
      (tables.coverage || []).filter((coverage) => coverage.listing_slug === slug && coverage.player_id === row.player_id),
      'coverageMark',
      'service_key',
      (coverage) => ({serviceKey: coverage.service_key, mark: coverage.mark, meaning: coverage.meaning, sourceBasis: coverage.source_basis}),
    ),
  }))
  return {
    _id: `listicle.${idPart(slug)}`,
    _type: 'listiclePage',
    title: pageRow.headline || ordered[0]?.listing_title,
    slug: {_type: 'slug', current: slug},
    serviceName: pageRow.service_name,
    verticalKey,
    verticalLabel: pageRow.vertical_label,
    year: numeric(pageRow.year),
    dek: pageRow.dek,
    publisherName: pageRow.publisher_name,
    publisherDisclosure: pageRow.publisher_disclosure,
    reviewedAt: pageRow.reviewed_date,
    publishedAt: pageRow.published_date,
    assessmentKeys: objects(
      (tables.assessment_keys || []).filter((row) => row.listing_slug === slug).sort((a, b) => numeric(a.key_order) - numeric(b.key_order)),
      'scoreKey', 'label', (row) => ({label: row.label, description: row.description}),
    ),
    entries,
    quickAnswers: objects(
      (tables.quick_answer || []).filter((row) => row.listing_slug === slug).sort((a, b) => numeric(a.position) - numeric(b.position)),
      'quickAnswerItem', 'player_id', (row) => ({
        position: numeric(row.position),
        agency: {_type: 'reference', _ref: `agency.${idPart(row.player_id)}`},
        displayName: row.display_name,
        reason: row.one_line_reason,
        shown: String(row.shown).toLowerCase() === 'yes',
      }),
    ),
    serviceAxis: objects(
      (tables.service_axis || []).filter((row) => row.vertical === verticalKey).sort((a, b) => numeric(a.axis_order) - numeric(b.axis_order)),
      'serviceAxisItem', 'service_key',
      (row) => ({order: numeric(row.axis_order), key: row.service_key, label: row.service_label, whyItExists: row.why_it_exists}),
    ),
    questions: objects(
      (tables.questions || []).filter((row) => row.listing_slug === slug).sort((a, b) => numeric(a.question_order) - numeric(b.question_order)),
      'questionSection', 'anchor',
      (row) => ({anchor: row.anchor, title: row.question, description: row.description, kind: row.table_type}),
    ),
    alsoConsidered: objects(
      (tables.below_the_line || []).filter((row) => row.listing_slug === slug),
      'alsoConsideredItem', 'player_id', (row) => ({
        playerId: row.player_id,
        name: row.name,
        home: row.home || undefined,
        url: row.url || undefined,
        whatTheyAre: row.what_they_are || undefined,
        capabilityScore: numeric(row.score_capability_70),
        industryScore: numeric(row.score_industry_30),
        reasonExcluded: row.reason_excluded,
        reconsiderIf: row.reconsider_if,
      }),
    ),
    methodologyIntro: pageRow.methodology_intro,
    methodologySteps: objects(
      (tables.methodology || []).filter((row) => row.listing_slug === slug).sort((a, b) => numeric(a.step_order) - numeric(b.step_order)),
      'methodologyStep', 'step_title',
      (row) => ({title: row.step_title, body: portableText(row.step_body, row.step_title)}),
    ),
    methodologyCommunityFinding: pageRow.methodology_community_finding,
    methodologyCorrection: pageRow.methodology_correction,
    seoTitle: pageRow.seo_title,
    metaDescription: pageRow.meta_description,
    canonicalUrl: pageRow.canonical_url,
    footerReviewNote: pageRow.footer_review_note,
    footerLinkNote: pageRow.footer_link_note,
    editorialStatus: warnings.length ? 'needsData' : (pageRow.editorial_status || 'readyForReview'),
    dataWarnings: warnings,
  }
}

function buildTemplate(tables) {
  const firstPage = (tables.listicle_pages || [])[0] || {}
  return {
    _id: 'listicleTemplate.default',
    _type: 'listicleTemplate',
    name: 'MaximusLabs standard listicle template',
    publisherName: firstPage.publisher_name || 'MaximusLabs.ai',
    defaultFooterReviewNote: firstPage.footer_review_note,
    defaultFooterLinkNote: firstPage.footer_link_note,
    pagePathPrefix: '/listicles/',
    sectionOrder: objects(
      (tables.page_spec || []).sort((a, b) => numeric(a.order) - numeric(b.order)),
      'templateSection', 'section',
      (row) => ({order: numeric(row.order), name: row.section, content: row['what it contains']}),
    ),
    writingRules: objects(
      (tables.writing_memory || []).sort((a, b) => numeric(a.rule_order) - numeric(b.rule_order)),
      'writingRule', 'instruction', (row) => ({
        scope: row.scope,
        order: numeric(row.rule_order),
        instruction: row.instruction,
        sanityTarget: row.sanity_target,
        sourceTab: row.source_tab,
        required: String(row.required).toLowerCase() === 'yes',
      }),
    ),
  }
}

export function buildDocuments() {
  const tables = readTables()
  const agencies = tables.players.map((player) => buildAgency(tables, player))
  const listingGroups = Object.groupBy(tables.listings, (row) => row.listing_slug)
  const pages = Object.entries(listingGroups).map(([slug, rows]) => buildPage(tables, slug, rows || []))
  const template = buildTemplate(tables)
  return {tables, agencies, template, pages}
}