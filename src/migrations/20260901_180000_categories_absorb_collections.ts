import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Collapse the two competing taxonomies into one.
 *
 * The store had drifted into modelling product types as `product-collections`
 * ("Caviar Selection", "Truffle Treasury") while `categories` held region rows
 * ("Bite Into Europe") — the reverse of what the collection configs describe.
 * Regions had two sources on top of that: those six rows, and REGION_SLUGS in
 * src/lib/countries.ts. The header read the constant, /categories read the rows,
 * and their slugs never matched, so a region page could not have resolved a
 * product even once the catalogue was imported.
 *
 * After this migration:
 *   · categories  is the product-type tree — the 15 former collections become
 *                 top-level departments, keeping their slugs so existing links
 *                 survive. Children can be added under them later; the leaf rule
 *                 in Products.category is "has no children", so childless
 *                 departments stay selectable.
 *   · regions     are a filter only, derived from origin.country. The six legacy
 *                 rows are deleted.
 *   · product-collections is removed entirely, along with products_rels and
 *                 _products_v_rels, which existed solely to hold its hasMany.
 *
 * Safe to run: products is empty, so no product loses a category or a
 * collection. pages/_pages_v also reference categories but hold no rows.
 *
 * down() restores the schema and moves the 15 rows back to product_collections.
 * It deliberately does NOT resurrect the six region rows — they are retired, not
 * relocated, and reviving stale marketing copy on a rollback would be worse than
 * leaving categories empty of them.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── 1. the legacy region rows leave the tree ─────────────────────────
    -- TRIM because one row was saved with a trailing space in both title and
    -- slug ("authentic-algerian-products ").
    DELETE FROM "categories"
    WHERE TRIM("slug") IN (
      'authentic-algerian-products',
      'Bite-Into-Africa',
      'Bite-Into-Europe',
      'Bite-Into-the-middle-east',
      'Bite-into-Asia',
      'Bite-into-latin-america'
    );

    -- ── 2. product types move in as departments ──────────────────────────
    -- parent NULL + is_department true + path = slug is exactly what
    -- deriveCategoryLineage writes for a top-level category, so these rows are
    -- indistinguishable from ones created through the admin UI.
    INSERT INTO "categories"
      ("title", "slug", "description", "image_id", "sort_order",
       "parent_id", "path", "is_department", "updated_at", "created_at")
    SELECT
      "title", "slug", "description", "image_id", "sort_order",
      NULL, "slug", true, now(), "created_at"
    FROM "product_collections"
    ORDER BY "sort_order" NULLS LAST, "id";

    -- ── 3. product-collections is gone ───────────────────────────────────
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "product_collections_id";

    -- Both rels tables held product_collections_id and nothing else.
    DROP TABLE IF EXISTS "products_rels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_rels" CASCADE;
    DROP TABLE IF EXISTS "product_collections" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "product_collections" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar,
      "image_id" integer,
      "sort_order" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "product_collections"
      ADD CONSTRAINT "product_collections_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE UNIQUE INDEX "product_collections_slug_idx" ON "product_collections" ("slug");
    CREATE INDEX "product_collections_image_idx" ON "product_collections" ("image_id");
    CREATE INDEX "product_collections_updated_at_idx" ON "product_collections" ("updated_at");
    CREATE INDEX "product_collections_created_at_idx" ON "product_collections" ("created_at");

    -- Move the departments back out of the tree.
    INSERT INTO "product_collections"
      ("title", "slug", "description", "image_id", "sort_order", "updated_at", "created_at")
    SELECT "title", "slug", "description", "image_id", "sort_order", now(), "created_at"
    FROM "categories"
    WHERE "parent_id" IS NULL
    ORDER BY "sort_order" NULLS LAST, "id";

    DELETE FROM "categories" WHERE "parent_id" IS NULL;

    CREATE TABLE "products_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "product_collections_id" integer
    );

    CREATE TABLE "_products_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "product_collections_id" integer
    );

    ALTER TABLE "products_rels"
      ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id")
        REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action,
      ADD CONSTRAINT "products_rels_product_collections_fk" FOREIGN KEY ("product_collections_id")
        REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "_products_v_rels"
      ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id")
        REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action,
      ADD CONSTRAINT "_products_v_rels_product_collections_fk" FOREIGN KEY ("product_collections_id")
        REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "products_rels_order_idx" ON "products_rels" ("order");
    CREATE INDEX "products_rels_parent_idx" ON "products_rels" ("parent_id");
    CREATE INDEX "products_rels_path_idx" ON "products_rels" ("path");
    CREATE INDEX "products_rels_product_collections_id_idx" ON "products_rels" ("product_collections_id");
    CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" ("order");
    CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" ("parent_id");
    CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" ("path");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "product_collections_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_product_collections_fk"
      FOREIGN KEY ("product_collections_id")
      REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;
  `)
}
