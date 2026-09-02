import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
import { Banners } from './collections/Banners'
import { Regions } from './collections/Regions'
import { Team } from './collections/Team'
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
    Regions,
    Suppliers,
    Warehouses,
    Brands,
    Orders,
    B2BInquiries,
    Pages,
    BlogPosts,
    BlogCategories,
    Testimonials,
    OfficeLocations,
    Team,
    NewsletterSubscribers,
    Banners,
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
    // Auto-push is OFF by default. With it on, `next dev` diffs the schema
    // against the live database on every boot and blocks on interactive
    // "is this a rename?" questions — which silently hold the dev server at
    // "Compiling…" and can apply destructive changes with no reviewable record.
    //
    // It stays available as a deliberate, one-off escape hatch:
    //   PAYLOAD_DB_PUSH=true pnpm db:push
    //
    // That is the only way to reconcile a database that was previously managed
    // by push: `migrate:create` diffs against the last snapshot in
    // src/migrations/, and push leaves none — with no snapshot it emits a
    // from-scratch "create everything" baseline that cannot run against an
    // existing database. Push introspects the live schema, so it produces the
    // real delta.
    push: process.env.PAYLOAD_DB_PUSH === 'true',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
