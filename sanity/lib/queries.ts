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

export const listiclePageQuery = defineQuery(`
  *[_type == "listiclePage" && slug.current == $slug][0] {
    ...,
    "slug": slug.current,
    template->{
      name,
      templateVersion,
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
