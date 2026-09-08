import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, catalogueAccess, publishedOrStaff } from './access'
import { COUNTRY_OPTIONS, REGION_BY_COUNTRY, REGION_SLUGS } from '../lib/countries'
import {
  assertUniqueVariantSkus,
  deriveVariantRollups,
  ensureProductSlug,
  stampPublishedAt,
} from './hooks/productHooks'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    group: 'Catalogue',
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'category', 'basePrice', 'inStock', '_status'],
    listSearchableFields: ['title', 'sku'],
  },
  access: {
    ...catalogueAccess,
    read: publishedOrStaff,
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  hooks: {
    beforeValidate: [ensureProductSlug, assertUniqueVariantSkus],
    beforeChange: [deriveVariantRollups, stampPublishedAt],
  },
  fields: [
    // ─── Identity ────────────────────────────────────────────────────────
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
      admin: {
        readOnly: true,
        description: 'Derived from the title on save.',
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Product-level identifier. Each variant carries its own SKU too.' },
    },

    // ─── Classification ──────────────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
      admin: { description: 'Must be a leaf category, not a department.' },
      validate: async (value: unknown, { req }: { req: { payload?: unknown } }) => {
        if (!value) return 'Required.'
        const payload = req?.payload as
          | { count: (args: unknown) => Promise<{ totalDocs: number }> }
          | undefined
        if (!payload?.count) return true
        const id = typeof value === 'object' && value !== null ? (value as { id: unknown }).id : value
        const children = await payload.count({
          collection: 'categories',
          where: { parent: { equals: id } },
          overrideAccess: true,
        })
        return children.totalDocs === 0 || 'Pick a sub-category, not a department.'
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      index: true,
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'suppliers',
      index: true,
    },

    // ─── Origin ──────────────────────────────────────────────────────────
    {
      name: 'origin',
      type: 'group',
      fields: [
        {
          name: 'country',
          type: 'select',
          required: true,
          index: true,
          options: COUNTRY_OPTIONS,
          admin: { description: 'Country of origin. Drives the region filter.' },
        },
        {
          name: 'region',
          type: 'select',
          index: true,
          options: [...REGION_SLUGS],
          admin: {
            readOnly: true,
            description: 'Derived from the country on save.',
          },
          hooks: {
            beforeChange: [
              ({ siblingData }) => {
                const country = (siblingData as { country?: string } | undefined)?.country
                return country ? (REGION_BY_COUNTRY[country.toUpperCase()] ?? null) : null
              },
            ],
          },
        },
        {
          name: 'producerRegion',
          type: 'text',
          admin: { description: 'Sub-national origin, e.g. "Piedmont", "Kalamata".' },
        },
        {
          name: 'appellation',
          type: 'text',
          admin: { description: 'Protected designation, e.g. DOP / PDO / IGP.' },
        },
      ],
    },

    // ─── Content ─────────────────────────────────────────────────────────
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: { description: 'Brief summary shown on listing cards.' },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      required: true,
      admin: { description: 'First image is the primary. Alt text lives on the media item.' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },

    // ─── Pricing & variants ──────────────────────────────────────────────
    // The catalogue stores AED only. Other currencies are a display-time
    // conversion — stored FX rates go stale and turn one price edit into five.
    {
      name: 'basePrice',
      type: 'number',
      min: 0,
      index: true,
      admin: {
        readOnly: true,
        description: 'AED. Cheapest variant — the "from" price. Derived on save.',
      },
    },
    {
      name: 'baseCompareAt',
      type: 'number',
      min: 0,
      admin: { readOnly: true, description: 'Compare-at of the cheapest variant.' },
    },
    {
      name: 'variants',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Variant', plural: 'Variants' },
      admin: {
        description:
          'The orderable unit. Single-size products get exactly one variant. SKUs must be unique across the whole catalogue.',
      },
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true,
          index: true,
          // Not `unique: true` — Payload's unique constraint is unreliable on a
          // field nested in an array. Enforced by assertUniqueVariantSkus.
        },
        {
          name: 'size',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "30g", "1kg", "6 × 750ml".' },
        },
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'AED.' } },
        { name: 'compareAt', type: 'number', min: 0, admin: { description: 'AED, before sale.' } },
        { name: 'barcode', type: 'text', admin: { description: 'UPC/EAN.' } },
        { name: 'weightGrams', type: 'number', min: 0 },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
        {
          name: 'isDefault',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Preselected on the product page. Exactly one per product.' },
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'inventory',
          type: 'array',
          admin: { description: 'Stock per warehouse, for this size.' },
          fields: [
            {
              name: 'warehouse',
              type: 'relationship',
              relationTo: 'warehouses',
              required: true,
            },
            { name: 'quantity', type: 'number', min: 0, defaultValue: 0, required: true },
            { name: 'reservedQuantity', type: 'number', min: 0, defaultValue: 0 },
            { name: 'lowStockThreshold', type: 'number', min: 0 },
          ],
        },
      ],
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'True when any variant is in stock. Derived on save.',
      },
    },

    // ─── Merchandising ───────────────────────────────────────────────────
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'featuredRank',
      type: 'number',
      admin: {
        description: 'Lower sorts first among featured products.',
        condition: (data) => Boolean(data?.isFeatured),
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Sort key for New Arrivals. Stamped on first publish and preserved across re-imports, so a catalogue reload does not make everything new.',
      },
    },

    // ─── Food attributes ─────────────────────────────────────────────────
    {
      name: 'dietary',
      type: 'group',
      fields: [
        { name: 'isHalal', type: 'checkbox', defaultValue: false, index: true },
        { name: 'isLactoseFree', type: 'checkbox', defaultValue: false, index: true },
        { name: 'isOrganic', type: 'checkbox', defaultValue: false, index: true },
        { name: 'isVegetarian', type: 'checkbox', defaultValue: false, index: true },
        { name: 'isVegan', type: 'checkbox', defaultValue: false, index: true },
        { name: 'isGlutenFree', type: 'checkbox', defaultValue: false, index: true },
      ],
    },
    { name: 'ingredients', type: 'textarea' },
    { name: 'allergens', type: 'textarea' },
    {
      name: 'nutritionPer100g',
      type: 'group',
      label: 'Nutrition per 100g',
      fields: [
        { name: 'energyKJ', type: 'number', min: 0 },
        { name: 'energyKcal', type: 'number', min: 0 },
        { name: 'protein', type: 'number', min: 0 },
        { name: 'carbohydrates', type: 'number', min: 0 },
        { name: 'sugars', type: 'number', min: 0 },
        { name: 'fat', type: 'number', min: 0 },
        { name: 'saturatedFat', type: 'number', min: 0 },
        { name: 'salt', type: 'number', min: 0 },
        { name: 'fibre', type: 'number', min: 0 },
      ],
    },
    { name: 'storageInstructions', type: 'textarea' },
    { name: 'packaging', type: 'text' },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },

    // ─── Shipping ────────────────────────────────────────────────────────
    {
      name: 'shipping',
      type: 'group',
      fields: [
        {
          name: 'dimensionsCm',
          type: 'group',
          fields: [
            { name: 'length', type: 'number', min: 0 },
            { name: 'width', type: 'number', min: 0 },
            { name: 'height', type: 'number', min: 0 },
          ],
        },
        {
          name: 'shippingClass',
          type: 'select',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Express', value: 'express' },
            { label: 'Frozen', value: 'frozen' },
            { label: 'Fragile', value: 'fragile' },
            { label: 'Oversized', value: 'oversized' },
          ],
        },
        { name: 'freeShippingEligible', type: 'checkbox', defaultValue: false },
        { name: 'handlingDays', type: 'number', min: 0 },
      ],
    },

    // ─── SEO ─────────────────────────────────────────────────────────────
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

    // ─── Provenance ──────────────────────────────────────────────────────
    // Empty for products authored here. An importer stamps it so a second run
    // is an upsert: without a stable external key, re-importing a supplier
    // feed after they retitle a product creates a second row rather than
    // updating the first, and the catalogue quietly doubles.
    {
      name: 'source',
      type: 'group',
      label: 'Import source',
      fields: [
        {
          name: 'provider',
          type: 'text',
          index: true,
          admin: { readOnly: true, description: 'Importer that owns this row, e.g. "garcia-de-la-cruz".' },
        },
        {
          name: 'externalId',
          type: 'text',
          index: true,
          admin: { readOnly: true, description: 'Identifier in the source system. The upsert key.' },
        },
        {
          name: 'handle',
          type: 'text',
          index: true,
          admin: { readOnly: true, description: 'Source slug, kept for tracing back by hand.' },
        },
        { name: 'url', type: 'text', admin: { readOnly: true } },
        { name: 'importedAt', type: 'date', admin: { readOnly: true } },
      ],
    },
  ],
  timestamps: true,
}
