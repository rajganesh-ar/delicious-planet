import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'subheadline', type: 'textarea' },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'ctaLabel',
      type: 'text',
    },
    {
      name: 'ctaHref',
      type: 'text',
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'fullscreen',
      options: ['fullscreen', 'split', 'contained'],
    },
  ],
}

export const FeaturedProductsBlock: Block = {
  slug: 'featuredProducts',
  labels: { singular: 'Featured Products', plural: 'Featured Products' },
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      maxRows: 6,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      options: ['grid', 'carousel'],
    },
  ],
}

export const CategoryShowcaseBlock: Block = {
  slug: 'categoryShowcase',
  labels: { singular: 'Category Showcase', plural: 'Category Showcases' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'horizontal-scroll',
      options: ['horizontal-scroll', 'grid'],
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: 'testimonials',
      hasMany: true,
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'carousel',
      options: ['carousel', 'grid'],
    },
  ],
}

export const ExperienceBlock: Block = {
  slug: 'experience',
  labels: { singular: 'Experience Section', plural: 'Experience Sections' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: ['left', 'right', 'fullbleed'],
    },
  ],
}

export const StoryBlock: Block = {
  slug: 'story',
  labels: { singular: 'Brand Story', plural: 'Brand Stories' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const OfficeLocationsBlock: Block = {
  slug: 'officeLocations',
  labels: { singular: 'Office Locations', plural: 'Office Locations' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'offices',
      type: 'relationship',
      relationTo: 'office-locations',
      hasMany: true,
    },
  ],
}

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  labels: { singular: 'Newsletter CTA', plural: 'Newsletter CTAs' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'text' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe' },
  ],
}

export const PartnersLogoBlock: Block = {
  slug: 'partnersLogo',
  labels: { singular: 'Partners / Logos', plural: 'Partners / Logos' },
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'logos',
      type: 'array',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'name', type: 'text', required: true },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}

export const CTABannerBlock: Block = {
  slug: 'ctaBanner',
  labels: { singular: 'CTA Banner', plural: 'CTA Banners' },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonHref', type: 'text', required: true },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const RichContentBlock: Block = {
  slug: 'richContent',
  labels: { singular: 'Rich Content', plural: 'Rich Content' },
  fields: [
    { name: 'content', type: 'richText', required: true },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'prose',
      options: ['prose', 'wide', 'full'],
    },
  ],
}
