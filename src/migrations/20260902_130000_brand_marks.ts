import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Give the brand marque strips a record to hang on.
 *
 * The logo strips on the homepage and /brands were two hard-coded arrays of
 * five files in public/images/partner-logo/. They now read the `brands`
 * collection (src/lib/brand-marks.ts), which already held four of the five —
 * Admiral Caviar, Caputo, Velsoro and García de la Cruz.
 *
 * Cebon was the fifth mark on screen with no row behind it, so it is added
 * here. This publishes nothing new: the logo has been shipping in
 * public/images/partner-logo/cebon.png and rendering on the homepage all along.
 * Without the row the mark would silently disappear the moment the strips
 * started reading the CMS.
 *
 * No logo uploads are set. Each of these slugs has bundled artwork that
 * brand-marks.ts falls back to, so the strips render exactly as before and an
 * upload in the admin panel takes over whenever someone makes one.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "brands" ("title", "slug", "description", "updated_at", "created_at")
    SELECT 'Cebon', 'cebon',
           'Dairy and cheese producer carried across the chilled range.',
           now(), now()
    WHERE NOT EXISTS (SELECT 1 FROM "brands" WHERE "slug" = 'cebon');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "brands" WHERE "slug" = 'cebon';
  `)
}
