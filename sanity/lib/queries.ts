import {defineQuery} from 'next-sanity'

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
    "href": "/blog/" + slug.current
  }
`)

// Same projection as blogCollectionQuery so related cards reuse the exact
// collection ArticleCard. Four most-recent entries other than the current one.
export const relatedPostsQuery = defineQuery(`
  *[_type in ["listiclePage", "infoArticle"] && slug.current != $slug]
    | order(coalesce(publishedAt, reviewedAt) desc) [0...4] {
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
    "href": "/blog/" + slug.current
  }
`)

export const infoArticleQuery = defineQuery(`
  *[_type == "infoArticle" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
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
