import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess } from './access'
import { REGIONS } from '../lib/regions'

/**
 * Presentation for the "Shop by Region" row.
 *
 * A region is NOT a bucket of products an editor fills — membership is derived
 * from each product's `origin.country` (see src/lib/countries.ts), which is why
 * `slug` is a fixed select rather than free text: a slug that isn't in
 * REGION_SLUGS would link to a listing that can never match anything.
 *
 * These rows only decide how a region is *presented* — its label, blurb, card
 * art, order and whether it shows at all. src/lib/regions.ts holds the bundled
 * defaults these rows override, so an empty collection still renders the row.
 */
export const Regions: CollectionConfig = {
  slug: 'regions',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'active', 'sortOrder'],
    group: 'Content',
    description:
      'The "Shop by Region" row on the homepage. Products are matched by their country of origin — these rows only control wording, artwork and priority.',
  },
  access: catalogueAccess,
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: REGIONS.map((region) => ({ label: region.label, value: region.slug })),
      admin: {
        description:
          'Which region this row presents. The list is fixed: a region exists because countries are mapped to it, not because a row was added here.',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: { description: 'Big name on the card, e.g. "Europe".' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Bite into',
      admin: { description: 'Small line above the label.' },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Short blurb used on listing pages and in the mega menu.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Card artwork. Without one the bundled default for this region is used.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide the region without deleting it.' },
    },
    {
      // Kept as `sortOrder` in code and in the database — every other collection
      // orders on a field of that name, and renaming the column would buy a
      // migration for a word only the editor ever sees.
      name: 'sortOrder',
      label: 'Priority',
      type: 'number',
      admin: {
        description:
          'Lower shows first. Decimals and negatives are allowed, so a region can be slotted between two others (2.5) or pushed to the front (0) without renumbering the rest. Left blank, it falls behind every region that has a number.',
      },
    },
  ],
}
