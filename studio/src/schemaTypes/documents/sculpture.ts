import {DocumentTextIcon} from '@sanity/icons'
import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

/**
 * Sculpture schema.  Define and edit the fields for the 'sculpture' content type.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const sculpture = defineType({
  name: 'sculpture',
  title: 'Sculpture',
  icon: DocumentTextIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
        aiAssist: {
          imageDescriptionField: 'alt',
        },
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
          validation: (rule) => {
            // Custom validation to ensure alt text is provided if the image is present. https://www.sanity.io/docs/validation
            return rule.custom((alt, context) => {
              if ((context.document?.coverImage as any)?.asset?._ref && !alt) {
                return 'Required'
              }
              return true
            })
          },
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'extraImages',
      title: 'Extra Images',
      type: 'array',
      of: [
        defineField({
          name: 'Image',
          type: 'image',
          options: {
            hotspot: true,
          }
        })
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A slug is required for the sculpture to show up in the preview',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'top',
      title: 'Top',
      type: 'number',
      hidden: true
    }),
    defineField({
      name: 'left',
      title: 'Left',
      type: 'number',
      hidden: true
    }),
    defineField({
      name: 'left_percentage',
      title: 'Left (percentage)',
      type: 'string',
      hidden: true
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'number',
      hidden: true
    }),
    defineField({
      name: 'width_percentage',
      title: 'Width (percentage)',
      type: 'string',
      hidden: true
    }),
    defineField({
      name: 'height',
      title: 'Height',
      type: 'number',
      hidden: true
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      hidden: true
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'person' }],
      hidden: true
    }),
  ],
  // List preview configuration. https://www.sanity.io/docs/previews-list-views
  preview: {
    select: {
      title: 'title',
      authorFirstName: 'author.firstName',
      authorLastName: 'author.lastName',
      date: 'date',
      media: 'coverImage',
    },
    prepare({title, media, authorFirstName, authorLastName, date}) {
      const subtitles = [
        authorFirstName && authorLastName && `by ${authorFirstName} ${authorLastName}`,
        date && `on ${format(parseISO(date), 'LLL d, yyyy')}`,
      ].filter(Boolean)

      return {title, media, subtitle: subtitles.join(' ')}
    },
  },
})
