import {defineArrayMember, defineField, defineType} from 'sanity'

export const programType = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'summary', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'hook', title: 'Story hook', type: 'text', rows: 2, description: 'One compelling line shown on the cover'}),
    defineField({name: 'intro', type: 'text', rows: 5, description: 'Opening paragraph for the story page'}),
    defineField({name: 'ending', title: 'Where it leads', type: 'text', rows: 4, description: 'Closing reflection shown at the end'}),
    defineField({
      name: 'cover',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required()})],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'startDate', type: 'date', validation: (rule) => rule.required()}),
    defineField({
      name: 'endDate',
      type: 'date',
      validation: (rule) => rule.custom((endDate, context) => {
        const document = context.document;
        if (typeof endDate !== 'string' || !document || typeof document.startDate !== 'string') return true;
        return endDate >= document.startDate || 'End date must be on or after the start date.';
      }),
    }),
    defineField({name: 'partnersCount', title: 'Number of partners', type: 'number', validation: (rule) => rule.integer().min(0)}),
    defineField({
      name: 'partners',
      title: 'Partners on this story',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'partner'}]})],
      options: {sortable: true},
      description: 'Choose partners from the main Partner records. Edit their name, logo and website under Site → Partners.',
    }),
    defineField({
      name: 'storyCta',
      title: '"Help us write the next one" button',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Button label', type: 'string', initialValue: 'Help us write the next one'}),
        defineField({
          name: 'href',
          title: 'Button link',
          type: 'string',
          description: 'A page path such as /volunteer, or a full https:// URL.',
          initialValue: '/volunteer',
        }),
      ],
    }),
    defineField({
      name: 'locations',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'location'}]})],
      description: 'Locations used by chapters and their photos.',
    }),
    defineField({
      name: 'chapters',
      title: 'Event days',
      type: 'array',
      of: [defineArrayMember({type: 'programChapter'})],
      options: {sortable: true},
      description: 'Add each event day to this program. Every day can have its own story, locations, and photos or videos.',
      validation: (rule) => rule.required().min(1).custom((chapters, context) => {
        if (!Array.isArray(chapters)) return true;
        const dates = chapters
          .map((chapter) => chapter && typeof chapter === 'object' && 'date' in chapter ? chapter.date : undefined)
          .filter((date): date is string => typeof date === 'string');
        if (dates.some((date, index) => index > 0 && date < dates[index - 1])) {
          return 'Chapter dates must be in chronological order.';
        }
        const document = context.document;
        if (!document || typeof document.startDate !== 'string') return true;
        if (dates.some((date) => date < document.startDate!)) return 'Chapter dates must not precede the program start date.';
        if (typeof document.endDate === 'string' && dates.some((date) => date > document.endDate!)) {
          return 'Chapter dates must not be after the program end date.';
        }
        return true;
      }),
    }),
    defineField({name: 'featuredOnHome', type: 'boolean', initialValue: false}),
    defineField({name: 'featuredTestimonial', type: 'reference', to: [{type: 'testimonial'}]}),
    defineField({name: 'isSample', type: 'boolean', hidden: true, initialValue: false}),
  ],
  preview: {
    select: {title: 'title', subtitle: 'status', media: 'cover', startDate: 'startDate', isSample: 'isSample'},
    prepare({title, subtitle, media, startDate, isSample}) {
      return {
        title: `${isSample ? 'SAMPLE · ' : ''}${title || 'Untitled program'}`,
        subtitle: [subtitle, startDate].filter(Boolean).join(' · '),
        media,
      };
    },
  },
})
