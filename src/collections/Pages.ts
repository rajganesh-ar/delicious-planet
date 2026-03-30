import type { CollectionConfig } from 'payload'
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
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
  },
  versions: {
    drafts: {
      autosave: false,
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
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
