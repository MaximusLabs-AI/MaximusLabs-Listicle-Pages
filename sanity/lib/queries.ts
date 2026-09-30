import {defineQuery} from 'next-sanity'

import {legacyUrlGroq, takeoverUrlGroq} from './legacyRules'

// Pages that live at an old Webflow-folder address instead of /blog: their /blog
// address 301s there and every card links straight to it. The rules live in
// legacyRules.ts, shared with next.config.ts, Studio validation and Visit site.
const legacyUrl = legacyUrlGroq

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

// An article created in Sanity and published at an old-folder address (its
// "Replaces old page"), looked up by that address.
export const articleByUrlQuery = defineQuery(`
  *[_type == "infoArticle" && ${takeoverUrlGroq} == $url][0] {
    ...,
    "slug": slug.current,
    "legacyUrl": ${legacyUrl},
    "imageUrl": coalesce(coverImage.asset->url, coverImageUrl)
  }
`)

// Every page with an old-folder URL, for the Cloudflare worker's routing list
// (app/api/legacy-routes). takeover = the app serves that address in the new
// design; otherwise only its /blog address redirects there (migrated articles).
export const legacyRoutesQuery = defineQuery(`
  *[_type in ["infoArticle", "listiclePage"] && defined(slug.current)]{
    _type,
    "slug": slug.current,
    "url": ${legacyUrl},
    "takeover": defined(${takeoverUrlGroq})
  }[defined(url)]
`)
