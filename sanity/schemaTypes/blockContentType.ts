import {defineType, defineArrayMember, defineField} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'
import {PlayIcon} from '@sanity/icons/Play'

/**
 * Portable Text used by blog posts. Portable Text is rendered on the front end
 * with the already-installed @portabletext/react package.
 */
export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            title: 'Link',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (rule) => rule.required(),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
        }),
      ],
    }),
    defineArrayMember({
      type: 'object',
      name: 'youtube',
      title: 'YouTube video',
      icon: PlayIcon,
      fields: [
        defineField({
          name: 'url',
          title: 'YouTube URL',
          type: 'url',
          description: 'Paste an unlisted or public YouTube link. Videos load only after a visitor taps play.',
          validation: (rule) => rule.required().custom((value: string | undefined) => {
            if (!value) return true
            try {
              const url = new URL(value)
              const allowed = [
                'youtube.com', 'www.youtube.com', 'm.youtube.com',
                'youtu.be', 'www.youtube-nocookie.com',
              ]
              return url.protocol === 'https:' && allowed.includes(url.hostname)
                ? true
                : 'Use a YouTube URL over HTTPS.'
            } catch {
              return 'Enter a valid YouTube URL.'
            }
          }),
        }),
        defineField({
          name: 'title',
          title: 'Title (optional)',
          type: 'string',
        }),
      ],
      preview: {
        select: {title: 'title', subtitle: 'url'},
        prepare({title, subtitle}) {
          return {title: title || 'YouTube video', subtitle}
        },
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'callout',
      title: 'Callout',
      fields: [
        defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.required()}),
      ],
      preview: {select: {title: 'title', subtitle: 'text'}},
    }),
  ],
})
