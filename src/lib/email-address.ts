/**
 * Payload's own email rule (`payload/dist/fields/validations.js`, 3.80), which
 * it does not export.
 *
 * Every route that takes an address from the public and later hands it to
 * `payload.create` checks it with this first. A looser check lets through
 * addresses such as "name@gmailcom" or "a@b.c" that Payload then rejects
 * inside the create, and the visitor sees a 500 "please try again" that can
 * never succeed instead of being told to fix a typo.
 */
const PAYLOAD_EMAIL =
  /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i

export function isValidEmail(value: string): boolean {
  return PAYLOAD_EMAIL.test(value)
}
