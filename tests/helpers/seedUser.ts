import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  roles: ['admin' as 'admin' | 'customer'],
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user.
  //
  // Two steps, not one: Users has a `beforeValidate` hook that pins `roles` to
  // ['customer'] on any create where the requesting user is not already an
  // admin — the guard that stops the public signup endpoint being an admin
  // factory. The Local API carries no `req.user`, so it is caught by that rule
  // too, and a one-step create silently produced a customer. The admin panel
  // then bounced this user straight back to /admin/login, forever.
  //
  // The hook only fires on `operation === 'create'`, so promoting afterwards is
  // the intended escape hatch rather than a way around the guard.
  const created = await payload.create({
    collection: 'users',
    data: testUser,
  })

  await payload.update({
    collection: 'users',
    id: created.id,
    data: { roles: testUser.roles },
    overrideAccess: true,
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
