import type { CollectionConfig } from 'payload'
import { adminOnlyInNav, adminOnlyWrites, isAdmin, publishedOrStaff } from './access'
import {
  HeroBlock,
  FeaturedProductsBlock,
  CategoryShowcaseBlock,
  TestimonialsBlock,
  ExperienceBlock,
  StoryBlock,
  OfficeLocationsBlock,
  NewsletterBlock,
  PartnersLogoBlock,
  CTABannerBlock,
  RichContentBlock,
} from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Content',
    hidden: adminOnlyInNav,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
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
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        FeaturedProductsBlock,
        CategoryShowcaseBlock,
        TestimonialsBlock,
        ExperienceBlock,
        StoryBlock,
        OfficeLocationsBlock,
        NewsletterBlock,
        PartnersLogoBlock,
        CTABannerBlock,
        RichContentBlock,
      ],
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
