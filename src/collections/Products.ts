import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'brand',
      'category',
      'collection',
      'countryOfOrigin',
      'inStock',
      '_status',
    ],
  },
  versions: {
    drafts: {
      autosave: false,
    },
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
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      admin: {
        description: 'Stock-keeping unit identifier.',
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: {
        description: 'Brief summary shown on listing cards.',
      },
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'prices',
      type: 'array',
      fields: [
        {
          name: 'currency',
          type: 'select',
          required: true,
          options: [
            { label: 'USD', value: 'USD' },
            { label: 'AED', value: 'AED' },
            { label: 'GBP', value: 'GBP' },
            { label: 'EUR', value: 'EUR' },
            { label: 'INR', value: 'INR' },
          ],
        },
        {
          name: 'amount',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'compareAtAmount',
          type: 'number',
          min: 0,
          admin: {
            description: 'Original price before sale.',
          },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'collection',
      type: 'relationship',
      relationTo: 'product-collections',
      admin: {
        description: 'Curated collection this product belongs to.',
      },
    },
    {
      name: 'supplier',
      type: 'relationship',
      relationTo: 'suppliers',
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
    },
    {
      name: 'barcode',
      type: 'text',
      admin: {
        description: 'UPC/EAN barcode.',
      },
    },
    {
      name: 'countryOfOrigin',
      type: 'text',
      admin: {
        description: 'Country or region of origin.',
      },
    },
    {
      name: 'weight',
      type: 'text',
      admin: {
        description: 'e.g. "100g", "500g", "1kg".',
      },
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      required: true,
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'sizeVariants',
      type: 'array',
      fields: [
        { name: 'size', type: 'text', required: true },
        { name: 'priceAED', type: 'number', min: 0 },
        { name: 'compareAtPriceAED', type: 'number', min: 0 },
        { name: 'variantSku', type: 'text' },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'inventoryLevels',
      type: 'array',
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
    {
      name: 'shipping',
      type: 'group',
      fields: [
        { name: 'weightGrams', type: 'number', min: 0 },
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
    {
      name: 'ingredients',
      type: 'textarea',
    },
    {
      name: 'allergens',
      type: 'textarea',
    },
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
    {
      name: 'dietary',
      type: 'group',
      fields: [
        { name: 'isHalal', type: 'checkbox', defaultValue: false },
        { name: 'isLactoseFree', type: 'checkbox', defaultValue: false },
        { name: 'isOrganic', type: 'checkbox', defaultValue: false },
        { name: 'isVegetarian', type: 'checkbox', defaultValue: false },
        { name: 'isVegan', type: 'checkbox', defaultValue: false },
        { name: 'isGlutenFree', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'storageInstructions',
      type: 'textarea',
    },
    {
      name: 'packaging',
      type: 'text',
    },
    {
      name: 'specifications',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  timestamps: true,
}
