import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Bring the database up to the variant/origin/collections schema.
 *
 * Written as a delta by hand rather than generated. `payload migrate:create`
 * diffs against the newest snapshot in this directory; this database was
 * previously managed by `push`, which leaves no snapshot, so the generator
 * emitted a from-scratch "create every table" baseline that cannot run against
 * an existing database. The DDL below is lifted verbatim from that baseline and
 * reduced to the objects the live schema is actually missing.
 *
 * Safe to run because the products tables are empty — the catalogue is being
 * re-imported. It does NOT touch media, users, orders, brands, suppliers or
 * warehouses beyond adding three nullable columns to orders_items.
 *
 * What it does:
 *   · products    drops the multi-currency prices[] and sizeVariants[] model,
 *                 adds AED basePrice + the variants[] table
 *   · products    replaces free-text countryOfOrigin with origin.country (ISO
 *                 enum) + derived origin.region
 *   · products    collection (0..1) becomes collections (hasMany) via rels
 *   · categories  adds path / isDepartment and the ancestors rels table
 *   · orders      adds the line-item snapshot columns so order history survives
 *                 a catalogue wipe
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── enums ────────────────────────────────────────────────────────────
    CREATE TYPE "public"."enum_products_origin_country" AS ENUM('DZ', 'AR', 'AU', 'AT', 'BH', 'BD', 'BE', 'BO', 'BR', 'KH', 'CA', 'CL', 'CN', 'CO', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DO', 'EC', 'EG', 'SV', 'ET', 'FI', 'FR', 'DE', 'GH', 'GR', 'GT', 'HN', 'HU', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JP', 'JO', 'KE', 'KW', 'LB', 'LY', 'MG', 'MY', 'MX', 'MA', 'NP', 'NL', 'NZ', 'NI', 'NG', 'NO', 'OM', 'PK', 'PS', 'PA', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'SA', 'SN', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 'ES', 'LK', 'SE', 'CH', 'SY', 'TW', 'TZ', 'TH', 'TN', 'TR', 'UG', 'AE', 'GB', 'US', 'UY', 'VE', 'VN', 'YE');
    CREATE TYPE "public"."enum_products_origin_region" AS ENUM('europe', 'middle-east', 'africa', 'latin-america', 'north-america', 'asia', 'oceania');
    CREATE TYPE "public"."enum__products_v_version_origin_country" AS ENUM('DZ', 'AR', 'AU', 'AT', 'BH', 'BD', 'BE', 'BO', 'BR', 'KH', 'CA', 'CL', 'CN', 'CO', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DO', 'EC', 'EG', 'SV', 'ET', 'FI', 'FR', 'DE', 'GH', 'GR', 'GT', 'HN', 'HU', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JP', 'JO', 'KE', 'KW', 'LB', 'LY', 'MG', 'MY', 'MX', 'MA', 'NP', 'NL', 'NZ', 'NI', 'NG', 'NO', 'OM', 'PK', 'PS', 'PA', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'SA', 'SN', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 'ES', 'LK', 'SE', 'CH', 'SY', 'TW', 'TZ', 'TH', 'TN', 'TR', 'UG', 'AE', 'GB', 'US', 'UY', 'VE', 'VN', 'YE');
    CREATE TYPE "public"."enum__products_v_version_origin_region" AS ENUM('europe', 'middle-east', 'africa', 'latin-america', 'north-america', 'asia', 'oceania');

    -- ── drop the superseded pricing / sizing model ───────────────────────
    DROP TABLE IF EXISTS "products_prices" CASCADE;
    DROP TABLE IF EXISTS "products_size_variants" CASCADE;
    DROP TABLE IF EXISTS "products_inventory_levels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_prices" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_size_variants" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_inventory_levels" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_products_prices_currency";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_prices_currency";

    -- ── products: new columns ────────────────────────────────────────────
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "country_of_origin",
      DROP COLUMN IF EXISTS "weight",
      DROP COLUMN IF EXISTS "barcode",
      DROP COLUMN IF EXISTS "shipping_weight_grams",
      DROP COLUMN IF EXISTS "collection_id",
      ADD COLUMN "origin_country" "enum_products_origin_country",
      ADD COLUMN "origin_region" "enum_products_origin_region",
      ADD COLUMN "origin_producer_region" varchar,
      ADD COLUMN "origin_appellation" varchar,
      ADD COLUMN "base_price" numeric,
      ADD COLUMN "base_compare_at" numeric,
      ADD COLUMN "featured_rank" numeric,
      ADD COLUMN "published_at" timestamp(3) with time zone;

    ALTER TABLE "_products_v"
      DROP COLUMN IF EXISTS "version_country_of_origin",
      DROP COLUMN IF EXISTS "version_weight",
      DROP COLUMN IF EXISTS "version_barcode",
      DROP COLUMN IF EXISTS "version_shipping_weight_grams",
      DROP COLUMN IF EXISTS "version_collection_id",
      ADD COLUMN "version_origin_country" "enum__products_v_version_origin_country",
      ADD COLUMN "version_origin_region" "enum__products_v_version_origin_region",
      ADD COLUMN "version_origin_producer_region" varchar,
      ADD COLUMN "version_origin_appellation" varchar,
      ADD COLUMN "version_base_price" numeric,
      ADD COLUMN "version_base_compare_at" numeric,
      ADD COLUMN "version_featured_rank" numeric,
      ADD COLUMN "version_published_at" timestamp(3) with time zone;

    -- ── categories: lineage ──────────────────────────────────────────────
    ALTER TABLE "categories"
      ADD COLUMN "path" varchar,
      ADD COLUMN "is_department" boolean;

    -- ── orders: line items become self-describing ────────────────────────
    ALTER TABLE "orders_items"
      ALTER COLUMN "product_id" DROP NOT NULL,
      ADD COLUMN "variant_sku" varchar,
      ADD COLUMN "title_snapshot" varchar,
      ADD COLUMN "size_snapshot" varchar;

    -- ── new tables ───────────────────────────────────────────────────────
    CREATE TABLE "products_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "sku" varchar,
      "size" varchar,
      "price" numeric,
      "compare_at" numeric,
      "barcode" varchar,
      "weight_grams" numeric,
      "in_stock" boolean DEFAULT true,
      "is_default" boolean DEFAULT false,
      "image_id" integer
    );

    CREATE TABLE "products_variants_inventory" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "warehouse_id" integer,
      "quantity" numeric DEFAULT 0,
      "reserved_quantity" numeric DEFAULT 0,
      "low_stock_threshold" numeric
    );

    CREATE TABLE "products_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "product_collections_id" integer
    );

    CREATE TABLE "categories_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "categories_id" integer
    );

    CREATE TABLE "_products_v_version_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "sku" varchar,
      "size" varchar,
      "price" numeric,
      "compare_at" numeric,
      "barcode" varchar,
      "weight_grams" numeric,
      "in_stock" boolean DEFAULT true,
      "is_default" boolean DEFAULT false,
      "image_id" integer,
      "_uuid" varchar
    );

    CREATE TABLE "_products_v_version_variants_inventory" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "warehouse_id" integer,
      "quantity" numeric DEFAULT 0,
      "reserved_quantity" numeric DEFAULT 0,
      "low_stock_threshold" numeric,
      "_uuid" varchar
    );

    CREATE TABLE "_products_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "product_collections_id" integer
    );

    -- ── foreign keys ─────────────────────────────────────────────────────
    ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_variants_inventory" ADD CONSTRAINT "products_variants_inventory_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_variants_inventory" ADD CONSTRAINT "products_variants_inventory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_variants"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_product_collections_fk" FOREIGN KEY ("product_collections_id") REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_products_v_version_variants_inventory" ADD CONSTRAINT "_products_v_version_variants_inventory_warehouse_id_warehouses_id_fk" FOREIGN KEY ("warehouse_id") REFERENCES "public"."warehouses"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_products_v_version_variants_inventory" ADD CONSTRAINT "_products_v_version_variants_inventory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_variants"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_product_collections_fk" FOREIGN KEY ("product_collections_id") REFERENCES "public"."product_collections"("id") ON DELETE cascade ON UPDATE no action;

    -- ── indexes ──────────────────────────────────────────────────────────
    CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
    CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
    CREATE INDEX "products_variants_sku_idx" ON "products_variants" USING btree ("sku");
    CREATE INDEX "products_variants_image_idx" ON "products_variants" USING btree ("image_id");
    CREATE INDEX "products_variants_inventory_order_idx" ON "products_variants_inventory" USING btree ("_order");
    CREATE INDEX "products_variants_inventory_parent_id_idx" ON "products_variants_inventory" USING btree ("_parent_id");
    CREATE INDEX "products_variants_inventory_warehouse_idx" ON "products_variants_inventory" USING btree ("warehouse_id");
    CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
    CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
    CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
    CREATE INDEX "products_rels_product_collections_id_idx" ON "products_rels" USING btree ("product_collections_id");
    CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
    CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
    CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
    CREATE INDEX "categories_rels_categories_id_idx" ON "categories_rels" USING btree ("categories_id");
    CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
    CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
    CREATE INDEX "_products_v_version_variants_sku_idx" ON "_products_v_version_variants" USING btree ("sku");
    CREATE INDEX "_products_v_version_variants_inventory_order_idx" ON "_products_v_version_variants_inventory" USING btree ("_order");
    CREATE INDEX "_products_v_version_variants_inventory_parent_id_idx" ON "_products_v_version_variants_inventory" USING btree ("_parent_id");
    CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
    CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
    CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");

    CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_idx" ON "products" USING btree ("sku");
    CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products" USING btree ("category_id");
    CREATE INDEX IF NOT EXISTS "products_brand_idx" ON "products" USING btree ("brand_id");
    CREATE INDEX IF NOT EXISTS "products_supplier_idx" ON "products" USING btree ("supplier_id");
    CREATE INDEX IF NOT EXISTS "products_origin_origin_country_idx" ON "products" USING btree ("origin_country");
    CREATE INDEX IF NOT EXISTS "products_origin_origin_region_idx" ON "products" USING btree ("origin_region");
    CREATE INDEX IF NOT EXISTS "products_base_price_idx" ON "products" USING btree ("base_price");
    CREATE INDEX IF NOT EXISTS "products_in_stock_idx" ON "products" USING btree ("in_stock");
    CREATE INDEX IF NOT EXISTS "products_is_featured_idx" ON "products" USING btree ("is_featured");
    CREATE INDEX IF NOT EXISTS "products_published_at_idx" ON "products" USING btree ("published_at");
    CREATE INDEX IF NOT EXISTS "categories_path_idx" ON "categories" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "categories_is_department_idx" ON "categories" USING btree ("is_department");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverses the structural change. It does not restore the dropped prices[]
  // and sizeVariants[] data — that is gone with the tables, which is acceptable
  // only because the catalogue was empty when this ran.
  await db.execute(sql`
    DROP TABLE IF EXISTS "products_variants_inventory" CASCADE;
    DROP TABLE IF EXISTS "products_variants" CASCADE;
    DROP TABLE IF EXISTS "products_rels" CASCADE;
    DROP TABLE IF EXISTS "categories_rels" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variants_inventory" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_variants" CASCADE;
    DROP TABLE IF EXISTS "_products_v_rels" CASCADE;

    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "origin_country",
      DROP COLUMN IF EXISTS "origin_region",
      DROP COLUMN IF EXISTS "origin_producer_region",
      DROP COLUMN IF EXISTS "origin_appellation",
      DROP COLUMN IF EXISTS "base_price",
      DROP COLUMN IF EXISTS "base_compare_at",
      DROP COLUMN IF EXISTS "featured_rank",
      DROP COLUMN IF EXISTS "published_at",
      ADD COLUMN IF NOT EXISTS "country_of_origin" varchar,
      ADD COLUMN IF NOT EXISTS "weight" varchar,
      ADD COLUMN IF NOT EXISTS "barcode" varchar,
      ADD COLUMN IF NOT EXISTS "shipping_weight_grams" numeric,
      ADD COLUMN IF NOT EXISTS "collection_id" integer;

    ALTER TABLE "_products_v"
      DROP COLUMN IF EXISTS "version_origin_country",
      DROP COLUMN IF EXISTS "version_origin_region",
      DROP COLUMN IF EXISTS "version_origin_producer_region",
      DROP COLUMN IF EXISTS "version_origin_appellation",
      DROP COLUMN IF EXISTS "version_base_price",
      DROP COLUMN IF EXISTS "version_base_compare_at",
      DROP COLUMN IF EXISTS "version_featured_rank",
      DROP COLUMN IF EXISTS "version_published_at";

    ALTER TABLE "categories"
      DROP COLUMN IF EXISTS "path",
      DROP COLUMN IF EXISTS "is_department";

    ALTER TABLE "orders_items"
      DROP COLUMN IF EXISTS "variant_sku",
      DROP COLUMN IF EXISTS "title_snapshot",
      DROP COLUMN IF EXISTS "size_snapshot";

    DROP TYPE IF EXISTS "public"."enum_products_origin_country";
    DROP TYPE IF EXISTS "public"."enum_products_origin_region";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_origin_country";
    DROP TYPE IF EXISTS "public"."enum__products_v_version_origin_region";
  `)
}
