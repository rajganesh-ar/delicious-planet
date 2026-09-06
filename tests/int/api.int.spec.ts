// @vitest-environment node

// Runs against the Payload Local API and the database — there is no DOM in
// play. It was inheriting the config's jsdom default, which under jsdom 28
// fails to boot the worker at all (html-encoding-sniffer require()s an ESM
// module), so the whole file errored before a single assertion ran.

import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})
