import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  admin: {
    group: 'Content',
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
  },
  access: catalogueAccess,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea' },
  ],
  timestamps: true,
}
