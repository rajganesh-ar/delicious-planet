import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop the retired `og` image size from the media table.
 *
 * The size itself was removed from Media.ts earlier — nothing on the site ever
 * read it, every social card sets its own art. That stopped new uploads writing
 * a fourth rendition, but left six populated columns behind on 511 rows and
 * their 1200×630 objects in R2.
 *
 * Those objects are now gone: `pnpm media:cleanup --strays` swept all 511 of
 * them (48.9 MB), checked first against every text column in this database and
 * against the source tree, neither of which referenced a single og key.
 *
 * A note for anyone reading the old comment in Media.ts, which claimed these
 * columns were "what identifies the old og files in the bucket" and that
 * dropping them first would strand the objects: that was never how the sweep
 * worked. cleanup-r2.ts diffs the bucket against the keys Payload reports, and
 * Payload stopped reporting `sizes.og` the moment the size left the config —
 * the adapter builds its table definition from the field config, so it never
 * selected these columns at all. Their being invisible to it is precisely why
 * the objects registered as strays. The order of the two steps never mattered.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_sizes_og_sizes_og_filename_idx";

    ALTER TABLE "media"
      DROP COLUMN IF EXISTS "sizes_og_url",
      DROP COLUMN IF EXISTS "sizes_og_width",
      DROP COLUMN IF EXISTS "sizes_og_height",
      DROP COLUMN IF EXISTS "sizes_og_mime_type",
      DROP COLUMN IF EXISTS "sizes_og_filesize",
      DROP COLUMN IF EXISTS "sizes_og_filename";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The columns come back empty. The renditions they named are deleted from R2,
  // so restoring the values would only point at 404s — re-add the size in
  // Media.ts and re-upload if this is ever genuinely wanted back.
  await db.execute(sql`
    ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "sizes_og_url" varchar,
      ADD COLUMN IF NOT EXISTS "sizes_og_width" numeric,
      ADD COLUMN IF NOT EXISTS "sizes_og_height" numeric,
      ADD COLUMN IF NOT EXISTS "sizes_og_mime_type" varchar,
      ADD COLUMN IF NOT EXISTS "sizes_og_filesize" numeric,
      ADD COLUMN IF NOT EXISTS "sizes_og_filename" varchar;

    CREATE INDEX IF NOT EXISTS "media_sizes_og_sizes_og_filename_idx"
      ON "media" USING btree ("sizes_og_filename");
  `)
}
