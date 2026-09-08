import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

export const OfficeLocations: CollectionConfig = {
  slug: 'office-locations',
  admin: {
    group: 'Settings',
    hidden: adminOnlyInNav,
    useAsTitle: 'city',
    defaultColumns: ['city', 'country'],
  },
  access: catalogueAccess,
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
