import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  orderings: [
    {
      name: 'publishedAtDesc',
      title: 'Published date, newest first',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'string',
      initialValue: 'Aromire-Éko Foundation',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'News', value: 'News'},
          {title: 'Programs', value: 'Programs'},
          {title: 'Stories', value: 'Stories'},
          {title: 'Announcements', value: 'Announcements'},
        ],
        layout: 'radio',
      },
      initialValue: 'News',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
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
    defineField({name: 'body', type: 'blockContent'}),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'metaTitle', title: 'Meta title', type: 'string'}),
        defineField({
          name: 'metaDescription',
          title: 'Meta description',
          type: 'text',
          rows: 2,
          validation: (rule) => rule.max(160),
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alternative text', type: 'string'}),
          ],
        }),
      ],
    }),

    // Legacy fields retained (hidden) so existing documents keep their data.
    defineField({
      name: 'date',
      title: 'Legacy publication date',
      type: 'datetime',
      hidden: true,
      description: 'Replaced by publishedAt. Kept for existing posts.',
    }),
    defineField({
      name: 'authorRef',
      title: 'Legacy author reference',
      type: 'reference',
      to: [{type: 'author'}],
      hidden: true,
      description: 'Replaced by the author string. Kept for existing posts.',
    }),
    defineField({
      name: 'categories',
      title: 'Legacy categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'category'}]})],
      hidden: true,
      description: 'Replaced by category and tags. Kept for existing posts.',
    }),
    defineField({name: 'program', type: 'reference', to: [{type: 'program'}], hidden: true}),
    defineField({
      name: 'cover',
      title: 'Legacy cover',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      hidden: true,
    }),
    defineField({
      name: 'mainImage',
      title: 'Legacy main image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
      hidden: true,
    }),
    defineField({name: 'isSample', type: 'boolean', hidden: true, initialValue: false}),
  ],
  preview: {
    select: {
      title: 'title',
      publishedAt: 'publishedAt',
      legacyDate: 'date',
      cover: 'coverImage',
      legacyCover: 'cover',
      legacyMain: 'mainImage',
      isSample: 'isSample',
    },
    prepare({title, publishedAt, legacyDate, cover, legacyCover, legacyMain, isSample}) {
      const date = publishedAt || legacyDate
      return {
        title: `${isSample ? 'SAMPLE · ' : ''}${title || 'Untitled post'}`,
        subtitle: date
          ? new Date(date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            })
          : undefined,
        media: cover || legacyCover || legacyMain,
      }
    },
  },
})
