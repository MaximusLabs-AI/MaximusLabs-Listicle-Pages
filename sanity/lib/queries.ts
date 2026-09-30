import {defineQuery} from 'next-sanity'

// Informational articles migrated from Webflow keep their original URL
// (/answer-engine-optimizations/*, /generative-engine-optimization/*) as the
// canonical one, because that URL carries the ranking history. Their /blog copy
// 301s there and every card links straight to it. Listicles have no older URL,
// and an article whose sourceUrl is already /blog stays on /blog.
// next.config.ts repeats this filter to build the 301 list; keep them in step.
const legacyUrl = `select(_type == "infoArticle" && defined(sourceUrl) && !string::startsWith(sourceUrl, "https://www.maximuslabs.ai/blog/") => sourceUrl)`

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
export const listiclePageQuery = defineQuery(`
  *[_type == "listiclePage" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
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
  }
`)
