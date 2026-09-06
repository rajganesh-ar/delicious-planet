import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { VendorApplications } from './collections/VendorApplications'
import { ChefProfiles } from './collections/ChefProfiles'
import { Recipes } from './collections/Recipes'
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

/**
 * Transactional email, over SMTP.
 *
 * The domain's mail already lives on Google Workspace (its MX is
 * smtp.google.com and google._domainkey is published), so sending through the
 * same account means outbound mail is DKIM-signed by the infrastructure that
 * already owns the domain — no second provider, no separate reputation to
 * warm up, and nothing new to verify.
 *
 * SMTP_PASSWORD is a Google App Password, not the account password: Google
 * removed plain-password SMTP in 2022, so this only works on an account with
 * 2-Step Verification turned on. See .env.example.
 *
 * Same posture as R2 above: deployed, missing configuration is fatal, because
 * it means password resets deliver nothing while the UI still says "check your
 * email", and every order confirmation is silently dropped. Locally it only
 * warns — with no adapter registered Payload falls back to its built-in stub,
 * which logs the rendered message to the console instead of sending it. That is
 * the intended development loop: every template is reviewable without an
 * account or a single DNS record.
 */
const smtp = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
}

const SMTP_PORT = Number(process.env.SMTP_PORT || 465)

const missingSmtp = Object.entries(smtp)
  .filter(([, value]) => !value)
  .map(([name]) => name)

if (missingSmtp.length > 0) {
  const message = `Email is not configured: ${missingSmtp.join(', ')}. Password resets and order confirmations will not be sent. See .env.example.`
  if (process.env.NODE_ENV === 'production') throw new Error(message)
  console.warn(`⚠ ${message}`)
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Delicious Planet',
    },
    components: {
      /**
       * The trading dashboard sits above Payload's own collection cards rather
       * than replacing the dashboard view, so the default navigation is still
       * there underneath it. `beforeDashboard` is also the stable slot — the
       * widget API in 3.80 is still marked experimental.
       */
      beforeDashboard: ['/components/admin/Dashboard'],
      graphics: {
        Logo: '/components/admin/brand/Logo',
        Icon: '/components/admin/brand/Icon',
      },
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
    VendorApplications,
    ChefProfiles,
    Recipes,
    NewsletterSubscribers,
    Banners,
  ],
  globals: [SiteSettings, Navigation],
  /**
   * Left undefined without credentials so Payload's console stub takes over.
   *
   * The From address defaults to the authenticated mailbox deliberately: Gmail
   * rewrites a From it does not own back to the account that authenticated, so
   * a mismatch here would silently send under the wrong address. To send as
   * something else, add it in Gmail as a verified "Send mail as" alias first.
   */
  email:
    missingSmtp.length === 0
      ? nodemailerAdapter({
          defaultFromAddress: process.env.EMAIL_FROM || smtp.SMTP_USER || '',
          defaultFromName: process.env.EMAIL_FROM_NAME || 'Delicious Planet',
          transportOptions: {
            host: smtp.SMTP_HOST,
            port: SMTP_PORT,
            // 465 is implicit TLS; 587 starts plain and upgrades via STARTTLS.
            secure: SMTP_PORT === 465,
            auth: { user: smtp.SMTP_USER, pass: smtp.SMTP_PASSWORD },
          },
        })
      : undefined,
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
