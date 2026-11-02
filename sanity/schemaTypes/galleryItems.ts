import {defineArrayMember, defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'
import {MultipleImageUploadInput} from './MultipleImageUploadInput'

export default defineType({
  name: 'galleryItem',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      description: 'Add multiple event photos with Add item, then drag them to reorder.',
      type: 'array',
      options: {layout: 'grid'},
      components: {input: MultipleImageUploadInput},
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({name: 'caption', title: 'Photo caption', type: 'string'}),
          ],
        }),
      ],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image (optional)',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'image',
      type: 'image',
      hidden: true,
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({
      name: 'category',
      title: 'Category (optional)',
      description: 'Leave blank when the outreach has a broad target; otherwise select the main audience.',
      type: 'string',
      options: {list: ['Youth', 'Women', 'Community']},
    }),
    defineField({
      name: 'caption',
      title: 'Brief event summary',
      description: 'A short overview displayed near the top of the event page.',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(280),
    }),
    defineField({name: 'date', type: 'date'}),
    defineField({
      name: 'videos',
      title: 'Videos',
      description: 'Add YouTube, Vimeo, or direct HTTPS video URLs. Videos appear on the event page only.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          icon: PlayIcon,
          fields: [
            defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
            defineField({
              name: 'url',
              type: 'url',
              validation: (r) => r.required().uri({scheme: ['https']}),
            }),
            defineField({name: 'caption', type: 'text', rows: 2}),
          ],
          preview: {select: {title: 'title', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'category', media: 'images.0'}},
})