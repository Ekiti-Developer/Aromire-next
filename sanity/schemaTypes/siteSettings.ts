import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'orgName',
      title: 'Organisation name',
      type: 'string',
      validation: (rule) => rule.required(),
      initialValue: 'Aromire-Éko Empowerment Foundation',
    }),
    defineField({
      name: 'tagline',
      type: 'text',
      rows: 2,
      description: 'Short description shown in the site footer.',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required()})],
    }),
    defineField({
      name: 'donateUrl',
      title: 'Donate link',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'email', type: 'string'}),
    defineField({name: 'phone', type: 'string'}),
    defineField({name: 'whatsapp', title: 'WhatsApp number', type: 'string'}),
    defineField({
      name: 'socials',
      title: 'Social links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {list: ['Facebook', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'X']},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
            }),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'orgName', media: 'logo'}},
})
