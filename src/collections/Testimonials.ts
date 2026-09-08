import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Content',
    hidden: adminOnlyInNav,
    useAsTitle: 'name',
    defaultColumns: ['name', 'company', 'rating'],
  },
  access: catalogueAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'role', type: 'text' },
    { name: 'company', type: 'text' },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      defaultValue: 5,
    },
  ],
  timestamps: true,
}
