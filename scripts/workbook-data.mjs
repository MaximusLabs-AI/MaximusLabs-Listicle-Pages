import path from 'node:path'
import {fileURLToPath} from 'node:url'

import XLSX from 'xlsx'

const here = path.dirname(fileURLToPath(import.meta.url))
export const root = path.resolve(here, '..')
export const workbookPath = path.join(root, 'MaximusLabs listicle feed.xlsx')

const headerRows = {README: 2, directions: 2, service_axis: 2, listings: 2, page_spec: 2}
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

function directionRows(tables, playerId, verticalKey) {
  const rows = rowsFor(tables, 'directions', playerId)
  const tagged = rows.filter((row) => String(row.shown_in || '').includes(verticalKey))
  if (tagged.length) return tagged
  if (verticalKey === 'b2b-saas') {
    const explicit = rows.filter((row) => String(row.shown_in || '').includes('b2b-saas'))
    if (explicit.length) return explicit
  }
  const defaultRows = rows.filter((row) => !String(row.shown_in || '').includes('b2b-saas'))
  return defaultRows.length ? defaultRows : rows
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

function pageWarnings(tables, slug, verticalKey) {
  const warnings = [
    'The workbook has no page-level dek field; the importer generated a default.',
    'The workbook has no page-level publisher disclosure field; the importer generated a default.',
    'The workbook page_spec describes methodology structure but not the methodology copy.',
    'The workbook has no SEO title, meta description, canonical URL, or Open Graph image fields.',
    'The workbook has no agency-level review evidence note field.',
  ]
  const considered = tables.below_the_line.filter((row) => row.listing_slug === slug)
  if (considered.some((row) => !row.what_they_are || !row.url || !row.home)) warnings.push('Also-considered records are missing what_they_are, home, or URL values.')
  if (tables.ratings.some((row) => !row.profile_url)) warnings.push('One or more rating profile URLs are missing.')
  if (tables.reviews.some((row) => !row.source_url)) warnings.push('One or more review source URLs are missing.')
  if (tables.cases.some((row) => !row.source_url)) warnings.push('One or more case-study source URLs are missing.')
  if (tables.cases.some((row) => !row.vertical)) warnings.push('One or more case studies are not tagged to a vertical.')
  if (verticalKey === 'b2b-saas') warnings.push('The directions tab has no listing_slug or vertical column; B2B SaaS rows are inferred from shown_in text.')
  return warnings
}

function buildPage(tables, slug, rows) {
  const ordered = rows.slice().sort((a, b) => numeric(a.rank) - numeric(b.rank))
  const first = ordered[0]
  const verticalKey = first.vertical
  const verticalLabel = titleCase(verticalKey)
  const year = Number(String(first.published_date).slice(0, 4)) || new Date().getFullYear()
  const warnings = pageWarnings(tables, slug, verticalKey)
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
    directions: directionRows(tables, row.player_id, verticalKey)
      .sort((a, b) => numeric(a.row_order) - numeric(b.row_order))
      .map((direction) => direction.lever),
    coverage: objects(
      tables.coverage.filter((coverage) => coverage.listing_slug === slug && coverage.player_id === row.player_id),
      'coverageMark',
      'service_key',
      (coverage) => ({serviceKey: coverage.service_key, mark: coverage.mark, meaning: coverage.meaning, sourceBasis: coverage.source_basis}),
    ),
  }))
  const publisher = ordered.find((row) => row.listed_reason === 'publisher') || ordered[0]
  return {
    _id: `listicle.${idPart(slug)}`,
    _type: 'listiclePage',
    title: first.listing_title,
    slug: {_type: 'slug', current: slug},
    serviceName: 'Answer Engine Optimization',
    verticalKey,
    verticalLabel,
    year,
    dek: `Independent evaluation of the agencies building AI citation presence for ${verticalLabel.toLowerCase()} companies, assessed on answer engine capability, industry surface area, and published evidence.`,
    publisherName: 'MaximusLabs.ai',
    publisherDisclosure: `Published by MaximusLabs.ai, which competes with every firm listed. Listed first as publisher; signal rank ${publisher.signal_rank}, printed on our own card.`,
    reviewedAt: first.published_date,
    publishedAt: first.published_date,
    assessmentKeys: [
      {label: 'How it is weighted', description: `Answer engine capability carries 70, ${verticalLabel.toLowerCase()} fit 30.`, _type: 'scoreKey', _key: 'weighting'},
      {label: 'AEO capability', description: 'Declared practice, published methodology, independent recognition, measurement, and outcomes.', _type: 'scoreKey', _key: 'capability'},
      {label: `${verticalLabel} fit`, description: 'Named clients, declared surface, measured citation, and published industry content.', _type: 'scoreKey', _key: 'industry'},
    ],
    entries,
    quickAnswers: objects(
      tables.quick_answer.filter((row) => row.listing_slug === slug).sort((a, b) => numeric(a.position) - numeric(b.position)),
      'quickAnswerItem',
      'player_id',
      (row) => ({
        position: numeric(row.position),
        agency: {_type: 'reference', _ref: `agency.${idPart(row.player_id)}`},
        displayName: row.display_name,
        reason: row.one_line_reason,
        shown: String(row.shown).toLowerCase() === 'yes',
      }),
    ),
    serviceAxis: objects(
      tables.service_axis.filter((row) => row.vertical === verticalKey).sort((a, b) => numeric(a.axis_order) - numeric(b.axis_order)),
      'serviceAxisItem',
      'service_key',
      (row) => ({order: numeric(row.axis_order), key: row.service_key, label: row.service_label, whyItExists: row.why_it_exists}),
    ),
    questions: [
      {anchor: 'q-services', title: 'What answer engine services does each firm actually provide?', description: 'Services down the side, firms across the top, with a count of how many treat each service as core.', kind: 'serviceMatrix'},
      {anchor: 'q-money', title: 'What do you actually get for the money?', description: 'Annual figures are derived from published monthly bands unless the firm quotes annually.', kind: 'commercials'},
      {anchor: 'q-tools', title: 'What tools do they own?', description: 'An owned platform, licensed tools, or a spreadsheet.', kind: 'tooling'},
      {anchor: 'q-industry', title: `How much do they know about ${verticalLabel.toLowerCase()}?`, description: 'Declared industry practice, measured citations, service depth, gaps, and competitive sets.', kind: 'industry'},
    ].map((question, index) => ({...question, _type: 'questionSection', _key: `question-${index + 1}`})),
    alsoConsidered: objects(
      tables.below_the_line.filter((row) => row.listing_slug === slug),
      'alsoConsideredItem',
      'player_id',
      (row) => ({
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
    seoTitle: `${first.listing_title} (${year})`,
    metaDescription: `Compare ${ordered.length} answer engine optimization agencies for ${verticalLabel.toLowerCase()}, including services, pricing, evidence, case studies, and limitations.`,
    footerReviewNote: 'Ratings appear only for platforms each firm is actually on. A live profile with no reviews remains visible.',
    footerLinkNote: 'Every outbound link carries rel="nofollow".',
    editorialStatus: 'needsData',
    dataWarnings: warnings,
  }
}

export function buildDocuments() {
  const tables = readTables()
  const agencies = tables.players.map((player) => buildAgency(tables, player))
  const listingGroups = Object.groupBy(tables.listings, (row) => row.listing_slug)
  const pages = Object.entries(listingGroups).map(([slug, rows]) => buildPage(tables, slug, rows || []))
  return {tables, agencies, pages}
}
