import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { publicMediaUrl } from './lib/media-url'
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

/**
 * Cloudflare R2, reached through its S3-compatible API. Every value is
 * required; see .env.example for where each one comes from.
 */
const r2 = {
  R2_BUCKET: process.env.R2_BUCKET,
  R2_ENDPOINT: process.env.R2_ENDPOINT,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
}

const missingR2 = Object.entries(r2)
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missingR2.length > 0) {
  const message = `R2 media storage is not configured: ${missingR2.join(', ')}. See .env.example.`
  // Deployed, this means every image on the site 404s and every upload fails,
  // so the build must not come up. Locally it is survivable — the rest of the
  // app works while the bucket is still being set up — so it only warns.
  if (process.env.NODE_ENV === 'production') throw new Error(message)
  console.warn(`⚠ ${message}`)
}

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
    /**
     * Media lives in Cloudflare R2, reached through its S3-compatible API.
     *
     * Three things are R2-specific: the region is always `auto`, the endpoint is
     * account-scoped rather than region-scoped, and path-style addressing is
     * required — R2 does not serve virtual-hosted bucket subdomains.
     *
     * `R2_ENDPOINT` is the private API endpoint used for reads and writes.
     * `R2_PUBLIC_URL` is the separate public domain the bucket is exposed on
     * (an r2.dev subdomain or a custom one); it is what browsers hit, and
     * next.config.ts derives its image `remotePatterns` entry from it.
     */
    s3Storage({
      enabled: true,
      collections: {
        media: {
          // Media is already world-readable (see Media.access.read), so serving
          // it straight from R2 costs nothing in access control and saves a
          // Vercel function invocation per image. Without this every request
          // would stream through /api/media/file/*, which is most of what the
          // move to R2 is meant to avoid — R2 egress is free, Vercel's is not.
          disablePayloadAccessControl: true,
          // The adapter's own generateURL would point at the private S3
          // endpoint, so the public domain is applied here instead. Called once
          // per size with that size's filename, as an afterRead hook — nothing
          // is written to the database, so the public domain can change later
          // without a data migration.
          generateFileURL: ({ filename, prefix }) =>
            publicMediaUrl([prefix, filename].filter(Boolean).join('/')),
        },
      },
      bucket: r2.R2_BUCKET || '',
      config: {
        endpoint: r2.R2_ENDPOINT || '',
        region: 'auto',
        credentials: {
          accessKeyId: r2.R2_ACCESS_KEY_ID || '',
          secretAccessKey: r2.R2_SECRET_ACCESS_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
