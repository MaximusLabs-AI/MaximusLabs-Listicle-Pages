import {defineArrayMember, defineField, defineType} from 'sanity'

export const listiclePage = defineType({
  name: 'listiclePage',
  title: 'Listicle page',
  type: 'document',
  groups: [
    {name: 'page', title: 'Page', default: true},
    {name: 'ranking', title: 'Ranking'},
    {name: 'methodology', title: 'Methodology'},
    {name: 'seo', title: 'SEO'},
    {name: 'workflow', title: 'Workflow'},
  ],
  fields: [
    defineField({name: 'title', title: 'Headline', type: 'string', group: 'page', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'page', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'serviceName', title: 'Service name', type: 'string', group: 'page', validation: (rule) => rule.required()}),
    defineField({name: 'verticalKey', title: 'Vertical key', type: 'string', group: 'page', validation: (rule) => rule.required()}),
    defineField({name: 'verticalLabel', title: 'Vertical label', type: 'string', group: 'page', validation: (rule) => rule.required()}),
    defineField({name: 'year', title: 'Year', type: 'number', group: 'page', validation: (rule) => rule.required().integer()}),
    defineField({name: 'dek', title: 'Dek', type: 'text', rows: 3, group: 'page', validation: (rule) => rule.required().warning('Required for a complete published page.')}),
    defineField({name: 'publisherName', title: 'Publisher', type: 'string', group: 'page', initialValue: 'MaximusLabs.ai'}),
    defineField({name: 'publisherDisclosure', title: 'Publisher disclosure', type: 'text', rows: 4, group: 'page', validation: (rule) => rule.required().warning('Required for a complete published page.')}),
    defineField({name: 'reviewedAt', title: 'Last reviewed', type: 'date', group: 'page'}),
    defineField({name: 'publishedAt', title: 'Published date', type: 'date', group: 'page'}),
    defineField({name: 'assessmentKeys', title: 'Three-up assessment key', type: 'array', of: [defineArrayMember({type: 'scoreKey'})], group: 'page', validation: (rule) => rule.max(3)}),

    defineField({name: 'entries', title: 'Ranked agencies', type: 'array', of: [defineArrayMember({type: 'listicleEntry'})], group: 'ranking', validation: (rule) => rule.required().min(1)}),
    defineField({name: 'quickAnswers', title: 'Quick answer panel', type: 'array', of: [defineArrayMember({type: 'quickAnswerItem'})], group: 'ranking'}),
    defineField({name: 'serviceAxis', title: 'Service comparison axis', type: 'array', of: [defineArrayMember({type: 'serviceAxisItem'})], group: 'ranking'}),
    defineField({name: 'questions', title: 'Comparison questions', type: 'array', of: [defineArrayMember({type: 'questionSection'})], group: 'ranking'}),
    defineField({name: 'alsoConsidered', title: 'Also considered', type: 'array', of: [defineArrayMember({type: 'alsoConsideredItem'})], group: 'ranking'}),

    defineField({name: 'methodologyIntro', title: 'Methodology introduction', type: 'text', rows: 4, group: 'methodology'}),
    defineField({name: 'methodologySteps', title: 'Methodology steps', type: 'array', of: [defineArrayMember({type: 'methodologyStep'})], group: 'methodology'}),
    defineField({name: 'methodologyCommunityFinding', title: 'Community finding', type: 'text', rows: 5, group: 'methodology'}),
    defineField({name: 'methodologyCorrection', title: 'Correction worth naming', type: 'text', rows: 5, group: 'methodology'}),

    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo'}),
    defineField({name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo'}),
    defineField({name: 'canonicalUrl', title: 'Canonical URL', type: 'url', group: 'seo'}),
    defineField({name: 'openGraphImage', title: 'Open Graph image', type: 'image', group: 'seo', options: {hotspot: true}}),
    defineField({name: 'footerReviewNote', title: 'Review-data footer note', type: 'text', rows: 3, group: 'page'}),
    defineField({name: 'footerLinkNote', title: 'Outbound-link footer note', type: 'text', rows: 2, group: 'page'}),

    defineField({
      name: 'editorialStatus',
      title: 'Editorial status',
      type: 'string',
      group: 'workflow',
      options: {
        list: [
          {title: 'Needs data', value: 'needsData'},
          {title: 'Ready for review', value: 'readyForReview'},
          {title: 'Approved', value: 'approved'},
        ],
        layout: 'radio',
      },
      initialValue: 'needsData',
    }),
    defineField({name: 'dataWarnings', title: 'Import warnings', type: 'array', of: [{type: 'string'}], group: 'workflow', readOnly: true}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'editorialStatus'},
  },
})
