import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'mainNav',
      type: 'array',
      label: 'Main Navigation',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text' },
        {
          name: 'type',
          type: 'select',
          defaultValue: 'link',
          options: ['link', 'mega-menu'],
        },
        {
          name: 'megaMenuColumns',
          type: 'array',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'mega-menu',
          },
          fields: [
            { name: 'heading', type: 'text' },
            {
              name: 'links',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'href', type: 'text', required: true },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: 'Footer Columns',
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
