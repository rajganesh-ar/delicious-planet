import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add a third role: `fulfilment`.
 *
 * Until now the system had two, and they sat at opposite ends — `admin` could
 * change everything including prices, and `customer` could not open the admin
 * panel at all. There was no way to give the person who packs boxes an account,
 * so in practice they either got a full admin login or worked from someone
 * else's screen.
 *
 * `fulfilment` can sign into the admin, see every order, and move it along:
 * status, carrier, tracking number, internal notes. It cannot touch prices,
 * line items, the catalogue, users, pages or settings. The rules that enforce
 * that are in the collection configs; this migration only widens the enum the
 * column is stored in.
 *
 * Purely additive. No existing row changes, and `fulfilment` is not granted to
 * anybody — an admin assigns it on the user's own record.
 *
 * `ALTER TYPE ... ADD VALUE` inside a transaction needs Postgres 12+; this
 * database is 18.6, and the new value is not read back in the same transaction,
 * which is the remaining restriction.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_roles" ADD VALUE IF NOT EXISTS 'fulfilment';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Postgres cannot drop a value from an enum, so the type is rebuilt. Anyone
  // holding the role is moved to `customer` first — `roles` is required, so
  // simply deleting the rows could leave a user with none, which would fail
  // validation on their next save. Users who already have `customer` just lose
  // the extra row rather than gaining a duplicate.
  await db.execute(sql`
    DELETE FROM "users_roles" a
    WHERE a."value" = 'fulfilment'
      AND EXISTS (
        SELECT 1 FROM "users_roles" b
        WHERE b."parent_id" = a."parent_id" AND b."value" = 'customer'
      );

    UPDATE "users_roles" SET "value" = 'customer' WHERE "value" = 'fulfilment';

    ALTER TYPE "public"."enum_users_roles" RENAME TO "enum_users_roles__old";
    CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'customer');
    ALTER TABLE "users_roles"
      ALTER COLUMN "value" TYPE "public"."enum_users_roles"
      USING "value"::text::"public"."enum_users_roles";
    DROP TYPE "public"."enum_users_roles__old";
  `)
}
