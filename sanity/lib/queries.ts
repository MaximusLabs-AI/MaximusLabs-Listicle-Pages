import {defineQuery} from 'next-sanity'

// Pages that live at a URL in one of the original Webflow folders instead of
// /blog, because that URL carries the ranking history:
// - informational articles migrated from Webflow (their original sourceUrl),
// - listicles published at an old-folder URL (their canonicalUrl).
// Their /blog address 301s there, and every card links straight to it. The two
// folders are listed explicitly so a stray URL can never create a redirect loop.
// next.config.ts repeats this rule to build the 301 list; keep them in step.
const inLegacyFolder = (field: string) =>
  `(string::startsWith(${field}, "https://www.maximuslabs.ai/answer-engine-optimizations/") || string::startsWith(${field}, "https://www.maximuslabs.ai/generative-engine-optimization/"))`
const legacyUrl = `select(
  _type == "infoArticle" && defined(sourceUrl) && ${inLegacyFolder('sourceUrl')} => sourceUrl,
  _type == "listiclePage" && defined(canonicalUrl) && ${inLegacyFolder('canonicalUrl')} => canonicalUrl
)`

export const listicleIndexQuery = defineQuery(`
  *[_type == "listiclePage"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    verticalLabel,
    editorialStatus,
    publishedAt
  }
`)

export const blogCollectionQuery = defineQuery(`
  *[_type in ["listiclePage", "infoArticle"]] | order(coalesce(publishedAt, reviewedAt) desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    "serviceName": coalesce(serviceName, service),
    "verticalLabel": coalesce(verticalLabel, industry),
    "dek": coalesce(dek, excerpt),
    "publisherName": coalesce(publisherName, authorName),
    publishedAt,
    reviewedAt,
    readingMinutes,
    blogType,
    contentCategory,
    "imageUrl": coalesce(coverImage.asset->url, openGraphImage.asset->url, coverImageUrl),
    "agencyCount": count(entries),
    "href": coalesce(${legacyUrl}, "/blog/" + slug.current)
  }
`)

export const infoArticleQuery = defineQuery(`
  *[_type == "infoArticle" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    "legacyUrl": ${legacyUrl},
    "imageUrl": coalesce(coverImage.asset->url, coverImageUrl)
  }
`)

// Everything the listicle template needs, including resolved agencies.
const listicleProjection = `{
    ...,
    "slug": slug.current,
    "legacyUrl": ${legacyUrl},
    "template": *[_id == "listicleTemplate.default"][0]{
      name,
      publisherName,
      defaultFooterReviewNote,
      defaultFooterLinkNote,
      pagePathPrefix,
      sectionOrder[],
      writingRules[]
    },
    entries[] {
      ...,
      agency-> {
        ...,
        pricing,
        buyerTrust,
        engineCoverage[],
        ratings[],
        reviews[],
        caseStudies[],
        portfolio[],
        universalServiceLines[],
        verticalProfiles[],
        sources[]
      }
    },
    quickAnswers[] {
      ...,
      agency->{_id, playerId, name, home}
    }
  }`

export const listiclePageQuery = defineQuery(`
  *[_type == "listiclePage" && slug.current == $slug][0] ${listicleProjection}
`)

// A listicle published at an old-folder URL, looked up by that URL.
export const listicleByUrlQuery = defineQuery(`
  *[_type == "listiclePage" && canonicalUrl == $url][0] ${listicleProjection}
`)

// Every page with an old-folder URL, for the Cloudflare worker's routing list
// (app/api/legacy-routes). Same legacyUrl rule as the cards and redirects.
export const legacyRoutesQuery = defineQuery(`
  *[_type in ["infoArticle", "listiclePage"] && defined(slug.current)]{
    _type,
    "slug": slug.current,
    "url": ${legacyUrl}
  }[defined(url)]
`)
