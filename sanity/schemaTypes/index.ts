import {agency} from './agency'
import {blogContentBlock, infoArticle} from './blog'
import {listiclePage} from './listiclePage'
import {listicleTemplate} from './listicleTemplate'
import {objectTypes} from './objects'

export const schemaTypes = [
  ...objectTypes,
  blogContentBlock,
  agency,
  listicleTemplate,
  listiclePage,
  infoArticle,
]
