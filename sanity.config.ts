import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

import {VisitSiteAction} from './sanity/actions/VisitSiteAction'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'MaximusLabs Listicle Pages',
  projectId:
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    process.env.SANITY_PROJECT_ID ||
    'zhc68b02',
  dataset:
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    'production',
  basePath: '/studio',
  plugins: [structureTool({structure}), visionTool()],
  document: {
    actions: (previous, context) =>
      ['listiclePage', 'infoArticle'].includes(context.schemaType)
        ? [VisitSiteAction, ...previous]
        : previous,
    newDocumentOptions: (previous) =>
      previous.filter((item) => item.templateId !== 'listicleTemplate'),
  },
  schema: {types: schemaTypes},
})
