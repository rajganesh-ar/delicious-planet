import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
  },
  access: catalogueAccess,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'website',
      type: 'text',
    },
  ],
  timestamps: true,
}
