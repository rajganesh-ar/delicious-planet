import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add the staff-notification settings to the site-settings global.
 *
 * Transactional email is new to this project — until now nothing was ever sent,
 * to a customer or to the team. The recipient for staff alerts lives in the CMS
 * rather than in an environment variable so it can be changed without a deploy,
 * which is the difference between the shop's own staff being able to redirect
 * their order alerts and having to ask a developer.
 *
 * `enabled` defaults to true: the field appears on an existing row as NULL, and
 * the reader treats only an explicit `false` as off, so alerts work the moment
 * an address is set without anyone having to find and tick a box.
 *
 * Both columns are nullable — src/lib/email/recipients.ts falls back to
 * ADMIN_NOTIFICATION_EMAIL and then to the published company mailbox, so an
 * empty field never means an unannounced order.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      ADD COLUMN IF NOT EXISTS "notifications_order_email" varchar,
      ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT true;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings"
      DROP COLUMN IF EXISTS "notifications_order_email",
      DROP COLUMN IF EXISTS "notifications_enabled";
  `)
}
