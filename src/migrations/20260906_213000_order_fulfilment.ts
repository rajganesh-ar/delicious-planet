import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Give orders the columns the back office needs to actually ship them.
 *
 * Until now an order carried what was bought and whether it was paid, but
 * nothing about getting it to the door: no carrier, no tracking number, no
 * record of when it left. Staff kept that outside the system, which is why the
 * admin could show a queue but never a fulfilment state.
 *
 * Added:
 *   · orders.fulfillment_*   carrier, tracking number, and the two timestamps
 *                            the status transitions stamp automatically.
 *   · orders.internal_notes  staff-only, deliberately separate from `notes`,
 *                            which is the customer's own message at checkout.
 *   · orders_timeline        an append-only audit of every status and payment
 *                            change, written by the beforeChange hook rather
 *                            than by hand. `by_id` is null for the Stripe
 *                            webhook, which has no user.
 *
 * Also indexes `status`, `payment_status` and `orders_items.variant_sku`. The
 * first two back the dashboard's queue counts; the third the field config has
 * declared `index: true` since the variants migration, but the hand-written
 * delta never created it.
 *
 * Purely additive — every column is nullable and no existing row is rewritten.
 * The three orders on the live database keep an empty timeline until their next
 * status change, which is honest: we have no record of what happened to them.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_orders_fulfillment_carrier" AS ENUM('dhl', 'fedex', 'ups', 'aramex', 'emirates-post', 'local-courier', 'pickup', 'other');

    ALTER TABLE "orders"
      ADD COLUMN "fulfillment_carrier" "enum_orders_fulfillment_carrier",
      ADD COLUMN "fulfillment_tracking_number" varchar,
      ADD COLUMN "fulfillment_shipped_at" timestamp(3) with time zone,
      ADD COLUMN "fulfillment_delivered_at" timestamp(3) with time zone,
      ADD COLUMN "internal_notes" varchar;

    CREATE TABLE "orders_timeline" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "event" varchar,
      "note" varchar,
      "at" timestamp(3) with time zone,
      "by_id" integer
    );

    ALTER TABLE "orders_timeline" ADD CONSTRAINT "orders_timeline_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "orders_timeline" ADD CONSTRAINT "orders_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "orders_timeline_order_idx" ON "orders_timeline" USING btree ("_order");
    CREATE INDEX "orders_timeline_parent_id_idx" ON "orders_timeline" USING btree ("_parent_id");
    CREATE INDEX "orders_timeline_by_idx" ON "orders_timeline" USING btree ("by_id");

    CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "orders_payment_status_idx" ON "orders" USING btree ("payment_status");
    CREATE INDEX IF NOT EXISTS "orders_items_variant_sku_idx" ON "orders_items" USING btree ("variant_sku");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "orders_timeline" CASCADE;

    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "fulfillment_carrier",
      DROP COLUMN IF EXISTS "fulfillment_tracking_number",
      DROP COLUMN IF EXISTS "fulfillment_shipped_at",
      DROP COLUMN IF EXISTS "fulfillment_delivered_at",
      DROP COLUMN IF EXISTS "internal_notes";

    DROP TYPE IF EXISTS "public"."enum_orders_fulfillment_carrier";

    DROP INDEX IF EXISTS "orders_status_idx";
    DROP INDEX IF EXISTS "orders_payment_status_idx";
    DROP INDEX IF EXISTS "orders_items_variant_sku_idx";
  `)
}
