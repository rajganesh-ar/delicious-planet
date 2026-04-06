import type { CollectionConfig } from 'payload'

export const VendorApplications: CollectionConfig = {
  slug: 'vendor-applications',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'contactName', 'category', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'company',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'contactName',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'phone',
          type: 'text',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'website',
          type: 'text',
          admin: { width: '50%' },
        },
        {
          name: 'country',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      hasMany: true,
      options: [
        { label: 'Honey & Hive-Derived Products', value: 'honey' },
        { label: 'Olive Oil & Botanical Oils', value: 'oils' },
        { label: 'Dried Fruits', value: 'dried_fruits' },
        { label: 'Plant Extracts', value: 'plant_extracts' },
        { label: 'Specialty Culinary Ingredients', value: 'specialty_culinary' },
        { label: 'Natural Sweeteners', value: 'natural_sweeteners' },
        { label: 'Functional Agricultural Products', value: 'functional_agricultural' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'partnershipType',
      type: 'select',
      required: true,
      options: [
        { label: 'Direct Supply', value: 'direct_supply' },
        { label: 'Private Label Production', value: 'private_label' },
        { label: 'Regional Distribution', value: 'regional_distribution' },
        { label: 'Category-Specific Agreement', value: 'category_specific' },
      ],
    },
    {
      name: 'annualCapacity',
      type: 'text',
      admin: {
        description: 'Estimated annual production capacity relevant to proposed supply.',
      },
    },
    {
      name: 'certifications',
      type: 'textarea',
      admin: {
        description:
          'List any relevant certifications (e.g., ISO, HACCP, organic, fair trade, etc.).',
      },
    },
    {
      name: 'exportExperience',
      type: 'select',
      options: [
        { label: 'Yes — currently exporting', value: 'active' },
        { label: 'Yes — previous export experience', value: 'previous' },
        { label: 'No — seeking first export partner', value: 'none' },
      ],
    },
    {
      name: 'productDescription',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Brief overview of primary products proposed for supply, including specifications and packaging formats.',
      },
    },
    {
      name: 'additionalInformation',
      type: 'textarea',
      admin: {
        description:
          'Any additional context relevant to this application (distribution history, target markets, etc.).',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Under Review', value: 'under_review' },
        { label: 'Documentation Requested', value: 'docs_requested' },
        { label: 'Sample Stage', value: 'sample_stage' },
        { label: 'Approved', value: 'approved' },
        { label: 'Declined', value: 'declined' },
      ],
      access: {
        create: () => false,
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes (not visible to the applicant).',
      },
      access: {
        create: () => false,
      },
    },
  ],
  timestamps: true,
}
