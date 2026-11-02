import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {pillarType} from './pillarType'
import galleryItemType from './galleryItems'
import aboutPageType from './aboutPage'
import {partnerType} from './partnerType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, authorType, pillarType, galleryItemType, aboutPageType, partnerType],
}
