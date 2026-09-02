/**
 * Apply every pending migration, oldest first.
 *
 *   node scripts/apply-migration.cjs           # all pending
 *   node scripts/apply-migration.cjs <name>    # just one
 *
 * Exists because `payload migrate` hangs on this database: push left a
 * `dev` row with batch -1 in payload_migrations, and the CLI blocks on an
 * interactive prompt about it that never renders.
 *
 * Each migration runs in its own transaction (so a failure changes nothing and
 * earlier migrations stay applied) and is recorded the way the CLI would.
 */
const fs = require('fs')
const path = require('path')

// This file lives in scripts/, but every path below is relative to the repo root.
const ROOT = path.join(__dirname, '..')
for (const l of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
  if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}
// pnpm does not hoist pg to the root node_modules, so fall back to its store path.
function loadPg() {
  try {
    return require('pg')
  } catch {
    const store = path.join(ROOT, 'node_modules', '.pnpm')
    const dir = fs.readdirSync(store).find((d) => d.startsWith('pg@'))
    if (!dir) throw new Error('pg not found in node_modules/.pnpm')
    return require(path.join(store, dir, 'node_modules', 'pg'))
  }
}
const { Client } = loadPg()

const MIGRATIONS_DIR = path.join(ROOT, 'src', 'migrations')
const only = process.argv[2]

/** Pull the raw SQL out of a migration's up() template literal. */
function extractSql(name) {
  const src = fs.readFileSync(path.join(MIGRATIONS_DIR, `${name}.ts`), 'utf8')
  const upStart = src.indexOf('export async function up')
  const downStart = src.indexOf('export async function down')
  if (upStart === -1 || downStart === -1) throw new Error(`${name}: could not find up()/down()`)
  const upBody = src.slice(upStart, downStart)
  const open = upBody.indexOf('sql`')
  const close = upBody.indexOf('`)', open)
  if (open === -1 || close === -1) throw new Error(`${name}: could not find the sql template`)
  const out = upBody.slice(open + 4, close)
  if (!out.trim()) throw new Error(`${name}: empty SQL`)
  // The runner executes this verbatim; interpolation would mean unreviewed SQL.
  if (out.includes('${')) throw new Error(`${name}: SQL contains interpolation — refusing to run blind`)
  return out
}

;(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await c.connect()

  const onDisk = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''))
    .sort()

  const applied = new Set(
    (await c.query(`SELECT name FROM payload_migrations WHERE name <> 'dev'`)).rows.map(
      (r) => r.name,
    ),
  )

  let pending = onDisk.filter((n) => !applied.has(n))
  if (only) {
    if (!onDisk.includes(only)) {
      console.error(`No such migration: ${only}`)
      await c.end()
      process.exit(1)
    }
    pending = applied.has(only) ? [] : [only]
  }

  if (pending.length === 0) {
    console.log('Nothing pending.')
  }

  for (const name of pending) {
    process.stdout.write(`${name} ... `)
    await c.query('BEGIN')
    try {
      await c.query(extractSql(name))
      // Clear the marker push left behind so the table reflects reality.
      await c.query(`DELETE FROM payload_migrations WHERE name = 'dev'`)
      await c.query(
        `INSERT INTO payload_migrations (name, batch, updated_at, created_at)
         VALUES ($1, COALESCE((SELECT MAX(batch::int) FROM payload_migrations WHERE batch <> '-1'), 0) + 1, now(), now())`,
        [name],
      )
      await c.query('COMMIT')
      console.log('applied')
    } catch (e) {
      await c.query('ROLLBACK')
      console.log('FAILED — rolled back, nothing changed')
      console.error(e.message)
      await c.end()
      process.exit(1)
    }
  }

  console.table((await c.query('SELECT name, batch FROM payload_migrations ORDER BY id')).rows)
  await c.end()
})().catch((e) => {
  console.error('FAILED:', e.message)
  process.exit(1)
})
