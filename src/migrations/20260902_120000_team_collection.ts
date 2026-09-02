import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Make the About page's "Our people" section editable.
 *
 * Both halves of that section were hard-coded in AboutPageClient: a `team`
 * array of four, and the founder's name, title and quote written straight into
 * the JSX. Adding a colleague meant a pull request.
 *
 * The five rows below reproduce exactly what the page rendered before, so
 * /about looks identical until someone edits it — the same approach the regions
 * migration took. `photo_id` is left NULL on purpose: those portraits were never
 * shot, so the cards keep showing the designed placeholder rather than a broken
 * image, and an upload in the admin panel is all that is needed to fill them.
 *
 * The founder is a row with `is_founder`, not a separate table. Two people
 * carrying the flag is a data mistake rather than a layout one, so nothing here
 * enforces a single founder — the page takes the first by priority.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "team" (
      "id" serial PRIMARY KEY NOT NULL,
      "role" varchar NOT NULL,
      "name" varchar,
      "photo_id" integer,
      "is_founder" boolean DEFAULT false,
      "quote" varchar,
      "active" boolean DEFAULT true,
      "sort_order" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "team"
      ADD CONSTRAINT "team_photo_id_media_id_fk"
      FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE INDEX "team_photo_idx" ON "team" ("photo_id");
    CREATE INDEX "team_updated_at_idx" ON "team" ("updated_at");
    CREATE INDEX "team_created_at_idx" ON "team" ("created_at");

    -- Every collection joins the admin document-locking rels table.
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_id" integer;

    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_team_fk"
      FOREIGN KEY ("team_id") REFERENCES "public"."team"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "payload_locked_documents_rels_team_id_idx"
      ON "payload_locked_documents_rels" ("team_id");

    -- Seeded from the team array and the founder block in AboutPageClient.
    -- The two nameless rows were rendering as "Open role" and still do.
    INSERT INTO "team" ("role", "name", "is_founder", "quote", "active", "sort_order")
    VALUES
      ('Founder & CEO', 'Nabila Mellaz', true,
       'Working closely with honey production highlighted the importance of continuity across cultivation cycles. As sourcing expanded, the objective stayed the same: structured coordination between production environments and professional markets.',
       true, 0),
      ('Sales Director', 'Muzn Salih', false, NULL, true, 1),
      ('Business Development', 'Raj Ganesh', false, NULL, true, 2),
      ('Head of Sourcing', NULL, false, NULL, true, 3),
      ('Creative Director', NULL, false, NULL, true, 4);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "team_id";
    DROP TABLE IF EXISTS "team" CASCADE;
  `)
}
