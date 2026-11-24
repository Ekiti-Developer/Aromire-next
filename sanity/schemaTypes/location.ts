import {defineField, defineType} from 'sanity'

export const locationType = defineType({
  name: 'location',
  title: 'Location',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'address', type: 'string'}),
    defineField({name: 'geo', title: 'Map location', type: 'geopoint'}),
    defineField({name: 'isSample', type: 'boolean', hidden: true, initialValue: false}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'address', isSample: 'isSample'},
    prepare({title, subtitle, isSample}) {
      return {title: `${isSample ? 'SAMPLE · ' : ''}${title || 'Untitled location'}`, subtitle};
    },
  },
})
