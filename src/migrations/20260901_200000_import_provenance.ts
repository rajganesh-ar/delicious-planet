import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Give imported rows a stable external key.
 *
 * Catalogue rows that arrive from a supplier feed need an identifier that
 * survives the supplier editing their own copy. Without one, the only way to
 * match an incoming record to an existing row is title or slug — both of which
 * the supplier owns and changes. Re-running an import after they retitle a
 * product then creates a second row instead of updating the first, and the
 * catalogue silently doubles.
 *
 * Two columns carry that key:
 *
 *   · products.source_*   provider + external id + handle + url + imported_at.
 *                         `source_external_id` is what an importer upserts on.
 *                         NULL for products authored in the admin.
 *
 *   · media.source_url    the URL a file was fetched from. Images need their
 *                         own key because filenames collide across products —
 *                         a feed can ship two different "Garlic-1.jpg" — so
 *                         matching on `filename` would wire the wrong picture
 *                         onto the second product.
 *
 * Everything is additive and nullable, so existing rows are untouched and the
 * columns stay invisible to anyone not running an importer.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── media ────────────────────────────────────────────────────────────
    ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "source_url" varchar;
    CREATE INDEX IF NOT EXISTS "media_source_url_idx" ON "media" ("source_url");

    -- ── products ─────────────────────────────────────────────────────────
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_provider" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_external_id" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_handle" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_url" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "source_imported_at" timestamp(3) with time zone;

    CREATE INDEX IF NOT EXISTS "products_source_source_provider_idx"
      ON "products" ("source_provider");
    CREATE INDEX IF NOT EXISTS "products_source_source_external_id_idx"
      ON "products" ("source_external_id");
    CREATE INDEX IF NOT EXISTS "products_source_source_handle_idx"
      ON "products" ("source_handle");

    -- ── product drafts ───────────────────────────────────────────────────
    -- Products has versions enabled, so every field exists twice. Skipping the
    -- version table would make the column vanish whenever a draft is restored.
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_source_provider" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_source_external_id" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_source_handle" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_source_url" varchar;
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_source_imported_at" timestamp(3) with time zone;

    CREATE INDEX IF NOT EXISTS "_products_v_version_source_version_source_provider_idx"
      ON "_products_v" ("version_source_provider");
    CREATE INDEX IF NOT EXISTS "_products_v_version_source_version_source_external_id_idx"
      ON "_products_v" ("version_source_external_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_source_version_source_handle_idx"
      ON "_products_v" ("version_source_handle");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "media_source_url_idx";
    ALTER TABLE "media" DROP COLUMN IF EXISTS "source_url";

    DROP INDEX IF EXISTS "products_source_source_provider_idx";
    DROP INDEX IF EXISTS "products_source_source_external_id_idx";
    DROP INDEX IF EXISTS "products_source_source_handle_idx";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "source_provider";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "source_external_id";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "source_handle";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "source_url";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "source_imported_at";

    DROP INDEX IF EXISTS "_products_v_version_source_version_source_provider_idx";
    DROP INDEX IF EXISTS "_products_v_version_source_version_source_external_id_idx";
    DROP INDEX IF EXISTS "_products_v_version_source_version_source_handle_idx";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_source_provider";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_source_external_id";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_source_handle";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_source_url";
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_source_imported_at";
  `)
}
