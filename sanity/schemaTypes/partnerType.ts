import {defineField, defineType} from 'sanity'
import {UsersIcon} from '@sanity/icons/Users'

export const partnerType = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  icon: UsersIcon,
  orderings: [
    {
      name: 'sortOrderAsc',
      title: 'Display order',
      by: [{field: 'sortOrder', direction: 'asc'}, {field: 'name', direction: 'asc'}],
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Organization name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
      validation: (rule) => rule.custom((value) => {
        if (!value) return true
        try {
          const url = new URL(value)
          return url.protocol === 'https:' || url.protocol === 'http:'
            ? true
            : 'Use an HTTP or HTTPS URL.'
        } catch {
          return 'Enter a valid URL.'
        }
      }),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.integer(),
    }),
    defineField({name: 'isSample', type: 'boolean', hidden: true, initialValue: false}),
  ],
  preview: {
    select: {title: 'name', media: 'logo', subtitle: 'website', isSample: 'isSample'},
    prepare({title, media, subtitle, isSample}) {
      return {
        title: `${isSample ? 'SAMPLE · ' : ''}${title || 'Untitled partner'}`,
        subtitle,
        media,
      }
    },
  },
})
