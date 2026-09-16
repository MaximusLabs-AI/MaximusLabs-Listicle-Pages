import {defineArrayMember, defineField, defineType} from 'sanity'

export const agency = defineType({
  name: 'agency',
  title: 'Agency',
  type: 'document',
  groups: [
    {name: 'identity', title: 'Identity', default: true},
    {name: 'commercials', title: 'Commercials'},
    {name: 'proof', title: 'Proof'},
    {name: 'capability', title: 'AEO capability'},
    {name: 'verticals', title: 'Verticals'},
    {name: 'sources', title: 'Sources'},
  ],
  fields: [
    defineField({name: 'playerId', title: 'Player ID', type: 'string', group: 'identity', readOnly: true, validation: (rule) => rule.required()}),
    defineField({name: 'name', title: 'Name', type: 'string', group: 'identity', validation: (rule) => rule.required()}),
    defineField({name: 'home', title: 'Website label', type: 'string', group: 'identity'}),
    defineField({name: 'url', title: 'Website URL', type: 'url', group: 'identity'}),
    defineField({name: 'positioningLine', title: 'Positioning line', type: 'text', rows: 3, group: 'identity'}),
    defineField({name: 'shortWhy', title: 'Short reason', type: 'string', group: 'identity'}),
    defineField({name: 'headquarters', title: 'Headquarters', type: 'string', group: 'identity'}),
    defineField({name: 'offices', title: 'Offices and coverage', type: 'array', of: [{type: 'string'}], group: 'identity'}),
    defineField({name: 'founded', title: 'Founded', type: 'string', group: 'identity'}),
    defineField({name: 'teamSize', title: 'Team size', type: 'string', group: 'identity'}),
    defineField({name: 'projectsCompleted', title: 'Projects completed', type: 'string', group: 'identity'}),
    defineField({name: 'industries', title: 'Industries served', type: 'array', of: [{type: 'string'}], group: 'identity'}),
    defineField({name: 'expertise', title: 'Areas of expertise', type: 'text', rows: 4, group: 'identity'}),
    defineField({name: 'notableClients', title: 'Notable clients', type: 'text', rows: 5, group: 'identity'}),

    defineField({name: 'pricing', title: 'Pricing and terms', type: 'pricing', group: 'commercials'}),
    defineField({name: 'timeToResult', title: 'Time to first result', type: 'text', rows: 3, group: 'commercials'}),
    defineField({name: 'wins', title: 'Where it wins', type: 'text', rows: 5, group: 'commercials'}),
    defineField({name: 'loses', title: 'Where it loses', type: 'text', rows: 5, group: 'commercials'}),

    defineField({name: 'buyerTrust', title: 'Buyer trust', type: 'buyerTrust', group: 'proof'}),
    defineField({name: 'ratings', title: 'Ratings', type: 'array', of: [defineArrayMember({type: 'rating'})], group: 'proof'}),
    defineField({name: 'reviews', title: 'Customer reviews', type: 'array', of: [defineArrayMember({type: 'customerReview'})], group: 'proof'}),
    defineField({name: 'reviewNote', title: 'Review evidence note', type: 'text', rows: 4, group: 'proof'}),
    defineField({name: 'reviewNoteSourceUrl', title: 'Review evidence source', type: 'url', group: 'proof'}),
    defineField({name: 'caseStudies', title: 'Case studies', type: 'array', of: [defineArrayMember({type: 'caseStudy'})], group: 'proof'}),
    defineField({name: 'portfolio', title: 'Portfolio', type: 'array', of: [defineArrayMember({type: 'portfolioItem'})], group: 'proof'}),

    defineField({name: 'primaryServices', title: 'Primary service labels', type: 'array', of: [{type: 'string'}], group: 'capability'}),
    defineField({name: 'supportingServices', title: 'Supporting service labels', type: 'array', of: [{type: 'string'}], group: 'capability'}),
    defineField({name: 'engineCoverage', title: 'Engine coverage', type: 'array', of: [defineArrayMember({type: 'engineCoverage'})], group: 'capability'}),
    defineField({name: 'measurement', title: 'What gets measured', type: 'text', rows: 4, group: 'capability'}),
    defineField({name: 'tooling', title: 'Tooling and IP', type: 'text', rows: 4, group: 'capability'}),
    defineField({name: 'seoRelationship', title: 'Relationship to SEO', type: 'text', rows: 4, group: 'capability'}),
    defineField({name: 'universalServiceLines', title: 'Universal AEO service lines', type: 'array', of: [defineArrayMember({type: 'serviceLine'})], group: 'capability'}),

    defineField({name: 'verticalProfiles', title: 'Vertical profiles', type: 'array', of: [defineArrayMember({type: 'verticalProfile'})], group: 'verticals', validation: (rule) => rule.unique()}),
    defineField({name: 'sources', title: 'Sources', type: 'array', of: [defineArrayMember({type: 'sourceLink'})], group: 'sources'}),
    defineField({name: 'lastVerified', title: 'Last verified', type: 'date', group: 'sources'}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'headquarters'},
  },
})
