import {defineArrayMember, defineField, defineType} from 'sanity'

export const listicleTemplate = defineType({
  name: 'listicleTemplate',
  title: 'Listicle template',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Template name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'templateVersion', title: 'Template version', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'publisherName', title: 'Default publisher', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'defaultFooterReviewNote', title: 'Default review-data note', type: 'text', rows: 3}),
    defineField({name: 'defaultFooterLinkNote', title: 'Default outbound-link note', type: 'text', rows: 2}),
    defineField({name: 'pagePathPrefix', title: 'Page path prefix', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'sourceWorkbook', title: 'Source workbook', type: 'string', readOnly: true}),
    defineField({
      name: 'sectionOrder',
      title: 'Required page sections',
      description: 'The fixed page anatomy. The Next.js renderer preserves this order for every listicle.',
      type: 'array',
      of: [defineArrayMember({type: 'templateSection'})],
      validation: (rule) => rule.required().min(15),
    }),
    defineField({
      name: 'writingRules',
      title: 'Workbook writing memory',
      description: 'Reusable authoring and field-mapping rules imported from the writing_memory worksheet.',
      type: 'array',
      of: [defineArrayMember({type: 'writingRule'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'templateVersion'}},
})
