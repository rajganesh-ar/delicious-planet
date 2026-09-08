import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'
import {
  deriveCategoryLineage,
  ensureCategorySlug,
  refreshChildLineage,
} from './hooks/categoryHooks'

/**
 * The product-type tree, and the only taxonomy in the store. Two levels:
 * departments (no parent) and the leaves beneath them. Products attach to
 * leaves only — where "leaf" means "has no children", so a department with
 * nothing under it yet is still a valid target.
 *
 * Two things used to compete with this collection, and both are gone:
 *
 *   · Regions. This collection held rows like "Bite Into Europe" while
 *     src/lib/countries.ts held REGION_SLUGS, and their slugs never matched.
 *     Regions are now derived from `origin.country` on the product and exist
 *     only as a filter (/products?region=…). They must not be re-created here.
 *
 *   · product-collections. It had drifted into holding the real product types
 *     ("Caviar Selection", "Truffle Treasury") while this collection held
 *     regions. Those 15 rows moved in as departments and the collection was
 *     dropped — see migration 20260901_180000_categories_absorb_collections.
 */
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    group: 'Catalogue',
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', 'isDepartment', 'sortOrder'],
  },
  access: catalogueAccess,
  hooks: {
    beforeValidate: [ensureCategorySlug],
    beforeChange: [deriveCategoryLineage],
    afterChange: [refreshChildLineage],
  },
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
      admin: { readOnly: true, description: 'Derived from the title on save.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
      admin: { description: 'Leave empty for a department (top-level category).' },
    },
    {
      name: 'ancestors',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      index: true,
      admin: {
        readOnly: true,
        description:
          'Every category above this one. Lets a department listing select all its descendants in one query.',
      },
    },
    {
      name: 'path',
      type: 'text',
      index: true,
      admin: {
        readOnly: true,
        description: 'Slug path, e.g. "caviar-roe/sturgeon-caviar". Used for breadcrumbs.',
      },
    },
    {
      name: 'isDepartment',
      type: 'checkbox',
      index: true,
      admin: { readOnly: true, description: 'True when this category has no parent.' },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: { description: 'Manual sort order for display.' },
    },
  ],
  timestamps: true,
}
