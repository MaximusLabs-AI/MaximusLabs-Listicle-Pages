import {defineArrayMember, defineField, defineType} from 'sanity'

const requiredString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'string',
    validation: (rule) => rule.required(),
  })

export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing and terms',
  type: 'object',
  fields: [
    defineField({name: 'monthly', title: 'Monthly pricing', type: 'text', rows: 4}),
    defineField({name: 'monthlyShort', title: 'Monthly pricing short', type: 'string'}),
    defineField({name: 'annual', title: 'Annual pricing', type: 'text', rows: 4}),
    defineField({name: 'annualShort', title: 'Annual pricing short', type: 'string'}),
    defineField({name: 'minimumEngagement', title: 'Minimum engagement', type: 'text', rows: 2}),
    defineField({name: 'contractTerms', title: 'Contract and exit terms', type: 'text', rows: 3}),
  ],
})

export const buyerTrust = defineType({
  name: 'buyerTrust',
  title: 'Buyer trust',
  type: 'object',
  fields: [
    defineField({name: 'identity', title: 'Identity and standing', type: 'text', rows: 4}),
    defineField({name: 'trackRecord', title: 'Track record', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'thirdPartyProof', title: 'Third-party proof', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'delivery', title: 'How the work gets done', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'commercials', title: 'Commercial terms', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'risk', title: 'Risk and recourse', type: 'array', of: [{type: 'string'}]}),
  ],
})

export const engineCoverage = defineType({
  name: 'engineCoverage',
  title: 'Engine coverage',
  type: 'object',
  fields: [
    requiredString('engine', 'Engine'),
    defineField({
      name: 'coverage',
      title: 'Coverage',
      type: 'string',
      options: {
        list: [
          {title: 'Optimised and tracked', value: 'tick'},
          {title: 'Tracked or partial', value: 'part'},
          {title: 'Not covered', value: 'none'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'engine', subtitle: 'coverage'}},
})

export const rating = defineType({
  name: 'rating',
  title: 'Rating',
  type: 'object',
  fields: [
    requiredString('platform', 'Platform'),
    requiredString('value', 'Value'),
    defineField({name: 'count', title: 'Count or status', type: 'string'}),
    defineField({name: 'note', title: 'Note', type: 'string'}),
    defineField({name: 'profileUrl', title: 'Profile URL', type: 'url'}),
    defineField({name: 'checkedOn', title: 'Checked on', type: 'date'}),
  ],
  preview: {select: {title: 'platform', subtitle: 'value'}},
})

export const customerReview = defineType({
  name: 'customerReview',
  title: 'Customer review',
  type: 'object',
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    requiredString('reviewerName', 'Reviewer name'),
    defineField({name: 'reviewerRole', title: 'Reviewer role', type: 'string'}),
    requiredString('source', 'Source'),
    defineField({
      name: 'verification',
      title: 'Verification',
      type: 'string',
      options: {
        list: [
          {title: 'Third-party', value: 'third-party'},
          {title: 'Vendor-published', value: 'vendor-published'},
          {title: 'Unverified', value: 'unverified'},
        ],
      },
    }),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
  ],
  preview: {select: {title: 'reviewerName', subtitle: 'source'}},
})

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'object',
  fields: [
    requiredString('client', 'Client'),
    defineField({name: 'vertical', title: 'Vertical', type: 'string'}),
    defineField({name: 'clientIndustry', title: 'Client industry', type: 'string'}),
    defineField({name: 'problem', title: 'Problem', type: 'text', rows: 3}),
    defineField({name: 'workDone', title: 'Work done', type: 'text', rows: 3}),
    defineField({name: 'reportedResult', title: 'Reported result', type: 'text', rows: 3}),
    defineField({name: 'source', title: 'Source', type: 'string'}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
  ],
  preview: {select: {title: 'client', subtitle: 'clientIndustry'}},
})

export const portfolioItem = defineType({
  name: 'portfolioItem',
  title: 'Portfolio item',
  type: 'object',
  fields: [
    requiredString('title', 'Title'),
    defineField({name: 'vertical', title: 'Vertical', type: 'string'}),
    defineField({name: 'assetType', title: 'Asset type', type: 'string'}),
    defineField({name: 'note', title: 'Why it matters', type: 'text', rows: 4}),
    defineField({name: 'url', title: 'URL', type: 'url'}),
  ],
  preview: {select: {title: 'title', subtitle: 'assetType'}},
})

export const sourceLink = defineType({
  name: 'sourceLink',
  title: 'Source',
  type: 'object',
  fields: [
    requiredString('label', 'Label'),
    defineField({name: 'url', title: 'URL', type: 'url', validation: (rule) => rule.required()}),
    defineField({name: 'fetchedOn', title: 'Fetched on', type: 'date'}),
  ],
  preview: {select: {title: 'label', subtitle: 'url'}},
})

export const serviceLine = defineType({
  name: 'serviceLine',
  title: 'Service line',
  type: 'object',
  fields: [
    defineField({name: 'order', title: 'Order', type: 'number'}),
    requiredString('name', 'What they do'),
    defineField({name: 'whyItExists', title: 'Why it exists', type: 'text', rows: 2}),
    defineField({name: 'howTheyDoIt', title: 'How this firm does it', type: 'text', rows: 4}),
    defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}),
  ],
  preview: {select: {title: 'name', subtitle: 'whyItExists'}},
})

export const verticalProfile = defineType({
  name: 'verticalProfile',
  title: 'Vertical profile',
  type: 'object',
  fields: [
    requiredString('verticalKey', 'Vertical key'),
    defineField({name: 'pitch', title: 'Pitch', type: 'text', rows: 5}),
    defineField({name: 'serviceLines', title: 'Service lines', type: 'array', of: [defineArrayMember({type: 'serviceLine'})]}),
    defineField({name: 'notOffered', title: 'Not offered', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'builtFor', title: 'Company positions', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'icpNote', title: 'ICP note', type: 'text', rows: 4}),
    defineField({name: 'whoTheyWriteAgainst', title: 'Who they write against', type: 'text', rows: 4}),
    defineField({name: 'auditFindings', title: 'What the first audit finds', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'evidence', title: 'Proof they have done it', type: 'text', rows: 5}),
    defineField({name: 'whereItBreaks', title: 'Where it breaks', type: 'text', rows: 5}),
    defineField({name: 'namedIndustryClients', title: 'Named industry clients', type: 'text', rows: 3}),
    defineField({name: 'declaredSurface', title: 'Declared industry surface', type: 'text', rows: 3}),
    defineField({name: 'citedOnPrompts', title: 'Cited on industry prompts', type: 'string'}),
  ],
  preview: {select: {title: 'verticalKey', subtitle: 'pitch'}},
})

export const scoreKey = defineType({
  name: 'scoreKey',
  title: 'Assessment key',
  type: 'object',
  fields: [requiredString('label', 'Label'), defineField({name: 'description', title: 'Description', type: 'text', rows: 3})],
  preview: {select: {title: 'label', subtitle: 'description'}},
})

export const serviceAxisItem = defineType({
  name: 'serviceAxisItem',
  title: 'Service axis item',
  type: 'object',
  fields: [
    defineField({name: 'order', title: 'Order', type: 'number'}),
    requiredString('key', 'Key'),
    requiredString('label', 'Label'),
    defineField({name: 'whyItExists', title: 'Why it exists', type: 'string'}),
  ],
  preview: {select: {title: 'label', subtitle: 'whyItExists'}},
})

export const coverageMark = defineType({
  name: 'coverageMark',
  title: 'Service coverage mark',
  type: 'object',
  fields: [
    requiredString('serviceKey', 'Service key'),
    defineField({
      name: 'mark',
      title: 'Mark',
      type: 'string',
      options: {list: [{title: 'Core', value: 'F'}, {title: 'Partial', value: 'P'}, {title: 'Not offered', value: 'N'}]},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'meaning', title: 'Meaning', type: 'string'}),
    defineField({name: 'sourceBasis', title: 'Source basis', type: 'string'}),
  ],
  preview: {select: {title: 'serviceKey', subtitle: 'mark'}},
})

export const listicleEntry = defineType({
  name: 'listicleEntry',
  title: 'Ranked agency',
  type: 'object',
  fields: [
    defineField({name: 'agency', title: 'Agency', type: 'reference', to: [{type: 'agency'}], validation: (rule) => rule.required()}),
    defineField({name: 'rank', title: 'Published rank', type: 'number', validation: (rule) => rule.required().integer().positive()}),
    defineField({name: 'listedReason', title: 'Why it is listed here', type: 'string'}),
    defineField({name: 'capabilityScore', title: 'Capability score out of 70', type: 'number'}),
    defineField({name: 'industryScore', title: 'Industry score out of 30', type: 'number'}),
    defineField({name: 'totalScore', title: 'Total score out of 100', type: 'number'}),
    defineField({name: 'signalRank', title: 'Signal rank', type: 'number'}),
    defineField({name: 'evidenceQuality', title: 'Evidence quality out of 10', type: 'number'}),
    defineField({name: 'bestFor', title: 'Best for', type: 'text', rows: 3}),
    defineField({name: 'directions', title: 'What they actually do', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'coverage', title: 'Service coverage', type: 'array', of: [defineArrayMember({type: 'coverageMark'})]}),
  ],
  preview: {select: {title: 'agency.name', subtitle: 'rank'}},
})

export const quickAnswerItem = defineType({
  name: 'quickAnswerItem',
  title: 'Quick answer item',
  type: 'object',
  fields: [
    defineField({name: 'position', title: 'Position', type: 'number'}),
    defineField({name: 'agency', title: 'Agency', type: 'reference', to: [{type: 'agency'}]}),
    defineField({name: 'displayName', title: 'Display name', type: 'string'}),
    defineField({name: 'reason', title: 'One-line reason', type: 'string'}),
    defineField({name: 'shown', title: 'Shown in initial panel', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'displayName', subtitle: 'reason'}},
})

export const methodologyStep = defineType({
  name: 'methodologyStep',
  title: 'Methodology step',
  type: 'object',
  fields: [
    requiredString('title', 'Title'),
    defineField({name: 'body', title: 'Body', type: 'array', of: [{type: 'block'}]}),
  ],
  preview: {select: {title: 'title'}},
})

export const questionSection = defineType({
  name: 'questionSection',
  title: 'Comparison question',
  type: 'object',
  fields: [
    requiredString('anchor', 'Anchor'),
    requiredString('title', 'Question'),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
    defineField({
      name: 'kind',
      title: 'Table type',
      type: 'string',
      options: {
        list: [
          {title: 'Service matrix', value: 'serviceMatrix'},
          {title: 'Commercials', value: 'commercials'},
          {title: 'Tools and SEO', value: 'tooling'},
          {title: 'Industry depth', value: 'industry'},
        ],
      },
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'kind'}},
})

export const alsoConsideredItem = defineType({
  name: 'alsoConsideredItem',
  title: 'Also considered firm',
  type: 'object',
  fields: [
    defineField({name: 'playerId', title: 'Source player ID', type: 'string'}),
    requiredString('name', 'Name'),
    defineField({name: 'home', title: 'Website label', type: 'string'}),
    defineField({name: 'url', title: 'Website URL', type: 'url'}),
    defineField({name: 'whatTheyAre', title: 'What they are', type: 'text', rows: 2}),
    defineField({name: 'capabilityScore', title: 'Capability score out of 70', type: 'number'}),
    defineField({name: 'industryScore', title: 'Industry score out of 30', type: 'number'}),
    defineField({name: 'reasonExcluded', title: 'Why it falls short', type: 'text', rows: 4}),
    defineField({name: 'reconsiderIf', title: 'Reconsider if', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'name', subtitle: 'reasonExcluded'}},
})

export const templateSection = defineType({
  name: 'templateSection',
  title: 'Template section',
  type: 'object',
  fields: [
    defineField({name: 'order', title: 'Order', type: 'number', validation: (rule) => rule.required().integer().positive()}),
    requiredString('name', 'Section'),
    defineField({name: 'content', title: 'What it contains', type: 'text', rows: 3}),
  ],
  preview: {select: {title: 'name', subtitle: 'content'}},
})

export const writingRule = defineType({
  name: 'writingRule',
  title: 'Writing rule',
  type: 'object',
  fields: [
    requiredString('scope', 'Scope'),
    defineField({name: 'order', title: 'Order', type: 'number'}),
    defineField({name: 'instruction', title: 'Instruction', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'sanityTarget', title: 'Sanity target', type: 'string'}),
    defineField({name: 'sourceTab', title: 'Source worksheet', type: 'string'}),
    defineField({name: 'required', title: 'Required', type: 'boolean', initialValue: true}),
  ],
  preview: {select: {title: 'instruction', subtitle: 'sanityTarget'}},
})
export const objectTypes = [
  pricing,
  buyerTrust,
  engineCoverage,
  rating,
  customerReview,
  caseStudy,
  portfolioItem,
  sourceLink,
  serviceLine,
  verticalProfile,
  scoreKey,
  serviceAxisItem,
  coverageMark,
  listicleEntry,
  quickAnswerItem,
  methodologyStep,
  questionSection,
  alsoConsideredItem,
  templateSection,
  writingRule,
]
