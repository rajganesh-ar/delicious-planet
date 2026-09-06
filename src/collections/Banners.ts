import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, adminOnlyWrites } from './access'

/**
 * Promotional banners rendered between the homepage sections. Each banner is
 * pinned to a `placement` slot; several banners in the same slot render side by
 * side. Everything is optional except the title and placement so an editor can
 * publish a text-only promo without preparing artwork.
 */
export const Banners: CollectionConfig = {
  slug: 'banners',
  admin: {
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'placement', 'variant', 'active', 'sortOrder'],
    group: 'Content',
    description: 'Promotional banners shown between the homepage sections.',
  },
  access: {
    ...adminOnlyWrites,
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal name shown in the admin list.' },
    },
    {
      name: 'placement',
      type: 'select',
      required: true,
      defaultValue: 'below-hero',
      options: [
        { label: 'Below hero', value: 'below-hero' },
        { label: 'After Best Sellers', value: 'after-best-sellers' },
        { label: 'After New Arrivals', value: 'after-new-arrivals' },
        { label: 'Before newsletter', value: 'before-newsletter' },
      ],
      admin: { description: 'Which homepage slot this banner appears in.' },
    },
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'wide',
      options: [
        { label: 'Wide — full-width image band', value: 'wide' },
        { label: 'Split — half width, pairs up', value: 'split' },
        { label: 'Strip — slim text bar', value: 'strip' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      required: true,
      defaultValue: 'dark',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Forest green', value: 'forest' },
      ],
      admin: { description: 'Used for the text colour and the imageless background.' },
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: { description: 'Small label above the heading, e.g. "New this season".' },
    },
    { name: 'heading', type: 'text' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Optional. Without one the banner uses a solid brand background.' },
    },
    { name: 'ctaLabel', type: 'text', admin: { description: 'e.g. "Shop now".' } },
    {
      name: 'ctaHref',
      type: 'text',
      admin: { description: 'e.g. /products?dietary=halal' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide without deleting.' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: { description: 'Order within the slot. Lower shows first.' },
    },
  ],
}
