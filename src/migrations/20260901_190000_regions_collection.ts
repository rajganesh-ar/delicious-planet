import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Give regions a CMS row so their presentation can be edited.
 *
 * Regions stay derived — a product is in one because its origin.country maps to
 * it (src/lib/countries.ts), which is why `slug` is an enum of the seven fixed
 * slugs and not free text. What was hard-coded and is now editable is only the
 * presentation: label, eyebrow, blurb, card art, order and visibility.
 *
 * The seven rows below are seeded straight from the bundled table in
 * src/lib/regions.ts, so the admin list opens populated and the homepage renders
 * exactly as it did before anyone touches it. `image_id` is left NULL on
 * purpose: with no upload the storefront falls back to the bundled artwork in
 * public/images, which ships with the build and cannot 404.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_regions_slug" AS ENUM(
      'europe', 'middle-east', 'africa', 'latin-america',
      'north-america', 'asia', 'oceania'
    );

    CREATE TABLE "regions" (
      "id" serial PRIMARY KEY NOT NULL,
      "slug" "enum_regions_slug" NOT NULL,
      "label" varchar NOT NULL,
      "eyebrow" varchar DEFAULT 'Bite into',
      "description" varchar,
      "image_id" integer,
      "active" boolean DEFAULT true,
      "sort_order" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "regions"
      ADD CONSTRAINT "regions_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    -- Unique: one row presents one region. Two rows for 'europe' would render
    -- the card twice and leave which one wins undefined.
    CREATE UNIQUE INDEX "regions_slug_idx" ON "regions" ("slug");
    CREATE INDEX "regions_image_idx" ON "regions" ("image_id");
    CREATE INDEX "regions_updated_at_idx" ON "regions" ("updated_at");
    CREATE INDEX "regions_created_at_idx" ON "regions" ("created_at");

    -- Every collection joins the admin document-locking rels table.
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "regions_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_regions_fk"
      FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "payload_locked_documents_rels_regions_id_idx"
      ON "payload_locked_documents_rels" ("regions_id");

    -- Seeded from REGIONS in src/lib/regions.ts, in that order.
    INSERT INTO "regions" ("slug", "label", "eyebrow", "description", "active", "sort_order")
    VALUES
      ('europe', 'Europe', 'Bite into',
       'Explore authentic European gourmet foods from Italy, France, Spain, Greece and more.',
       true, 1),
      ('middle-east', 'Middle East', 'Bite into',
       'Spices, mezze and confections from the Levant, the Gulf and Anatolia.',
       true, 2),
      ('africa', 'Africa', 'Bite into',
       'Single-origin coffee, honey, argan and heritage grains from across the continent.',
       true, 3),
      ('latin-america', 'Latin America', 'Bite into',
       'Cacao, coffee, ancient grains and chillies from Mexico down to Patagonia.',
       true, 4),
      ('north-america', 'North America', 'Bite into',
       'Maple, wild rice, craft preserves and small-batch pantry staples.',
       true, 5),
      ('asia', 'Asia', 'Bite into',
       'Rice, tea, soy and spice traditions from East, South and Southeast Asia.',
       true, 6),
      ('oceania', 'Oceania', 'Bite into',
       'Manuka honey, macadamia and cool-climate produce from Australia and New Zealand.',
       true, 7);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "regions_id";
    DROP TABLE IF EXISTS "regions" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_regions_slug";
  `)
}
