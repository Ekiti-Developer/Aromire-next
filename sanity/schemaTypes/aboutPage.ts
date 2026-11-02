import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', initialValue: 'About Us'}),
    defineField({name: 'seoTitle', title: 'SEO title', type: 'string'}),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      description: 'Shown square (600×600). Falls back to the logo if empty.',
    }),
    defineField({name: 'eyebrow', type: 'string', description: 'Default: Who We Are'}),
    defineField({name: 'heading', type: 'string'}),
    defineField({name: 'intro', type: 'text', rows: 4}),
    defineField({name: 'mission', type: 'text', rows: 3}),
    defineField({name: 'vision', type: 'text', rows: 3}),
    defineField({name: 'values', type: 'text', rows: 3}),
    defineField({name: 'approach', type: 'text', rows: 3}),
  ],
  preview: {prepare: () => ({title: 'About page'})},
})