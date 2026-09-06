import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

export const Suppliers: CollectionConfig = {
  slug: 'suppliers',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'website'],
  },
  access: catalogueAccess,
  fields: [
    {
      name: 'name',
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'contactPerson',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'title', type: 'text' },
      ],
    },
  ],
  timestamps: true,
}
