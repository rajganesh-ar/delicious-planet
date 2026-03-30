import type { CollectionConfig } from 'payload'

export const OfficeLocations: CollectionConfig = {
  slug: 'office-locations',
  admin: {
    useAsTitle: 'city',
    defaultColumns: ['city', 'country'],
  },
  fields: [
    { name: 'city', type: 'text', required: true },
    { name: 'country', type: 'text', required: true },
    { name: 'address', type: 'textarea' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    {
      name: 'coordinates',
      type: 'group',
      fields: [
        { name: 'lat', type: 'number' },
        { name: 'lng', type: 'number' },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  timestamps: true,
}
