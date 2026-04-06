import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Suppliers } from './collections/Suppliers'
import { Orders } from './collections/Orders'
import { B2BInquiries } from './collections/B2BInquiries'
import { Pages } from './collections/Pages'
import { BlogPosts } from './collections/BlogPosts'
import { BlogCategories } from './collections/BlogCategories'
import { Testimonials } from './collections/Testimonials'
import { OfficeLocations } from './collections/OfficeLocations'
import { Warehouses } from './collections/Warehouses'
import { Brands } from './collections/Brands'
import { ProductCollections } from './collections/ProductCollections'
import { VendorApplications } from './collections/VendorApplications'
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Products,
    Categories,
    Suppliers,
    Warehouses,
    Brands,
    ProductCollections,
    Orders,
    B2BInquiries,
    VendorApplications,
    Pages,
    BlogPosts,
    BlogCategories,
    Testimonials,
    OfficeLocations,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
