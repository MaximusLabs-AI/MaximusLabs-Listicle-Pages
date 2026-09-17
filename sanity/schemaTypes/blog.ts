import {defineArrayMember, defineField, defineType} from 'sanity'

const serviceOptions = [
  {title: 'AEO', value: 'aeo'},
  {title: 'GEO & AI SEO', value: 'geo'},
  {title: 'B2B SEO', value: 'b2bSeo'},
  {title: 'Technical SEO', value: 'technicalSeo'},
  {title: 'Agentic Commerce', value: 'agenticCommerce'},
]

const industryOptions = [
  {title: 'B2B SaaS', value: 'b2bSaas'},
  {title: 'Healthcare', value: 'healthcare'},
  {title: 'Finance & FinTech', value: 'finance'},
  {title: 'Cybersecurity', value: 'cybersecurity'},
  {title: 'Ecommerce', value: 'ecommerce'},
  {title: 'Sales & CRM', value: 'salesCrm'},
  {title: 'HR & People', value: 'hrPeople'},
  {title: 'Legal', value: 'legal'},
  {title: 'Supply Chain', value: 'supplyChain'},
  {title: 'Education', value: 'education'},
  {title: 'General', value: 'general'},
]

const blogTypeOptions = [
  {title: 'Informational', value: 'informational'},
  {title: 'Research & Data', value: 'research'},
  {title: 'How-to Guide', value: 'guide'},
  {title: 'Case Study', value: 'caseStudy'},
  {title: 'Tools & Platforms', value: 'tools'},
]

export const blogContentBlock = defineType({
  name: 'blogContentBlock',
  title: 'Blog content block',
  type: 'object',
  fields: [
    defineField({
      name: 'kind',
      title: 'Block type',
      type: 'string',
      options: {
        list: [
          {title: 'Heading', value: 'heading'},
          {title: 'Paragraph', value: 'paragraph'},
          {title: 'Bullet list', value: 'bulletList'},
          {title: 'Numbered list', value: 'numberList'},
          {title: 'Quote', value: 'quote'},
          {title: 'Image', value: 'image'},
          {title: 'Table', value: 'table'},
          {title: 'Embed / preserved HTML', value: 'html'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'headingLevel', title: 'Heading level', type: 'number'}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 6}),
    defineField({name: 'items', title: 'List items', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'url', title: 'Image or embed URL', type: 'url'}),
    defineField({name: 'alt', title: 'Alternative text', type: 'string'}),
    defineField({name: 'caption', title: 'Caption', type: 'text', rows: 2}),
    defineField({name: 'html', title: 'Preserved source HTML', type: 'text', rows: 10}),
  ],
  preview: {
    select: {kind: 'kind', text: 'text', caption: 'caption'},
    prepare: ({kind, text, caption}) => ({title: text || caption || kind, subtitle: kind}),
  },
})

function sharedFields() {
  return [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({name: 'slug', title: 'Slug', type: 'slug', group: 'content', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'excerpt', title: 'Description', type: 'text', rows: 4, group: 'content', validation: (rule) => rule.required()}),
    defineField({name: 'coverImage', title: 'Collection cover image', type: 'image', group: 'content', options: {hotspot: true}}),
    defineField({name: 'coverImageUrl', title: 'Migrated Webflow cover URL', type: 'url', group: 'content'}),
    defineField({name: 'authorName', title: 'Author', type: 'string', group: 'content', initialValue: 'Krishna Kaanth'}),
    defineField({name: 'authorImageUrl', title: 'Author image URL', type: 'url', group: 'content'}),
    defineField({name: 'publishedAt', title: 'Published date', type: 'date', group: 'content'}),
    defineField({name: 'updatedAt', title: 'Last updated', type: 'date', group: 'content'}),
    defineField({name: 'readingMinutes', title: 'Reading time in minutes', type: 'number', group: 'content'}),
    defineField({name: 'service', title: 'Service', type: 'string', group: 'discovery', options: {list: serviceOptions}, validation: (rule) => rule.required()}),
    defineField({name: 'industry', title: 'Industry', type: 'string', group: 'discovery', options: {list: industryOptions}, validation: (rule) => rule.required()}),
    defineField({name: 'blogType', title: 'Blog type', type: 'string', group: 'discovery', options: {list: blogTypeOptions}, validation: (rule) => rule.required()}),
    defineField({name: 'searchKeywords', title: 'Search keywords', type: 'array', of: [{type: 'string'}], group: 'discovery'}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string', group: 'seo'}),
    defineField({name: 'metaDescription', title: 'Meta description', type: 'text', rows: 3, group: 'seo'}),
    defineField({name: 'sourceUrl', title: 'Original published URL', type: 'url', group: 'migration', readOnly: true}),
    defineField({name: 'sourcePath', title: 'Original URL path', type: 'string', group: 'migration', readOnly: true}),
    defineField({name: 'migratedAt', title: 'Migrated at', type: 'datetime', group: 'migration', readOnly: true}),
    defineField({name: 'sourceHash', title: 'Source hash', type: 'string', group: 'migration', readOnly: true}),
  ]
}

const groups = [
  {name: 'content', title: 'Content', default: true},
  {name: 'discovery', title: 'Collection and filters'},
  {name: 'seo', title: 'SEO'},
  {name: 'migration', title: 'Migration record'},
]

export const infoArticle = defineType({
  name: 'infoArticle',
  title: 'Informational article',
  type: 'document',
  groups,
  fields: [
    ...sharedFields(),
    defineField({
      name: 'body',
      title: 'Article blocks',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'blogContentBlock'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'service'}},
})

