import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('MaximusLabs content')
    .items([
      S.listItem()
        .id('standard-listicle-template')
        .title('Standard listicle template')
        .child(
          S.document()
            .schemaType('listicleTemplate')
            .documentId('listicleTemplate.default')
            .title('Standard listicle template'),
        ),
      S.divider(),
      S.documentTypeListItem('listiclePage').title('Listicle pages'),
      S.documentTypeListItem('infoArticle').title('Informational articles'),
      S.documentTypeListItem('agency').title('Agencies'),
    ])
