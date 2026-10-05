import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `regions` row for Algeria, and the products filed under it.
 *
 * Once any region row exists the rows decide which regions show (see
 * resolveRegions), so without this row the new region would never appear.
 * Priority 0 puts it ahead of Europe at 1, and it is the highlighted card.
 *
 * Algerian products were derived into `africa` before DZ moved; the field hook
 * only runs on save, so they are re-filed here. None were stocked when this
 * was written, but the update keeps the migration correct either way.
 *
 * Separate from the schema migration because Postgres will not use an enum
 * value in the transaction that added it.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  INSERT INTO "regions" ("slug", "label", "eyebrow", "description", "active", "highlighted", "sort_order", "updated_at", "created_at")
  VALUES ('algeria', 'Algeria', 'Our roots', 'Deglet Nour dates, olive oil, couscous and spice from the country our sourcing grew from.', true, true, 0, now(), now())
  ON CONFLICT ("slug") DO NOTHING;
  UPDATE "products" SET "origin_region" = 'algeria' WHERE "origin_country" = 'DZ';
  UPDATE "_products_v" SET "version_origin_region" = 'algeria' WHERE "version_origin_country" = 'DZ';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "_products_v" SET "version_origin_region" = 'africa' WHERE "version_origin_region" = 'algeria';
  UPDATE "products" SET "origin_region" = 'africa' WHERE "origin_region" = 'algeria';
  DELETE FROM "regions" WHERE "slug" = 'algeria';`)
}
