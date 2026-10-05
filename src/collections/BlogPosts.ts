import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, adminOnlyWrites, isAdmin, publishedOrStaff } from './access'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    group: 'Content',
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'categories', '_status', 'publishedAt'],
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  access: {
    ...adminOnlyWrites,
    // Any signed-in user used to read drafts here, and every shopper can make
    // an account. Drafts and their history are for staff.
    read: publishedOrStaff,
    readVersions: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on listing cards.',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'blog-categories',
      hasMany: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
  timestamps: true,
}
