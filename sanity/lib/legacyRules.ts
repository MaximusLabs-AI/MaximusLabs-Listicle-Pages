// Rules for pages that live at an old Webflow-folder address instead of /blog.
// A plain module with no dependencies, shared by the queries, next.config.ts,
// Studio validation and the Visit site action, so they can never drift apart.

export const SITE = 'https://www.maximuslabs.ai'
export const LEGACY_FOLDERS = ['/answer-engine-optimizations/', '/generative-engine-optimization/'] as const

export const isLegacyUrl = (url: unknown): url is string =>
  typeof url === 'string' && LEGACY_FOLDERS.some((folder) => url.startsWith(SITE + folder))

const inLegacyFolder = (field: string) =>
  `(${LEGACY_FOLDERS.map((folder) => `string::startsWith(${field}, "${SITE}${folder}")`).join(' || ')})`

// GROQ: the old address a page is published at in the new design, or null.
// - a listicle whose Canonical URL is an old address,
// - an article created in Sanity (no migration record) whose "Replaces old page"
//   is one. Migrated articles never qualify: they stay on Webflow.
export const takeoverUrlGroq = `select(
  _type == "listiclePage" && defined(canonicalUrl) && ${inLegacyFolder('canonicalUrl')} => canonicalUrl,
  _type == "infoArticle" && !defined(sourceUrl) && defined(replacesUrl) && ${inLegacyFolder('replacesUrl')} => replacesUrl
)`

// GROQ: where a page's /blog address 301s and where its card links: its takeover
// address or, for a migrated article, its original Webflow URL. Null for pages
// that live on /blog.
export const legacyUrlGroq = `coalesce(${takeoverUrlGroq}, select(_type == "infoArticle" && defined(sourceUrl) && ${inLegacyFolder('sourceUrl')} => sourceUrl))`
