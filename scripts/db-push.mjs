/**
 * Deliberate, one-off schema push.
 *
 *   PAYLOAD_DB_PUSH=true pnpm db:push
 *
 * Booting Payload with `push` enabled makes drizzle introspect the live
 * database and apply the difference. This is separate from `pnpm dev` on
 * purpose: pushing should be something you choose to do and watch, not
 * something that happens behind every dev-server start.
 *
 * If it asks whether an object was created or renamed, the answer is almost
 * always **create** — a rename only makes sense when a field genuinely changed
 * name and kept its meaning.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

if (process.env.PAYLOAD_DB_PUSH !== 'true') {
  console.error('Refusing to run: set PAYLOAD_DB_PUSH=true to confirm.')
  process.exit(1)
}

console.log('Pushing schema to the database…\n')
const payload = await getPayload({ config: await config })

// Prove the push actually landed rather than trusting a silent success.
const checks = [
  ['products', 'base_price'],
  ['products', 'origin_country'],
  ['categories', 'path'],
  ['orders_items', 'title_snapshot'],
]

let bad = 0
for (const [table, column] of checks) {
  const { rows } = await payload.db.drizzle.execute(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = '${table}' AND column_name = '${column}' LIMIT 1`,
  )
  const ok = rows.length > 0
  if (!ok) bad += 1
  console.log(`  ${ok ? 'ok  ' : 'MISS'}  ${table}.${column}`)
}

for (const table of ['products_variants', 'categories_rels', 'products_rels']) {
  const { rows } = await payload.db.drizzle.execute(
    `SELECT to_regclass('public.${table}') AS t`,
  )
  const ok = rows[0]?.t !== null
  if (!ok) bad += 1
  console.log(`  ${ok ? 'ok  ' : 'MISS'}  table ${table}`)
}

console.log('')
console.log(bad === 0 ? 'Schema is in sync.' : `${bad} expected object(s) still missing.`)
process.exit(bad === 0 ? 0 : 1)
