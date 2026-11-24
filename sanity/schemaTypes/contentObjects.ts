import {defineArrayMember, defineField, defineType} from 'sanity'

export const ctaLinkType = defineType({
  name: 'ctaLink',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {list: [{title: 'Internal page', value: 'internal'}, {title: 'External URL', value: 'external'}]},
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internalPage',
      title: 'Internal page path',
      type: 'string',
      options: {
        list: [
          {title: 'Home', value: '/'},
          {title: 'Programs', value: '/programs'},
          {title: 'Blog', value: '/blog'},
          {title: 'Get involved', value: '/get-involved'},
        ],
      },
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent;
        if (!parent || typeof parent !== 'object' || !('linkType' in parent) || parent.linkType !== 'internal') return true;
        return typeof value === 'string' && value.length > 0 ? true : 'Choose an internal page.';
      }),
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent;
        if (!parent || typeof parent !== 'object' || !('linkType' in parent) || parent.linkType !== 'external') return true;
        if (typeof value !== 'string') return 'Add an external URL.';
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'https:' || parsed.protocol === 'http:'
            ? true
            : 'External URLs must use HTTP or HTTPS.';
        } catch {
          return 'Add a valid external URL.';
        }
      }),
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
  ],
})

export const standPillarType = defineType({
  name: 'standPillar',
  title: 'Pillar',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'text', title: 'Description', type: 'text', rows: 2, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

export const pullQuoteType = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  fields: [
    defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'attribution', type: 'string'}),
  ],
  preview: {select: {title: 'text', subtitle: 'attribution'}},
})

export const photoType = defineType({
  name: 'programPhoto',
  title: 'Program photo or video',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media type',
      type: 'string',
      options: {layout: 'radio', list: [{title: 'Photo', value: 'image'}, {title: 'YouTube video', value: 'video'}]},
      initialValue: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required()})],
      hidden: ({parent}) => parent?.mediaType !== 'image',
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent;
        if (parent && typeof parent === 'object' && 'mediaType' in parent && parent.mediaType !== 'image') return true;
        return value ? true : 'Add a photo for photo entries.';
      }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Use a YouTube video; videos are embedded only after a visitor chooses to play.',
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent;
        if (!parent || typeof parent !== 'object' || !('mediaType' in parent) || parent.mediaType !== 'video') return true;
        if (typeof value !== 'string') return 'Add a YouTube video URL.';
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'https:' && ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(parsed.hostname)
            ? true
            : 'Use a YouTube URL over HTTPS.';
        } catch {
          return 'Add a valid YouTube URL.';
        }
      }),
      hidden: ({parent}) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'poster',
      title: 'Video poster image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required()})],
      hidden: ({parent}) => parent?.mediaType !== 'video',
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent;
        if (!parent || typeof parent !== 'object' || !('mediaType' in parent) || parent.mediaType !== 'video') return true;
        return value ? true : 'Add a poster image for the video.';
      }),
    }),
    defineField({name: 'caption', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'storyLine', title: 'Story line', type: 'text', rows: 2}),
    defineField({
      name: 'location',
      type: 'reference',
      to: [{type: 'location'}],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'mediaType', media: 'image'},
    prepare({title, subtitle, media}) {
      return {title: title || 'Untitled media', subtitle: subtitle === 'video' ? 'Video' : 'Photo', media};
    },
  },
})

export const chapterType = defineType({
  name: 'programChapter',
  title: 'Program event day',
  type: 'object',
  fields: [
    defineField({name: 'dayLabel', title: 'Event day title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'date', type: 'date'}),
    defineField({name: 'headline', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'narrative', type: 'text', rows: 5, validation: (rule) => rule.required()}),
    defineField({name: 'pullQuote', type: 'pullQuote'}),
    defineField({
      name: 'locations',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'location'}]})],
      validation: (rule) => rule.required().min(1),
      description: 'Choose locations already listed on the program.',
    }),
    defineField({
      name: 'photos',
      type: 'array',
      of: [defineArrayMember({type: 'programPhoto'})],
      options: {layout: 'grid'},
    }),
  ],
  preview: {
    select: {title: 'dayLabel', subtitle: 'headline', date: 'date'},
    prepare({title, subtitle, date}) {
      return {title: title || 'Untitled event day', subtitle: [date, subtitle].filter(Boolean).join(' · ')};
    },
  },
})
