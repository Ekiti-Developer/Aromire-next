import {defineField, defineType} from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'role', type: 'string'}),
    defineField({name: 'quote', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({
      name: 'photo',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'videoUrl',
      title: 'YouTube video URL (optional)',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'videoPoster',
      title: 'Video poster',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({name: 'program', type: 'reference', to: [{type: 'program'}]}),
    defineField({
      name: 'consentConfirmed',
      title: 'Consent confirmed',
      type: 'boolean',
      initialValue: false,
      validation: (rule) => rule.required().custom((value) =>
        value === true ? true : 'Confirm permission before publishing this testimonial.',
      ),
    }),
    defineField({name: 'isSample', type: 'boolean', hidden: true, initialValue: false}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo', isSample: 'isSample'},
    prepare({title, subtitle, media, isSample}) {
      return {title: `${isSample ? 'SAMPLE · ' : ''}${title || 'Untitled testimonial'}`, subtitle, media};
    },
  },
})
