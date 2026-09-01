import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// Never hardcode this — the repo is public, and a committed password is a
// working login for /admin that stays in git history forever.
const PASSWORD = process.env.ADMIN_RESET_PASSWORD

if (!PASSWORD) {
  throw new Error(
    'Set ADMIN_RESET_PASSWORD in your environment before running this script, e.g.\n' +
      '  ADMIN_RESET_PASSWORD="<a strong password>" pnpm tsx scripts/reset-admin.ts',
  )
}

const USERS = [
  { email: 'admin@deliciousplanet.co', name: 'Admin', roles: ['admin'] },
  { email: 'raj@deliciousplanet.co', name: 'Raj', roles: ['admin'] },
  { email: 'nabila@deliciousplanet.co', name: 'Nabila', roles: ['admin'] },
]

async function upsertUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: (typeof USERS)[number],
) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: user.email } },
    limit: 1,
  })

  if (existing.docs.length > 0) {
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password: PASSWORD, roles: user.roles as ['admin'] },
    })
    console.log(`Updated: ${user.email}`)
  } else {
    await payload.create({
      collection: 'users',
      data: { email: user.email, name: user.name, password: PASSWORD, roles: user.roles as ['admin'] },
    })
    console.log(`Created: ${user.email}`)
  }
}

async function main() {
  const payload = await getPayload({ config })
  for (const user of USERS) {
    await upsertUser(payload, user)
  }
  console.log(`\nDone. Password for all: ${PASSWORD}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
