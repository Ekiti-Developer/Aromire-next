import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {partnerType} from './partnerType'
import {authorType} from './authorType'
import {pillarType} from './pillarType'
import aboutPageType from './aboutPage'
import {siteSettingsType} from './siteSettings'
import {ctaLinkType, standPillarType, pullQuoteType, photoType, chapterType} from './contentObjects'
import {locationType} from './location'
import {testimonialType} from './testimonial'
import {programType} from './program'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    partnerType,
    authorType,
    pillarType,
    aboutPageType,
    siteSettingsType,
    ctaLinkType,
    standPillarType,
    pullQuoteType,
    photoType,
    chapterType,
    locationType,
    testimonialType,
    programType,
  ],
}
